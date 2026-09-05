import { GROUPS, type Group, type Player, type Team } from '../types'
import { createId } from './id'

function shuffle<T>(items: T[]): T[] {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function playersByGroup(players: Player[]): Record<Group, Player[]> {
  return {
    A: players.filter((p) => p.group === 'A'),
    B: players.filter((p) => p.group === 'B'),
    C: players.filter((p) => p.group === 'C'),
  }
}

export function canDrawTeams(players: Player[], teamCount: number): boolean {
  const byGroup = playersByGroup(players)
  return GROUPS.every((g) => byGroup[g].length >= teamCount)
}

/** Randomly draws teams by ballot: one shuffled player per group per team. */
export function drawTeamsRandomly(players: Player[], teamCount: number): Team[] {
  const byGroup = playersByGroup(players)
  const shuffled: Record<Group, Player[]> = {
    A: shuffle(byGroup.A).slice(0, teamCount),
    B: shuffle(byGroup.B).slice(0, teamCount),
    C: shuffle(byGroup.C).slice(0, teamCount),
  }

  return Array.from({ length: teamCount }, (_, i) => ({
    id: createId(),
    name: `Team ${i + 1}`,
    playerIds: {
      A: shuffled.A[i]?.id ?? null,
      B: shuffled.B[i]?.id ?? null,
      C: shuffled.C[i]?.id ?? null,
    },
  }))
}

export function emptyTeams(teamCount: number): Team[] {
  return Array.from({ length: teamCount }, (_, i) => ({
    id: createId(),
    name: `Team ${i + 1}`,
    playerIds: { A: null, B: null, C: null },
  }))
}

export function teamPlayerName(team: Team, group: Group, players: Player[]): string {
  const id = team.playerIds[group]
  if (!id) return 'Unassigned'
  return players.find((p) => p.id === id)?.name ?? 'Unknown'
}

export function isTeamComplete(team: Team): boolean {
  return GROUPS.every((g) => team.playerIds[g] !== null)
}
