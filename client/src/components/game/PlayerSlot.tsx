'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { MaskAvatar } from '@/components/masks/MaskAvatar';
import { IntegrityBar } from './IntegrityBar';
import { PublicPlayer, MaskEmotion } from '@/lib/types';
import clsx from 'clsx';

interface PlayerSlotProps {
    player: PublicPlayer | null;
    position: 'top' | 'right' | 'bottom' | 'left';
    isCurrentTurn: boolean;
    emotion?: MaskEmotion;
    isMe?: boolean;
}

const positionClasses = {
    top: 'top-4 left-1/2 -translate-x-1/2',
    right: 'right-4 top-1/2 -translate-y-1/2',
    bottom: 'bottom-32 left-1/2 -translate-x-1/2',
    left: 'left-4 top-1/2 -translate-y-1/2',
};

export function PlayerSlot({
    player,
    position,
    isCurrentTurn,
    emotion = 'idle',
    isMe = false,
}: PlayerSlotProps) {
    if (!player) {
        return (
            <div className={clsx('absolute', positionClasses[position])}>
                <div className="w-24 h-32 border-2 border-dashed border-neon-cyan/20 rounded-lg flex items-center justify-center clip-cyber">
                    <span className="text-neon-cyan/30 text-xs font-display tracking-wider">EMPTY</span>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            className={clsx('absolute', positionClasses[position])}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
        >
            <div className={clsx(
                'relative p-4 clip-cyber',
                'bg-dark-panel/80 backdrop-blur-sm',
                'border-2',
                isCurrentTurn && !player.isEliminated
                    ? 'border-neon-pink'
                    : player.isEliminated
                        ? 'border-glitch-red/50'
                        : 'border-neon-cyan/30',
                player.isEliminated && 'opacity-60'
            )}
                style={{
                    boxShadow: isCurrentTurn && !player.isEliminated
                        ? '0 0 20px #FF00FF, 0 0 40px #FF00FF44, inset 0 0 20px #FF00FF22'
                        : player.isEliminated
                            ? '0 0 10px #FF3333, inset 0 0 10px #FF333322'
                            : '0 0 10px #00FFF044, inset 0 0 15px #00FFF011',
                }}
            >
                {/* Circuit pattern overlay */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div
                        className="w-full h-full"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10h8v1H0v-1zm12 0h8v1h-8v-1zM10 0v8h1V0h-1zm0 12v8h1v-8h-1z' fill='%2300FFF0' fill-opacity='0.5'/%3E%3C/svg%3E")`,
                        }}
                    />
                </div>

                {/* Current turn indicator */}
                <AnimatePresence>
                    {isCurrentTurn && !player.isEliminated && (
                        <motion.div
                            className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-neon-pink text-dark-bg text-[10px] font-display font-bold tracking-widest clip-cyber-sm"
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            style={{ boxShadow: '0 0 10px #FF00FF' }}
                        >
                            PLAYING
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Me indicator */}
                {isMe && (
                    <div
                        className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-neon-purple text-white text-[10px] font-display font-bold tracking-widest clip-cyber-sm"
                        style={{ boxShadow: '0 0 10px #BD00FF' }}
                    >
                        YOU
                    </div>
                )}

                <div className="flex flex-col items-center gap-3 relative z-10">
                    <MaskAvatar
                        maskType={player.maskType}
                        emotion={emotion}
                        size="md"
                        isEliminated={player.isEliminated}
                        rating={player.rating}
                    />

                    <div className="w-28">
                        <IntegrityBar value={player.integrity} size="sm" />
                    </div>

                    {/* Card count */}
                    {!player.isEliminated && player.cardCount > 0 && (
                        <div className="flex items-center gap-1 text-xs text-neon-cyan/70 font-display">
                            <span>🃏</span>
                            <span>{player.cardCount}</span>
                        </div>
                    )}

                    {/* Ready indicator (in lobby) */}
                    {player.isReady && !player.isEliminated && (
                        <motion.span
                            className="text-xs text-neon-cyan font-display"
                            animate={{ opacity: [1, 0.5, 1] }}
                            transition={{ repeat: Infinity, duration: 1 }}
                        >
                            ✓ READY
                        </motion.span>
                    )}
                </div>

                {/* Eliminated overlay */}
                <AnimatePresence>
                    {player.isEliminated && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 flex items-center justify-center bg-dark-bg/70 clip-cyber"
                        >
                            <motion.span
                                className="text-glitch-red font-display font-bold text-sm tracking-widest"
                                animate={{
                                    textShadow: [
                                        '0 0 10px #FF3333',
                                        '0 0 20px #FF3333, -2px 0 #FF00FF, 2px 0 #00FFF0',
                                        '0 0 10px #FF3333',
                                    ]
                                }}
                                transition={{ repeat: Infinity, duration: 0.5 }}
                            >
                                ELIMINATED
                            </motion.span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Active turn glow animation */}
                {isCurrentTurn && !player.isEliminated && (
                    <motion.div
                        className="absolute inset-0 pointer-events-none clip-cyber"
                        animate={{
                            boxShadow: [
                                'inset 0 0 20px #FF00FF44',
                                'inset 0 0 40px #FF00FF66',
                                'inset 0 0 20px #FF00FF44',
                            ],
                        }}
                        transition={{ repeat: Infinity, duration: 1 }}
                    />
                )}
            </div>
        </motion.div>
    );
}
