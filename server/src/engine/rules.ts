// ============================================
// ROYAL GLITCH - Pair Annihilation Rules
// Old Maid Variant Game Logic
// ============================================

import { Card } from '../shared/types';
import { isPair, isGlitch, cardEquals, removeCardByIndex } from './deck';

// Result of finding pairs in a hand
export interface PairResult {
  pairs: [Card, Card][];     // Matched pairs to be discarded
  remaining: Card[];          // Cards left after purge
  pairCount: number;          // Number of pairs found
}

// Find all pairs in a hand and return separated result
export function findPairs(hand: Card[]): PairResult {
  const pairs: [Card, Card][] = [];
  const used = new Set<number>();
  
  // Compare each card with every other card to find pairs
  for (let i = 0; i < hand.length; i++) {
    if (used.has(i)) continue;
    
    for (let j = i + 1; j < hand.length; j++) {
      if (used.has(j)) continue;
      
      if (isPair(hand[i], hand[j])) {
        pairs.push([hand[i], hand[j]]);
        used.add(i);
        used.add(j);
        break; // Each card can only be in one pair
      }
    }
  }
  
  // Get remaining unpaired cards
  const remaining = hand.filter((_, idx) => !used.has(idx));
  
  return {
    pairs,
    remaining,
    pairCount: pairs.length,
  };
}

// Purge all pairs from a hand (auto-discard on deal or after draw)
export function purgePairs(hand: Card[]): PairResult {
  return findPairs(hand);
}

// Check if a specific card can form a pair with any card in hand
export function findMatchingCard(hand: Card[], card: Card): Card | null {
  // The Glitch (♠Q) cannot pair with anything since other Queens are removed
  if (isGlitch(card)) {
    return null;
  }
  
  for (const handCard of hand) {
    if (isPair(card, handCard) && !cardEquals(card, handCard)) {
      return handCard;
    }
  }
  
  return null;
}

// Draw a card and check for new pair
export interface DrawResult {
  drawnCard: Card;
  formedPair: boolean;
  matchedCard: Card | null;
  newHand: Card[];          // Hand after adding card and removing pair (if any)
}

export function processDrawnCard(hand: Card[], drawnCard: Card): DrawResult {
  const matchedCard = findMatchingCard(hand, drawnCard);
  
  if (matchedCard) {
    // Pair formed - remove the matched card from hand (drawn card never added)
    const newHand = hand.filter(c => !cardEquals(c, matchedCard));
    return {
      drawnCard,
      formedPair: true,
      matchedCard,
      newHand,
    };
  } else {
    // No pair - add drawn card to hand
    return {
      drawnCard,
      formedPair: false,
      matchedCard: null,
      newHand: [...hand, drawnCard],
    };
  }
}

// Check if a player has won (empty hand and not holding Glitch)
export function hasWon(hand: Card[]): boolean {
  return hand.length === 0;
}

// Check if a player has lost (only card is Glitch and everyone else is empty)
export function hasLost(hand: Card[], allOtherHandsEmpty: boolean): boolean {
  if (!allOtherHandsEmpty) return false;
  
  // Must be holding exactly the Glitch
  return hand.length === 1 && isGlitch(hand[0]);
}

// Check if game is over (one player holds only Glitch, others empty)
export function isGameOver(hands: Card[][]): { over: boolean; loserIndex: number } {
  const nonEmptyHands = hands.map((h, i) => ({ hand: h, index: i }))
    .filter(({ hand }) => hand.length > 0);
  
  if (nonEmptyHands.length === 1) {
    const { hand, index } = nonEmptyHands[0];
    // Should be holding exactly the Glitch
    if (hand.length === 1 && isGlitch(hand[0])) {
      return { over: true, loserIndex: index };
    }
  }
  
  return { over: false, loserIndex: -1 };
}

// Get next player index (skipping eliminated players with empty hands)
export function getNextPlayer(
  currentIndex: number, 
  hands: Card[][], 
  playerCount: number
): number {
  let next = (currentIndex + 1) % playerCount;
  let attempts = 0;
  
  // Find next player with cards
  while (hands[next].length === 0 && attempts < playerCount) {
    next = (next + 1) % playerCount;
    attempts++;
  }
  
  return next;
}

// Get previous player index (the one we draw FROM)
export function getPreviousPlayer(
  currentIndex: number,
  hands: Card[][],
  playerCount: number
): number {
  let prev = (currentIndex - 1 + playerCount) % playerCount;
  let attempts = 0;
  
  // Find previous player with cards
  while (hands[prev].length === 0 && attempts < playerCount) {
    prev = (prev - 1 + playerCount) % playerCount;
    attempts++;
  }
  
  return prev;
}

// Count total cards remaining in all hands
export function countTotalCards(hands: Card[][]): number {
  return hands.reduce((sum, hand) => sum + hand.length, 0);
}

// Count players still in game (have cards or are the potential Glitch holder)
export function countActivePlayers(hands: Card[][]): number {
  return hands.filter(h => h.length > 0).length;
}
