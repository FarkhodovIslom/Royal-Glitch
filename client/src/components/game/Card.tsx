'use client';

import { motion } from 'framer-motion';
import { Card as CardType, Suit, SUIT_SYMBOLS } from '@/lib/types';
import clsx from 'clsx';

interface CardProps {
    card: CardType;
    isPlayable?: boolean;
    isSelected?: boolean;
    isFaceDown?: boolean;
    onClick?: () => void;
    size?: 'sm' | 'md' | 'lg';
    style?: React.CSSProperties;
}

const sizeClasses = {
    sm: { container: 'w-14 h-20', rank: 'text-xs', suit: 'text-sm', center: 'text-2xl' },
    md: { container: 'w-20 h-28', rank: 'text-sm', suit: 'text-base', center: 'text-3xl' },
    lg: { container: 'w-24 h-36', rank: 'text-base', suit: 'text-lg', center: 'text-4xl' },
};

// Check if suit is red (hearts/diamonds = neon pink, spades/clubs = neon cyan)
const isRedSuit = (suit: Suit) => suit === 'hearts' || suit === 'diamonds';

// Is this the Queen of Spades?
const isQueenOfSpades = (card: CardType) => card.suit === 'spades' && card.rank === 'Q';

export function Card({
    card,
    isPlayable = false,
    isSelected = false,
    isFaceDown = false,
    onClick,
    size = 'md',
    style,
}: CardProps) {
    const suitSymbol = SUIT_SYMBOLS[card.suit];
    const sizes = sizeClasses[size];
    const isRed = isRedSuit(card.suit);
    const isQoS = isQueenOfSpades(card);

    if (isFaceDown) {
        return (
            <motion.div
                className={clsx(
                    'relative rounded overflow-hidden',
                    'bg-dark-panel border-2 border-neon-purple',
                    sizes.container
                )}
                style={style}
                whileHover={{ scale: 1.02 }}
            >
                {/* Circuit pattern background */}
                <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,var(--dark-circuit)_0px,var(--dark-circuit)_2px,var(--dark-panel)_2px,var(--dark-panel)_4px)]" />

                {/* Center glow */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-neon-purple/30 blur-xl" />
                    <span className="absolute text-neon-purple text-2xl">🐛</span>
                </div>

                {/* Border glow */}
                <div className="absolute inset-0 rounded border border-neon-purple/50 shadow-neon-purple" />
            </motion.div>
        );
    }

    return (
        <motion.div
            className={clsx(
                'relative rounded overflow-hidden cursor-default select-none',
                'bg-dark-panel border-2 transition-all duration-200',
                sizes.container,
                isRed ? 'border-neon-pink/70' : 'border-neon-cyan/70',
                isPlayable && 'cursor-pointer',
                isSelected && 'ring-2 ring-neon-purple',
                isQoS && 'animate-glitch-loop border-glitch-red'
            )}
            style={style}
            onClick={isPlayable ? onClick : undefined}
            whileHover={isPlayable ? {
                y: -20,
                scale: 1.08,
                transition: { type: 'spring', stiffness: 400, damping: 25 }
            } : {}}
            whileTap={isPlayable ? { scale: 0.95 } : {}}
        >
            {/* Circuit trace background */}
            <div className="absolute inset-0 opacity-30">
                <svg className="w-full h-full" viewBox="0 0 80 112">
                    <defs>
                        <pattern id="circuit" width="10" height="10" patternUnits="userSpaceOnUse">
                            <path
                                d="M0 5h4M6 5h4M5 0v4M5 6v4"
                                stroke={isRed ? '#FF00FF' : '#00FFF0'}
                                strokeWidth="0.5"
                                strokeOpacity="0.3"
                            />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#circuit)" />
                </svg>
            </div>

            {/* Top left corner */}
            <div className={clsx(
                'absolute top-1 left-1.5 flex flex-col items-center leading-none',
                isRed ? 'suit-red' : 'suit-black'
            )}>
                <span className={clsx('font-bold font-display', sizes.rank)}>{card.rank}</span>
                <span className={sizes.suit}>{suitSymbol}</span>
            </div>

            {/* Center suit (large, glowing) */}
            <div className="absolute inset-0 flex items-center justify-center">
                <motion.span
                    className={clsx(
                        sizes.center,
                        isRed ? 'suit-red' : 'suit-black'
                    )}
                    animate={isQoS ? {
                        textShadow: [
                            '0 0 10px #FF3333, 0 0 20px #FF3333',
                            '0 0 20px #FF3333, 0 0 40px #FF3333',
                            '0 0 10px #FF3333, 0 0 20px #FF3333',
                        ]
                    } : {}}
                    transition={{ repeat: Infinity, duration: 1 }}
                >
                    {suitSymbol}
                </motion.span>
            </div>

            {/* Bottom right corner (inverted) */}
            <div className={clsx(
                'absolute bottom-1 right-1.5 flex flex-col items-center leading-none rotate-180',
                isRed ? 'suit-red' : 'suit-black'
            )}>
                <span className={clsx('font-bold font-display', sizes.rank)}>{card.rank}</span>
                <span className={sizes.suit}>{suitSymbol}</span>
            </div>

            {/* Hover glow effect */}
            {isPlayable && (
                <motion.div
                    className="absolute inset-0 opacity-0 pointer-events-none"
                    whileHover={{ opacity: 1 }}
                >
                    <div className={clsx(
                        'absolute inset-0',
                        isRed ? 'bg-neon-pink/10' : 'bg-neon-cyan/10'
                    )} />
                    {/* Scanline effect on hover */}
                    <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent_0px,transparent_2px,rgba(255,0,255,0.05)_2px,rgba(255,0,255,0.05)_4px)]" />
                </motion.div>
            )}

            {/* Queen of Spades danger overlay */}
            {isQoS && (
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 bg-glitch-red/10" />
                    <div className="absolute top-0 left-0 w-full h-0.5 bg-glitch-red animate-scanline" />
                </div>
            )}

            {/* Neon border glow */}
            <div className={clsx(
                'absolute inset-0 rounded pointer-events-none',
                isRed ? 'shadow-neon-pink' : 'shadow-neon-cyan',
                isQoS && 'shadow-[0_0_15px_#FF3333,0_0_30px_#FF333366]'
            )} />
        </motion.div>
    );
}
