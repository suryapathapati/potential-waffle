import type { Match, MatchFormat, SetScore } from '../types'

export function setsNeededToWin(format: MatchFormat): number {
  if (format === 'single-set') return 1
  if (format === 'best-of-3') return 2
  return 3
}

export function getSetWinner(set: SetScore): 'p1' | 'p2' | null {
  if (set.p1 === set.p2) return null
  return set.p1 > set.p2 ? 'p1' : 'p2'
}

export function countSetWins(sets: SetScore[]): { p1: number; p2: number } {
  let p1 = 0
  let p2 = 0
  for (const set of sets) {
    const winner = getSetWinner(set)
    if (winner === 'p1') p1++
    else if (winner === 'p2') p2++
  }
  return { p1, p2 }
}

export function getMatchWinnerSide(sets: SetScore[], format: MatchFormat): 'p1' | 'p2' | null {
  const needed = setsNeededToWin(format)
  const { p1, p2 } = countSetWins(sets)
  if (p1 >= needed) return 'p1'
  if (p2 >= needed) return 'p2'
  return null
}

export function isMatchComplete(sets: SetScore[], format: MatchFormat): boolean {
  return getMatchWinnerSide(sets, format) !== null
}

export function formatScoreLine(match: Match): string {
  if (match.isBye) return 'BYE'
  if (match.sets.length === 0) return 'Not played'
  return match.sets.map((s) => `${s.p1}-${s.p2}`).join(', ')
}

export function emptySets(format: MatchFormat): SetScore[] {
  const count = format === 'single-set' ? 1 : format === 'best-of-3' ? 3 : 5
  return Array.from({ length: count }, () => ({ p1: 0, p2: 0 }))
}
