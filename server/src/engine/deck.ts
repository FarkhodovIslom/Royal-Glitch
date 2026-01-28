// ============================================
// ROYAL GLITCH - Card Deck Management
// ============================================

import { Card, Suit, Rank } from '../shared/types';

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

// Get numeric value for a rank (for comparison)
export function getRankValue(rank: Rank): number {
  const values: Record<Rank, number> = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
    '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
  };
  return values[rank];
}

// Create a standard 52-card deck
export function createDeck(): Card[] {
  const deck: Card[] = [];
  
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        suit,
        rank,
        value: getRankValue(rank),
      });
    }
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

// Deal cards to players
export function deal(deck: Card[], cardsPerPlayer: number, playerCount: number): Card[][] {
  const hands: Card[][] = Array.from({ length: playerCount }, () => []);
  const shuffledDeck = shuffle(deck);
  
  for (let i = 0; i < cardsPerPlayer * playerCount; i++) {
    const playerIndex = i % playerCount;
    hands[playerIndex].push(shuffledDeck[i]);
  }
  
  // Sort each hand by suit then rank
  for (const hand of hands) {
    sortHand(hand);
  }
  
  return hands;
}

// Sort hand by suit (spades, hearts, diamonds, clubs) then by rank
export function sortHand(hand: Card[]): void {
  const suitOrder: Record<Suit, number> = {
    spades: 0,
    hearts: 1,
    diamonds: 2,
    clubs: 3,
  };
  
  hand.sort((a, b) => {
    if (suitOrder[a.suit] !== suitOrder[b.suit]) {
      return suitOrder[a.suit] - suitOrder[b.suit];
    }
    return a.value - b.value;
  });
}

// Remove specific cards from deck (for Phase 2)
export function removeCards(deck: Card[], cardsToRemove: Card[]): Card[] {
  return deck.filter(card => 
    !cardsToRemove.some(remove => 
      remove.suit === card.suit && remove.rank === card.rank
    )
  );
}

// Check if a card matches another
export function cardEquals(a: Card, b: Card): boolean {
  return a.suit === b.suit && a.rank === b.rank;
}

// Check if card is Queen of Spades
export function isQueenOfSpades(card: Card): boolean {
  return card.suit === 'spades' && card.rank === 'Q';
}

// Check if card is Jack of Diamonds
export function isJackOfDiamonds(card: Card): boolean {
  return card.suit === 'diamonds' && card.rank === 'J';
}

// Check if card is a heart
export function isHeart(card: Card): boolean {
  return card.suit === 'hearts';
}

// Find a specific card in a hand
export function findCardInHand(hand: Card[], card: Card): number {
  return hand.findIndex(c => cardEquals(c, card));
}

// Remove a card from hand
export function removeCardFromHand(hand: Card[], card: Card): Card[] {
  const index = findCardInHand(hand, card);
  if (index === -1) return hand;
  
  return [...hand.slice(0, index), ...hand.slice(index + 1)];
}

// Get card display string (for logging)
export function cardToString(card: Card): string {
  const suitSymbols: Record<Suit, string> = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠',
  };
  return `${card.rank}${suitSymbols[card.suit]}`;
}
