import { create } from 'zustand';
import { Card, Phase, PublicPlayer, PlayerStanding, MaskEmotion, GameAction, DiscardedPair } from '@/lib/types';

interface GameState {
  // Connection
  playerId: string | null;
  roomId: string | null;
  creatorId: string | null; // Room creator ID
  isConnected: boolean;

  // Game state
  phase: Phase;
  players: PublicPlayer[];
  myHand: Card[];
  currentPlayerId: string | null;
  isMyTurn: boolean;
  currentTargetId: string | null; // Who to draw from
  
  // Elimination tracking
  eliminatedPlayerId: string | null;
  
  // Discarded pairs pile
  discardedPairs: DiscardedPair[];
  
  // Game over
  isGameOver: boolean;
  finalStandings: PlayerStanding[];
  winnerId: string | null;

  // Mask emotions
  maskEmotions: Record<string, MaskEmotion>;

  // Actions
  setPlayerId: (id: string) => void;
  setRoomId: (id: string | null) => void;
  setCreatorId: (id: string | null) => void;
  setConnected: (connected: boolean) => void;
  setPhase: (phase: Phase) => void;
  setPlayers: (players: PublicPlayer[]) => void;
  addPlayer: (player: PublicPlayer) => void;
  removePlayer: (playerId: string) => void;
  updatePlayerReady: (playerId: string, isReady: boolean) => void;
  updatePlayerCardCount: (playerId: string, cardCount: number) => void;
  setMyHand: (cards: Card[]) => void;
  setCurrentPlayerId: (id: string | null) => void;
  setIsMyTurn: (isMyTurn: boolean) => void;
  setCurrentTargetId: (id: string | null) => void;
  setMaskEmotion: (playerId: string, emotion: MaskEmotion) => void;
  setEliminated: (playerId: string) => void;
  setGameOver: (winnerId: string, standings: PlayerStanding[]) => void;
  removeCardFromHand: (card: Card) => void;
  addDiscardedPair: (pair: DiscardedPair) => void;
  clearDiscardedPairs: () => void;
  
  // Action tracking
  lastAction: GameAction | null;
  setLastAction: (action: GameAction | null) => void;

  reset: () => void;
}

const initialState = {
  playerId: null,
  roomId: null,
  creatorId: null,
  isConnected: false,
  phase: 'WAITING' as Phase,
  players: [],
  myHand: [],
  currentPlayerId: null,
  isMyTurn: false,
  currentTargetId: null,
  eliminatedPlayerId: null,
  discardedPairs: [],
  isGameOver: false,
  finalStandings: [],
  winnerId: null,
  maskEmotions: {},
  lastAction: null,
};

export const useGameStore = create<GameState>((set, get) => ({
  ...initialState,

  setPlayerId: (id) => set({ playerId: id }),
  setRoomId: (id) => set({ roomId: id }),
  setCreatorId: (id) => set({ creatorId: id }),
  setConnected: (connected) => set({ isConnected: connected }),
  setPhase: (phase) => set({ phase }),
  
  setPlayers: (players) => set({ players }),
  
  addPlayer: (player) => set((state) => ({
    players: state.players.some((p) => p.id === player.id)
      ? state.players
      : [...state.players, player],
  })),
  
  removePlayer: (playerId) => set((state) => ({
    players: state.players.filter((p) => p.id !== playerId),
  })),
  
  updatePlayerReady: (playerId, isReady) => set((state) => ({
    players: state.players.map((p) =>
      p.id === playerId ? { ...p, isReady } : p
    ),
  })),
  
  setMyHand: (cards) => set({ myHand: cards }),
  
  updatePlayerCardCount: (playerId, cardCount) => set((state) => ({
    players: state.players.map((p) =>
      p.id === playerId ? { ...p, cardCount } : p
    ),
  })),
  
  setCurrentPlayerId: (id) => set({ currentPlayerId: id }),
  
  setIsMyTurn: (isMyTurn) => set({ isMyTurn }),
  
  setCurrentTargetId: (id) => set({ currentTargetId: id }),
  
  setMaskEmotion: (playerId, emotion) => set((state) => ({
    maskEmotions: { ...state.maskEmotions, [playerId]: emotion },
  })),
  
  setEliminated: (playerId) => set((state) => ({
    eliminatedPlayerId: playerId,
    players: state.players.map((p) =>
      p.id === playerId ? { ...p, isEliminated: true } : p
    ),
  })),
  
  setGameOver: (winnerId, standings) => set({
    isGameOver: true,
    winnerId,
    finalStandings: standings,
    phase: 'GAME_OVER',
  }),
  
  removeCardFromHand: (card) => set((state) => ({
    myHand: state.myHand.filter(
      (c) => !(c.suit === card.suit && c.rank === card.rank)
    ),
  })),

  addDiscardedPair: (pair) => set((state) => ({
    discardedPairs: [...state.discardedPairs, pair],
  })),
  
  clearDiscardedPairs: () => set({ discardedPairs: [] }),

  setLastAction: (action) => set({ lastAction: action }),
  
  reset: () => set(initialState),
}));
