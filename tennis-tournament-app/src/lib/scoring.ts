import type { SetResult, SubMatch } from '../types'

export function getSubMatchWinner(sub: SubMatch): 'home' | 'away' | null {
  if (sub.forfeitWinner) return sub.forfeitWinner
  return getSetWinner(sub.result)
}

export function getSetWinner(result: SetResult | null): 'home' | 'away' | null {
  if (!result) return null
  if (result.homeGames === result.awayGames) return null
  return result.homeGames > result.awayGames ? 'home' : 'away'
}

export function isTiebreakSet(result: SetResult): boolean {
  return (
    (result.homeGames === 7 && result.awayGames === 6) ||
    (result.homeGames === 6 && result.awayGames === 7)
  )
}

export function formatSetScore(sub: SubMatch): string {
  if (sub.forfeitWinner) {
    return sub.forfeitWinner === 'home' ? 'Forfeit (home)' : 'Forfeit (away)'
  }
  if (!sub.result) return 'Not played'
  const { homeGames, awayGames, tiebreak } = sub.result
  const base = `${homeGames}-${awayGames}`
  if (tiebreak) return `${base} (${tiebreak.home}-${tiebreak.away})`
  return base
}

export function emptySetResult(): SetResult {
  return { homeGames: 0, awayGames: 0, tiebreak: null }
}
