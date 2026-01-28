'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './Card';
import { DiscardedPair } from '@/lib/types';

interface DiscardPileProps {
    discardedPairs: DiscardedPair[];
    maxVisible?: number;
}

export function DiscardPile({ discardedPairs, maxVisible = 4 }: DiscardPileProps) {
    // Show most recent pairs first
    const recentPairs = [...discardedPairs].reverse().slice(0, maxVisible);
    const totalCount = discardedPairs.length;

    if (totalCount === 0) {
        return (
            <div className="flex flex-col items-center gap-2 p-3 opacity-40">
                <div className="w-16 h-20 rounded-lg border-2 border-dashed border-neon-cyan/30 flex items-center justify-center">
                    <span className="text-neon-cyan/50 text-xs">Empty</span>
                </div>
                <span className="text-[10px] font-display tracking-widest text-neon-cyan/50">
                    DISCARD
                </span>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-2">
            {/* Pair stack */}
            <div className="relative w-24 h-24">
                <AnimatePresence>
                    {recentPairs.map((pair, index) => (
                        <motion.div
                            key={pair.timestamp}
                            className="absolute inset-0 flex items-center justify-center"
                            style={{
                                zIndex: maxVisible - index,
                                transform: `translateY(${index * -4}px) rotate(${(index % 2 === 0 ? 1 : -1) * (index * 3)}deg)`,
                            }}
                            initial={{ scale: 1.5, opacity: 0, y: -50 }}
                            animate={{ scale: 1, opacity: 1, y: index * -4 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                        >
                            <div className="flex -space-x-6 transform scale-50">
                                <Card card={pair.cards[0]} size="sm" />
                                <Card card={pair.cards[1]} size="sm" />
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Glow effect */}
                <motion.div
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                        background: 'radial-gradient(circle, rgba(255,0,255,0.15) 0%, transparent 70%)',
                    }}
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
            </div>

            {/* Counter */}
            <motion.div
                className="px-3 py-1 bg-dark-panel/80 border border-neon-pink/40 rounded text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <span className="text-neon-pink text-sm font-bold">{totalCount}</span>
                <span className="text-neon-pink/60 text-[10px] ml-1 font-display tracking-wider">
                    PAIRS
                </span>
            </motion.div>
        </div>
    );
}
