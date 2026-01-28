'use client';

import { motion } from 'framer-motion';
import clsx from 'clsx';
import { MaskType, MaskEmotion, MASK_NAMES } from '@/lib/types';

interface MaskAvatarProps {
    maskType: MaskType;
    emotion?: MaskEmotion;
    size?: 'sm' | 'md' | 'lg';
    isEliminated?: boolean;
    showName?: boolean;
    rating?: number;
}

const sizeClasses = {
    sm: 'w-14 h-14',
    md: 'w-20 h-20',
    lg: 'w-28 h-28',
};

// Cyber-styled mask SVG paths
const MASK_PATHS: Record<MaskType, { path: string; glow: string }> = {
    venetian: {
        path: 'M50 20C30 20 15 35 15 50C15 65 30 80 50 80C70 80 85 65 85 50C85 35 70 20 50 20ZM35 45C38 45 40 48 40 52C40 56 38 58 35 58C32 58 30 56 30 52C30 48 32 45 35 45ZM65 45C68 45 70 48 70 52C70 56 68 58 65 58C62 58 60 56 60 52C60 48 62 45 65 45ZM50 70C40 70 33 65 33 65L50 72L67 65C67 65 60 70 50 70Z',
        glow: '#00FFF0',
    },
    kabuki: {
        path: 'M50 15C25 15 10 35 10 55C10 75 25 85 50 85C75 85 90 75 90 55C90 35 75 15 50 15ZM30 50C35 50 38 55 38 60C38 65 35 68 30 68C25 68 22 65 22 60C22 55 25 50 30 50ZM70 50C75 50 78 55 78 60C78 65 75 68 70 68C65 68 62 65 62 60C62 55 65 50 70 50ZM50 75L35 65H65L50 75Z',
        glow: '#FF00FF',
    },
    tribal: {
        path: 'M50 10C20 10 5 40 5 55C5 70 20 90 50 90C80 90 95 70 95 55C95 40 80 10 50 10ZM25 45L35 55L25 65L15 55L25 45ZM75 45L85 55L75 65L65 55L75 45ZM50 80C35 80 25 70 25 70L50 75L75 70C75 70 65 80 50 80Z',
        glow: '#BD00FF',
    },
    plague: {
        path: 'M50 10C35 10 20 25 20 45C20 50 22 55 25 60C25 60 15 80 15 85C15 90 40 90 50 90C60 90 85 90 85 85C85 80 75 60 75 60C78 55 80 50 80 45C80 25 65 10 50 10ZM35 40C40 40 43 45 43 50C43 55 40 58 35 58C30 58 27 55 27 50C27 45 30 40 35 40ZM65 40C70 40 73 45 73 50C73 55 70 58 65 58C60 58 57 55 57 50C57 45 60 40 65 40Z',
        glow: '#00FFF0',
    },
    jester: {
        path: 'M50 5L40 25L20 20L35 40L15 50L35 60L20 80L40 75L50 95L60 75L80 80L65 60L85 50L65 40L80 20L60 25L50 5ZM40 45C43 45 45 48 45 52C45 56 43 58 40 58C37 58 35 56 35 52C35 48 37 45 40 45ZM60 45C63 45 65 48 65 52C65 56 63 58 60 58C57 58 55 56 55 52C55 48 57 45 60 45ZM50 70C45 70 42 68 42 68L50 72L58 68C58 68 55 70 50 70Z',
        glow: '#FFD700',
    },
    phantom: {
        path: 'M50 15C30 15 15 30 15 50C15 55 17 60 20 65L15 85L35 75C40 78 45 80 50 80C70 80 85 65 85 50C85 30 70 15 50 15ZM35 45C38 45 40 48 40 52C40 56 38 58 35 58C32 58 30 56 30 52C30 48 32 45 35 45ZM55 50L65 45L65 55L55 50Z',
        glow: '#FF00FF',
    },
};

const emotionAnimations: Record<MaskEmotion, any> = {
    idle: { scale: 1 },
    shake: {
        x: [0, -5, 5, -5, 5, 0],
        transition: { duration: 0.5 },
    },
    glitch: {
        x: [0, -3, 3, -3, 3, 0],
        filter: [
            'hue-rotate(0deg) brightness(1)',
            'hue-rotate(90deg) brightness(1.5)',
            'hue-rotate(180deg) brightness(0.8)',
            'hue-rotate(270deg) brightness(1.2)',
            'hue-rotate(0deg) brightness(1)',
        ],
        transition: { duration: 0.3 },
    },
    pulse: {
        scale: [1, 1.15, 1, 1.15, 1],
        transition: { duration: 1, repeat: Infinity },
    },
    crack: {
        opacity: [1, 0.5, 1, 0.3, 0.1],
        filter: ['brightness(1)', 'brightness(0.5) saturate(0)', 'brightness(0.3) saturate(0)'],
        transition: { duration: 0.5 },
    },
};

export function MaskAvatar({
    maskType,
    emotion = 'idle',
    size = 'md',
    isEliminated = false,
    showName = false,
    rating,
}: MaskAvatarProps) {
    const mask = MASK_PATHS[maskType];

    return (
        <div className="flex flex-col items-center gap-2">
            <motion.div
                className={clsx(
                    'relative rounded-lg flex items-center justify-center',
                    'bg-dark-panel border-2',
                    sizeClasses[size],
                    isEliminated ? 'border-glitch-red' : 'border-neon-purple',
                    !isEliminated && 'mask-cyber'
                )}
                style={{
                    boxShadow: isEliminated
                        ? '0 0 15px #FF3333, inset 0 0 20px rgba(255,51,51,0.2)'
                        : `0 0 15px ${mask.glow}44, inset 0 0 20px ${mask.glow}22`,
                }}
                animate={emotionAnimations[emotion]}
            >
                {/* Circuit background */}
                <div className="absolute inset-0 opacity-20 rounded-lg overflow-hidden">
                    <div
                        className="w-full h-full"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10h8v2H0v-2zm12 0h8v2h-8v-2zM10 0v8h2V0h-2zm0 12v8h2v-8h-2z' fill='%2300FFF0' fill-opacity='0.3'/%3E%3C/svg%3E")`,
                        }}
                    />
                </div>

                {/* Mask SVG */}
                <svg
                    viewBox="0 0 100 100"
                    className="w-3/4 h-3/4 relative z-10"
                    style={{
                        filter: isEliminated
                            ? 'grayscale(1) brightness(0.3)'
                            : `drop-shadow(0 0 5px ${mask.glow}) drop-shadow(0 0 10px ${mask.glow}66)`,
                    }}
                >
                    <path
                        d={mask.path}
                        fill={isEliminated ? '#333' : mask.glow}
                        opacity={isEliminated ? 0.5 : 0.9}
                    />
                </svg>

                {/* Eliminated overlay */}
                {isEliminated && (
                    <motion.div
                        className="absolute inset-0 flex items-center justify-center bg-dark-bg/60 rounded-lg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <span className="text-2xl">💀</span>
                    </motion.div>
                )}

                {/* Glitch scanlines on emotion */}
                {emotion === 'glitch' && (
                    <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
                        <motion.div
                            className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent_0px,transparent_2px,rgba(255,0,255,0.3)_2px,rgba(255,0,255,0.3)_4px)]"
                            animate={{ y: [0, 10] }}
                            transition={{ repeat: Infinity, duration: 0.1 }}
                        />
                    </div>
                )}

                {/* Neon border glow animation */}
                {!isEliminated && (
                    <motion.div
                        className="absolute inset-0 rounded-lg pointer-events-none"
                        style={{ border: `1px solid ${mask.glow}` }}
                        animate={{
                            opacity: [0.5, 1, 0.5],
                            boxShadow: [
                                `0 0 5px ${mask.glow}`,
                                `0 0 15px ${mask.glow}, 0 0 30px ${mask.glow}44`,
                                `0 0 5px ${mask.glow}`,
                            ],
                        }}
                        transition={{ repeat: Infinity, duration: 2 }}
                    />
                )}
            </motion.div>

            {showName && (
                <span className={clsx(
                    'text-xs font-display tracking-wider',
                    isEliminated ? 'text-glitch-red/60' : 'text-neon-cyan/80'
                )}>
                    {MASK_NAMES[maskType].toUpperCase()}
                </span>
            )}

            {rating !== undefined && (
                <div className="flex items-center gap-1">
                    <span className="text-neon-purple text-xs">⚡</span>
                    <span className="text-xs text-neon-purple font-display">
                        {rating}
                    </span>
                </div>
            )}
        </div>
    );
}
