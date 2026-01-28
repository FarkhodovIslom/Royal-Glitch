
import { Test, TestingModule } from '@nestjs/testing';
import { GameService } from './game.service';
import { RatingService } from '../rating/rating.service';
import { MaskType, Card } from '../shared/types';

describe('GameService', () => {
  let service: GameService;
  let ratingService: RatingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameService,
        {
          provide: RatingService,
          useValue: {
            getRating: jest.fn().mockReturnValue(1000),
            updateRating: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<GameService>(GameService);
    ratingService = module.get<RatingService>(RatingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Room Management', () => {
    it('should create a room', () => {
      const room = service.createRoom('p1', 's1', 'venetian');
      expect(room).toBeDefined();
      expect(room.players.length).toBe(1);
      expect(room.players[0].id).toBe('p1');
    });

    it('should join a room', () => {
      const room = service.createRoom('p1', 's1', 'venetian');
      const joinedRoom = service.joinRoom(room.id, 'p2', 's2', 'kabuki');
      
      expect(joinedRoom).toBeDefined();
      expect(joinedRoom?.players.length).toBe(2);
    });

    it('should not join full room', () => {
      const room = service.createRoom('p1', 's1', 'venetian');
      service.joinRoom(room.id, 'p2', 's2', 'kabuki');
      service.joinRoom(room.id, 'p3', 's3', 'jester');
      service.joinRoom(room.id, 'p4', 's4', 'plague');
      
      const result = service.joinRoom(room.id, 'p5', 's5', 'phantom');
      expect(result).toBeNull();
    });

    it('should leave room', () => {
      const room = service.createRoom('p1', 's1', 'venetian');
      service.leaveRoom('s1');
      
      const foundRoom = service.getRoom(room.id);
      expect(foundRoom).toBeUndefined(); // Room deleted when empty
    });
  });

  describe('Game Flow', () => {
    let roomId: string;
    
    beforeEach(() => {
      const room = service.createRoom('p1', 's1', 'venetian');
      roomId = room.id;
      service.joinRoom(roomId, 'p2', 's2', 'kabuki');
      service.joinRoom(roomId, 'p3', 's3', 'jester');
      service.joinRoom(roomId, 'p4', 's4', 'plague');

      service.setPlayerReady('s1', true);
      service.setPlayerReady('s2', true);
      service.setPlayerReady('s3', true);
      service.setPlayerReady('s4', true);
    });

    it('should start game when all ready', () => {
      expect(service.allPlayersReady(roomId)).toBe(true);
      
      const room = service.startGame(roomId);
      expect(room?.phase).toBe('QUADRANT');
      expect(room?.players[0].hand.length).toBe(13);
    });

    it('should handle card play', () => {
      const room = service.startGame(roomId)!;
      const currentPlayer = room.players[room.currentPlayerIndex];
      const validCards = service.getValidCardsForCurrentPlayer(roomId);
      const cardToPlay = validCards[0];

      const result = service.playCard(currentPlayer.socketId, cardToPlay);
      
      expect(result.success).toBe(true);
      expect(room.currentTrick.length).toBe(1);
    });

    it('should validate turn', () => {
        const room = service.startGame(roomId)!;
        const currentPlayer = room.players[room.currentPlayerIndex];
        // Find a player who is NOT the current player
        const otherPlayer = room.players.find(p => p.id !== currentPlayer.id)!;
        
        // Try to play with wrong player
        // We need a valid card format even if it shouldn't be valid to play, 
        // to pass basic type checks before logic check
        const card: Card = { suit: 'hearts', rank: '2', value: 2 }; 
        
        const result = service.playCard(otherPlayer.socketId, card);
        expect(result.success).toBe(false);
        expect(result.error).toBe('Not your turn');
    });
  });
});
