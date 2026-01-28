// ============================================
// ROYAL GLITCH - Card Deck Management
// Pair Annihilation System (Old Maid Variant)
// ============================================

import { Card, Suit, Rank } from '../shared/types';

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

// The Glitch card identifier
export const GLITCH_CARD: Card = {
  suit: 'spades',
  rank: 'Q',
  value: 12,
  isGlitch: true,
};

// Get numeric value for a rank (for comparison)
export function getRankValue(rank: Rank): number {
  const values: Record<Rank, number> = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
    '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
  };
  return values[rank];
}

// Create the 49-card Pair Annihilation deck
// Removes: ♥Q, ♦Q, ♣Q
// Keeps: ♠Q (The Glitch)
export function createDeck(): Card[] {
  const deck: Card[] = [];
  
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      // Skip the removed Queens (Hearts, Diamonds, Clubs)
      if (rank === 'Q' && suit !== 'spades') {
        continue;
      }
      
      const isGlitch = rank === 'Q' && suit === 'spades';
      
      deck.push({
        suit,
        rank,
        value: getRankValue(rank),
        isGlitch,
      });
    }
  }
  
  // Verify: should be exactly 49 cards (52 - 3 Queens)
  if (deck.length !== 49) {
    throw new Error(`Invalid deck size: expected 49, got ${deck.length}`);
  }
  
  return deck;
}

// Fisher-Yates shuffle algorithm
export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

// Deal cards to players (some may have 1 more card)
export function deal(deck: Card[], playerCount: number): Card[][] {
  const shuffledDeck = shuffle(deck);
  const hands: Card[][] = Array.from({ length: playerCount }, () => []);
  
  // Deal all cards round-robin
  for (let i = 0; i < shuffledDeck.length; i++) {
    const playerIndex = i % playerCount;
    hands[playerIndex].push(shuffledDeck[i]);
  }
  
  return hands;
}

// Check if two cards form a pair (same rank, different suits)
export function isPair(card1: Card, card2: Card): boolean {
  // Same rank = pair (regardless of suit color)
  return card1.rank === card2.rank;
}

// Check if card is The Glitch (♠Q)
export function isGlitch(card: Card): boolean {
  return card.suit === 'spades' && card.rank === 'Q';
}

// Check if card is a Queen (any Queen in original deck)
export function isQueen(card: Card): boolean {
  return card.rank === 'Q';
}

// Check if two cards match (for comparison)
export function cardEquals(a: Card, b: Card): boolean {
  return a.suit === b.suit && a.rank === b.rank;
}

// Find index of a specific card in hand
export function findCardInHand(hand: Card[], card: Card): number {
  return hand.findIndex(c => cardEquals(c, card));
}

// Remove a card from hand by index
export function removeCardByIndex(hand: Card[], index: number): Card[] {
  return [...hand.slice(0, index), ...hand.slice(index + 1)];
}

// Remove a specific card from hand
export function removeCardFromHand(hand: Card[], card: Card): Card[] {
  const index = findCardInHand(hand, card);
  if (index === -1) return hand;
  return removeCardByIndex(hand, index);
}

// Get a random card from a hand (for blind draw)
export function drawRandomCard(hand: Card[]): { card: Card; index: number } | null {
  if (hand.length === 0) return null;
  
  const index = Math.floor(Math.random() * hand.length);
  return { card: hand[index], index };
}

// Sort hand by rank then suit (for display)
export function sortHand(hand: Card[]): void {
  const suitOrder: Record<Suit, number> = {
    spades: 0,
    hearts: 1,
    diamonds: 2,
    clubs: 3,
  };
  
  hand.sort((a, b) => {
    if (a.value !== b.value) {
      return a.value - b.value;
    }
    return suitOrder[a.suit] - suitOrder[b.suit];
  });
}

// Get card display string (for logging)
export function cardToString(card: Card): string {
  const suitSymbols: Record<Suit, string> = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠',
  };
  const glitchTag = card.isGlitch ? ' [GLITCH]' : '';
  return `${card.rank}${suitSymbols[card.suit]}${glitchTag}`;
}
