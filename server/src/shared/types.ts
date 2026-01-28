// ============================================
// ROYAL GLITCH - Shared Types
// Pair Annihilation System (Old Maid Variant)
// ============================================

// Card Types
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  suit: Suit;
  rank: Rank;
  value: number; // 2-14 for ranking
  isGlitch?: boolean; // True for ♠Q (The Glitch)
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

// Game Phases (Simplified for Pair Annihilation)
export type Phase = 'WAITING' | 'PLAYING' | 'GAME_OVER';

// Player
export interface Player {
  id: string;
  socketId: string;
  maskType: MaskType;
  nickname: string;
  hand: Card[];
  isEliminated: boolean; // Lost the round (held Glitch)
  isReady: boolean;
  rating: number;
  hasWon: boolean; // Emptied hand without Glitch
}

// Discarded pair record
export interface DiscardedPair {
  playerId: string;
  cards: [Card, Card];
  timestamp: number;
}

// Draw action record
export interface DrawAction {
  drawerId: string;      // Who drew
  targetId: string;      // From whom
  drawnCard: Card;       // What was drawn
  formedPair: boolean;   // Did it form a pair?
  matchedCard?: Card;    // The card it matched with (if any)
  timestamp: number;
}

// Game Room
export interface GameRoom {
  id: string;
  creatorId: string;
  phase: Phase;
  players: Player[];
  currentPlayerIndex: number;
  discardedPairs: DiscardedPair[];
  drawHistory: DrawAction[];
  roundNumber: number;
  glitchHolderId?: string; // Track who currently has The Glitch
}

// Rating Changes (for end of round)
export const RATING_CHANGES = {
  WINNER: 15,   // Each winner: +15
  LOSER: -30,   // The Glitch holder: -30
} as const;

export const STARTING_RATING = 1000;
export const MIN_RATING = 0;

// Socket Events - Client to Server
export interface ClientToServerEvents {
  create_room: (data: { maskType: MaskType; nickname: string }) => void;
  join_room: (data: { roomId: string; maskType: MaskType; nickname: string }) => void;
  leave_room: (data: { roomId: string }) => void;
  player_ready: (data: { roomId: string }) => void;
  start_game: (data: { roomId: string }) => void;
  draw_card: (data: { roomId: string; cardIndex: number }) => void; // Blind draw
}

// Socket Events - Server to Client
export interface ServerToClientEvents {
  room_created: (data: { roomId: string }) => void;
  room_joined: (data: { roomId: string; players: PublicPlayer[] }) => void;
  player_joined: (data: { player: PublicPlayer }) => void;
  player_left: (data: { playerId: string }) => void;
  player_ready_change: (data: { playerId: string; isReady: boolean }) => void;
  game_started: (data: { phase: Phase }) => void;
  
  // Pair Annihilation events
  hand_dealt: (data: { cards: Card[] }) => void;
  pairs_purged: (data: { 
    playerId: string; 
    pairs: [Card, Card][]; 
    remainingCount: number 
  }) => void;
  
  your_turn: (data: { 
    targetPlayerId: string;  // Who to draw from
    targetCardCount: number; // How many cards they have
  }) => void;
  
  card_drawn: (data: { 
    drawerId: string; 
    targetId: string; 
    formedPair: boolean;
    pair?: [Card, Card]; // The pair if formed (visible to all)
    drawerCardCount: number;
    targetCardCount: number;
  }) => void;
  
  player_emptied: (data: { playerId: string }) => void; // Player won by emptying hand
  
  round_over: (data: { 
    loserId: string;     // Who held The Glitch
    glitchCard: Card;    // The Glitch card
    standings: PlayerStanding[];
  }) => void;
  
  game_over: (data: { 
    finalWinnerId: string; 
    finalStandings: PlayerStanding[] 
  }) => void;
  
  mask_emotion: (data: { playerId: string; emotion: MaskEmotion }) => void;
  invalid_move: (data: { reason: string }) => void;
  error: (data: { message: string }) => void;
}

// Public Player (without sensitive info like hand)
export interface PublicPlayer {
  id: string;
  maskType: MaskType;
  nickname: string;
  isEliminated: boolean;
  isReady: boolean;
  rating: number;
  cardCount: number;
  hasWon: boolean;
}

// Player Standing
export interface PlayerStanding {
  playerId: string;
  placement: number;
  isLoser: boolean;
  ratingChange: number;
  newRating: number;
}

// Phase names for display
export const PHASE_NAMES: Record<Phase, string> = {
  WAITING: 'WAITING FOR PLAYERS',
  PLAYING: 'PAIR ANNIHILATION',
  GAME_OVER: 'GAME OVER',
};
