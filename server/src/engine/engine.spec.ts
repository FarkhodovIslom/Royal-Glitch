
import { createDeck, deal, isHeart, isQueenOfSpades, cardEquals, removeCardFromHand } from './deck';
import { canPlayCard, determineTrickWinner, checkHeartsBroken, findFirstLeader } from './rules';
import { calculateDamage, applyDamage } from './damage';
import { advancePhase, getPhaseConfig, calculateRatingChange } from './phase';
import { Card, PlayedCard, Suit } from '../shared/types';

describe('Game Engine', () => {
  describe('Deck', () => {
    it('should create a standard 52 card deck', () => {
      const deck = createDeck();
      expect(deck.length).toBe(52);
    });

    it('should identify specific cards correctly', () => {
      const qos: Card = { suit: 'spades', rank: 'Q', value: 12 };
      const heart: Card = { suit: 'hearts', rank: 'A', value: 14 };
      const club: Card = { suit: 'clubs', rank: '2', value: 2 };

      expect(isQueenOfSpades(qos)).toBe(true);
      expect(isQueenOfSpades(heart)).toBe(false);
      expect(isHeart(heart)).toBe(true);
      expect(isHeart(club)).toBe(false);
    });

    it('should deal cards correctly', () => {
      const deck = createDeck();
      const hands = deal(deck, 13, 4);
      expect(hands.length).toBe(4);
      expect(hands[0].length).toBe(13);
    });
  });

  describe('Rules', () => {
    const hand: Card[] = [
      { suit: 'hearts', rank: 'A', value: 14 },
      { suit: 'spades', rank: 'K', value: 13 },
      { suit: 'clubs', rank: '2', value: 2 },
    ];
    const ledSuit: Suit = 'spades';

    it('should validate following suit', () => {
      const validCard: Card = { suit: 'spades', rank: 'K', value: 13 };
      const invalidCard: Card = { suit: 'hearts', rank: 'A', value: 14 };

      const result1 = canPlayCard(validCard, hand, ledSuit, false, false, false);
      expect(result1.valid).toBe(true);

      const result2 = canPlayCard(invalidCard, hand, ledSuit, false, false, false);
      expect(result2.valid).toBe(false);
      expect(result2.reason).toContain('Must follow suit');
    });

    it('should allow any card if void in led suit', () => {
      const voidHand: Card[] = [
        { suit: 'hearts', rank: 'A', value: 14 },
        { suit: 'diamonds', rank: '2', value: 2 },
      ];
      const validCard: Card = { suit: 'hearts', rank: 'A', value: 14 };
      
      const result = canPlayCard(validCard, voidHand, 'spades', false, false, false);
      expect(result.valid).toBe(true);
    });

    it('should prevent playing hearts on first trick unless only hearts/QoS', () => {
      const heart: Card = { suit: 'hearts', rank: 'A', value: 14 };
      // Hand with a non-heart/non-QoS card
      const safeHand: Card[] = [{ suit: 'clubs', rank: '2', value: 2 }, heart];
      
      const result = canPlayCard(heart, safeHand, null, false, true, true);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('first trick');
    });

    it('should determine trick winner correctly', () => {
      const trick: PlayedCard[] = [
        { playerId: 'p1', card: { suit: 'spades', rank: '2', value: 2 } }, // Led
        { playerId: 'p2', card: { suit: 'spades', rank: 'A', value: 14 } }, // Winner
        { playerId: 'p3', card: { suit: 'hearts', rank: 'K', value: 13 } }, // Off-suit (high value but wrong suit)
        { playerId: 'p4', card: { suit: 'spades', rank: 'K', value: 13 } },
      ];

      expect(determineTrickWinner(trick)).toBe('p2');
    });

    it('should check if hearts are broken', () => {
      const broken: Card[] = [{ suit: 'hearts', rank: '2', value: 2 }];
      const notBroken: Card[] = [{ suit: 'spades', rank: '2', value: 2 }];
      
      expect(checkHeartsBroken(broken)).toBe(true);
      expect(checkHeartsBroken(notBroken)).toBe(false);
    });
  });

  describe('Damage', () => {
    it('should calculate damage correctly', () => {
      const cards: Card[] = [
        { suit: 'hearts', rank: '2', value: 2 }, // 5
        { suit: 'spades', rank: 'Q', value: 12 }, // 40
        { suit: 'clubs', rank: '2', value: 2 },    // 0
      ];
      
      expect(calculateDamage(cards)).toBe(45);
    });

    it('should apply damage to integrity correctly', () => {
      expect(applyDamage(100, 45)).toBe(55);
      expect(applyDamage(10, 20)).toBe(0); // Clamped at 0
    });
  });

  describe('Phase', () => {
    it('should configure phases correctly', () => {
      const qConfig = getPhaseConfig('QUADRANT');
      expect(qConfig).toBeDefined();
      expect(qConfig?.cardsPerPlayer).toBe(13);

      const tConfig = getPhaseConfig('TRIANGLE');
      expect(tConfig?.cardsPerPlayer).toBe(17);
    });

    it('should advance phase correctly', () => {
      expect(advancePhase('QUADRANT')).toBe('TRIANGLE');
      expect(advancePhase('TRIANGLE')).toBe('DUEL');
      expect(advancePhase('DUEL')).toBe('GAME_OVER');
    });

    it('should calculate rating changes', () => {
      expect(calculateRatingChange(1)).toBe(35);
      expect(calculateRatingChange(4)).toBe(-35);
    });
  });
});
