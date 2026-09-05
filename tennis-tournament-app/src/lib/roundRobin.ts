import { createId } from './id'
import { countSetWins, getMatchWinnerSide } from './scoring'
import type { Match, MatchFormat, Player } from '../types'

/** Generates a round-robin schedule using the circle method. */
export function generateRoundRobinSchedule(players: Player[]): Match[] {
  const ids: (string | null)[] = players.map((p) => p.id)
  if (ids.length % 2 !== 0) ids.push(null)

  const n = ids.length
  const rounds = n - 1
  const half = n / 2
  const fixed = ids[0]
  let rotating = ids.slice(1)

  const matches: Match[] = []
  for (let r = 0; r < rounds; r++) {
    const roundIds = [fixed, ...rotating]
    let matchIndex = 0
    for (let i = 0; i < half; i++) {
      const a = roundIds[i]
      const b = roundIds[n - 1 - i]
      if (a === null || b === null) continue
      matches.push({
        id: createId(),
        round: r + 1,
        matchIndex: matchIndex++,
        player1Id: a,
        player2Id: b,
        sets: [],
        winnerId: null,
        isBye: false,
      })
    }
    rotating = [rotating[rotating.length - 1], ...rotating.slice(0, -1)]
  }

  return matches
}

export function recordRoundRobinResult(
  matches: Match[],
  matchId: string,
  sets: Match['sets'],
  matchFormat: MatchFormat,
): Match[] {
  return matches.map((m) => {
    if (m.id !== matchId) return m
    const side = getMatchWinnerSide(sets, matchFormat)
    const winnerId = side === 'p1' ? m.player1Id : side === 'p2' ? m.player2Id : null
    return { ...m, sets, winnerId }
  })
}

export interface StandingsRow {
  player: Player
  played: number
  wins: number
  losses: number
  setsWon: number
  setsLost: number
  gamesWon: number
  gamesLost: number
}

export function computeStandings(players: Player[], matches: Match[]): StandingsRow[] {
  const rows = new Map<string, StandingsRow>()
  for (const p of players) {
    rows.set(p.id, {
      player: p,
      played: 0,
      wins: 0,
      losses: 0,
      setsWon: 0,
      setsLost: 0,
      gamesWon: 0,
      gamesLost: 0,
    })
  }

  for (const m of matches) {
    if (!m.winnerId || !m.player1Id || !m.player2Id) continue
    const p1 = rows.get(m.player1Id)
    const p2 = rows.get(m.player2Id)
    if (!p1 || !p2) continue

    const { p1: p1Sets, p2: p2Sets } = countSetWins(m.sets)
    p1.played++
    p2.played++
    p1.setsWon += p1Sets
    p1.setsLost += p2Sets
    p2.setsWon += p2Sets
    p2.setsLost += p1Sets

    for (const set of m.sets) {
      p1.gamesWon += set.p1
      p1.gamesLost += set.p2
      p2.gamesWon += set.p2
      p2.gamesLost += set.p1
    }

    if (m.winnerId === m.player1Id) {
      p1.wins++
      p2.losses++
    } else {
      p2.wins++
      p1.losses++
    }
  }

  return Array.from(rows.values()).sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins
    const aSetDiff = a.setsWon - a.setsLost
    const bSetDiff = b.setsWon - b.setsLost
    if (bSetDiff !== aSetDiff) return bSetDiff - aSetDiff
    const aGameDiff = a.gamesWon - a.gamesLost
    const bGameDiff = b.gamesWon - b.gamesLost
    return bGameDiff - aGameDiff
  })
}
