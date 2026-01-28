import { create } from 'zustand';
import { Card, Phase, PublicPlayer, PlayedCard, MaskType, PlayerStanding, MaskEmotion } from '@/lib/types';

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
  currentTrick: PlayedCard[];
  currentPlayerId: string | null;
  validCards: Card[];
  isMyTurn: boolean;

  // Phase tracking
  heartsBroken: boolean;
  
  // Elimination tracking
  eliminatedPlayerId: string | null;
  
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
  setMyHand: (cards: Card[]) => void;
  addToTrick: (playedCard: PlayedCard) => void;
  clearTrick: () => void;
  setCurrentPlayerId: (id: string | null) => void;
  setValidCards: (cards: Card[]) => void;
  setIsMyTurn: (isMyTurn: boolean) => void;
  updateIntegrity: (playerId: string, integrity: number) => void;
  setMaskEmotion: (playerId: string, emotion: MaskEmotion) => void;
  setEliminated: (playerId: string) => void;
  setGameOver: (winnerId: string, standings: PlayerStanding[]) => void;
  removeCardFromHand: (card: Card) => void;
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
  currentTrick: [],
  currentPlayerId: null,
  validCards: [],
  isMyTurn: false,
  heartsBroken: false,
  eliminatedPlayerId: null,
  isGameOver: false,
  finalStandings: [],
  winnerId: null,
  maskEmotions: {},
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
  
  addToTrick: (playedCard) => set((state) => ({
    currentTrick: [...state.currentTrick, playedCard],
  })),
  
  clearTrick: () => set({ currentTrick: [] }),
  
  setCurrentPlayerId: (id) => set({ currentPlayerId: id }),
  
  setValidCards: (cards) => set({ validCards: cards, isMyTurn: true }),
  
  setIsMyTurn: (isMyTurn) => set({ isMyTurn }),
  
  updateIntegrity: (playerId, integrity) => set((state) => ({
    players: state.players.map((p) =>
      p.id === playerId ? { ...p, integrity } : p
    ),
  })),
  
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
  
  reset: () => set(initialState),
}));
