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

      socket.on('pairs_purged', ({ playerId, pairs, remainingCount }) => {
        console.log('Pairs purged:', playerId, pairs.length, 'pairs');
        // Update card counts after pairs purged
        if (playerId !== useGameStore.getState().playerId) {
            useGameStore.getState().updatePlayerCardCount(playerId, remainingCount);
        }
        // Add initial pairs to discard pile
        pairs.forEach((pairCards: [any, any]) => {
          useGameStore.getState().addDiscardedPair({
            playerId,
            cards: pairCards,
            timestamp: Date.now(),
          });
        });
      });

      socket.on('card_drawn', ({ drawerId, targetId, formedPair, pair, drawerCardCount, targetCardCount }) => {
        console.log('Card drawn:', drawerId, 'from', targetId, 'Pair:', formedPair);
        
        // Update card counts for both players
        useGameStore.getState().updatePlayerCardCount(drawerId, drawerCardCount);
        useGameStore.getState().updatePlayerCardCount(targetId, targetCardCount);
        
        // Dispatch visual action
        if (formedPair && pair) {
          useGameStore.getState().setLastAction({
            type: 'PAIR',
            playerId: drawerId,
            targetId,
            cards: pair,
            timestamp: Date.now(),
          });
          // Add to discard pile
          useGameStore.getState().addDiscardedPair({
            playerId: drawerId,
            cards: pair,
            timestamp: Date.now(),
          });
        } else {
          useGameStore.getState().setLastAction({
            type: 'DRAW',
            playerId: drawerId,
            targetId,
            timestamp: Date.now(),
          });
        }
      });

      socket.on('player_emptied', ({ playerId }) => {
         console.log('Player emptied hand:', playerId);
         useGameStore.getState().updatePlayerCardCount(playerId, 0);
      });

      socket.on('round_over', ({ loserId, glitchCard, standings }) => {
         console.log('Round over, loser:', loserId);
         useGameStore.getState().setEliminated(loserId);
      });

      socket.on('game_started', ({ phase }: { phase: Phase }) => {
        console.log('Game started, phase:', phase);
        useGameStore.getState().setPhase(phase);
      });

      socket.on('hand_dealt', ({ cards }: { cards: Card[] }) => {
        console.log('Hand dealt:', cards.length, 'cards');
        useGameStore.getState().setMyHand(cards);
      });

      socket.on('your_turn', ({ targetPlayerId, targetCardCount }: { targetPlayerId: string, targetCardCount: number }) => {
        console.log('Your turn! Draw from:', targetPlayerId);
        useGameStore.getState().setIsMyTurn(true);
        useGameStore.getState().setCurrentTargetId(targetPlayerId);
      });

      socket.on('mask_emotion', ({ playerId, emotion }: { playerId: string; emotion: MaskEmotion }) => {
        console.log('Mask emotion:', playerId, emotion);
        useGameStore.getState().setMaskEmotion(playerId, emotion);
        setTimeout(() => {
          useGameStore.getState().setMaskEmotion(playerId, 'idle');
        }, 1000);
      });

      socket.on('player_eliminated', ({ playerId, placement }) => {
        console.log('Player eliminated:', playerId, 'Placement:', placement);
      });

      socket.on('game_over', ({ finalWinnerId, finalStandings }: { finalWinnerId: string; finalStandings: PlayerStanding[] }) => {
        // Guard: Only process if game is not already over
        if (useGameStore.getState().isGameOver) {
          console.log('Game already over, ignoring duplicate game_over event');
          return;
        }
        console.log('Game over! Winner:', finalWinnerId);
        useGameStore.getState().setGameOver(finalWinnerId, finalStandings);
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

  const createRoom = useCallback((maskType: string, nickname: string) => {
    const socket = getSocket();
    socket.emit('create_room', { 
        playerId: useGameStore.getState().playerId, 
        maskType,
        nickname
    });
  }, []);

  const joinRoom = useCallback((roomId: string, maskType: string, nickname: string) => {
    const socket = getSocket();
    socket.emit('join_room', { 
        roomId, 
        playerId: useGameStore.getState().playerId, 
        maskType,
        nickname
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
    socket.emit('player_ready'); 
  }, []);

  const startGame = useCallback(() => {
    const socket = getSocket();
    socket.emit('start_game');
  }, []);

  const drawCard = useCallback((cardIndex?: number) => {
    const socket = getSocket();
    socket.emit('draw_card', { cardIndex });
    useGameStore.getState().setIsMyTurn(false);
    useGameStore.getState().setCurrentTargetId(null);
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
    drawCard,
    getRooms,
    isConnected,
    playerId,
    roomId,
  };
}
