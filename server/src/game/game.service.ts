import { Injectable } from '@nestjs/common';
import { 
  GameRoom, 
  Player, 
  Card, 
  Phase, 
  MaskType, 
  PlayedCard,
  Trick,
  PublicPlayer,
  PlayerStanding,
  PHASE_CONFIGS,
} from '../shared/types';
import {
  createDeck,
  deal,
  removeCards,
  removeCardFromHand,
  cardEquals,
} from '../engine/deck';
import {
  canPlayCard,
  determineTrickWinner,
  getValidCards,
  findFirstLeader,
} from '../engine/rules';
import {
  calculateTrickDamage,
  applyDamage,
} from '../engine/damage';
import {
  getPhaseConfig,
  determineEliminated,
  advancePhase,
  getPlacement,
  calculateRatingChange,
  resetIntegrity,
  clearPhaseData,
  getActivePlayers,
  generateFinalStandings,
} from '../engine/phase';
import { RatingService } from '../rating/rating.service';

@Injectable()
export class GameService {
  private rooms: Map<string, GameRoom> = new Map();
  private playerRoomMap: Map<string, string> = new Map(); // socketId -> roomId
  private eliminations: Map<string, { playerId: string; placement: number }[]> = new Map();

  constructor(private readonly ratingService: RatingService) {}

  // Generate unique room ID
  generateRoomId(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  // Create a new game room
  createRoom(playerId: string, socketId: string, maskType: MaskType): GameRoom {
    const roomId = this.generateRoomId();
    
    const player: Player = {
      id: playerId,
      socketId,
      maskType,
      hand: [],
      integrity: 100,
      isEliminated: false,
      isReady: false,
      rating: this.ratingService.getRating(playerId),
      tricksWon: [],
    };

    const room: GameRoom = {
      id: roomId,
      creatorId: playerId, // Track who created the room
      phase: 'WAITING',
      players: [player],
      currentTrick: [],
      tricks: [],
      currentPlayerIndex: 0,
      heartsBroken: false,
      leadSuit: null,
      phaseNumber: 0,
    };

    this.rooms.set(roomId, room);
    this.playerRoomMap.set(socketId, roomId);
    this.eliminations.set(roomId, []);

    console.log(`🎴 Room ${roomId} created by player ${playerId}`);
    return room;
  }

  // Join an existing room
  joinRoom(roomId: string, playerId: string, socketId: string, maskType: MaskType): GameRoom | null {
    const room = this.rooms.get(roomId);
    
    if (!room) {
      console.log(`❌ Room ${roomId} not found`);
      return null;
    }

    if (room.phase !== 'WAITING') {
      console.log(`❌ Room ${roomId} game already in progress`);
      return null;
    }

    if (room.players.length >= 4) {
      console.log(`❌ Room ${roomId} is full`);
      return null;
    }

    // Check if player already in room
    if (room.players.some(p => p.id === playerId)) {
      console.log(`❌ Player ${playerId} already in room ${roomId}`);
      return null;
    }

    const player: Player = {
      id: playerId,
      socketId,
      maskType,
      hand: [],
      integrity: 100,
      isEliminated: false,
      isReady: false,
      rating: this.ratingService.getRating(playerId),
      tricksWon: [],
    };

    room.players.push(player);
    this.playerRoomMap.set(socketId, roomId);

    console.log(`🎴 Player ${playerId} joined room ${roomId} (${room.players.length}/4)`);
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

    const player = room.players[playerIndex];
    room.players.splice(playerIndex, 1);
    this.playerRoomMap.delete(socketId);

    console.log(`🚪 Player ${player.id} left room ${roomId}`);

    // Delete room if empty
    if (room.players.length === 0) {
      this.rooms.delete(roomId);
      this.eliminations.delete(roomId);
      console.log(`🗑️ Room ${roomId} deleted (empty)`);
    }

    return { room, playerId: player.id };
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
    return room.players.length === 4 && room.players.every(p => p.isReady);
  }

  // Start the game
  startGame(roomId: string): GameRoom | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    if (room.players.length !== 4) {
      console.log(`❌ Cannot start: need 4 players, have ${room.players.length}`);
      return null;
    }

    room.phase = 'QUADRANT';
    room.phaseNumber = 1;
    this.startPhase(room);

    console.log(`🎮 Game started in room ${roomId}`);
    return room;
  }

  // Start a phase (deal cards, set first player)
  private startPhase(room: GameRoom): void {
    const config = getPhaseConfig(room.phase);
    if (!config) return;

    // Reset for new phase
    room.currentTrick = [];
    room.tricks = [];
    room.heartsBroken = false;
    room.leadSuit = null;

    // Clear player data and reset integrity
    const activePlayers = getActivePlayers(room.players);
    resetIntegrity(room.players);
    clearPhaseData(room.players);

    // Build and deal deck
    let deck = createDeck();
    if (config.removeCards.length > 0) {
      deck = removeCards(deck, config.removeCards);
    }

    const hands = deal(deck, config.cardsPerPlayer, activePlayers.length);
    
    // Assign hands to active players
    activePlayers.forEach((player, index) => {
      player.hand = hands[index];
    });

    // Find first leader (player with 2♣ or 3♣)
    const activeHands = activePlayers.map(p => p.hand);
    const firstLeaderIndex = findFirstLeader(activeHands);
    
    // Set current player to the first leader
    const firstLeader = activePlayers[firstLeaderIndex];
    room.currentPlayerIndex = room.players.findIndex(p => p.id === firstLeader.id);

    console.log(`📦 Phase ${room.phase} started: ${activePlayers.length} players, ${config.cardsPerPlayer} cards each`);
  }

  // Play a card
  playCard(socketId: string, card: Card): {
    success: boolean;
    room?: GameRoom;
    playerId?: string;
    trickComplete?: boolean;
    trickWinner?: string;
    trickDamage?: Record<string, number>;
    phaseComplete?: boolean;
    eliminatedId?: string;
    gameOver?: boolean;
    finalStandings?: PlayerStanding[];
    error?: string;
  } {
    const roomId = this.playerRoomMap.get(socketId);
    if (!roomId) return { success: false, error: 'Not in a room' };

    const room = this.rooms.get(roomId);
    if (!room) return { success: false, error: 'Room not found' };

    const player = room.players.find(p => p.socketId === socketId);
    if (!player) return { success: false, error: 'Player not found' };

    // Check if it's this player's turn
    const currentPlayer = room.players[room.currentPlayerIndex];
    if (currentPlayer.id !== player.id) {
      return { success: false, error: 'Not your turn' };
    }

    // Validate card play
    const isFirstTrick = room.tricks.length === 0 && room.currentTrick.length === 0;
    const isLeading = room.currentTrick.length === 0;
    const ledSuit = room.currentTrick.length > 0 ? room.currentTrick[0].card.suit : null;

    const validation = canPlayCard(
      card,
      player.hand,
      ledSuit,
      room.heartsBroken,
      isFirstTrick,
      isLeading
    );

    if (!validation.valid) {
      return { success: false, error: validation.reason };
    }

    // Play the card
    const playedCard: PlayedCard = { playerId: player.id, card };
    room.currentTrick.push(playedCard);
    player.hand = removeCardFromHand(player.hand, card);

    // Set lead suit if first card
    if (room.currentTrick.length === 1) {
      room.leadSuit = card.suit;
    }

    // Check if hearts broken
    if (card.suit === 'hearts') {
      room.heartsBroken = true;
    }

    console.log(`🃏 ${player.id} played ${card.rank}${card.suit}`);

    // Check if trick is complete
    const activePlayers = getActivePlayers(room.players);
    if (room.currentTrick.length === activePlayers.length) {
      return this.completeTrick(room, player.id);
    }

    // Move to next player
    this.advanceToNextPlayer(room);

    return { success: true, room, playerId: player.id };
  }

  // Complete a trick
  private completeTrick(room: GameRoom, lastPlayerId: string): {
    success: boolean;
    room: GameRoom;
    playerId: string;
    trickComplete: true;
    trickWinner: string;
    trickDamage: Record<string, number>;
    phaseComplete?: boolean;
    eliminatedId?: string;
    gameOver?: boolean;
    finalStandings?: PlayerStanding[];
  } {
    const winnerId = determineTrickWinner(room.currentTrick);
    const trick: Trick = {
      cards: [...room.currentTrick],
      winnerId,
    };
    room.tricks.push(trick);

    // Give cards to winner
    const winner = room.players.find(p => p.id === winnerId);
    if (winner) {
      const trickCards = room.currentTrick.map(pc => pc.card);
      winner.tricksWon.push(trickCards);

      // Calculate and apply damage immediately
      const damage = calculateTrickDamage(trickCards);
      if (damage > 0) {
        winner.integrity = applyDamage(winner.integrity, damage);
      }
    }

    // Build damage record
    const trickDamage: Record<string, number> = {};
    for (const player of room.players) {
      trickDamage[player.id] = player.integrity;
    }

    console.log(`✅ Trick won by ${winnerId}`);

    // Clear trick
    room.currentTrick = [];
    room.leadSuit = null;

    // Check if phase is complete (all cards played)
    const activePlayers = getActivePlayers(room.players);
    const allCardsPlayed = activePlayers.every(p => p.hand.length === 0);

    if (allCardsPlayed) {
      return {
        ...this.completePhase(room),
        trickComplete: true,
        trickWinner: winnerId,
        trickDamage,
        playerId: lastPlayerId,
      };
    }

    // Set winner as next player
    room.currentPlayerIndex = room.players.findIndex(p => p.id === winnerId);

    return {
      success: true,
      room,
      playerId: lastPlayerId,
      trickComplete: true,
      trickWinner: winnerId,
      trickDamage,
    };
  }

  // Complete a phase
  private completePhase(room: GameRoom): {
    success: boolean;
    room: GameRoom;
    phaseComplete: boolean;
    eliminatedId?: string;
    gameOver?: boolean;
    finalStandings?: PlayerStanding[];
  } {
    const activePlayers = getActivePlayers(room.players);
    
    // Determine eliminated player
    const eliminated = determineEliminated(activePlayers);
    eliminated.isEliminated = true;
    
    const placement = getPlacement(room.phase);
    const ratingChange = calculateRatingChange(placement as 1 | 2 | 3 | 4);
    
    // Update rating
    this.ratingService.updateRating(eliminated.id, ratingChange);
    eliminated.rating = this.ratingService.getRating(eliminated.id);

    // Track elimination
    const roomEliminations = this.eliminations.get(room.id) || [];
    roomEliminations.push({ playerId: eliminated.id, placement });
    this.eliminations.set(room.id, roomEliminations);

    console.log(`💀 ${eliminated.id} eliminated at ${placement}th place (${ratingChange} rating)`);

    // Check if game over
    const remainingPlayers = getActivePlayers(room.players);
    if (remainingPlayers.length <= 1) {
      // Game over - crown the winner
      const winner = remainingPlayers[0];
      if (winner) {
        const winnerRatingChange = calculateRatingChange(1);
        this.ratingService.updateRating(winner.id, winnerRatingChange);
        winner.rating = this.ratingService.getRating(winner.id);
      }

      room.phase = 'GAME_OVER';
      const finalStandings = generateFinalStandings(room.players, roomEliminations);

      console.log(`🏆 Game over! Winner: ${winner?.id}`);

      return {
        success: true,
        room,
        phaseComplete: true,
        eliminatedId: eliminated.id,
        gameOver: true,
        finalStandings,
      };
    }

    // Advance to next phase
    room.phase = advancePhase(room.phase);
    room.phaseNumber++;
    this.startPhase(room);

    console.log(`📈 Advancing to phase ${room.phase}`);

    return {
      success: true,
      room,
      phaseComplete: true,
      eliminatedId: eliminated.id,
    };
  }

  // Advance to next active player
  private advanceToNextPlayer(room: GameRoom): void {
    const activePlayers = getActivePlayers(room.players);
    let nextIndex = room.currentPlayerIndex;

    do {
      nextIndex = (nextIndex + 1) % room.players.length;
    } while (room.players[nextIndex].isEliminated);

    room.currentPlayerIndex = nextIndex;
  }

  // Get current player
  getCurrentPlayer(roomId: string): Player | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    return room.players[room.currentPlayerIndex];
  }

  // Get valid cards for current player
  getValidCardsForCurrentPlayer(roomId: string): Card[] {
    const room = this.rooms.get(roomId);
    if (!room) return [];

    const player = room.players[room.currentPlayerIndex];
    if (!player || player.isEliminated) return [];

    const isFirstTrick = room.tricks.length === 0 && room.currentTrick.length === 0;
    const isLeading = room.currentTrick.length === 0;
    const ledSuit = room.currentTrick.length > 0 ? room.currentTrick[0].card.suit : null;

    return getValidCards(
      player.hand,
      ledSuit,
      room.heartsBroken,
      isFirstTrick,
      isLeading
    );
  }

  // Get public player data (hide hands)
  getPublicPlayers(room: GameRoom): PublicPlayer[] {
    return room.players.map(p => ({
      id: p.id,
      maskType: p.maskType,
      integrity: p.integrity,
      isEliminated: p.isEliminated,
      isReady: p.isReady,
      rating: p.rating,
      cardCount: p.hand.length,
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
    const rooms: { id: string; playerCount: number; phase: Phase }[] = [];
    
    this.rooms.forEach((room, id) => {
      rooms.push({
        id,
        playerCount: room.players.length,
        phase: room.phase,
      });
    });

    return rooms;
  }

  // Check if player is room creator
  isRoomCreator(socketId: string): boolean {
    const room = this.getRoomBySocketId(socketId);
    if (!room) return false;
    
    const player = room.players.find(p => p.socketId === socketId);
    return player?.id === room.creatorId;
  }

  // Check if game can be started (4 players in room)
  canStartGame(roomId: string): boolean {
    const room = this.rooms.get(roomId);
    return room?.players.length === 4 && room.phase === 'WAITING';
  }

  // Get creator ID for a room
  getRoomCreatorId(roomId: string): string | null {
    const room = this.rooms.get(roomId);
    return room?.creatorId || null;
  }
}
