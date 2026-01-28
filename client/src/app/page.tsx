'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Bug, Crown } from 'lucide-react';

// Data rain characters
const DATA_CHARS = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';

function DataRain() {
    const [columns, setColumns] = useState<number[]>([]);

    useEffect(() => {
        const cols = Math.floor(window.innerWidth / 20);
        setColumns(Array.from({ length: cols }, () => Math.random() * 100));
    }, []);

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 opacity-30">
            {columns.map((delay, i) => (
                <motion.div
                    key={i}
                    className="absolute top-0 text-neon-cyan text-xs font-mono"
                    style={{ left: `${i * 20}px` }}
                    initial={{ y: '-100%' }}
                    animate={{ y: '100vh' }}
                    transition={{
                        duration: 10 + Math.random() * 10,
                        repeat: Infinity,
                        delay: delay / 10,
                        ease: 'linear',
                    }}
                >
                    {Array.from({ length: 30 }, () =>
                        DATA_CHARS[Math.floor(Math.random() * DATA_CHARS.length)]
                    ).join('\n')}
                </motion.div>
            ))}
        </div>
    );
}

function GlitchLogo() {
    return (
        <div className="relative">
            {/* Glitch layers */}
            <motion.h1
                className="font-display text-6xl md:text-8xl lg:text-9xl font-black tracking-wider"
                style={{
                    background: 'linear-gradient(180deg, #00FFF0 0%, #BD00FF 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    filter: 'drop-shadow(0 0 20px rgba(0, 255, 240, 0.5))',
                }}
                animate={{
                    textShadow: [
                        '0 0 20px #00FFF0',
                        '3px 0 30px #FF00FF, -3px 0 30px #00FFF0',
                        '0 0 20px #00FFF0',
                    ],
                }}
                transition={{ repeat: Infinity, duration: 2 }}
            >
                ROYAL
            </motion.h1>

            <motion.div
                className="relative"
                animate={{
                    x: [0, -2, 2, -1, 1, 0],
                }}
                transition={{ repeat: Infinity, duration: 3, times: [0, 0.9, 0.92, 0.94, 0.96, 1] }}
            >
                {/* Glitch offset layers */}
                <h1
                    className="absolute top-0 left-0 font-display text-6xl md:text-8xl lg:text-9xl font-black tracking-wider text-neon-pink opacity-70"
                    style={{
                        clipPath: 'polygon(0 0, 100% 0, 100% 45%, 0 45%)',
                        transform: 'translate(-4px, 0)',
                    }}
                >
                    GLITCH
                </h1>
                <h1
                    className="absolute top-0 left-0 font-display text-6xl md:text-8xl lg:text-9xl font-black tracking-wider text-neon-cyan opacity-70"
                    style={{
                        clipPath: 'polygon(0 55%, 100% 55%, 100% 100%, 0 100%)',
                        transform: 'translate(4px, 0)',
                    }}
                >
                    GLITCH
                </h1>
                <h1
                    className="font-display text-6xl md:text-8xl lg:text-9xl font-black tracking-wider text-white"
                    style={{
                        textShadow: '0 0 10px #00FFF0, 0 0 20px #BD00FF, 0 0 40px #FF00FF',
                    }}
                >
                    GLITCH
                </h1>
            </motion.div>

            {/* Crown */}
            <motion.div
                className="absolute -top-16 left-1/2 -translate-x-1/2"
                animate={{
                    filter: [
                        'drop-shadow(0 0 10px #FFD700)',
                        'drop-shadow(0 0 30px #FFD700)',
                        'drop-shadow(0 0 10px #FFD700)',
                    ],
                }}
                transition={{ repeat: Infinity, duration: 2 }}
            >
                <Crown className="text-[#FFD700] md:w-16 md:h-16 w-12 h-12" />
            </motion.div>
        </div>
    );
}

export default function Home() {
    return (
        <main className="min-h-screen bg-cyber relative overflow-hidden scanlines">
            {/* Data rain background */}
            <DataRain />

            {/* Ambient glows */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(189,0,255,0.15) 0%, transparent 70%)' }}
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{ repeat: Infinity, duration: 8 }}
                />
                <motion.div
                    className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(0,255,240,0.1) 0%, transparent 70%)' }}
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{ repeat: Infinity, duration: 6 }}
                />
            </div>

            {/* Grid lines */}
            <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                    backgroundImage: `
            linear-gradient(rgba(0,255,240,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,240,0.1) 1px, transparent 1px)
          `,
                    backgroundSize: '50px 50px',
                }}
            />

            {/* Content */}
            <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-8">

                {/* Logo */}
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="mb-8"
                >
                    <GlitchLogo />
                </motion.div>

                {/* Tagline */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    className="text-lg md:text-2xl text-neon-cyan/80 mb-12 font-body tracking-widest text-center"
                    style={{ textShadow: '0 0 10px rgba(0,255,240,0.5)' }}
                >
                    HIDE BEHIND YOUR MASK. SURVIVE THE ELIMINATION.
                </motion.p>

                {/* Decorative line */}
                <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 1, duration: 0.8 }}
                    className="w-80 h-px mb-12 relative"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neon-cyan to-transparent" />
                    <motion.div
                        className="absolute top-0 left-0 w-4 h-px bg-neon-pink"
                        animate={{ left: ['0%', '100%', '0%'] }}
                        transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                    />
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2, duration: 0.6 }}
                    className="flex flex-col sm:flex-row gap-6"
                >
                    <Link href="/lobby">
                        <button className="btn-cyber text-lg px-12 py-5 group relative overflow-hidden">
                            <span className="relative z-10">ENTER THE CLUB</span>
                            <motion.div
                                className="absolute inset-0 bg-neon-cyan/20"
                                initial={{ x: '-100%' }}
                                whileHover={{ x: '0%' }}
                                transition={{ duration: 0.3 }}
                            />
                        </button>
                    </Link>

                    <button className="btn-cyber btn-cyber-pink text-lg px-12 py-5">
                        HOW TO PLAY
                    </button>
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 0.8 }}
                    className="mt-16 flex gap-12 md:gap-20"
                >
                    {[
                        { value: '4', label: 'PLAYERS' },
                        { value: '3', label: 'PHASES' },
                        { value: '1', label: 'WINNER' },
                    ].map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            className="text-center"
                            whileHover={{ scale: 1.1 }}
                        >
                            <motion.div
                                className="text-4xl md:text-5xl font-display font-bold neon-cyan"
                                animate={{
                                    textShadow: [
                                        '0 0 10px #00FFF0',
                                        '0 0 20px #00FFF0, 0 0 40px #00FFF0',
                                        '0 0 10px #00FFF0',
                                    ],
                                }}
                                transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}
                            >
                                {stat.value}
                            </motion.div>
                            <div className="text-xs text-neon-cyan/60 tracking-[0.3em] mt-2">
                                {stat.label}
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Theme badge */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.8, duration: 0.8 }}
                    className="mt-16"
                >
                    <div className="panel-cyber px-6 py-3 flex items-center gap-3">
                        <motion.span
                            className="w-2 h-2 rounded-full bg-neon-pink"
                            animate={{ opacity: [1, 0.3, 1] }}
                            transition={{ repeat: Infinity, duration: 1 }}
                        />
                        <span className="text-neon-pink/80 text-sm font-body tracking-wider">
                            GLOBAL GAME JAM 2026 • THEME: MASK
                        </span>
                    </div>
                </motion.div>
            </div>

            {/* Corner decorations */}
            <div className="absolute top-4 left-4 w-20 h-20 border-l-2 border-t-2 border-neon-cyan/30" />
            <div className="absolute top-4 right-4 w-20 h-20 border-r-2 border-t-2 border-neon-cyan/30" />
            <div className="absolute bottom-4 left-4 w-20 h-20 border-l-2 border-b-2 border-neon-pink/30" />
            <div className="absolute bottom-4 right-4 w-20 h-20 border-r-2 border-b-2 border-neon-pink/30" />

            {/* Bottom scanline */}
            <motion.div
                className="absolute bottom-0 left-0 right-0 h-px bg-neon-cyan"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 2 }}
            />
        </main>
    );
}
