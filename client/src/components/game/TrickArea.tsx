import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './Card';
import { GameAction } from '@/lib/types';
import { useEffect, useState } from 'react';

interface TrickAreaProps {
    lastAction: GameAction | null;
    playerPositions: Record<string, 'north' | 'east' | 'south' | 'west'>;
}

// Offsets for animation start points (outside the center area)
const sourceOffsets: Record<string, { x: number; y: number }> = {
    north: { x: 0, y: -200 },
    east: { x: 300, y: 0 },
    south: { x: 0, y: 200 },
    west: { x: -300, y: 0 },
};

export function TrickArea({ lastAction, playerPositions }: TrickAreaProps) {
    const [visibleAction, setVisibleAction] = useState<GameAction | null>(null);

    // Sync prop to local state with timeout for clearing
    useEffect(() => {
        if (lastAction) {
            setVisibleAction(lastAction);
            const timer = setTimeout(() => {
                setVisibleAction(null);
            }, 3000); // Show for 3 seconds
            return () => clearTimeout(timer);
        }
    }, [lastAction]);

    if (!visibleAction) {
        return (
            <div className="relative w-[200px] h-[200px] flex items-center justify-center">
                <div className="flex flex-col items-center gap-1 opacity-20">
                    <span className="text-4xl">⚔️</span>
                    <span className="text-[10px] font-display tracking-widest text-neon-cyan">
                        BATTLEFIELD
                    </span>
                </div>
            </div>
        );
    }

    const isPair = visibleAction.type === 'PAIR';
    const isDraw = visibleAction.type === 'DRAW';

    // Determine source position for draw animation
    let startPos = { x: 0, y: 0 };
    if (visibleAction.targetId && playerPositions[visibleAction.targetId]) {
        // Source is the targetId (where we drew FROM)
        const posName = playerPositions[visibleAction.targetId];
        if (sourceOffsets[posName]) {
            startPos = sourceOffsets[posName];
        }
    }

    // Determine return destination (drawer)
    let endPos = { x: 0, y: 0 };
    if (isDraw && visibleAction.playerId && playerPositions[visibleAction.playerId]) {
        // Destination is the drawer (where card goes TO)
        const posName = playerPositions[visibleAction.playerId];
        if (sourceOffsets[posName]) {
            // We want to fly TOWARDS them, maybe not all the way off screen
            endPos = { x: sourceOffsets[posName].x * 0.5, y: sourceOffsets[posName].y * 0.5 };
        }
    }

    return (
        <div className="relative w-[200px] h-[200px] flex items-center justify-center">
            {/* Center glow effect based on action type */}
            <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                    background: isPair
                        ? 'radial-gradient(circle, rgba(255,0,255,0.2) 0%, transparent 70%)'
                        : 'radial-gradient(circle, rgba(0,255,240,0.1) 0%, transparent 70%)',
                }}
                animate={{
                    opacity: [0.6, 1, 0.6],
                    scale: [1, 1.1, 1],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
            />

            {/* PAIR DISPLAY */}
            <AnimatePresence mode='wait'>
                {isPair && visibleAction.cards && (
                    <motion.div
                        key={`pair-${visibleAction.timestamp}`}
                        className="relative z-10 flex gap-4"
                        initial={{ scale: 0.5, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 1.5, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                        <Card card={visibleAction.cards[0]} size="md" />
                        <Card card={visibleAction.cards[1]} size="md" />

                        {/* Match Label */}
                        <motion.div
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 bg-neon-pink/90 text-white font-bold px-4 py-1 rounded shadow-lg border border-white/50 backdrop-blur-md whitespace-nowrap"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1.2, rotate: -12 }}
                            transition={{ delay: 0.2, type: 'spring' }}
                        >
                            PAIR MATCHED!
                        </motion.div>
                    </motion.div>
                )}

                {/* DRAW DISPLAY - Animated Flying Card */}
                {isDraw && (
                    <motion.div
                        key={`draw-${visibleAction.timestamp}`}
                        className="absolute z-20"
                        initial={{ x: startPos.x, y: startPos.y, opacity: 0, scale: 0.5, rotate: 180 }}
                        animate={{
                            x: [startPos.x, 0, endPos.x],
                            y: [startPos.y, 0, endPos.y],
                            opacity: [0, 1, 0],
                            scale: [0.5, 1.2, 0.5],
                            rotate: [180, 0, 0]
                        }}
                        transition={{ duration: 1, times: [0, 0.5, 1], ease: "easeInOut" }}
                    >
                        {/* Show card back or generic card since draw is blind usually, but we might know rank/suit if revealed later? 
                            For Pair Annihilation draw is blind until it lands. 
                            Let's show a Card Back. 
                        */}
                        <div className="w-[60px] h-[84px] bg-dark-elem rounded border-2 border-neon-cyan/50 flex items-center justify-center shadow-[0_0_15px_rgba(0,255,240,0.5)]">
                            <span className="text-2xl">?</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
