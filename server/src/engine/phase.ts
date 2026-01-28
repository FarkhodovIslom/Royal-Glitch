// ============================================
// ROYAL GLITCH - Phase Progression
// Pair Annihilation System (Old Maid Variant)
// ============================================

import { 
  Phase, 
  Player, 
  RATING_CHANGES,
  PlayerStanding 
} from '../shared/types';

// Phase progression order
const PHASE_ORDER: Phase[] = ['WAITING', 'PLAYING', 'GAME_OVER'];

// Determine which player is eliminated (placeholder - not used in Pair Annihilation)
export function determineEliminated(players: Player[]): Player {
  const activePlayers = players.filter(p => !p.isEliminated);
  
  if (activePlayers.length === 0) {
    throw new Error('No active players');
  }

  // In Pair Annihilation, elimination happens through holding The Glitch
  // This function is kept for potential future extensions
  return activePlayers[0];
}

// Advance to next phase
export function advancePhase(currentPhase: Phase): Phase {
  const currentIndex = PHASE_ORDER.indexOf(currentPhase);
  if (currentIndex >= 0 && currentIndex < PHASE_ORDER.length - 1) {
    return PHASE_ORDER[currentIndex + 1];
  }
  return 'GAME_OVER';
}

// Get placement for eliminated player (placeholder - not used in Pair Annihilation)
export function getPlacement(phase: Phase): number {
  // In Pair Annihilation, placements are calculated differently
  return 0;
}

// Calculate rating change based on placement
export function calculateRatingChange(placement: number): number {
  if (placement === 1) {
    return RATING_CHANGES.WINNER;
  }
  return RATING_CHANGES.LOSER;
}

// Reset player state for new round (placeholder)
export function resetIntegrity(players: Player[]): void {
  // Pair Annihilation doesn't use integrity
  // This is kept for potential future extensions
}

// Clear players' hands for new phase
export function clearPhaseData(players: Player[]): void {
  for (const player of players) {
    if (!player.isEliminated) {
      player.hand = [];
    }
  }
}

// Generate final standings
export function generateFinalStandings(
  players: Player[],
  eliminations: { playerId: string; placement: number }[]
): PlayerStanding[] {
  const standings: PlayerStanding[] = [];

  // Add eliminated players with their placements
  for (const elim of eliminations) {
    const player = players.find(p => p.id === elim.playerId);
    if (player) {
      const ratingChange = calculateRatingChange(elim.placement);
      standings.push({
        playerId: player.id,
        placement: elim.placement,
        isLoser: true,
        ratingChange,
        newRating: Math.max(0, player.rating + ratingChange),
      });
    }
  }

  // Find winner (last non-eliminated player)
  const winner = players.find(p => !p.isEliminated);
  if (winner) {
    const ratingChange = calculateRatingChange(1);
    standings.push({
      playerId: winner.id,
      placement: 1,
      isLoser: false,
      ratingChange,
      newRating: winner.rating + ratingChange,
    });
  }

  // Sort by placement
  standings.sort((a, b) => a.placement - b.placement);

  return standings;
}

// Get active player count
export function getActivePlayerCount(players: Player[]): number {
  return players.filter(p => !p.isEliminated).length;
}

// Get active players
export function getActivePlayers(players: Player[]): Player[] {
  return players.filter(p => !p.isEliminated);
}

// Check if game should end
export function shouldGameEnd(players: Player[], phase: Phase): boolean {
  const activePlayers = getActivePlayerCount(players);
  return activePlayers <= 1 || phase === 'GAME_OVER';
}

// Get phase configuration (placeholder for future extensions)
export function getPhaseConfig(phase: Phase): Record<string, unknown> | null {
  const configs: Record<Phase, Record<string, unknown>> = {
    WAITING: { name: 'WAITING FOR PLAYERS', minPlayers: 2, maxPlayers: 4 },
    PLAYING: { name: 'PAIR ANNIHILATION', minPlayers: 2, maxPlayers: 4 },
    GAME_OVER: { name: 'GAME OVER', minPlayers: 0, maxPlayers: 0 },
  };
  return configs[phase] || null;
}

