import { createId } from './id'
import { getMatchWinnerSide } from './scoring'
import type { Match, MatchFormat, Player } from '../types'

function nextPowerOfTwo(n: number): number {
  let size = 1
  while (size < n) size *= 2
  return size
}

/** Standard bracket seeding order so top seeds meet as late as possible. */
function standardSeedOrder(size: number): number[] {
  if (size === 1) return [1]
  const prev = standardSeedOrder(size / 2)
  const result: number[] = []
  for (const seed of prev) {
    result.push(seed)
    result.push(size + 1 - seed)
  }
  return result
}

export function bracketSizeFor(playerCount: number): number {
  return nextPowerOfTwo(Math.max(playerCount, 2))
}

export function totalRounds(playerCount: number): number {
  return Math.log2(bracketSizeFor(playerCount))
}

export function roundLabel(round: number, playerCount: number): string {
  const rounds = totalRounds(playerCount)
  const fromEnd = rounds - round + 1
  if (fromEnd === 1) return 'Final'
  if (fromEnd === 2) return 'Semifinal'
  if (fromEnd === 3) return 'Quarterfinal'
  const matchesInRound = bracketSizeFor(playerCount) / Math.pow(2, round)
  return `Round of ${matchesInRound * 2}`
}

/**
 * Generates a full single-elimination bracket. Byes are placed on top seeds
 * per standard seeding order and auto-advanced immediately.
 */
export function generateSingleEliminationBracket(players: Player[]): Match[] {
  const size = bracketSizeFor(players.length)
  const rounds = Math.log2(size)
  const seedOrder = standardSeedOrder(size)
  const slots: (Player | null)[] = seedOrder.map((seed) =>
    seed <= players.length ? players[seed - 1] : null,
  )

  const matches: Match[] = []

  // Round 1
  const round1Count = size / 2
  for (let i = 0; i < round1Count; i++) {
    const a = slots[i * 2]
    const b = slots[i * 2 + 1]
    const isBye = !a || !b
    const winnerId = isBye ? (a ? a.id : b ? b.id : null) : null
    matches.push({
      id: createId(),
      round: 1,
      matchIndex: i,
      player1Id: a ? a.id : null,
      player2Id: b ? b.id : null,
      sets: [],
      winnerId,
      isBye,
    })
  }

  // Remaining rounds start empty; populated as earlier rounds resolve.
  for (let r = 2; r <= rounds; r++) {
    const count = size / Math.pow(2, r)
    for (let i = 0; i < count; i++) {
      matches.push({
        id: createId(),
        round: r,
        matchIndex: i,
        player1Id: null,
        player2Id: null,
        sets: [],
        winnerId: null,
        isBye: false,
      })
    }
  }

  return propagateByes(matches, rounds)
}

function propagateByes(matches: Match[], rounds: number): Match[] {
  let result = matches
  for (let r = 1; r < rounds; r++) {
    const thisRound = result.filter((m) => m.round === r)
    for (const m of thisRound) {
      if (m.winnerId) {
        result = placeWinnerInNextRound(result, m, rounds)
      }
    }
  }
  return result
}

function placeWinnerInNextRound(matches: Match[], match: Match, rounds: number): Match[] {
  if (match.round >= rounds) return matches
  const nextRound = match.round + 1
  const nextIndex = Math.floor(match.matchIndex / 2)
  const slot = match.matchIndex % 2 === 0 ? 'player1Id' : 'player2Id'

  return matches.map((m) => {
    if (m.round !== nextRound || m.matchIndex !== nextIndex) return m
    return { ...m, [slot]: match.winnerId }
  })
}

/** Applies a score update to a match and cascades the winner forward. */
export function recordMatchResult(
  matches: Match[],
  matchId: string,
  sets: Match['sets'],
  matchFormat: MatchFormat,
  playerCount: number,
): Match[] {
  const rounds = totalRounds(playerCount)
  const target = matches.find((m) => m.id === matchId)
  if (!target || !target.player1Id || !target.player2Id) return matches

  const side = getMatchWinnerSide(sets, matchFormat)
  const winnerId = side === 'p1' ? target.player1Id : side === 'p2' ? target.player2Id : null

  let updated = matches.map((m) => (m.id === matchId ? { ...m, sets, winnerId } : m))

  const resolvedMatch = updated.find((m) => m.id === matchId)!

  // Clear anything downstream first (in case a result is being changed).
  updated = clearDownstream(updated, resolvedMatch, rounds)

  if (winnerId) {
    updated = placeWinnerInNextRound(updated, resolvedMatch, rounds)
  }

  return updated
}

function clearDownstream(matches: Match[], match: Match, rounds: number): Match[] {
  if (match.round >= rounds) return matches
  const nextRound = match.round + 1
  const nextIndex = Math.floor(match.matchIndex / 2)
  const slot = match.matchIndex % 2 === 0 ? 'player1Id' : 'player2Id'

  let result = matches.map((m) => {
    if (m.round !== nextRound || m.matchIndex !== nextIndex) return m
    return { ...m, [slot]: null, sets: [], winnerId: null }
  })

  const nextMatch = result.find((m) => m.round === nextRound && m.matchIndex === nextIndex)
  if (nextMatch) {
    result = clearDownstream(result, nextMatch, rounds)
  }
  return result
}

export function getChampion(matches: Match[], playerCount: number): string | null {
  const rounds = totalRounds(playerCount)
  const final = matches.find((m) => m.round === rounds)
  return final?.winnerId ?? null
}
