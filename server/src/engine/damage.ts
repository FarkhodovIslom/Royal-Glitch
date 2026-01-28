// ============================================
// ROYAL GLITCH - Damage Calculation
// ============================================

import { Card, DAMAGE } from '../shared/types';
import { isHeart, isQueenOfSpades, isJackOfDiamonds } from './deck';

// Calculate damage from a set of cards (cards collected from tricks)
export function calculateDamage(cards: Card[]): number {
  let damage = 0;

  for (const card of cards) {
    if (isHeart(card)) {
      damage += DAMAGE.HEART; // 5% per heart
    }
    if (isQueenOfSpades(card)) {
      damage += DAMAGE.QUEEN_OF_SPADES; // 40% for Queen of Spades
    }
    // Optional: Jack of Diamonds heals
    if (isJackOfDiamonds(card)) {
      damage += DAMAGE.JACK_OF_DIAMONDS; // -10% heal
    }
  }

  return damage;
}

// Calculate damage for a single trick
export function calculateTrickDamage(trickCards: Card[]): number {
  return calculateDamage(trickCards);
}

// Apply damage to integrity (clamp between 0 and 100)
export function applyDamage(currentIntegrity: number, damage: number): number {
  const newIntegrity = currentIntegrity - damage;
  return Math.max(0, Math.min(100, newIntegrity));
}

// Get damage breakdown for display
export interface DamageBreakdown {
  hearts: number;
  queenOfSpades: boolean;
  jackOfDiamonds: boolean;
  totalDamage: number;
}

export function getDamageBreakdown(cards: Card[]): DamageBreakdown {
  let hearts = 0;
  let queenOfSpades = false;
  let jackOfDiamonds = false;

  for (const card of cards) {
    if (isHeart(card)) hearts++;
    if (isQueenOfSpades(card)) queenOfSpades = true;
    if (isJackOfDiamonds(card)) jackOfDiamonds = true;
  }

  const totalDamage = calculateDamage(cards);

  return {
    hearts,
    queenOfSpades,
    jackOfDiamonds,
    totalDamage,
  };
}

// Check if "Shooting the Moon" occurred (got all hearts + Queen of Spades)
// In this variant, we don't use this mechanic, but kept for potential extension
export function checkShootTheMoon(cards: Card[]): boolean {
  const heartCount = cards.filter(isHeart).length;
  const hasQueenOfSpades = cards.some(isQueenOfSpades);
  
  return heartCount === 13 && hasQueenOfSpades;
}
