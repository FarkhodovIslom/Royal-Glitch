'use client';

import { motion } from 'framer-motion';
import { MaskAvatar } from '@/components/masks/MaskAvatar';
import { PublicPlayer, MaskEmotion } from '@/lib/types';
import clsx from 'clsx';

interface PlayerInfoProps {
    player: PublicPlayer;
    position: 'north' | 'east' | 'south' | 'west';
    emotion?: MaskEmotion;
    isMe?: boolean;
}

export function PlayerInfo({ player, position, emotion = 'idle', isMe = false }: PlayerInfoProps) {
    const isVertical = position === 'east' || position === 'west';

    return (
        <motion.div
            className={clsx(
                'flex items-center gap-2 px-3 py-2',
                'bg-dark-panel/80 backdrop-blur-sm',
                'border rounded-lg clip-cyber-sm',
                player.isEliminated
                    ? 'border-glitch-red/40 opacity-60'
                    : isMe
                        ? 'border-neon-purple/60'
                        : 'border-neon-cyan/30',
                isVertical ? 'flex-col' : 'flex-row'
            )}
            style={{
                boxShadow: player.isEliminated
                    ? '0 0 8px rgba(255,51,51,0.2)'
                    : isMe
                        ? '0 0 10px rgba(189,0,255,0.3)'
                        : '0 0 8px rgba(0,255,240,0.1)',
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
        >
            {/* Small mask avatar */}
            <MaskAvatar
                maskType={player.maskType}
                nickname={player.nickname}
                emotion={emotion}
                size="md"
                showName
                rating={player.rating}
            />

            {/* Info */}
            <div className={clsx('flex gap-2', isVertical ? 'flex-col items-center' : 'flex-row items-center')}>
                {/* Card Count instead of Integrity */}
                <span className="text-xs font-mono font-bold text-neon-cyan">
                    {player.cardCount} Cards
                </span>

                {/* Rating */}
                <span className="text-[10px] text-neon-purple/60 font-mono">
                    ★{player.rating}
                </span>
            </div>

            {/* YOU badge */}
            {isMe && (
                <span
                    className="text-[9px] px-1.5 py-0.5 bg-neon-purple/30 text-neon-purple font-display tracking-wider rounded"
                >
                    YOU
                </span>
            )}

            {/* Eliminated overlay */}
            {player.isEliminated && (
                <motion.span
                    className="absolute text-[10px] text-glitch-red font-display tracking-wider"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                >
                    OUT
                </motion.span>
            )}
        </motion.div>
    );
}
