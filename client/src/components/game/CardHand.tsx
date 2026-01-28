'use client';

import { motion } from 'framer-motion';
import { Card } from './Card';
import { Card as CardType } from '@/lib/types';

interface CardHandProps {
    cards: CardType[];
    validCards: CardType[];
    isMyTurn: boolean;
    onPlayCard: (card: CardType) => void;
}

export function CardHand({
    cards,
    validCards,
    isMyTurn,
    onPlayCard,
}: CardHandProps) {
    const isValidCard = (card: CardType) => {
        return validCards.some(
            (vc) => vc.suit === card.suit && vc.rank === card.rank
        );
    };

    // Fan layout calculations
    const fanAngle = 3; // degrees between cards
    const totalAngle = (cards.length - 1) * fanAngle;
    const startAngle = -totalAngle / 2;

    return (
        <div className="relative">
            {/* Hand glow background */}
            {isMyTurn && (
                <motion.div
                    className="absolute -inset-8 rounded-full opacity-30 pointer-events-none"
                    style={{
                        background: 'radial-gradient(ellipse at 50% 100%, rgba(255,0,255,0.3) 0%, transparent 70%)',
                    }}
                    animate={{ opacity: [0.2, 0.4, 0.2] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                />
            )}

            {/* Cards container */}
            <div className="flex items-end justify-center relative" style={{ height: '180px' }}>
                {cards.map((card, index) => {
                    const angle = startAngle + index * fanAngle;
                    const isValid = isValidCard(card);
                    const isPlayable = isMyTurn && isValid;

                    // Arc positioning
                    const xOffset = Math.sin((angle * Math.PI) / 180) * 200;
                    const yOffset = Math.cos((angle * Math.PI) / 180) * 30 - 30;

                    return (
                        <motion.div
                            key={`${card.suit}-${card.rank}`}
                            className="absolute origin-bottom"
                            style={{
                                left: '50%',
                                bottom: 0,
                                marginLeft: '-40px',
                                zIndex: index,
                            }}
                            initial={{
                                x: xOffset,
                                y: yOffset,
                                rotate: angle,
                                opacity: 0,
                                scale: 0.8,
                            }}
                            animate={{
                                x: xOffset,
                                y: yOffset,
                                rotate: angle,
                                opacity: 1,
                                scale: 1,
                            }}
                            transition={{
                                type: 'spring',
                                stiffness: 300,
                                damping: 25,
                                delay: index * 0.03,
                            }}
                            whileHover={isPlayable ? {
                                y: yOffset - 30,
                                zIndex: 50,
                                scale: 1.1,
                                transition: { duration: 0.2 }
                            } : {}}
                        >
                            <Card
                                card={card}
                                isPlayable={isPlayable}
                                onClick={() => isPlayable && onPlayCard(card)}
                                size="lg"
                            />

                            {/* Playable indicator glow */}
                            {isPlayable && (
                                <motion.div
                                    className="absolute inset-0 rounded pointer-events-none"
                                    style={{
                                        boxShadow: '0 0 15px #FF00FF, 0 0 30px #FF00FF44',
                                    }}
                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                    transition={{ repeat: Infinity, duration: 1 }}
                                />
                            )}

                            {/* Invalid card overlay */}
                            {isMyTurn && !isValid && (
                                <div className="absolute inset-0 bg-dark-bg/50 rounded pointer-events-none" />
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* Card count indicator */}
            <motion.div
                className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-3 py-1 bg-dark-panel/80 border border-neon-cyan/30 clip-cyber-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <span className="text-neon-cyan text-xs font-display tracking-wider">
                    {cards.length} <span className="text-neon-cyan/60">CARDS</span>
                </span>
            </motion.div>
        </div>
    );
}
