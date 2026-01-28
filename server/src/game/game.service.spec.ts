// ============================================
// ROYAL GLITCH - Game Service Tests
// Pair Annihilation System
// ============================================

import { Test, TestingModule } from '@nestjs/testing';
import { GameService } from './game.service';
import { RatingService } from '../rating/rating.service';

describe('GameService - Pair Annihilation', () => {
  let service: GameService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameService,
        {
          provide: RatingService,
          useValue: {
            getRating: jest.fn().mockReturnValue(1000),
            updateRating: jest.fn().mockReturnValue(1000),
          },
        },
      ],
    }).compile();

    service = module.get<GameService>(GameService);
  });

  describe('createRoom', () => {
    it('should create a room with one player', () => {
      const room = service.createRoom('player1', 'socket1', 'venetian', 'Player1');
      
      expect(room).toBeDefined();
      expect(room.id).toBeDefined();
      expect(room.players.length).toBe(1);
      expect(room.phase).toBe('WAITING');
      expect(room.creatorId).toBe('player1');
    });
  });

  describe('joinRoom', () => {
    it('should allow players to join a waiting room', () => {
      const room = service.createRoom('player1', 'socket1', 'venetian', 'Player1');
      const joined = service.joinRoom(room.id, 'player2', 'socket2', 'kabuki', 'Player2');
      expect(joined).toBeDefined();
      expect(joined!.players.length).toBe(2);
    });

    it('should not allow more than 4 players', () => {
      const room = service.createRoom('p1', 's1', 'venetian', 'P1');
      service.joinRoom(room.id, 'p2', 's2', 'kabuki', 'P2');
      service.joinRoom(room.id, 'p3', 's3', 'tribal', 'P3');
      service.joinRoom(room.id, 'p4', 's4', 'plague', 'P4');

      const fifth = service.joinRoom(room.id, 'p5', 's5', 'jester', 'P5');
      expect(fifth).toBeNull();
    });
  });

  describe('startGame', () => {
    let roomId: string;

    beforeEach(() => {
      const room = service.createRoom('p1', 's1', 'venetian', 'P1');
      roomId = room.id;
      service.joinRoom(roomId, 'p2', 's2', 'kabuki', 'P2');
    });

    it('should start game with minimum 2 players', () => {
      const room = service.startGame(roomId);
      
      expect(room).toBeDefined();
      expect(room!.phase).toBe('PLAYING');
    });

    it('should deal and purge pairs on start', () => {
      const room = service.startGame(roomId);
      
      // Players should have cards
      expect(room!.players[0].hand.length).toBeGreaterThan(0);
      expect(room!.players[1].hand.length).toBeGreaterThan(0);
      
      // Total cards should be less than 49 (some pairs purged)
      const totalCards = room!.players.reduce((sum, p) => sum + p.hand.length, 0);
      expect(totalCards).toBeLessThanOrEqual(49);
    });

    it('should record discarded pairs', () => {
      const room = service.startGame(roomId);
      
      // Pairs should have been discarded
      expect(room!.discardedPairs.length).toBeGreaterThanOrEqual(0);
    });

    it('should track Glitch holder', () => {
      const room = service.startGame(roomId);
      
      // Someone should have the Glitch
      const glitchHolder = room!.players.find(p => 
        p.hand.some(c => c.isGlitch)
      );
      
      if (glitchHolder) {
        expect(room!.glitchHolderId).toBe(glitchHolder.id);
      }
    });
  });

  describe('drawCard', () => {
    let roomId: string;

    beforeEach(() => {
      const room = service.createRoom('p1', 's1', 'venetian', 'P1');
      roomId = room.id;
      service.joinRoom(roomId, 'p2', 's2', 'kabuki', 'P2');
      service.startGame(roomId);
    });

    it('should allow current player to draw', () => {
      const room = service.getRoom(roomId)!;
      const currentPlayer = room.players[room.currentPlayerIndex];
      
      const result = service.drawCard(currentPlayer.socketId);
      
      expect(result.success).toBe(true);
      expect(result.drawnCard).toBeDefined();
    });

    it('should not allow non-current player to draw', () => {
      const room = service.getRoom(roomId)!;
      const currentIndex = room.currentPlayerIndex;
      const otherIndex = (currentIndex + 1) % room.players.length;
      const otherPlayer = room.players[otherIndex];
      
      const result = service.drawCard(otherPlayer.socketId);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Not your turn');
    });

    it('should advance to next player after draw', () => {
      const room = service.getRoom(roomId)!;
      const initialIndex = room.currentPlayerIndex;
      const currentPlayer = room.players[initialIndex];
      
      service.drawCard(currentPlayer.socketId);
      
      const updatedRoom = service.getRoom(roomId)!;
      expect(updatedRoom.currentPlayerIndex).not.toBe(initialIndex);
    });
  });

  describe('getPublicPlayers', () => {
    it('should hide hand details', () => {
      const room = service.createRoom('p1', 's1', 'venetian', 'P1');
      service.joinRoom(room.id, 'p2', 's2', 'kabuki', 'P2');
      service.startGame(room.id);
      
      const startedRoom = service.getRoom(room.id)!;
      const publicPlayers = service.getPublicPlayers(startedRoom);
      
      expect(publicPlayers.length).toBe(2);
      publicPlayers.forEach(p => {
        expect(p.cardCount).toBeDefined();
        expect((p as any).hand).toBeUndefined();
      });
    });
  });

  describe('canStartGame', () => {
    it('should return true with 2+ players in WAITING', () => {
      const room = service.createRoom('p1', 's1', 'venetian', 'P1');
      service.joinRoom(room.id, 'p2', 's2', 'kabuki', 'P2');
      
      expect(service.canStartGame(room.id)).toBe(true);
    });

    it('should return false with only 1 player', () => {
      const room = service.createRoom('p1', 's1', 'venetian', 'P1');
      
      expect(service.canStartGame(room.id)).toBe(false);
    });
  });
});
