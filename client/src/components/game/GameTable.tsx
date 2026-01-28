'use client';

import { motion } from 'framer-motion';
import { CardHand } from './CardHand';
import { OpponentHand } from './OpponentHand';
import { PlayerInfo } from './PlayerInfo';
import { TrickArea } from './TrickArea';
import { DiscardPile } from './DiscardPile';
import { PublicPlayer, Card, MaskEmotion, GameAction, DiscardedPair } from '@/lib/types';
import styles from './GameTable.module.css';

interface GameTableProps {
    players: PublicPlayer[];
    lastAction: GameAction | null;
    myHand: Card[];
    isMyTurn: boolean;
    currentTargetId: string | null;
    discardedPairs: DiscardedPair[];
    onDrawCard: () => void;
    playerPositions: Record<string, 'top' | 'right' | 'bottom' | 'left'>;
    maskEmotions: Record<string, MaskEmotion>;
    playerId: string | null;
}

type Position = 'north' | 'east' | 'south' | 'west';

export function GameTable({
    players,
    lastAction,
    myHand,
    isMyTurn,
    currentTargetId,
    discardedPairs,
    onDrawCard,
    playerPositions,
    maskEmotions,
    playerId,
}: GameTableProps) {
    // Map position names
    const positionMap: Record<string, Position> = {
        top: 'north',
        right: 'east',
        bottom: 'south',
        left: 'west',
    };

    // Get player at a specific position
    const getPlayerAtPosition = (pos: Position) => {
        const oldPos = pos === 'north' ? 'top' : pos === 'east' ? 'right' : pos === 'south' ? 'bottom' : 'left';
        return players.find(p => playerPositions[p.id] === oldPos) || null;
    };

    // Convert playerPositions to new format for TrickArea
    const trickPositions = Object.fromEntries(
        Object.entries(playerPositions).map(([id, pos]) => [id, positionMap[pos]])
    ) as Record<string, Position>;

    const northPlayer = getPlayerAtPosition('north');
    const eastPlayer = getPlayerAtPosition('east');
    const westPlayer = getPlayerAtPosition('west');
    const southPlayer = getPlayerAtPosition('south');

    // Check if a player is the valid draw target
    const isDrawTarget = (player: { id: string } | null) => {
        return !!(isMyTurn && player && player.id === currentTargetId);
    };

    // Only allow draw from valid target
    const handleDraw = (player: { id: string } | null) => {
        if (isMyTurn && player && player.id === currentTargetId) {
            onDrawCard();
        }
    };

    return (
        <div className={styles.gameTable}>
            {/* North player area */}
            <div className={styles.north}>
                {northPlayer && (
                    <motion.div
                        className={styles.playerArea}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <OpponentHand
                            cardCount={northPlayer.cardCount}
                            position="north"
                            isDrawTarget={isDrawTarget(northPlayer)}
                            onClick={() => handleDraw(northPlayer)}
                        />
                        <PlayerInfo
                            player={northPlayer}
                            position="north"
                            emotion={maskEmotions[northPlayer.id] || 'idle'}
                        />
                    </motion.div>
                )}
            </div>

            {/* West player area */}
            <div className={styles.west}>
                {westPlayer && (
                    <motion.div
                        className={styles.playerAreaVertical}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <OpponentHand
                            cardCount={westPlayer.cardCount}
                            position="west"
                            isDrawTarget={isDrawTarget(westPlayer)}
                            onClick={() => handleDraw(westPlayer)}
                        />
                        <PlayerInfo
                            player={westPlayer}
                            position="west"
                            emotion={maskEmotions[westPlayer.id] || 'idle'}
                        />
                    </motion.div>
                )}
            </div>

            {/* Center trick area */}
            <div className={styles.center}>
                <TrickArea
                    lastAction={lastAction}
                    playerPositions={trickPositions}
                />
            </div>

            {/* Discard pile - positioned top right */}
            <div className="absolute top-4 right-4 z-10">
                <DiscardPile discardedPairs={discardedPairs} />
            </div>

            {/* East player area */}
            <div className={styles.east}>
                {eastPlayer && (
                    <motion.div
                        className={styles.playerAreaVertical}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <OpponentHand
                            cardCount={eastPlayer.cardCount}
                            position="east"
                            isDrawTarget={isDrawTarget(eastPlayer)}
                            onClick={() => handleDraw(eastPlayer)}
                        />
                        <PlayerInfo
                            player={eastPlayer}
                            position="east"
                            emotion={maskEmotions[eastPlayer.id] || 'idle'}
                        />
                    </motion.div>
                )}
            </div>

            {/* South player area (YOU) */}
            <div className={styles.south}>
                {southPlayer && (
                    <motion.div
                        className={styles.playerAreaSouth}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <PlayerInfo
                            player={southPlayer}
                            position="south"
                            emotion={maskEmotions[southPlayer.id] || 'idle'}
                            isMe
                        />
                        <CardHand
                            cards={myHand}
                            isMyTurn={isMyTurn}
                        />
                    </motion.div>
                )}
            </div>
        </div>
    );
}
