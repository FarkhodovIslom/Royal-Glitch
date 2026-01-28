import { Injectable } from '@nestjs/common';
import { 
  GameRoom, 
  Player, 
  Card, 
  Phase, 
  MaskType, 
  PublicPlayer,
  PlayerStanding,
  DiscardedPair,
  DrawAction,
  RATING_CHANGES,
} from '../shared/types';
import {
  createDeck,
  deal,
  isGlitch,
  drawRandomCard,
  removeCardByIndex,
  sortHand,
  cardToString,
} from '../engine/deck';
import {
  purgePairs,
  processDrawnCard,
  isGameOver,
  getNextPlayer,
  getPreviousPlayer,
  countActivePlayers,
} from '../engine/rules';
import { RatingService } from '../rating/rating.service';

@Injectable()
export class GameService {
  private rooms: Map<string, GameRoom> = new Map();
  private playerRoomMap: Map<string, string> = new Map();

  constructor(private readonly ratingService: RatingService) {}

  // Generate unique room ID
  private generateRoomId(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  // Sanitize nickname
  private sanitizeNickname(nickname: string): string {
    // Trim whitespace and limit to 20 characters
    const sanitized = nickname.trim().slice(0, 20);
    // Return sanitized or default to 'Player'
    return sanitized || 'Player';
  }

  // Create a new game room
  createRoom(playerId: string, socketId: string, maskType: MaskType, nickname: string): GameRoom {
    const roomId = this.generateRoomId();
    
    const player: Player = {
      id: playerId,
      socketId,
      maskType,
      nickname: this.sanitizeNickname(nickname),
      hand: [],
      isEliminated: false,
      isReady: false,
      rating: this.ratingService.getRating(playerId),
      hasWon: false,
    };

    const room: GameRoom = {
      id: roomId,
      creatorId: playerId,
      phase: 'WAITING',
      players: [player],
      currentPlayerIndex: 0,
      discardedPairs: [],
      drawHistory: [],
      roundNumber: 0,
    };

    this.rooms.set(roomId, room);
    this.playerRoomMap.set(socketId, roomId);

    return room;
  }

  // Join an existing room
  joinRoom(roomId: string, playerId: string, socketId: string, maskType: MaskType, nickname: string): GameRoom | null {
    const room = this.rooms.get(roomId);
    
    if (!room) return null;
    if (room.phase !== 'WAITING') return null;
    if (room.players.length >= 4) return null;
    if (room.players.some(p => p.id === playerId)) return null;

    const player: Player = {
      id: playerId,
      socketId,
      maskType,
      nickname: this.sanitizeNickname(nickname),
      hand: [],
      isEliminated: false,
      isReady: false,
      rating: this.ratingService.getRating(playerId),
      hasWon: false,
    };

    room.players.push(player);
    this.playerRoomMap.set(socketId, roomId);

    return room;
  }

  // Leave a room
  leaveRoom(socketId: string): { room: GameRoom; playerId: string } | null {
    const roomId = this.playerRoomMap.get(socketId);
    if (!roomId) return null;

    const room = this.rooms.get(roomId);
    if (!room) return null;

    const playerIndex = room.players.findIndex(p => p.socketId === socketId);
    if (playerIndex === -1) return null;

    const playerId = room.players[playerIndex].id;
    room.players.splice(playerIndex, 1);
    this.playerRoomMap.delete(socketId);

    // Clean up empty rooms
    if (room.players.length === 0) {
      this.rooms.delete(roomId);
      return { room, playerId };
    }

    // Transfer creator if needed
    if (room.creatorId === playerId && room.players.length > 0) {
      room.creatorId = room.players[0].id;
    }

    return { room, playerId };
  }

  // Set player ready status
  setPlayerReady(socketId: string, isReady: boolean): { room: GameRoom; playerId: string } | null {
    const roomId = this.playerRoomMap.get(socketId);
    if (!roomId) return null;

    const room = this.rooms.get(roomId);
    if (!room) return null;

    const player = room.players.find(p => p.socketId === socketId);
    if (!player) return null;

    player.isReady = isReady;
    return { room, playerId: player.id };
  }

  // Check if all players are ready
  allPlayersReady(roomId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;
    return room.players.every(p => p.isReady);
  }

  // Start the game
  startGame(roomId: string): GameRoom | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    if (room.phase !== 'WAITING') return null;
    if (room.players.length < 2) return null; // Minimum 2 players

    room.phase = 'PLAYING';
    room.roundNumber = 1;
    this.dealAndPurge(room);

    return room;
  }

  // Deal cards and auto-purge pairs
  dealAndPurge(room: GameRoom): Map<string, { pairs: [Card, Card][]; remaining: Card[] }> {
    // Create 49-card deck and deal
    const deck = createDeck();
    const hands = deal(deck, room.players.length);
    
    const purgeResults = new Map<string, { pairs: [Card, Card][]; remaining: Card[] }>();

    // Assign hands and purge pairs
    room.players.forEach((player, index) => {
      const { pairs, remaining } = purgePairs(hands[index]);
      
      // Record discarded pairs
      for (const pair of pairs) {
        room.discardedPairs.push({
          playerId: player.id,
          cards: pair,
          timestamp: Date.now(),
        });
      }

      // Set player's hand to remaining cards
      player.hand = remaining;
      sortHand(player.hand);
      player.hasWon = player.hand.length === 0;
      
      // Track who has the Glitch
      if (player.hand.some(c => isGlitch(c))) {
        room.glitchHolderId = player.id;
      }

      purgeResults.set(player.id, { pairs, remaining });

      console.log(`[DEAL] ${player.maskType}: ${hands[index].length} cards -> purged ${pairs.length} pairs -> ${remaining.length} remaining`);
    });

    // Set first player (random)
    room.currentPlayerIndex = Math.floor(Math.random() * room.players.length);

    return purgeResults;
  }

  // Draw a card from previous player
  drawCard(socketId: string, cardIndex?: number): {
    success: boolean;
    room?: GameRoom;
    drawerId?: string;
    targetId?: string;
    drawnCard?: Card;
    formedPair?: boolean;
    matchedCard?: Card;
    playerEmptied?: boolean;
    roundOver?: boolean;
    loserId?: string;
    glitchCard?: Card;
    standings?: PlayerStanding[];
    error?: string;
  } {
    const roomId = this.playerRoomMap.get(socketId);
    if (!roomId) return { success: false, error: 'Not in a room' };

    const room = this.rooms.get(roomId);
    if (!room) return { success: false, error: 'Room not found' };
    if (room.phase !== 'PLAYING') return { success: false, error: 'Game not in progress' };

    // Verify it's this player's turn
    const currentPlayer = room.players[room.currentPlayerIndex];
    if (currentPlayer.socketId !== socketId) {
      return { success: false, error: 'Not your turn' };
    }

    // Skip if player has no cards (already won)
    if (currentPlayer.hand.length === 0) {
      this.advanceToNextPlayer(room);
      return { success: true, room, drawerId: currentPlayer.id, playerEmptied: true };
    }

    // Get previous player (who we draw from)
    const allHands = room.players.map(p => p.hand);
    const prevPlayerIndex = getPreviousPlayer(room.currentPlayerIndex, allHands, room.players.length);
    const targetPlayer = room.players[prevPlayerIndex];

    // Skip if target has no cards
    if (targetPlayer.hand.length === 0) {
      this.advanceToNextPlayer(room);
      return { success: true, room, drawerId: currentPlayer.id };
    }

    // Draw a random card from target (or specific index if provided)
    let drawIndex: number;
    if (cardIndex !== undefined && cardIndex >= 0 && cardIndex < targetPlayer.hand.length) {
      drawIndex = cardIndex; // Allow specific pick for testing
    } else {
      drawIndex = Math.floor(Math.random() * targetPlayer.hand.length);
    }

    const drawnCard = targetPlayer.hand[drawIndex];
    
    // Remove card from target's hand
    targetPlayer.hand = removeCardByIndex(targetPlayer.hand, drawIndex);

    // Process the drawn card
    const result = processDrawnCard(currentPlayer.hand, drawnCard);
    currentPlayer.hand = result.newHand;
    sortHand(currentPlayer.hand);

    // Record the draw action
    const drawAction: DrawAction = {
      drawerId: currentPlayer.id,
      targetId: targetPlayer.id,
      drawnCard,
      formedPair: result.formedPair,
      matchedCard: result.matchedCard || undefined,
      timestamp: Date.now(),
    };
    room.drawHistory.push(drawAction);

    // If pair formed, record it
    if (result.formedPair && result.matchedCard) {
      room.discardedPairs.push({
        playerId: currentPlayer.id,
        cards: [drawnCard, result.matchedCard],
        timestamp: Date.now(),
      });
    }

    // Update Glitch holder tracking
    this.updateGlitchHolder(room);

    // Check if current player emptied their hand
    const playerEmptied = currentPlayer.hand.length === 0;
    if (playerEmptied) {
      currentPlayer.hasWon = true;
      console.log(`[WIN] ${currentPlayer.maskType} emptied their hand!`);
    }

    // Check for game over
    const gameOverCheck = isGameOver(room.players.map(p => p.hand));
    if (gameOverCheck.over) {
      return this.endRound(room, gameOverCheck.loserIndex, drawnCard, result);
    }

    // Advance to next player
    this.advanceToNextPlayer(room);

    console.log(`[DRAW] ${currentPlayer.maskType} drew ${cardToString(drawnCard)} from ${targetPlayer.maskType} - pair: ${result.formedPair}`);

    return {
      success: true,
      room,
      drawerId: currentPlayer.id,
      targetId: targetPlayer.id,
      drawnCard,
      formedPair: result.formedPair,
      matchedCard: result.matchedCard || undefined,
      playerEmptied,
    };
  }

  // End the round
  private endRound(
    room: GameRoom, 
    loserIndex: number,
    drawnCard: Card,
    drawResult: { formedPair: boolean; matchedCard: Card | null }
  ): {
    success: boolean;
    room: GameRoom;
    drawerId: string;
    targetId: string;
    drawnCard: Card;
    formedPair: boolean;
    matchedCard?: Card;
    roundOver: boolean;
    loserId: string;
    glitchCard: Card;
    standings: PlayerStanding[];
  } {
    const loser = room.players[loserIndex];
    const glitchCard = loser.hand[0]; // Should be The Glitch

    console.log(`[ROUND OVER] ${loser.maskType} is eliminated with The Glitch!`);

    // Mark loser as eliminated
    loser.isEliminated = true;

    // Calculate standings
    const standings = this.calculateStandings(room);

    // Apply rating changes
    for (const standing of standings) {
      this.ratingService.updateRating(standing.playerId, standing.ratingChange);
    }

    room.phase = 'GAME_OVER';

    const currentPlayer = room.players[room.currentPlayerIndex];
    const prevIndex = getPreviousPlayer(room.currentPlayerIndex, room.players.map(p => p.hand), room.players.length);
    const targetPlayer = room.players[prevIndex];

    return {
      success: true,
      room,
      drawerId: currentPlayer.id,
      targetId: targetPlayer.id,
      drawnCard,
      formedPair: drawResult.formedPair,
      matchedCard: drawResult.matchedCard || undefined,
      roundOver: true,
      loserId: loser.id,
      glitchCard,
      standings,
    };
  }

  // Calculate final standings
  private calculateStandings(room: GameRoom): PlayerStanding[] {
    const standings: PlayerStanding[] = [];

    for (const player of room.players) {
      const isLoser = player.isEliminated;
      const ratingChange = isLoser ? RATING_CHANGES.LOSER : RATING_CHANGES.WINNER;
      const newRating = Math.max(0, player.rating + ratingChange);

      standings.push({
        playerId: player.id,
        placement: isLoser ? room.players.length : 1, // Winners all get 1st
        isLoser,
        ratingChange,
        newRating,
      });
    }

    return standings;
  }

  // Update Glitch holder tracking
  private updateGlitchHolder(room: GameRoom): void {
    for (const player of room.players) {
      if (player.hand.some(c => isGlitch(c))) {
        room.glitchHolderId = player.id;
        return;
      }
    }
  }

  // Advance to next active player
  advanceToNextPlayer(room: GameRoom): void {
    const hands = room.players.map(p => p.hand);
    room.currentPlayerIndex = getNextPlayer(room.currentPlayerIndex, hands, room.players.length);
  }

  // Get current player
  getCurrentPlayer(roomId: string): Player | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    return room.players[room.currentPlayerIndex];
  }

  // Get the target player (who current player draws from)
  getDrawTarget(roomId: string): Player | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    
    const hands = room.players.map(p => p.hand);
    const prevIndex = getPreviousPlayer(room.currentPlayerIndex, hands, room.players.length);
    return room.players[prevIndex];
  }

  // Get public player data (hide hands)
  getPublicPlayers(room: GameRoom): PublicPlayer[] {
    return room.players.map(p => ({
      id: p.id,
      maskType: p.maskType,
      nickname: p.nickname,
      isEliminated: p.isEliminated,
      isReady: p.isReady,
      rating: p.rating,
      cardCount: p.hand.length,
      hasWon: p.hasWon,
    }));
  }

  // Get room by ID
  getRoom(roomId: string): GameRoom | undefined {
    return this.rooms.get(roomId);
  }

  // Get room by socket ID
  getRoomBySocketId(socketId: string): GameRoom | undefined {
    const roomId = this.playerRoomMap.get(socketId);
    if (!roomId) return undefined;
    return this.rooms.get(roomId);
  }

  // Get all rooms (for lobby)
  getAllRooms(): { id: string; playerCount: number; phase: Phase }[] {
    const roomList: { id: string; playerCount: number; phase: Phase }[] = [];
    
    this.rooms.forEach((room, id) => {
      roomList.push({
        id,
        playerCount: room.players.length,
        phase: room.phase,
      });
    });

    return roomList;
  }

  // Check if player is room creator
  isRoomCreator(socketId: string): boolean {
    const room = this.getRoomBySocketId(socketId);
    if (!room) return false;
    const player = room.players.find(p => p.socketId === socketId);
    return player?.id === room.creatorId;
  }

  // Check if game can be started (minimum 2 players)
  canStartGame(roomId: string): boolean {
    const room = this.rooms.get(roomId);
    return room ? room.players.length >= 2 && room.phase === 'WAITING' : false;
  }

  // Get creator ID for a room
  getRoomCreatorId(roomId: string): string | null {
    const room = this.rooms.get(roomId);
    return room?.creatorId || null;
  }
}
