// ============================================
// ROYAL GLITCH - Client Shared Types
// Mirror of server types for client use
// ============================================

export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  suit: Suit;
  rank: Rank;
  value: number;
  isGlitch?: boolean;
}

export type MaskType = 
  | 'venetian' 
  | 'kabuki' 
  | 'tribal' 
  | 'plague' 
  | 'jester' 
  | 'phantom';

export type MaskEmotion = 'idle' | 'shake' | 'glitch' | 'pulse' | 'crack';

export type Phase = 'WAITING' | 'PLAYING' | 'GAME_OVER';

export interface PublicPlayer {
  id: string;
  maskType: MaskType;
  // integrity: number; // Removed in Pair Annihilation
  isEliminated: boolean;
  isReady: boolean;
  rating: number;
  cardCount: number;
  hasWon: boolean;
}

export interface PlayedCard {
  playerId: string;
  card: Card;
}

export interface PlayerStanding {
  playerId: string;
  placement: number;
  isLoser: boolean;
  ratingChange: number;
  newRating: number;
}

export interface RoomInfo {
  id: string;
  playerCount: number;
  phase: Phase;
}

// Suit symbols for display
export const SUIT_SYMBOLS: Record<Suit, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

// Suit colors
export const SUIT_COLORS: Record<Suit, string> = {
  hearts: '#E53935',
  diamonds: '#E53935',
  clubs: '#1E1E1E',
  spades: '#1E1E1E',
};

// Mask display names
export const MASK_NAMES: Record<MaskType, string> = {
  venetian: 'Venetian',
  kabuki: 'Kabuki',
  tribal: 'Tribal',
  plague: 'Plague Doctor',
  jester: 'Jester',
  phantom: 'Phantom',
};

// Phase display names
export const PHASE_NAMES: Record<Phase, string> = {
  WAITING: 'Waiting for Players',
  PLAYING: 'Pair Annihilation',
  GAME_OVER: 'Game Over',
};
