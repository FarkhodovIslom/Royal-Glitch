'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Phase, PHASE_NAMES } from '@/lib/types';

interface PhaseTransitionProps {
    phase: Phase;
    eliminatedName?: string;
    isVisible: boolean;
    onComplete?: () => void;
}

export function PhaseTransition({
    phase,
    eliminatedName,
    isVisible,
    onComplete,
}: PhaseTransitionProps) {
    const getPhaseConfig = () => {
        switch (phase) {
            case 'PLAYING':
                return {
                    title: 'PAIR ANNIHILATION',
                    subtitle: 'AVOID THE GLITCH',
                    color: '#00FFF0',
                    players: 0 // Not used for dot indicator anymore or dynamic
                };
            case 'GAME_OVER':
                return {
                    title: 'GAME OVER',
                    subtitle: '',
                    color: '#FF00FF',
                    players: 0
                };
            default:
                return null;
        }
    };

    const config = getPhaseConfig();

    return (
        <AnimatePresence>
            {isVisible && config && (
                <motion.div
                    className="fixed inset-0 z-50 bg-dark-bg/95 backdrop-blur-md flex items-center justify-center scanlines"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onAnimationComplete={() => {
                        setTimeout(() => {
                            onComplete?.();
                        }, 2500);
                    }}
                >
                    {/* Circuit background */}
                    <div
                        className="absolute inset-0 opacity-20"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg stroke='%2300FFF0' stroke-opacity='0.3' stroke-width='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        }}
                    />

                    {/* Glitch lines */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {[...Array(8)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-full h-px"
                                style={{
                                    top: `${10 + i * 10}%`,
                                    background: `linear-gradient(90deg, transparent, ${config.color}88, transparent)`,
                                }}
                                animate={{
                                    x: ['-100%', '100%'],
                                    opacity: [0, 1, 0],
                                }}
                                transition={{
                                    duration: 0.8,
                                    delay: i * 0.1,
                                    repeat: 3,
                                }}
                            />
                        ))}
                    </div>

                    <div className="text-center relative z-10">
                        {/* Eliminated message */}
                        {eliminatedName && (
                            <motion.div
                                className="mb-12"
                                initial={{ opacity: 0, y: -30, scale: 0.8 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ delay: 0.3, type: 'spring' }}
                            >
                                <motion.span
                                    className="text-2xl md:text-4xl font-display font-bold tracking-[0.3em] text-glitch-red"
                                    animate={{
                                        textShadow: [
                                            '0 0 10px #FF3333, -3px 0 #FF00FF, 3px 0 #00FFF0',
                                            '0 0 20px #FF3333, 3px 0 #FF00FF, -3px 0 #00FFF0',
                                            '0 0 10px #FF3333, -3px 0 #FF00FF, 3px 0 #00FFF0',
                                        ],
                                        x: [0, -2, 2, -2, 0],
                                    }}
                                    transition={{ repeat: Infinity, duration: 0.3 }}
                                >
                                    {eliminatedName.toUpperCase()} LIQUIDATED
                                </motion.span>

                                {/* Skull icon */}
                                <motion.div
                                    className="mt-4 text-5xl"
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ delay: 0.6, type: 'spring' }}
                                >
                                    💀
                                </motion.div>
                            </motion.div>
                        )}

                        {/* Phase title */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                                type: 'spring',
                                stiffness: 200,
                                damping: 15,
                                delay: eliminatedName ? 1 : 0.3
                            }}
                        >
                            <motion.h1
                                className="font-display font-black text-7xl md:text-9xl tracking-wider"
                                style={{ color: config.color }}
                                animate={{
                                    textShadow: [
                                        `0 0 20px ${config.color}`,
                                        `0 0 40px ${config.color}, 0 0 80px ${config.color}88`,
                                        `0 0 20px ${config.color}`,
                                    ],
                                }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                            >
                                {config.title}
                            </motion.h1>
                        </motion.div>

                        {config.subtitle && (
                            <motion.h2
                                className="font-display text-3xl md:text-5xl text-white/80 tracking-[0.5em] mt-4"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: eliminatedName ? 1.3 : 0.6 }}
                                style={{
                                    textShadow: `0 0 10px ${config.color}66`,
                                }}
                            >
                                {config.subtitle}
                            </motion.h2>
                        )}

                        {/* Player count indicator */}
                        <motion.div
                            className="mt-8 flex items-center justify-center gap-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: eliminatedName ? 1.5 : 0.8 }}
                        >
                            {[...Array(config.players)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="w-4 h-4 rounded-full"
                                    style={{
                                        background: config.color,
                                        boxShadow: `0 0 10px ${config.color}`,
                                    }}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: (eliminatedName ? 1.5 : 0.8) + i * 0.1 }}
                                />
                            ))}
                        </motion.div>

                        {/* Decorative line */}
                        <motion.div
                            className="mt-12 mx-auto h-px"
                            style={{
                                background: `linear-gradient(90deg, transparent, ${config.color}, transparent)`,
                            }}
                            initial={{ width: 0 }}
                            animate={{ width: 400 }}
                            transition={{ delay: eliminatedName ? 1.8 : 1, duration: 0.5 }}
                        />
                    </div>

                    {/* Corner decorations */}
                    <div className="absolute top-8 left-8 w-16 h-16 border-l-2 border-t-2" style={{ borderColor: config.color + '66' }} />
                    <div className="absolute top-8 right-8 w-16 h-16 border-r-2 border-t-2" style={{ borderColor: config.color + '66' }} />
                    <div className="absolute bottom-8 left-8 w-16 h-16 border-l-2 border-b-2" style={{ borderColor: config.color + '66' }} />
                    <div className="absolute bottom-8 right-8 w-16 h-16 border-r-2 border-b-2" style={{ borderColor: config.color + '66' }} />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
