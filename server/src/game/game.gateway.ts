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
import { MaskType } from '../shared/types';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly gameService: GameService) {}

  handleConnection(client: Socket) {
    console.log(`[WS] Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`[WS] Client disconnected: ${client.id}`);
    const result = this.gameService.leaveRoom(client.id);
    if (result) {
      this.server.to(result.room.id).emit('player_left', { playerId: result.playerId });
    }
  }

  @SubscribeMessage('create_room')
  handleCreateRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { playerId: string; maskType: MaskType; nickname: string },
  ) {
    const room = this.gameService.createRoom(data.playerId, client.id, data.maskType, data.nickname);
    client.join(room.id);
    client.emit('room_created', { roomId: room.id });
    
    // Also emit room_joined so the creator has the initial state
    const publicPlayers = this.gameService.getPublicPlayers(room);
    client.emit('room_joined', { 
      roomId: room.id, 
      creatorId: room.creatorId,
      players: publicPlayers 
    });
    
    console.log(`[ROOM] Created: ${room.id} by ${data.maskType}`);
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; playerId: string; maskType: MaskType; nickname: string },
  ) {
    const room = this.gameService.joinRoom(data.roomId, data.playerId, client.id, data.maskType, data.nickname);
    
    if (!room) {
      client.emit('error', { message: 'Could not join room' });
      return;
    }

    client.join(room.id);
    
    const publicPlayers = this.gameService.getPublicPlayers(room);
    client.emit('room_joined', { roomId: room.id, players: publicPlayers });

    const newPlayer = publicPlayers.find(p => p.id === data.playerId);
    if (newPlayer) {
      client.to(room.id).emit('player_joined', { player: newPlayer });
    }

    console.log(`[ROOM] ${data.maskType} joined ${room.id} (${room.players.length}/4)`);
  }

  @SubscribeMessage('leave_room')
  handleLeaveRoom(@ConnectedSocket() client: Socket) {
    const result = this.gameService.leaveRoom(client.id);
    if (result) {
      client.leave(result.room.id);
      this.server.to(result.room.id).emit('player_left', { playerId: result.playerId });
    }
  }

  @SubscribeMessage('player_ready')
  handlePlayerReady(@ConnectedSocket() client: Socket) {
    const result = this.gameService.setPlayerReady(client.id, true);
    if (!result) return;

    this.server.to(result.room.id).emit('player_ready_change', {
      playerId: result.playerId,
      isReady: true,
    });

    console.log(`[READY] ${result.playerId} is ready`);
  }

  @SubscribeMessage('start_game')
  handleStartGame(@ConnectedSocket() client: Socket) {
    // Verify creator
    if (!this.gameService.isRoomCreator(client.id)) {
      client.emit('error', { message: 'Only room creator can start the game' });
      return;
    }

    const room = this.gameService.getRoomBySocketId(client.id);
    if (!room) {
      client.emit('error', { message: 'Room not found' });
      return;
    }

    if (!this.gameService.canStartGame(room.id)) {
      client.emit('error', { message: 'Cannot start game (need at least 2 players)' });
      return;
    }

    // Start game - this deals cards and purges pairs
    const startedRoom = this.gameService.startGame(room.id);
    if (!startedRoom) {
      client.emit('error', { message: 'Failed to start game' });
      return;
    }

    // Notify all players
    this.server.to(room.id).emit('game_started', { phase: startedRoom.phase });

    // Send each player their hand
    for (const player of startedRoom.players) {
      const playerSocket = this.server.sockets.sockets.get(player.socketId);
      if (playerSocket) {
        playerSocket.emit('hand_dealt', { cards: player.hand });
      }
    }

    // Emit pairs purged for each player
    for (const player of startedRoom.players) {
      const pairRecord = startedRoom.discardedPairs.filter(d => d.playerId === player.id);
      if (pairRecord.length > 0) {
        this.server.to(room.id).emit('pairs_purged', {
          playerId: player.id,
          pairs: pairRecord.map(r => r.cards),
          remainingCount: player.hand.length,
        });
      }
    }

    console.log(`[GAME] Started in room ${room.id} with ${startedRoom.players.length} players`);

    // Notify first player of their turn
    this.notifyCurrentPlayerTurn(room.id);
  }

  @SubscribeMessage('draw_card')
  handleDrawCard(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { cardIndex?: number },
  ) {
    const result = this.gameService.drawCard(client.id, data.cardIndex);

    if (!result.success) {
      client.emit('invalid_move', { reason: result.error || 'Invalid draw' });
      return;
    }

    const room = result.room!;

    // Broadcast the draw result
    if (result.drawnCard) {
      const drawerPlayer = room.players.find(p => p.id === result.drawerId);
      const targetPlayer = room.players.find(p => p.id === result.targetId);

      this.server.to(room.id).emit('card_drawn', {
        drawerId: result.drawerId,
        targetId: result.targetId,
        formedPair: result.formedPair || false,
        pair: result.formedPair && result.matchedCard 
          ? [result.drawnCard, result.matchedCard] as [any, any]
          : undefined,
        drawerCardCount: drawerPlayer?.hand.length || 0,
        targetCardCount: targetPlayer?.hand.length || 0,
      });

      // Send updated hand to drawer
      if (drawerPlayer) {
        const drawerSocket = this.server.sockets.sockets.get(drawerPlayer.socketId);
        if (drawerSocket) {
          drawerSocket.emit('hand_dealt', { cards: drawerPlayer.hand });
        }
      }
    }

    // Player emptied their hand
    if (result.playerEmptied) {
      this.server.to(room.id).emit('player_emptied', { playerId: result.drawerId });
    }

    // Round over - someone is stuck with The Glitch
    if (result.roundOver) {
      this.server.to(room.id).emit('round_over', {
        loserId: result.loserId,
        glitchCard: result.glitchCard,
        standings: result.standings,
      });

      this.server.to(room.id).emit('game_over', {
        finalWinnerId: room.players.find(p => !p.isEliminated)?.id || '',
        finalStandings: result.standings,
      });

      console.log(`[GAME OVER] Room ${room.id} - Loser: ${result.loserId}`);
      return;
    }

    // Notify next player
    this.notifyCurrentPlayerTurn(room.id);
  }

  @SubscribeMessage('get_rooms')
  handleGetRooms() {
    return this.gameService.getAllRooms();
  }

  // Notify current player it's their turn
  private notifyCurrentPlayerTurn(roomId: string) {
    const room = this.gameService.getRoom(roomId);
    if (!room) return;

    const currentPlayer = this.gameService.getCurrentPlayer(roomId);
    if (!currentPlayer) return;

    // Skip players who have already emptied their hand
    if (currentPlayer.hand.length === 0) {
      this.gameService.advanceToNextPlayer(room);
      this.notifyCurrentPlayerTurn(roomId);
      return;
    }

    const targetPlayer = this.gameService.getDrawTarget(roomId);
    if (!targetPlayer) return;

    // Skip if target has no cards (shouldn't happen, but safety check)
    if (targetPlayer.hand.length === 0) {
      this.gameService.advanceToNextPlayer(room);
      this.notifyCurrentPlayerTurn(roomId);
      return;
    }

    const currentSocket = this.server.sockets.sockets.get(currentPlayer.socketId);
    if (currentSocket) {
      currentSocket.emit('your_turn', {
        targetPlayerId: targetPlayer.id,
        targetCardCount: targetPlayer.hand.length,
      });
      console.log(`[TURN] ${currentPlayer.maskType}'s turn to draw from ${targetPlayer.maskType} (${targetPlayer.hand.length} cards)`);
    }
  }
}
