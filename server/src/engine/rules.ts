// ============================================
// ROYAL GLITCH - Hearts Rule Validation
// ============================================

import { Card, Suit, PlayedCard } from '../shared/types';
import { isHeart, isQueenOfSpades } from './deck';

// Check if player has any cards of a specific suit
export function hasSuit(hand: Card[], suit: Suit): boolean {
  return hand.some(card => card.suit === suit);
}

// Get all cards of a specific suit from hand
export function getCardsOfSuit(hand: Card[], suit: Suit): Card[] {
  return hand.filter(card => card.suit === suit);
}

// Check if a card play is valid
export function canPlayCard(
  card: Card,
  hand: Card[],
  ledSuit: Suit | null,
  heartsBroken: boolean,
  isFirstTrick: boolean,
  isLeading: boolean
): { valid: boolean; reason?: string } {
  // Card must be in hand
  if (!hand.some(c => c.suit === card.suit && c.rank === card.rank)) {
    return { valid: false, reason: 'Card not in hand' };
  }

  // First trick restrictions
  if (isFirstTrick) {
    // Cannot play hearts on first trick
    if (isHeart(card)) {
      // Unless hand is ALL hearts
      if (hand.some(c => !isHeart(c))) {
        return { valid: false, reason: 'Cannot play hearts on first trick' };
      }
    }
    // Cannot play Queen of Spades on first trick
    if (isQueenOfSpades(card)) {
      // Unless hand has only Queen of Spades and hearts
      const nonHearts = hand.filter(c => !isHeart(c));
      if (nonHearts.length > 1 || (nonHearts.length === 1 && !isQueenOfSpades(nonHearts[0]))) {
        return { valid: false, reason: 'Cannot play Queen of Spades on first trick' };
      }
    }
  }

  // If leading a trick
  if (isLeading) {
    // Cannot lead with hearts until hearts are broken
    if (isHeart(card) && !heartsBroken) {
      // Unless player has only hearts
      if (hand.some(c => !isHeart(c))) {
        return { valid: false, reason: 'Hearts not broken yet' };
      }
    }
    return { valid: true };
  }

  // Following a trick - must follow suit if able
  if (ledSuit) {
    if (hasSuit(hand, ledSuit)) {
      if (card.suit !== ledSuit) {
        return { valid: false, reason: `Must follow suit (${ledSuit})` };
      }
    }
    // If can't follow suit, any card is valid
  }

  return { valid: true };
}

// Determine the winner of a trick
export function determineTrickWinner(trick: PlayedCard[]): string {
  if (trick.length === 0) {
    throw new Error('Empty trick');
  }

  const ledSuit = trick[0].card.suit;
  let winner = trick[0];

  for (const played of trick.slice(1)) {
    // Only cards of the led suit can win
    if (played.card.suit === ledSuit && played.card.value > winner.card.value) {
      winner = played;
    }
  }

  return winner.playerId;
}

// Check if hearts have been broken (any heart or Queen of Spades played)
export function checkHeartsBroken(playedCards: Card[]): boolean {
  return playedCards.some(card => isHeart(card) || isQueenOfSpades(card));
}

// Get valid cards that can be played
export function getValidCards(
  hand: Card[],
  ledSuit: Suit | null,
  heartsBroken: boolean,
  isFirstTrick: boolean,
  isLeading: boolean
): Card[] {
  return hand.filter(card => {
    const result = canPlayCard(card, hand, ledSuit, heartsBroken, isFirstTrick, isLeading);
    return result.valid;
  });
}

// Find who should lead first (player with 2 of clubs, or 3 of clubs in Phase 2)
export function findFirstLeader(hands: Card[][]): number {
  // Look for 2 of clubs first
  for (let i = 0; i < hands.length; i++) {
    if (hands[i].some(c => c.suit === 'clubs' && c.rank === '2')) {
      return i;
    }
  }
  // If 2 of clubs was removed (Phase 2), look for 3 of clubs
  for (let i = 0; i < hands.length; i++) {
    if (hands[i].some(c => c.suit === 'clubs' && c.rank === '3')) {
      return i;
    }
  }
  // Fallback to first player
  return 0;
}
