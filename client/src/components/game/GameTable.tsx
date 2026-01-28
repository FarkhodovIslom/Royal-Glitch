'use client';

import { motion } from 'framer-motion';
import { CardHand } from './CardHand';
import { OpponentHand } from './OpponentHand';
import { PlayerInfo } from './PlayerInfo';
import { TrickArea } from './TrickArea';
import { PublicPlayer, Card, PlayedCard, MaskEmotion } from '@/lib/types';
import styles from './GameTable.module.css';

interface GameTableProps {
    players: PublicPlayer[];
    currentTrick: PlayedCard[];
    myHand: Card[];
    validCards: Card[];
    isMyTurn: boolean;
    onDrawCard: () => void;
    playerPositions: Record<string, 'top' | 'right' | 'bottom' | 'left'>;
    maskEmotions: Record<string, MaskEmotion>;
    playerId: string | null;
}

type Position = 'north' | 'east' | 'south' | 'west';

export function GameTable({
    players,
    currentTrick,
    myHand,
    validCards,
    isMyTurn,
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

    // Helper to check if we can draw from this player (simplification: if it's my turn, I can draw from someone)
    // The server enforces the correct target, so we can just treat any click as a draw attempt for now
    // or add logic to only enable the correct target if we had that info prop-drilled
    const handleDraw = () => {
        if (isMyTurn) onDrawCard();
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
                            isCurrentTurn={!northPlayer.isEliminated && isMyTurn === false} // Visual only
                            onClick={handleDraw}
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
                            isCurrentTurn={!westPlayer.isEliminated}
                            onClick={handleDraw}
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
                    currentTrick={currentTrick}
                    playerPositions={trickPositions}
                />
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
                            isCurrentTurn={!eastPlayer.isEliminated}
                            onClick={handleDraw}
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
                            validCards={validCards}
                            isMyTurn={isMyTurn}
                        />
                    </motion.div>
                )}
            </div>
        </div>
    );
}
