'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { useSocket } from '@/hooks/useSocket';
import { useGameStore } from '@/stores/gameStore';
import { GameTable } from '@/components/game/GameTable';
import { PhaseTransition } from '@/components/effects/PhaseTransition';
import { PHASE_NAMES, Card } from '@/lib/types';

export default function GamePage() {
    const params = useParams();
    const router = useRouter();
    const roomId = params.roomId as string;

    const { connect, drawCard, isConnected, playerId } = useSocket();
    const {
        phase,
        players,
        myHand,
        currentTrick,
        validCards,
        isMyTurn,
        maskEmotions,
        isGameOver,
        winnerId,
        finalStandings,
        eliminatedPlayerId,
    } = useGameStore();

    const [showPhaseTransition, setShowPhaseTransition] = useState(false);
    const [lastPhase, setLastPhase] = useState(phase);
    const [showGameOver, setShowGameOver] = useState(false);

    // Connect on mount
    useEffect(() => {
        connect().catch(console.error);
    }, [connect]);

    // Handle phase changes
    useEffect(() => {
        if (phase !== lastPhase && phase !== 'WAITING') {
            setShowPhaseTransition(true);
            setLastPhase(phase);
        }
    }, [phase, lastPhase]);

    // Handle game over
    useEffect(() => {
        if (isGameOver) {
            setTimeout(() => setShowGameOver(true), 1000);
        }
    }, [isGameOver]);

    // Map players to positions
    const playerPositions = useMemo(() => {
        const positions: Record<string, 'top' | 'right' | 'bottom' | 'left'> = {};
        const positionOrder: ('bottom' | 'left' | 'top' | 'right')[] = ['bottom', 'left', 'top', 'right'];

        const myIndex = players.findIndex(p => p.id === playerId);

        players.forEach((player, index) => {
            const adjustedIndex = (index - myIndex + 4) % 4;
            positions[player.id] = positionOrder[adjustedIndex];
        });

        return positions;
    }, [players, playerId]);

    // Get player by position
    const getPlayerAtPosition = (pos: 'top' | 'right' | 'bottom' | 'left') => {
        return players.find(p => playerPositions[p.id] === pos) || null;
    };

    // Get current turn player
    const currentTurnPlayer = players.find(p => !p.isEliminated);

    // Handle draw card (Pair Annihilation logic)
    const handleDrawCard = () => {
        if (isMyTurn) {
            drawCard(); // Add index if we want specific card picking later
        }
    };

    return (
        <main className="min-h-screen relative overflow-hidden bg-cyber scanlines">
            {/* Hex grid background for table */}
            <div
                className="absolute inset-0"
                style={{
                    background: `
            radial-gradient(ellipse at 50% 50%, rgba(189,0,255,0.1) 0%, transparent 50%),
            url("data:image/svg+xml,%3Csvg width='50' height='43' viewBox='0 0 50 43' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cpolygon stroke='%2300FFF0' stroke-opacity='0.08' points='25 0 50 14.5 50 28.5 25 43 0 28.5 0 14.5'/%3E%3C/g%3E%3C/svg%3E")
          `,
                }}
            />

            {/* Ambient glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-30"
                    style={{
                        background: 'radial-gradient(circle, rgba(189,0,255,0.3) 0%, transparent 70%)',
                    }}
                />
            </div>

            {/* Phase indicator */}
            <motion.div
                className="absolute top-4 left-1/2 -translate-x-1/2 z-20"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div
                    className="px-8 py-3 panel-cyber flex items-center gap-4"
                    style={{ boxShadow: '0 0 20px #00FFF044' }}
                >
                    <motion.div
                        className="w-2 h-2 rounded-full bg-neon-cyan"
                        animate={{
                            boxShadow: ['0 0 5px #00FFF0', '0 0 15px #00FFF0', '0 0 5px #00FFF0']
                        }}
                        transition={{ repeat: Infinity, duration: 1 }}
                    />
                    <span className="text-neon-cyan font-display tracking-[0.3em] text-sm">
                        {PHASE_NAMES[phase]}
                    </span>
                    <span className="text-neon-purple/60 text-xs font-mono">
                        [{players.filter(p => !p.isEliminated).length} ACTIVE]
                    </span>
                </div>
            </motion.div>

            {/* Turn indicator */}
            {isMyTurn && (
                <motion.div
                    className="absolute top-20 left-1/2 -translate-x-1/2 z-20"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <motion.div
                        className="px-6 py-2 bg-neon-pink/20 border border-neon-pink text-neon-pink font-display text-sm tracking-widest clip-cyber-sm"
                        animate={{
                            boxShadow: [
                                '0 0 10px #FF00FF44',
                                '0 0 30px #FF00FF66',
                                '0 0 10px #FF00FF44',
                            ]
                        }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                    >
                        YOUR TURN
                    </motion.div>
                </motion.div>
            )}

            {/* Game Table - Classic Hearts Layout */}
            <GameTable
                players={players}
                currentTrick={currentTrick}
                myHand={myHand}
                validCards={validCards}
                isMyTurn={isMyTurn}
                onPlayCard={handlePlayCard}
                playerPositions={playerPositions}
                maskEmotions={maskEmotions}
                playerId={playerId}
            />

            {/* Room ID + Connection status */}
            <div className="absolute bottom-4 right-4 flex items-center gap-3 text-xs z-20">
                <motion.div
                    className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-neon-cyan' : 'bg-glitch-red'}`}
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                />
                <span className="text-neon-cyan/40 font-mono">ROOM: {roomId}</span>
            </div>

            {/* Phase Transition Overlay */}
            <PhaseTransition
                phase={phase}
                eliminatedName={eliminatedPlayerId ? players.find(p => p.id === eliminatedPlayerId)?.maskType : undefined}
                isVisible={showPhaseTransition}
                onComplete={() => setShowPhaseTransition(false)}
            />

            {/* Game Over Overlay */}
            <AnimatePresence>
                {showGameOver && (
                    <motion.div
                        className="fixed inset-0 z-50 bg-dark-bg/95 backdrop-blur-md flex items-center justify-center scanlines"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {/* Circuit background */}
                        <div
                            className="absolute inset-0 opacity-20"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg stroke='%2300FFF0' stroke-opacity='0.3' stroke-width='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                            }}
                        />

                        <div className="text-center relative z-10">
                            {/* Winner announcement */}
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', stiffness: 200 }}
                            >
                                <span className="text-8xl">👑</span>
                            </motion.div>

                            <motion.h1
                                className="font-display font-black text-6xl md:text-8xl tracking-wider mt-6"
                                style={{
                                    background: winnerId === playerId
                                        ? 'linear-gradient(180deg, #FFD700 0%, #FF00FF 100%)'
                                        : 'linear-gradient(180deg, #00FFF0 0%, #BD00FF 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                }}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                {winnerId === playerId ? 'VICTORY!' : 'GAME OVER'}
                            </motion.h1>

                            {winnerId === playerId && (
                                <motion.div
                                    className="mt-4 text-2xl text-glitch-yellow font-display tracking-widest"
                                    style={{ textShadow: '0 0 20px #FFD700' }}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.6 }}
                                >
                                    🎮 ROYAL GLITCH CHAMPION 🎮
                                </motion.div>
                            )}

                            {/* Standings */}
                            <motion.div
                                className="max-w-lg mx-auto panel-cyber p-6 mt-8"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 }}
                            >
                                <h2 className="font-display text-xl text-neon-cyan mb-4 tracking-wider">
                                    FINAL STANDINGS
                                </h2>
                                <div className="space-y-2">
                                    {finalStandings.map((standing, index) => {
                                        const player = players.find(p => p.id === standing.playerId);
                                        const isWinner = standing.placement === 1;
                                        return (
                                            <motion.div
                                                key={standing.playerId}
                                                className={`flex items-center justify-between p-3 clip-cyber-sm ${isWinner
                                                    ? 'bg-glitch-yellow/20 border border-glitch-yellow/50'
                                                    : 'bg-dark-circuit/50 border border-neon-cyan/20'
                                                    }`}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 1 + index * 0.1 }}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <span className={`text-2xl font-display ${isWinner ? 'text-glitch-yellow' : 'text-neon-cyan/60'
                                                        }`}>
                                                        {isWinner ? '👑' : `#${standing.placement}`}
                                                    </span>
                                                    <span className="text-white font-display tracking-wider">
                                                        {player?.maskType?.toUpperCase() || 'UNKNOWN'}
                                                    </span>
                                                </div>
                                                <div className="text-right font-mono">
                                                    <span className={standing.ratingChange >= 0 ? 'text-neon-cyan' : 'text-glitch-red'}>
                                                        {standing.ratingChange > 0 ? '+' : ''}{standing.ratingChange}
                                                    </span>
                                                    <span className="text-neon-purple/60 ml-2">
                                                        ({standing.newRating})
                                                    </span>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </motion.div>

                            <motion.button
                                className="btn-cyber mt-8"
                                onClick={() => router.push('/lobby')}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1.5 }}
                            >
                                PLAY AGAIN
                            </motion.button>
                        </div>

                        {/* Corner decorations */}
                        <div className="absolute top-8 left-8 w-16 h-16 border-l-2 border-t-2 border-neon-cyan/30" />
                        <div className="absolute top-8 right-8 w-16 h-16 border-r-2 border-t-2 border-neon-cyan/30" />
                        <div className="absolute bottom-8 left-8 w-16 h-16 border-l-2 border-b-2 border-neon-pink/30" />
                        <div className="absolute bottom-8 right-8 w-16 h-16 border-r-2 border-b-2 border-neon-pink/30" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Corner decorations */}
            <div className="absolute top-4 left-4 w-12 h-12 border-l-2 border-t-2 border-neon-cyan/20 z-20" />
            <div className="absolute top-4 right-4 w-12 h-12 border-r-2 border-t-2 border-neon-cyan/20 z-20" />
            <div className="absolute bottom-4 left-4 w-12 h-12 border-l-2 border-b-2 border-neon-pink/20 z-20" />
        </main>
    );
}
