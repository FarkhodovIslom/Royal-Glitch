'use client';

import { motion } from 'framer-motion';
import clsx from 'clsx';

interface IntegrityBarProps {
    value: number; // 0-100
    showLabel?: boolean;
    size?: 'sm' | 'md' | 'lg';
    animate?: boolean;
}

const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
};

export function IntegrityBar({
    value,
    showLabel = true,
    size = 'md',
    animate = true
}: IntegrityBarProps) {
    // Determine color based on value
    const getBarColor = () => {
        if (value > 60) return '#00FFF0'; // neon cyan
        if (value > 30) return '#FFD700'; // glitch yellow
        return '#FF3333'; // glitch red
    };

    const barColor = getBarColor();
    const isCritical = value <= 20 && value > 0;

    return (
        <div className="w-full">
            {showLabel && (
                <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] text-neon-cyan/60 uppercase tracking-[0.2em] font-display">
                        INTEGRITY
                    </span>
                    <motion.span
                        className={clsx(
                            'text-sm font-bold font-display',
                            value > 60 && 'text-neon-cyan',
                            value <= 60 && value > 30 && 'text-glitch-yellow',
                            value <= 30 && 'text-glitch-red'
                        )}
                        animate={isCritical ? { opacity: [1, 0.5, 1] } : {}}
                        transition={{ repeat: Infinity, duration: 0.5 }}
                    >
                        {Math.round(value)}%
                    </motion.span>
                </div>
            )}

            {/* Bar container */}
            <div className={clsx(
                'w-full bg-dark-circuit border border-neon-cyan/30 relative overflow-hidden',
                sizeClasses[size],
                'clip-cyber-sm'
            )}>
                {/* Segmented overlay */}
                <div
                    className="absolute inset-0 z-10 pointer-events-none"
                    style={{
                        backgroundImage: 'repeating-linear-gradient(90deg, transparent 0px, transparent 4px, rgba(0,0,0,0.4) 4px, rgba(0,0,0,0.4) 5px)',
                    }}
                />

                {/* Fill bar */}
                <motion.div
                    className={clsx(
                        'h-full relative',
                        isCritical && 'animate-flicker'
                    )}
                    style={{
                        background: `linear-gradient(90deg, ${barColor}88, ${barColor})`,
                        boxShadow: `0 0 10px ${barColor}, 0 0 20px ${barColor}66`,
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{
                        type: 'spring',
                        stiffness: 100,
                        damping: 15,
                        duration: 0.5
                    }}
                >
                    {/* Shine effect */}
                    <div
                        className="absolute inset-0"
                        style={{
                            background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 50%, rgba(0,0,0,0.2) 100%)',
                        }}
                    />
                </motion.div>

                {/* Scanline effect for critical */}
                {isCritical && (
                    <motion.div
                        className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent_0px,transparent_1px,rgba(255,51,51,0.3)_1px,rgba(255,51,51,0.3)_2px)]"
                        animate={{ y: [0, 2] }}
                        transition={{ repeat: Infinity, duration: 0.1 }}
                    />
                )}
            </div>

            {/* Critical warning */}
            {isCritical && (
                <motion.div
                    className="mt-1 flex items-center justify-center gap-1"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ repeat: Infinity, duration: 0.3 }}
                >
                    <span className="text-glitch-red text-[10px] font-display tracking-widest">
                        ⚠ CRITICAL ⚠
                    </span>
                </motion.div>
            )}
        </div>
    );
}
