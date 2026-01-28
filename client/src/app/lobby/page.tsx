'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/hooks/useSocket';
import { useGameStore } from '@/stores/gameStore';
import { MaskAvatar } from '@/components/masks/MaskAvatar';
import { MaskType, MASK_NAMES } from '@/lib/types';
import Link from 'next/link';

const MASKS: MaskType[] = ['venetian', 'kabuki', 'tribal', 'plague', 'jester', 'phantom'];

export default function LobbyPage() {
    const router = useRouter();
    const { connect, createRoom, joinRoom, getRooms, isConnected, playerId, roomId } = useSocket();
    const { players, phase } = useGameStore();

    const [selectedMask, setSelectedMask] = useState<MaskType>('venetian');
    const [roomCode, setRoomCode] = useState('');
    const [availableRooms, setAvailableRooms] = useState<{ id: string; playerCount: number }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Connect on mount
    useEffect(() => {
        connect().catch((err) => {
            setError('Failed to connect to server');
            console.error(err);
        });
    }, [connect]);

    // Fetch available rooms
    useEffect(() => {
        if (isConnected) {
            const fetchRooms = async () => {
                try {
                    const rooms = await getRooms();
                    setAvailableRooms(rooms.filter(r => r.phase === 'WAITING'));
                } catch (err) {
                    console.error('Failed to fetch rooms:', err);
                }
            };

            fetchRooms();
            const interval = setInterval(fetchRooms, 5000);
            return () => clearInterval(interval);
        }
    }, [isConnected, getRooms]);

    // Navigate to game when game starts
    useEffect(() => {
        if (roomId && phase !== 'WAITING' && phase !== 'GAME_OVER') {
            router.push(`/game/${roomId}`);
        }
    }, [roomId, phase, router]);

    const handleCreateRoom = () => {
        if (!isConnected) {
            setError('Not connected to server');
            return;
        }
        setIsLoading(true);
        setError(null);
        createRoom(selectedMask);
    };

    const handleJoinRoom = (id: string) => {
        if (!isConnected) {
            setError('Not connected to server');
            return;
        }
        setIsLoading(true);
        setError(null);
        joinRoom(id, selectedMask);
    };

    const handleJoinByCode = () => {
        if (!roomCode.trim()) {
            setError('Please enter a room code');
            return;
        }
        handleJoinRoom(roomCode.toUpperCase());
    };

    // If in a room, show waiting room UI
    if (roomId) {
        return <WaitingRoom selectedMask={selectedMask} />;
    }

    return (
        <main className="min-h-screen bg-cyber p-8 scanlines relative overflow-hidden">
            {/* Grid background */}
            <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage: `
            linear-gradient(rgba(0,255,240,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,240,0.1) 1px, transparent 1px)
          `,
                    backgroundSize: '40px 40px',
                }}
            />

            <div className="max-w-5xl mx-auto relative z-10">
                {/* Back link */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-neon-cyan/60 hover:text-neon-cyan transition-colors mb-8 font-display text-sm tracking-wider"
                >
                    <span>←</span> BACK TO HOME
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1
                        className="font-display text-5xl md:text-6xl font-bold tracking-wider"
                        style={{
                            background: 'linear-gradient(180deg, #00FFF0 0%, #BD00FF 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            filter: 'drop-shadow(0 0 20px rgba(0, 255, 240, 0.3))',
                        }}
                    >
                        THE UNDERGROUND
                    </h1>
                    <p className="text-neon-cyan/60 mt-2 font-body tracking-wider">
                        Choose your mask and enter the game.
                    </p>
                </motion.div>

                {/* Connection status */}
                <motion.div
                    className="flex items-center gap-3 mb-8 panel-cyber px-4 py-2 w-fit"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <motion.div
                        className={`w-2 h-2 rounded-full ${isConnected ? 'bg-neon-cyan' : 'bg-glitch-red'}`}
                        animate={{
                            boxShadow: isConnected
                                ? ['0 0 5px #00FFF0', '0 0 15px #00FFF0', '0 0 5px #00FFF0']
                                : ['0 0 5px #FF3333', '0 0 15px #FF3333', '0 0 5px #FF3333']
                        }}
                        transition={{ repeat: Infinity, duration: 1 }}
                    />
                    <span className="text-sm text-neon-cyan/80 font-body">
                        {isConnected ? 'CONNECTED' : 'CONNECTING...'}
                    </span>
                    {playerId && (
                        <span className="text-xs text-neon-purple/60 font-mono ml-2">
                            [{playerId.slice(0, 8)}]
                        </span>
                    )}
                </motion.div>

                {error && (
                    <motion.div
                        className="mb-6 p-4 border border-glitch-red/50 bg-glitch-red/10 text-glitch-red font-body clip-cyber"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        ⚠ {error}
                    </motion.div>
                )}

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Mask Selection */}
                    <motion.div
                        className="panel-cyber p-6"
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h2 className="font-display text-xl text-neon-cyan mb-6 tracking-wider flex items-center gap-2">
                            <span className="text-neon-pink">▸</span> SELECT YOUR MASK
                        </h2>

                        <div className="grid grid-cols-3 gap-4">
                            {MASKS.map((mask, i) => (
                                <motion.button
                                    key={mask}
                                    className={`p-4 transition-all clip-cyber ${selectedMask === mask
                                        ? 'bg-neon-purple/20 border-2 border-neon-purple'
                                        : 'bg-dark-circuit/50 border-2 border-neon-cyan/20 hover:border-neon-cyan/60'
                                        }`}
                                    style={{
                                        boxShadow: selectedMask === mask
                                            ? '0 0 20px #BD00FF44, inset 0 0 20px #BD00FF22'
                                            : 'none',
                                    }}
                                    onClick={() => setSelectedMask(mask)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 + i * 0.1 }}
                                >
                                    <MaskAvatar
                                        maskType={mask}
                                        size="lg"
                                        showName
                                    />
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Room Options */}
                    <motion.div
                        className="space-y-6"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        {/* Create Room */}
                        <div className="panel-cyber p-6">
                            <h2 className="font-display text-xl text-neon-cyan mb-4 tracking-wider flex items-center gap-2">
                                <span className="text-neon-pink">▸</span> CREATE NEW GAME
                            </h2>
                            <button
                                className="btn-cyber w-full"
                                onClick={handleCreateRoom}
                                disabled={!isConnected || isLoading}
                            >
                                {isLoading ? 'INITIALIZING...' : 'CREATE ROOM'}
                            </button>
                        </div>

                        {/* Join by Code */}
                        <div className="panel-cyber p-6">
                            <h2 className="font-display text-xl text-neon-cyan mb-4 tracking-wider flex items-center gap-2">
                                <span className="text-neon-pink">▸</span> JOIN BY CODE
                            </h2>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    placeholder="ROOM CODE"
                                    value={roomCode}
                                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                                    className="flex-1 px-4 py-3 bg-dark-bg border-2 border-neon-cyan/30 text-neon-cyan font-mono placeholder-neon-cyan/30 focus:outline-none focus:border-neon-cyan clip-cyber-sm"
                                    style={{ boxShadow: 'inset 0 0 10px #00FFF011' }}
                                    maxLength={6}
                                />
                                <button
                                    className="btn-cyber px-6"
                                    onClick={handleJoinByCode}
                                    disabled={!isConnected || isLoading}
                                >
                                    JOIN
                                </button>
                            </div>
                        </div>

                        {/* Available Rooms */}
                        {availableRooms.length > 0 && (
                            <div className="panel-cyber p-6">
                                <h2 className="font-display text-xl text-neon-cyan mb-4 tracking-wider flex items-center gap-2">
                                    <span className="text-neon-pink">▸</span> OPEN LOBBIES
                                </h2>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {availableRooms.map((room) => (
                                        <motion.button
                                            key={room.id}
                                            className="w-full flex items-center justify-between p-3 bg-dark-bg/50 border border-neon-cyan/20 hover:border-neon-pink hover:bg-neon-pink/10 transition-all clip-cyber-sm"
                                            onClick={() => handleJoinRoom(room.id)}
                                            whileHover={{ x: 5 }}
                                        >
                                            <span className="font-mono text-neon-cyan">{room.id}</span>
                                            <span className="text-neon-purple text-sm font-display">
                                                {room.playerCount}/4 <span className="text-neon-purple/60">PLAYERS</span>
                                            </span>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>

            {/* Corner decorations */}
            <div className="absolute top-4 left-4 w-16 h-16 border-l-2 border-t-2 border-neon-cyan/30" />
            <div className="absolute top-4 right-4 w-16 h-16 border-r-2 border-t-2 border-neon-cyan/30" />
            <div className="absolute bottom-4 left-4 w-16 h-16 border-l-2 border-b-2 border-neon-pink/30" />
            <div className="absolute bottom-4 right-4 w-16 h-16 border-r-2 border-b-2 border-neon-pink/30" />
        </main>
    );
}

// Waiting Room Component
function WaitingRoom({ selectedMask }: { selectedMask: MaskType }) {
    const { setReady, startGame, leaveRoom, roomId } = useSocket();
    const { players, playerId, phase, creatorId } = useGameStore();
    const router = useRouter();
    const [isReady, setIsReady] = useState(false);

    const isCreator = playerId === creatorId;
    const canStart = players.length >= 2;

    const handleReady = () => {
        setReady();
        setIsReady(true);
    };

    const handleStartGame = () => {
        startGame();
    };

    const handleLeave = () => {
        leaveRoom();
    };

    // Navigate to game when game starts
    useEffect(() => {
        if (phase !== 'WAITING' && phase !== 'GAME_OVER' && roomId) {
            router.push(`/game/${roomId}`);
        }
    }, [phase, roomId, router]);

    return (
        <main className="min-h-screen bg-cyber p-8 flex items-center justify-center scanlines relative overflow-hidden">
            {/* Grid background */}
            <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage: `
            linear-gradient(rgba(0,255,240,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,240,0.1) 1px, transparent 1px)
          `,
                    backgroundSize: '40px 40px',
                }}
            />

            <motion.div
                className="max-w-xl w-full panel-cyber p-8 relative z-10"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                <div className="text-center mb-8">
                    <h1 className="font-display text-3xl text-neon-cyan tracking-wider mb-4">
                        WAITING ROOM
                    </h1>
                    <div className="flex items-center justify-center gap-3">
                        <span className="text-neon-cyan/60 text-sm font-body">ROOM CODE:</span>
                        <motion.span
                            className="font-mono text-2xl text-neon-pink"
                            style={{ textShadow: '0 0 10px #FF00FF' }}
                            animate={{
                                textShadow: ['0 0 10px #FF00FF', '0 0 20px #FF00FF', '0 0 10px #FF00FF']
                            }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                        >
                            {roomId}
                        </motion.span>
                    </div>
                    {isCreator && (
                        <span className="text-xs text-neon-purple mt-2 block font-display">👑 YOU ARE THE HOST</span>
                    )}
                </div>

                {/* Players Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    {[0, 1, 2, 3].map((slot) => {
                        const player = players[slot];
                        const isPlayerCreator = player?.id === creatorId;
                        return (
                            <motion.div
                                key={slot}
                                className={`p-4 clip-cyber border-2 ${player
                                    ? player.isReady || isPlayerCreator
                                        ? 'border-neon-cyan bg-neon-cyan/10'
                                        : 'border-neon-purple/50 bg-neon-purple/10'
                                    : 'border-dashed border-neon-cyan/20 bg-dark-circuit/30'
                                    }`}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: slot * 0.1 }}
                            >
                                {player ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <MaskAvatar
                                            maskType={player.maskType}
                                            size="md"
                                            showName
                                            rating={player.rating}
                                        />
                                        {isPlayerCreator ? (
                                            <span className="text-xs text-neon-purple font-display">👑 HOST</span>
                                        ) : player.isReady ? (
                                            <motion.span
                                                className="text-xs text-neon-cyan font-display"
                                                animate={{ opacity: [1, 0.5, 1] }}
                                                transition={{ repeat: Infinity, duration: 1 }}
                                            >
                                                ✓ READY
                                            </motion.span>
                                        ) : null}
                                        {player.id === playerId && (
                                            <span className="text-xs text-neon-pink font-display tracking-wider">YOU</span>
                                        )}
                                    </div>
                                ) : (
                                    <div className="h-28 flex items-center justify-center text-neon-cyan/30 font-display text-sm">
                                        WAITING...
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>

                {/* Player count */}
                <div className="text-center text-neon-cyan/60 mb-6 font-display tracking-wider">
                    <span className="text-neon-cyan">{players.length}</span>/4 PLAYERS • {players.length >= 2 ? 'READY TO START' : 'NEED 2+ TO START'}
                </div>

                {/* Action buttons */}
                <div className="flex gap-4">
                    <button
                        className="btn-cyber btn-cyber-pink flex-1"
                        onClick={handleLeave}
                    >
                        LEAVE
                    </button>
                    {isCreator ? (
                        <button
                            className={`flex-1 ${canStart
                                ? 'bg-neon-pink text-white font-display font-bold py-4 clip-cyber hover:bg-neon-pink/80'
                                : 'btn-cyber opacity-50 cursor-not-allowed'}`}
                            onClick={handleStartGame}
                            disabled={!canStart}
                            style={canStart ? { boxShadow: '0 0 20px #FF00FF' } : {}}
                        >
                            {canStart ? '🎮 START GAME' : 'WAITING FOR PLAYERS...'}
                        </button>
                    ) : (
                        <button
                            className={`flex-1 ${isReady ? 'bg-neon-cyan text-dark-bg font-display font-bold py-4 clip-cyber' : 'btn-cyber'}`}
                            onClick={handleReady}
                            disabled={isReady}
                            style={isReady ? { boxShadow: '0 0 20px #00FFF0' } : {}}
                        >
                            {isReady ? '✓ READY!' : 'READY UP'}
                        </button>
                    )}
                </div>
            </motion.div>

            {/* Corner decorations */}
            <div className="absolute top-4 left-4 w-16 h-16 border-l-2 border-t-2 border-neon-cyan/30" />
            <div className="absolute top-4 right-4 w-16 h-16 border-r-2 border-t-2 border-neon-cyan/30" />
            <div className="absolute bottom-4 left-4 w-16 h-16 border-l-2 border-b-2 border-neon-pink/30" />
            <div className="absolute bottom-4 right-4 w-16 h-16 border-r-2 border-b-2 border-neon-pink/30" />
        </main>
    );
}
