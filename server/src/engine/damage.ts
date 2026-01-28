// ============================================
// ROYAL GLITCH - Damage Calculation
// Pair Annihilation System (Old Maid Variant)
// ============================================

import { Card } from '../shared/types';

// Helper functions for card checks
function isHeart(card: Card): boolean {
  return card.suit === 'hearts';
}

function isQueenOfSpades(card: Card): boolean {
  return card.suit === 'spades' && card.rank === 'Q';
}

function isJackOfDiamonds(card: Card): boolean {
  return card.suit === 'diamonds' && card.rank === 'J';
}

// Note: The Pair Annihilation variant doesn't use traditional damage mechanics
// like Hearts does. This module is kept for potential future extensions.
// In this variant, damage is tracked through the round_end mechanism.

// Calculate damage from a set of cards (placeholder for potential extension)
export function calculateDamage(cards: Card[]): number {
  // Pair Annihilation doesn't use damage from collected cards
  return 0;
}

// Calculate damage for a single trick (placeholder)
export function calculateTrickDamage(trickCards: Card[]): number {
  return 0;
}

// Apply damage to integrity (placeholder - not used in Pair Annihilation)
export function applyDamage(currentIntegrity: number, damage: number): number {
  return Math.max(0, Math.min(100, currentIntegrity - damage));
}

// Get damage breakdown for display (placeholder)
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

  return {
    hearts,
    queenOfSpades,
    jackOfDiamonds,
    totalDamage: 0,
  };
}

// Check if "Shooting the Moon" occurred (placeholder - not used in Pair Annihilation)
export function checkShootTheMoon(cards: Card[]): boolean {
  const heartCount = cards.filter(isHeart).length;
  const hasQueenOfSpades = cards.some(isQueenOfSpades);
  
  return heartCount === 13 && hasQueenOfSpades;
}
