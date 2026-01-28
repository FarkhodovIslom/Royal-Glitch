import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';
import { Card, MaskType } from '../shared/types';

@WebSocketGateway({
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly gameService: GameService) {}

  handleConnection(client: Socket) {
    console.log(`🔌 Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`🔌 Client disconnected: ${client.id}`);
    
    const result = this.gameService.leaveRoom(client.id);
    if (result) {
      const { room, playerId } = result;
      this.server.to(room.id).emit('player_left', { playerId });
    }
  }

  @SubscribeMessage('create_room')
  handleCreateRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { playerId: string; maskType: MaskType },
  ) {
    const room = this.gameService.createRoom(data.playerId, client.id, data.maskType);
    
    client.join(room.id);
    client.emit('room_created', { roomId: room.id });
    client.emit('room_joined', {
      roomId: room.id,
      creatorId: room.creatorId,
      players: this.gameService.getPublicPlayers(room),
    });

    return { roomId: room.id };
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; playerId: string; maskType: MaskType },
  ) {
    const room = this.gameService.joinRoom(data.roomId, data.playerId, client.id, data.maskType);
    
    if (!room) {
      client.emit('error', { message: 'Could not join room' });
      return { success: false };
    }

    client.join(room.id);
    
    // Notify existing players
    const newPlayer = room.players.find(p => p.id === data.playerId);
    if (newPlayer) {
      client.to(room.id).emit('player_joined', {
        player: {
          id: newPlayer.id,
          maskType: newPlayer.maskType,
          integrity: newPlayer.integrity,
          isEliminated: newPlayer.isEliminated,
          isReady: newPlayer.isReady,
          rating: newPlayer.rating,
          cardCount: 0,
        },
      });
    }

    // Send room state to new player
    client.emit('room_joined', {
      roomId: room.id,
      creatorId: room.creatorId,
      players: this.gameService.getPublicPlayers(room),
    });

    return { success: true };
  }

  @SubscribeMessage('leave_room')
  handleLeaveRoom(@ConnectedSocket() client: Socket) {
    const result = this.gameService.leaveRoom(client.id);
    
    if (result) {
      const { room, playerId } = result;
      client.leave(room.id);
      this.server.to(room.id).emit('player_left', { playerId });
    }

    return { success: true };
  }

  @SubscribeMessage('player_ready')
  handlePlayerReady(@ConnectedSocket() client: Socket) {
    const result = this.gameService.setPlayerReady(client.id, true);
    
    if (!result) {
      return { success: false };
    }

    const { room, playerId } = result;

    // Notify all players of ready status change
    this.server.to(room.id).emit('player_ready_change', {
      playerId,
      isReady: true,
    });

    // Check if all players ready - start game
    if (this.gameService.allPlayersReady(room.id)) {
      const startedRoom = this.gameService.startGame(room.id);
      
      if (startedRoom) {
        // Notify game started
        this.server.to(room.id).emit('game_started', { phase: startedRoom.phase });

        // Send hands to each player
        for (const player of startedRoom.players) {
          this.server.to(player.socketId).emit('hand_dealt', {
            cards: player.hand,
          });
        }

        // Notify current player it's their turn
        this.notifyCurrentPlayerTurn(startedRoom.id);
      }
    }

    return { success: true };
  }

  @SubscribeMessage('start_game')
  handleStartGame(@ConnectedSocket() client: Socket) {
    // Verify caller is room creator
    if (!this.gameService.isRoomCreator(client.id)) {
      client.emit('error', { message: 'Only the room creator can start the game' });
      return { success: false };
    }

    const room = this.gameService.getRoomBySocketId(client.id);
    if (!room) {
      client.emit('error', { message: 'Room not found' });
      return { success: false };
    }

    // Verify 4 players are in room
    if (!this.gameService.canStartGame(room.id)) {
      client.emit('error', { message: 'Need 4 players to start the game' });
      return { success: false };
    }

    const startedRoom = this.gameService.startGame(room.id);
    
    if (startedRoom) {
      // Notify game started
      this.server.to(room.id).emit('game_started', { phase: startedRoom.phase });

      // Send hands to each player
      for (const player of startedRoom.players) {
        this.server.to(player.socketId).emit('hand_dealt', {
          cards: player.hand,
        });
      }

      // Notify current player it's their turn
      this.notifyCurrentPlayerTurn(startedRoom.id);
    }

    return { success: true };
  }

  @SubscribeMessage('play_card')
  handlePlayCard(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { card: Card },
  ) {
    const result = this.gameService.playCard(client.id, data.card);

    if (!result.success) {
      client.emit('invalid_move', { reason: result.error || 'Invalid move' });
      return { success: false };
    }

    const room = result.room!;

    // Broadcast card played
    this.server.to(room.id).emit('card_played', {
      playerId: result.playerId,
      card: data.card,
    });

    // If trick complete
    if (result.trickComplete) {
      this.server.to(room.id).emit('trick_complete', {
        winnerId: result.trickWinner,
        cards: room.tricks[room.tricks.length - 1]?.cards || [],
        damage: result.trickDamage,
      });

      // Send integrity updates
      for (const player of room.players) {
        this.server.to(room.id).emit('integrity_update', {
          playerId: player.id,
          integrity: player.integrity,
        });
      }

      // Trigger mask emotions for damage taken
      const winner = room.players.find(p => p.id === result.trickWinner);
      if (winner && result.trickDamage) {
        const oldIntegrity = result.trickDamage[winner.id];
        if (winner.integrity < oldIntegrity) {
          this.server.to(room.id).emit('mask_emotion', {
            playerId: winner.id,
            emotion: 'shake',
          });
        }
      }
    }

    // If phase complete
    if (result.phaseComplete) {
      this.server.to(room.id).emit('phase_complete', {
        eliminatedId: result.eliminatedId,
        standings: [],
      });

      this.server.to(room.id).emit('player_eliminated', {
        playerId: result.eliminatedId,
        placement: room.phaseNumber === 1 ? 4 : room.phaseNumber === 2 ? 3 : 2,
      });

      // Trigger glitch emotion for eliminated player
      this.server.to(room.id).emit('mask_emotion', {
        playerId: result.eliminatedId,
        emotion: 'crack',
      });
    }

    // If game over
    if (result.gameOver) {
      const winner = room.players.find(p => !p.isEliminated);
      
      this.server.to(room.id).emit('game_over', {
        winnerId: winner?.id || '',
        finalStandings: result.finalStandings || [],
      });

      // Winner celebration
      if (winner) {
        this.server.to(room.id).emit('mask_emotion', {
          playerId: winner.id,
          emotion: 'pulse',
        });
      }

      return { success: true, gameOver: true };
    }

    // If phase just started, deal new hands
    if (result.phaseComplete && !result.gameOver) {
      // Small delay then deal new hands
      setTimeout(() => {
        const updatedRoom = this.gameService.getRoom(room.id);
        if (updatedRoom) {
          // Send new hands to remaining players
          for (const player of updatedRoom.players) {
            if (!player.isEliminated) {
              this.server.to(player.socketId).emit('hand_dealt', {
                cards: player.hand,
              });
            }
          }

          this.server.to(room.id).emit('game_started', { phase: updatedRoom.phase });
          this.notifyCurrentPlayerTurn(room.id);
        }
      }, 2000);
    } else {
      // Notify next player
      this.notifyCurrentPlayerTurn(room.id);
    }

    return { success: true };
  }

  @SubscribeMessage('get_rooms')
  handleGetRooms() {
    return { rooms: this.gameService.getAllRooms() };
  }

  private notifyCurrentPlayerTurn(roomId: string) {
    const currentPlayer = this.gameService.getCurrentPlayer(roomId);
    const validCards = this.gameService.getValidCardsForCurrentPlayer(roomId);

    if (currentPlayer) {
      this.server.to(currentPlayer.socketId).emit('your_turn', {
        validCards,
      });
    }
  }
}
