'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './Card';
import { PlayedCard } from '@/lib/types';

interface TrickAreaProps {
    currentTrick: PlayedCard[];
    playerPositions: Record<string, 'north' | 'east' | 'south' | 'west'>;
}

// Position offsets for where cards appear (simplified center stack)
const positionStyles: Record<string, { x: number; y: number }> = {
    north: { x: 0, y: -25 },
    east: { x: 35, y: 0 },
    south: { x: 0, y: 25 },
    west: { x: -35, y: 0 },
};

// Starting positions for animation (cards fly in from player direction)
const entryPositions: Record<string, { x: number; y: number }> = {
    north: { x: 0, y: -150 },
    east: { x: 150, y: 0 },
    south: { x: 0, y: 150 },
    west: { x: -150, y: 0 },
};

export function TrickArea({ currentTrick, playerPositions }: TrickAreaProps) {
    const hasCards = currentTrick.length > 0;

    return (
        <div className="relative w-[200px] h-[200px] flex items-center justify-center">
            {/* Center glow */}
            <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                    background: hasCards
                        ? 'radial-gradient(circle, rgba(189,0,255,0.15) 0%, transparent 70%)'
                        : 'radial-gradient(circle, rgba(0,255,240,0.05) 0%, transparent 70%)',
                }}
                animate={hasCards ? {
                    opacity: [0.6, 1, 0.6],
                    scale: [1, 1.05, 1],
                } : {}}
                transition={{ repeat: Infinity, duration: 2 }}
            />

            {/* Subtle ring indicator */}
            <div
                className="absolute w-[160px] h-[160px] rounded-full border border-neon-cyan/20"
                style={{
                    boxShadow: '0 0 20px rgba(0,255,240,0.1)',
                }}
            />

            {/* Cards */}
            <AnimatePresence>
                {currentTrick.map((played, index) => {
                    const position = playerPositions[played.playerId] || 'south';
                    const finalPos = positionStyles[position];
                    const entryPos = entryPositions[position];

                    return (
                        <motion.div
                            key={`${played.card.suit}-${played.card.rank}-${index}`}
                            className="absolute"
                            initial={{
                                x: entryPos.x,
                                y: entryPos.y,
                                opacity: 0,
                                scale: 0.5,
                            }}
                            animate={{
                                x: finalPos.x,
                                y: finalPos.y,
                                opacity: 1,
                                scale: 1,
                            }}
                            exit={{
                                opacity: 0,
                                scale: 0,
                                transition: { duration: 0.3 }
                            }}
                            transition={{
                                type: 'spring',
                                stiffness: 300,
                                damping: 25
                            }}
                            style={{ zIndex: index + 1 }}
                        >
                            <Card card={played.card} size="md" />
                        </motion.div>
                    );
                })}
            </AnimatePresence>

            {/* Empty state */}
            {!hasCards && (
                <div className="flex flex-col items-center gap-1">
                    <motion.div
                        className="text-neon-cyan/20 text-3xl"
                        animate={{
                            opacity: [0.2, 0.4, 0.2],
                        }}
                        transition={{ repeat: Infinity, duration: 2 }}
                    >
                        🎴
                    </motion.div>
                    <span className="text-neon-cyan/30 text-[10px] font-display tracking-widest">
                        TRICK
                    </span>
                </div>
            )}
        </div>
    );
}
