'use client';

import { motion } from 'framer-motion';
import clsx from 'clsx';

interface OpponentHandProps {
    cardCount: number;
    position: 'north' | 'east' | 'west';
    isCurrentTurn?: boolean;
    onClick?: () => void;
}

export function OpponentHand({ cardCount, position, isCurrentTurn = false, onClick }: OpponentHandProps) {
    if (cardCount === 0) return null;

    const isVertical = position === 'east' || position === 'west';

    // Calculate fan spread based on position
    const fanAngle = isVertical ? 2 : 2.5;
    const totalAngle = (cardCount - 1) * fanAngle;
    const startAngle = -totalAngle / 2;

    // Card dimensions
    const cardWidth = isVertical ? 50 : 60;
    const cardHeight = isVertical ? 70 : 85;

    return (
        <div
            className={clsx(
                'relative flex items-center justify-center transition-all',
                isVertical ? 'h-[200px] w-[100px]' : 'h-[100px] w-[280px]',
                onClick && 'cursor-pointer hover:scale-105 hover:brightness-125'
            )}
            onClick={onClick}
        >
            {/* Turn indicator glow */}
            {isCurrentTurn && (
                <motion.div
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                        background: 'radial-gradient(ellipse, rgba(255,0,255,0.2) 0%, transparent 70%)',
                    }}
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                />
            )}

            {/* Cards */}
            {Array.from({ length: cardCount }).map((_, index) => {
                const angle = startAngle + index * fanAngle;

                // Position calculations
                let transform = '';
                let left = '50%';
                let top = '50%';

                if (position === 'north') {
                    // Horizontal arc curving upward
                    const xOffset = Math.sin((angle * Math.PI) / 180) * 120;
                    const yOffset = Math.abs(Math.cos((angle * Math.PI) / 180) * 15);
                    transform = `translate(-50%, -50%) translateX(${xOffset}px) translateY(${yOffset}px) rotate(${angle + 180}deg)`;
                } else if (position === 'west') {
                    // Vertical arc curving right
                    const yOffset = Math.sin((angle * Math.PI) / 180) * 80;
                    const xOffset = Math.abs(Math.cos((angle * Math.PI) / 180) * 10);
                    transform = `translate(-50%, -50%) translateY(${yOffset}px) translateX(${xOffset}px) rotate(${angle + 90}deg)`;
                } else if (position === 'east') {
                    // Vertical arc curving left
                    const yOffset = Math.sin((angle * Math.PI) / 180) * 80;
                    const xOffset = -Math.abs(Math.cos((angle * Math.PI) / 180) * 10);
                    transform = `translate(-50%, -50%) translateY(${yOffset}px) translateX(${xOffset}px) rotate(${angle - 90}deg)`;
                }

                return (
                    <motion.div
                        key={index}
                        className="absolute"
                        style={{
                            width: cardWidth,
                            height: cardHeight,
                            left,
                            top,
                            transform,
                            zIndex: index,
                        }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.02 }}
                    >
                        {/* Card back design */}
                        <div
                            className={clsx(
                                'w-full h-full rounded-md border-2',
                                'bg-gradient-to-br from-dark-panel via-dark-circuit to-dark-panel',
                                isCurrentTurn ? 'border-neon-pink/60' : 'border-neon-cyan/30',
                                'overflow-hidden'
                            )}
                            style={{
                                boxShadow: isCurrentTurn
                                    ? '0 2px 8px rgba(255,0,255,0.3)'
                                    : '0 2px 4px rgba(0,0,0,0.3)',
                            }}
                        >
                            {/* Pattern overlay */}
                            <div
                                className="absolute inset-1 opacity-30"
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h10v10H0zM10 10h10v10H10z' fill='%2300FFF0' fill-opacity='0.3'/%3E%3C/svg%3E")`,
                                }}
                            />

                            {/* Center emblem */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div
                                    className="w-6 h-6 rounded-full border border-neon-purple/50"
                                    style={{
                                        background: 'radial-gradient(circle, rgba(189,0,255,0.3) 0%, transparent 70%)',
                                    }}
                                />
                            </div>

                            {/* Corner decorations */}
                            <div className="absolute top-1 left-1 w-2 h-2 border-l border-t border-neon-cyan/40" />
                            <div className="absolute bottom-1 right-1 w-2 h-2 border-r border-b border-neon-cyan/40" />
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
