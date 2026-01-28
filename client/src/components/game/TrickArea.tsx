'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './Card';
import { PlayedCard } from '@/lib/types';

interface TrickAreaProps {
    currentTrick: PlayedCard[];
    playerPositions: Record<string, 'top' | 'right' | 'bottom' | 'left'>;
}

const positionStyles: Record<string, { x: number; y: number; rotate: number }> = {
    top: { x: 0, y: -40, rotate: 180 },
    right: { x: 50, y: 0, rotate: 270 },
    bottom: { x: 0, y: 40, rotate: 0 },
    left: { x: -50, y: 0, rotate: 90 },
};

export function TrickArea({ currentTrick, playerPositions }: TrickAreaProps) {
    const hasCards = currentTrick.length > 0;

    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* Hexagonal drop zone */}
            <div
                className={`relative w-56 h-56 flex items-center justify-center transition-all duration-300 ${hasCards ? 'trick-zone active' : 'trick-zone'
                    }`}
                style={{
                    clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
                }}
            >
                {/* Inner glow */}
                <motion.div
                    className="absolute inset-4"
                    style={{
                        background: 'radial-gradient(circle, rgba(189,0,255,0.1) 0%, transparent 70%)',
                        clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
                    }}
                    animate={hasCards ? {
                        opacity: [0.5, 1, 0.5],
                        scale: [1, 1.05, 1],
                    } : {}}
                    transition={{ repeat: Infinity, duration: 2 }}
                />

                {/* Circuit lines */}
                <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 100 100">
                    <defs>
                        <pattern id="hexCircuit" width="10" height="10" patternUnits="userSpaceOnUse">
                            <path d="M0 5h4M6 5h4M5 0v4M5 6v4" stroke="#00FFF0" strokeWidth="0.5" strokeOpacity="0.5" />
                        </pattern>
                    </defs>
                    <rect width="100" height="100" fill="url(#hexCircuit)" />
                </svg>

                {/* Cards */}
                <AnimatePresence>
                    {currentTrick.map((played, index) => {
                        const position = playerPositions[played.playerId] || 'bottom';
                        const style = positionStyles[position];

                        return (
                            <motion.div
                                key={`${played.card.suit}-${played.card.rank}-${index}`}
                                className="absolute"
                                initial={{
                                    x: style.x * 5,
                                    y: style.y * 5,
                                    opacity: 0,
                                    scale: 0.3,
                                    rotate: style.rotate
                                }}
                                animate={{
                                    x: style.x,
                                    y: style.y,
                                    opacity: 1,
                                    scale: 1,
                                    rotate: style.rotate
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
                    <div className="flex flex-col items-center gap-2">
                        <motion.div
                            className="text-neon-cyan/30 text-4xl"
                            animate={{
                                opacity: [0.3, 0.6, 0.3],
                                scale: [1, 1.1, 1],
                            }}
                            transition={{ repeat: Infinity, duration: 2 }}
                        >
                            🎴
                        </motion.div>
                        <span className="text-neon-cyan/40 text-xs font-display tracking-widest">
                            DROP ZONE
                        </span>
                    </div>
                )}
            </div>

            {/* Rotating border glow */}
            <motion.div
                className="absolute w-60 h-60 border-2 border-neon-purple/30 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
                style={{
                    boxShadow: '0 0 20px #BD00FF22',
                }}
            />
        </div>
    );
}
