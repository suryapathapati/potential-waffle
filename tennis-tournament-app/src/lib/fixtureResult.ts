import type { Fixture } from '../types'
import { getSubMatchWinner } from './scoring'

export interface FixtureResult {
  homeMatchesWon: number
  awayMatchesWon: number
  homeGames: number
  awayGames: number
  decidedCount: number
  winnerSide: 'home' | 'away' | null
  wentToGamesCountback: boolean
}

export function computeFixtureResult(fixture: Fixture): FixtureResult {
  if (fixture.wholeForfeitWinnerTeamId) {
    const winnerSide = fixture.wholeForfeitWinnerTeamId === fixture.homeTeamId ? 'home' : 'away'
    return {
      homeMatchesWon: winnerSide === 'home' ? 6 : 0,
      awayMatchesWon: winnerSide === 'away' ? 6 : 0,
      homeGames: 0,
      awayGames: 0,
      decidedCount: 6,
      winnerSide,
      wentToGamesCountback: false,
    }
  }

  let homeMatchesWon = 0
  let awayMatchesWon = 0
  let homeGames = 0
  let awayGames = 0
  let decidedCount = 0

  for (const sub of fixture.subMatches) {
    const winner = getSubMatchWinner(sub)
    if (winner) {
      decidedCount++
      if (winner === 'home') homeMatchesWon++
      else awayMatchesWon++
    }
    if (sub.result) {
      homeGames += sub.result.homeGames
      awayGames += sub.result.awayGames
    }
  }

  let winnerSide: 'home' | 'away' | null = null
  let wentToGamesCountback = false
  if (decidedCount === fixture.subMatches.length) {
    if (homeMatchesWon !== awayMatchesWon) {
      winnerSide = homeMatchesWon > awayMatchesWon ? 'home' : 'away'
    } else {
      wentToGamesCountback = true
      if (homeGames !== awayGames) {
        winnerSide = homeGames > awayGames ? 'home' : 'away'
      }
    }
  }

  return {
    homeMatchesWon,
    awayMatchesWon,
    homeGames,
    awayGames,
    decidedCount,
    winnerSide,
    wentToGamesCountback,
  }
}

export function isFixtureComplete(fixture: Fixture): boolean {
  if (fixture.wholeForfeitWinnerTeamId) return true
  return computeFixtureResult(fixture).winnerSide !== null
}
