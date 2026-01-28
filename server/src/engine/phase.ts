// ============================================
// ROYAL GLITCH - Phase Progression
// ============================================

import { 
  Phase, 
  Player, 
  PhaseConfig, 
  PHASE_CONFIGS, 
  RATING_CHANGES,
  PlayerStanding 
} from '../shared/types';

// Get phase configuration
export function getPhaseConfig(phase: Phase): PhaseConfig | null {
  if (phase === 'QUADRANT' || phase === 'TRIANGLE' || phase === 'DUEL') {
    return PHASE_CONFIGS[phase];
  }
  return null;
}

// Determine which player is eliminated (lowest integrity)
export function determineEliminated(players: Player[]): Player {
  const activePlayers = players.filter(p => !p.isEliminated);
  
  if (activePlayers.length === 0) {
    throw new Error('No active players');
  }

  // Find player with lowest integrity
  // In case of tie, player with lower rating is eliminated (more dramatic)
  return activePlayers.reduce((lowest, player) => {
    if (player.integrity < lowest.integrity) {
      return player;
    }
    if (player.integrity === lowest.integrity && player.rating < lowest.rating) {
      return player;
    }
    return lowest;
  });
}

// Advance to next phase
export function advancePhase(currentPhase: Phase): Phase {
  switch (currentPhase) {
    case 'QUADRANT':
      return 'TRIANGLE';
    case 'TRIANGLE':
      return 'DUEL';
    case 'DUEL':
      return 'GAME_OVER';
    default:
      return 'GAME_OVER';
  }
}

// Get placement for eliminated player based on current phase
export function getPlacement(phase: Phase): number {
  switch (phase) {
    case 'QUADRANT':
      return 4; // 4th place
    case 'TRIANGLE':
      return 3; // 3rd place
    case 'DUEL':
      return 2; // 2nd place (loser of finals)
    default:
      return 0;
  }
}

// Calculate rating change for a placement
export function calculateRatingChange(placement: 1 | 2 | 3 | 4): number {
  return RATING_CHANGES[placement];
}

// Reset integrity for surviving players
export function resetIntegrity(players: Player[]): void {
  for (const player of players) {
    if (!player.isEliminated) {
      player.integrity = 100;
    }
  }
}

// Clear players' hands and tricks won for new phase
export function clearPhaseData(players: Player[]): void {
  for (const player of players) {
    if (!player.isEliminated) {
      player.hand = [];
      player.tricksWon = [];
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
      const ratingChange = calculateRatingChange(elim.placement as 1 | 2 | 3 | 4);
      standings.push({
        playerId: player.id,
        placement: elim.placement,
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

// Check if game should end (only 1 player left or DUEL phase completed)
export function shouldGameEnd(players: Player[], phase: Phase): boolean {
  const activePlayers = getActivePlayerCount(players);
  return activePlayers <= 1 || phase === 'GAME_OVER';
}
