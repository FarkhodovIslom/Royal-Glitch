// ============================================
// ROYAL GLITCH - Shared Types
// ============================================

// Card Types
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  suit: Suit;
  rank: Rank;
  value: number; // 2-14 for ranking
}

// Mask Types
export type MaskType = 
  | 'venetian' 
  | 'kabuki' 
  | 'tribal' 
  | 'plague' 
  | 'jester' 
  | 'phantom';

export type MaskEmotion = 'idle' | 'shake' | 'glitch' | 'pulse' | 'crack';

// Game Phases
export type Phase = 'WAITING' | 'QUADRANT' | 'TRIANGLE' | 'DUEL' | 'GAME_OVER';

// Player
export interface Player {
  id: string;
  socketId: string;
  maskType: MaskType;
  hand: Card[];
  integrity: number; // 0-100
  isEliminated: boolean;
  isReady: boolean;
  rating: number;
  tricksWon: Card[][]; // Cards collected from won tricks this phase
}

// Played Card
export interface PlayedCard {
  playerId: string;
  card: Card;
}

// Trick
export interface Trick {
  cards: PlayedCard[];
  winnerId: string;
}

// Game Room
export interface GameRoom {
  id: string;
  creatorId: string; // The player who created the room
  phase: Phase;
  players: Player[];
  currentTrick: PlayedCard[];
  tricks: Trick[];
  currentPlayerIndex: number;
  heartsBroken: boolean;
  leadSuit: Suit | null;
  phaseNumber: number; // 1, 2, or 3
}

// Rating Changes
export const RATING_CHANGES = {
  1: 35,   // 1st place: +35
  2: 0,    // 2nd place: 0
  3: -20,  // 3rd place: -20
  4: -35,  // 4th place: -35
} as const;

export const STARTING_RATING = 1000;
export const MIN_RATING = 0;

// Damage Values
export const DAMAGE = {
  HEART: 5,           // 5% per heart
  QUEEN_OF_SPADES: 40, // 40% for Queen of Spades
  JACK_OF_DIAMONDS: -10, // -10% heal (optional)
} as const;

// Phase Configuration
export interface PhaseConfig {
  phase: Phase;
  playerCount: number;
  cardsPerPlayer: number;
  removeCards: Card[];
}

export const PHASE_CONFIGS: Record<'QUADRANT' | 'TRIANGLE' | 'DUEL', PhaseConfig> = {
  QUADRANT: {
    phase: 'QUADRANT',
    playerCount: 4,
    cardsPerPlayer: 13,
    removeCards: [],
  },
  TRIANGLE: {
    phase: 'TRIANGLE',
    playerCount: 3,
    cardsPerPlayer: 17,
    removeCards: [{ suit: 'clubs', rank: '2', value: 2 }], // Remove 2♣
  },
  DUEL: {
    phase: 'DUEL',
    playerCount: 2,
    cardsPerPlayer: 13,
    removeCards: [],
  },
};

// Socket Events - Client to Server
export interface ClientToServerEvents {
  create_room: (data: { maskType: MaskType }) => void;
  join_room: (data: { roomId: string; maskType: MaskType }) => void;
  leave_room: (data: { roomId: string }) => void;
  player_ready: (data: { roomId: string }) => void;
  play_card: (data: { roomId: string; card: Card }) => void;
}

// Socket Events - Server to Client
export interface ServerToClientEvents {
  room_created: (data: { roomId: string }) => void;
  room_joined: (data: { roomId: string; players: PublicPlayer[] }) => void;
  player_joined: (data: { player: PublicPlayer }) => void;
  player_left: (data: { playerId: string }) => void;
  player_ready_change: (data: { playerId: string; isReady: boolean }) => void;
  game_started: (data: { phase: Phase }) => void;
  hand_dealt: (data: { cards: Card[] }) => void;
  your_turn: (data: { validCards: Card[] }) => void;
  card_played: (data: { playerId: string; card: Card }) => void;
  trick_complete: (data: { winnerId: string; cards: PlayedCard[]; damage: Record<string, number> }) => void;
  integrity_update: (data: { playerId: string; integrity: number }) => void;
  phase_complete: (data: { eliminatedId: string; standings: PlayerStanding[] }) => void;
  player_eliminated: (data: { playerId: string; placement: number }) => void;
  game_over: (data: { winnerId: string; finalStandings: PlayerStanding[] }) => void;
  mask_emotion: (data: { playerId: string; emotion: MaskEmotion }) => void;
  invalid_move: (data: { reason: string }) => void;
  error: (data: { message: string }) => void;
}

// Public Player (without sensitive info like hand)
export interface PublicPlayer {
  id: string;
  maskType: MaskType;
  integrity: number;
  isEliminated: boolean;
  isReady: boolean;
  rating: number;
  cardCount: number;
}

// Player Standing
export interface PlayerStanding {
  playerId: string;
  placement: number;
  ratingChange: number;
  newRating: number;
}
