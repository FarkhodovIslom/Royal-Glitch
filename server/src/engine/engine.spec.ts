// ============================================
// ROYAL GLITCH - Pair Annihilation Tests
// ============================================

import { 
  createDeck, 
  isPair, 
  isGlitch, 
  shuffle, 
  deal, 
  drawRandomCard,
  cardToString,
} from './deck';
import { 
  findPairs, 
  purgePairs, 
  processDrawnCard, 
  isGameOver,
  getNextPlayer,
  getPreviousPlayer,
} from './rules';
import { Card } from '../shared/types';

describe('Deck - Pair Annihilation', () => {
  describe('createDeck', () => {
    it('should create exactly 49 cards', () => {
      const deck = createDeck();
      expect(deck.length).toBe(49);
    });

    it('should remove ♥Q, ♦Q, ♣Q but keep ♠Q', () => {
      const deck = createDeck();
      
      const heartsQueen = deck.find(c => c.suit === 'hearts' && c.rank === 'Q');
      const diamondsQueen = deck.find(c => c.suit === 'diamonds' && c.rank === 'Q');
      const clubsQueen = deck.find(c => c.suit === 'clubs' && c.rank === 'Q');
      const spadesQueen = deck.find(c => c.suit === 'spades' && c.rank === 'Q');
      
      expect(heartsQueen).toBeUndefined();
      expect(diamondsQueen).toBeUndefined();
      expect(clubsQueen).toBeUndefined();
      expect(spadesQueen).toBeDefined();
    });

    it('should mark ♠Q as The Glitch', () => {
      const deck = createDeck();
      const glitch = deck.find(c => c.suit === 'spades' && c.rank === 'Q');
      
      expect(glitch).toBeDefined();
      expect(glitch!.isGlitch).toBe(true);
    });

    it('should have exactly one Glitch card', () => {
      const deck = createDeck();
      const glitchCards = deck.filter(c => c.isGlitch);
      
      expect(glitchCards.length).toBe(1);
    });
  });

  describe('isPair', () => {
    it('should return true for cards with same rank', () => {
      const card1: Card = { suit: 'hearts', rank: '5', value: 5 };
      const card2: Card = { suit: 'clubs', rank: '5', value: 5 };
      
      expect(isPair(card1, card2)).toBe(true);
    });

    it('should return false for cards with different ranks', () => {
      const card1: Card = { suit: 'hearts', rank: '5', value: 5 };
      const card2: Card = { suit: 'clubs', rank: '7', value: 7 };
      
      expect(isPair(card1, card2)).toBe(false);
    });
  });

  describe('isGlitch', () => {
    it('should return true for ♠Q', () => {
      const glitch: Card = { suit: 'spades', rank: 'Q', value: 12, isGlitch: true };
      expect(isGlitch(glitch)).toBe(true);
    });

    it('should return false for other cards', () => {
      const card: Card = { suit: 'hearts', rank: 'A', value: 14 };
      expect(isGlitch(card)).toBe(false);
    });
  });

  describe('deal', () => {
    it('should distribute all 49 cards to players', () => {
      const deck = createDeck();
      const hands = deal(deck, 4);
      
      const totalCards = hands.reduce((sum, hand) => sum + hand.length, 0);
      expect(totalCards).toBe(49);
    });

    it('should give players roughly equal cards (within 1)', () => {
      const deck = createDeck();
      const hands = deal(deck, 4);
      
      const lengths = hands.map(h => h.length);
      const max = Math.max(...lengths);
      const min = Math.min(...lengths);
      
      expect(max - min).toBeLessThanOrEqual(1);
    });
  });
});

describe('Rules - Pair Annihilation', () => {
  describe('findPairs', () => {
    it('should find pairs in a hand', () => {
      const hand: Card[] = [
        { suit: 'hearts', rank: '5', value: 5 },
        { suit: 'clubs', rank: '5', value: 5 },
        { suit: 'hearts', rank: '7', value: 7 },
        { suit: 'clubs', rank: '7', value: 7 },
        { suit: 'hearts', rank: 'K', value: 13 },
      ];
      
      const result = findPairs(hand);
      
      expect(result.pairCount).toBe(2);
      expect(result.remaining.length).toBe(1);
      expect(result.remaining[0].rank).toBe('K');
    });

    it('should leave Glitch unpaired', () => {
      const hand: Card[] = [
        { suit: 'spades', rank: 'Q', value: 12, isGlitch: true },
        { suit: 'hearts', rank: '3', value: 3 },
        { suit: 'clubs', rank: '3', value: 3 },
      ];
      
      const result = findPairs(hand);
      
      expect(result.pairCount).toBe(1);
      expect(result.remaining.length).toBe(1);
      expect(result.remaining[0].isGlitch).toBe(true);
    });
  });

  describe('processDrawnCard', () => {
    it('should form pair when matching card exists', () => {
      const hand: Card[] = [
        { suit: 'hearts', rank: '5', value: 5 },
      ];
      const drawnCard: Card = { suit: 'clubs', rank: '5', value: 5 };
      
      const result = processDrawnCard(hand, drawnCard);
      
      expect(result.formedPair).toBe(true);
      expect(result.matchedCard).toBeDefined();
      expect(result.newHand.length).toBe(0); // Both cards removed
    });

    it('should add card when no match exists', () => {
      const hand: Card[] = [
        { suit: 'hearts', rank: '5', value: 5 },
      ];
      const drawnCard: Card = { suit: 'clubs', rank: '7', value: 7 };
      
      const result = processDrawnCard(hand, drawnCard);
      
      expect(result.formedPair).toBe(false);
      expect(result.matchedCard).toBeNull();
      expect(result.newHand.length).toBe(2);
    });

    it('should not pair Glitch with anything', () => {
      const hand: Card[] = [
        { suit: 'hearts', rank: '5', value: 5 },
      ];
      const glitch: Card = { suit: 'spades', rank: 'Q', value: 12, isGlitch: true };
      
      const result = processDrawnCard(hand, glitch);
      
      expect(result.formedPair).toBe(false);
      expect(result.newHand.length).toBe(2);
    });
  });

  describe('isGameOver', () => {
    it('should detect game over when one player holds only Glitch', () => {
      const hands: Card[][] = [
        [], // Player 0: empty
        [], // Player 1: empty
        [], // Player 2: empty
        [{ suit: 'spades', rank: 'Q', value: 12, isGlitch: true }], // Player 3: Glitch
      ];
      
      const result = isGameOver(hands);
      
      expect(result.over).toBe(true);
      expect(result.loserIndex).toBe(3);
    });

    it('should not be game over while multiple players have cards', () => {
      const hands: Card[][] = [
        [{ suit: 'hearts', rank: '5', value: 5 }],
        [{ suit: 'spades', rank: 'Q', value: 12, isGlitch: true }],
      ];
      
      const result = isGameOver(hands);
      
      expect(result.over).toBe(false);
    });
  });

  describe('getNextPlayer / getPreviousPlayer', () => {
    it('should skip players with empty hands', () => {
      const hands: Card[][] = [
        [{ suit: 'hearts', rank: '5', value: 5 }], // 0: has cards
        [], // 1: empty
        [], // 2: empty
        [{ suit: 'clubs', rank: '7', value: 7 }], // 3: has cards
      ];
      
      const next = getNextPlayer(0, hands, 4);
      expect(next).toBe(3); // Skips 1 and 2
      
      const prev = getPreviousPlayer(0, hands, 4);
      expect(prev).toBe(3); // Wraps around, skips 2 and 1
    });
  });
});
