'use client';

import { useCallback } from 'react';
import { getSocket, connectSocket, disconnectSocket } from '@/lib/socket';
import { useGameStore } from '@/stores/gameStore';
import { Card, PublicPlayer, PlayedCard, PlayerStanding, MaskEmotion, Phase } from '@/lib/types';

export function useSocket() {
  // Use selectors for reactive state components might need
  const isConnected = useGameStore(state => state.isConnected);
  const playerId = useGameStore(state => state.playerId);
  const roomId = useGameStore(state => state.roomId);

  const connect = useCallback(async () => {
    // Check connection status directly from state
    if (useGameStore.getState().isConnected) return;

    try {
      const socket = await connectSocket();
      useGameStore.getState().setConnected(true);

      // Generate a player ID if not set
      if (!useGameStore.getState().playerId) {
        useGameStore.getState().setPlayerId(`player_${Math.random().toString(36).substring(2, 8)}`);
      }

      // Remove all existing listeners to prevent duplicates
      socket.removeAllListeners();

      // Set up event listeners
      socket.on('room_created', ({ roomId }) => {
        console.log('Room created:', roomId);
        useGameStore.getState().setRoomId(roomId);
      });

      socket.on('room_joined', ({ roomId, creatorId, players }) => {
        console.log('Joined room:', roomId, 'Creator:', creatorId, 'Players:', players);
        useGameStore.getState().setRoomId(roomId);
        useGameStore.getState().setCreatorId(creatorId);
        useGameStore.getState().setPlayers(players);
      });

      socket.on('player_joined', ({ player }: { player: PublicPlayer }) => {
        console.log('Player joined:', player);
        useGameStore.getState().addPlayer(player);
      });

      socket.on('player_left', ({ playerId }) => {
        console.log('Player left:', playerId);
        useGameStore.getState().removePlayer(playerId);
      });

      socket.on('player_ready_change', ({ playerId, isReady }) => {
        console.log('Player ready:', playerId, isReady);
        useGameStore.getState().updatePlayerReady(playerId, isReady);
      });

      socket.on('game_started', ({ phase }: { phase: Phase }) => {
        console.log('Game started, phase:', phase);
        useGameStore.getState().setPhase(phase);
        useGameStore.getState().clearTrick();
      });

      socket.on('hand_dealt', ({ cards }: { cards: Card[] }) => {
        console.log('Hand dealt:', cards.length, 'cards');
        useGameStore.getState().setMyHand(cards);
      });

      socket.on('your_turn', ({ validCards }: { validCards: Card[] }) => {
        console.log('Your turn! Valid cards:', validCards.length);
        useGameStore.getState().setValidCards(validCards);
      });

      socket.on('card_played', ({ playerId, card }: { playerId: string; card: Card }) => {
        console.log('Card played:', playerId, card);
        useGameStore.getState().addToTrick({ playerId, card });
        useGameStore.getState().setIsMyTurn(false);
      });

      socket.on('trick_complete', ({ winnerId, cards, damage }) => {
        console.log('Trick complete, winner:', winnerId);
        // Clear trick after a delay for animation
        setTimeout(() => {
          useGameStore.getState().clearTrick();
        }, 1500);
      });

      socket.on('integrity_update', ({ playerId, integrity }) => {
        console.log('Integrity update:', playerId, integrity);
        useGameStore.getState().updateIntegrity(playerId, integrity);
      });

      socket.on('mask_emotion', ({ playerId, emotion }: { playerId: string; emotion: MaskEmotion }) => {
        console.log('Mask emotion:', playerId, emotion);
        useGameStore.getState().setMaskEmotion(playerId, emotion);
        // Reset emotion after animation
        setTimeout(() => {
          useGameStore.getState().setMaskEmotion(playerId, 'idle');
        }, 1000);
      });

      socket.on('phase_complete', ({ eliminatedId }) => {
        console.log('Phase complete, eliminated:', eliminatedId);
        useGameStore.getState().setEliminated(eliminatedId);
      });

      socket.on('player_eliminated', ({ playerId, placement }) => {
        console.log('Player eliminated:', playerId, 'Placement:', placement);
      });

      socket.on('game_over', ({ winnerId, finalStandings }: { winnerId: string; finalStandings: PlayerStanding[] }) => {
        console.log('Game over! Winner:', winnerId);
        useGameStore.getState().setGameOver(winnerId, finalStandings);
      });

      socket.on('error', ({ message }) => {
        console.error('Server error:', message);
      });

      socket.on('invalid_move', ({ reason }) => {
        console.warn('Invalid move:', reason);
      });

      socket.on('disconnect', () => {
        console.log('Disconnected from server');
        useGameStore.getState().setConnected(false);
      });

      return socket;
    } catch (error) {
      console.error('Failed to connect:', error);
      useGameStore.getState().setConnected(false);
      throw error;
    }
  }, []);

  const disconnect = useCallback(() => {
    disconnectSocket();
    useGameStore.getState().setConnected(false);
    useGameStore.getState().reset();
  }, []);

  const createRoom = useCallback((maskType: string) => {
    const socket = getSocket();
    socket.emit('create_room', { 
        playerId: useGameStore.getState().playerId, 
        maskType 
    });
  }, []);

  const joinRoom = useCallback((roomId: string, maskType: string) => {
    const socket = getSocket();
    socket.emit('join_room', { 
        roomId, 
        playerId: useGameStore.getState().playerId, 
        maskType 
    });
  }, []);

  const leaveRoom = useCallback(() => {
    const socket = getSocket();
    const roomId = useGameStore.getState().roomId;
    if (roomId) {
        socket.emit('leave_room', { roomId });
        useGameStore.getState().setRoomId(null);
        useGameStore.getState().setPlayers([]);
    }
  }, []);

  const setReady = useCallback(() => {
    const socket = getSocket();
    socket.emit('player_ready'); // Match server event name
  }, []);

  const startGame = useCallback(() => {
    const socket = getSocket();
    socket.emit('start_game');
  }, []);

  const playCard = useCallback((card: Card) => {
    const socket = getSocket();
    socket.emit('play_card', { card });
    useGameStore.getState().removeCardFromHand(card);
    useGameStore.getState().setIsMyTurn(false);
  }, []);

  const getRooms = useCallback(() => {
    const socket = getSocket();
    return new Promise<{ id: string; playerCount: number; phase: string }[]>((resolve) => {
      socket.emit('get_rooms', {}, (response: { rooms: any[] }) => {
        resolve(response?.rooms || []);
      });
    });
  }, []);

  return {
    connect,
    disconnect,
    createRoom,
    joinRoom,
    leaveRoom,
    setReady,
    startGame,
    playCard,
    getRooms,
    isConnected,
    playerId,
    roomId,
  };
}
