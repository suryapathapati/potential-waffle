import type { Fixture, Team } from '../types'
import { computeFixtureResult } from './fixtureResult'

export interface StandingsRow {
  team: Team
  played: number
  won: number
  lost: number
  matchesWon: number
  matchesLost: number
  gamesWon: number
  gamesLost: number
}

export function computeStandings(teams: Team[], fixtures: Fixture[]): StandingsRow[] {
  const rows = new Map<string, StandingsRow>()
  for (const t of teams) {
    rows.set(t.id, {
      team: t,
      played: 0,
      won: 0,
      lost: 0,
      matchesWon: 0,
      matchesLost: 0,
      gamesWon: 0,
      gamesLost: 0,
    })
  }

  const leagueFixtures = fixtures.filter(
    (f) => f.stage === 'league' && f.homeTeamId && f.awayTeamId,
  )

  for (const f of leagueFixtures) {
    const home = rows.get(f.homeTeamId!)
    const away = rows.get(f.awayTeamId!)
    if (!home || !away) continue

    const result = computeFixtureResult(f)
    home.matchesWon += result.homeMatchesWon
    home.matchesLost += result.awayMatchesWon
    away.matchesWon += result.awayMatchesWon
    away.matchesLost += result.homeMatchesWon
    home.gamesWon += result.homeGames
    home.gamesLost += result.awayGames
    away.gamesWon += result.awayGames
    away.gamesLost += result.homeGames

    if (result.winnerSide) {
      home.played++
      away.played++
      if (result.winnerSide === 'home') {
        home.won++
        away.lost++
      } else {
        away.won++
        home.lost++
      }
    }
  }

  const list = Array.from(rows.values())
  list.sort((a, b) => {
    if (b.won !== a.won) return b.won - a.won
    if (b.matchesWon !== a.matchesWon) return b.matchesWon - a.matchesWon
    if (b.gamesWon !== a.gamesWon) return b.gamesWon - a.gamesWon
    return headToHead(a, b, leagueFixtures)
  })
  return list
}

/** Tiebreaker #1 per rule 14: head-to-head result, used only once all counting stats are tied. */
function headToHead(a: StandingsRow, b: StandingsRow, fixtures: Fixture[]): number {
  const fixture = fixtures.find(
    (f) =>
      (f.homeTeamId === a.team.id && f.awayTeamId === b.team.id) ||
      (f.homeTeamId === b.team.id && f.awayTeamId === a.team.id),
  )
  if (!fixture) return 0
  const result = computeFixtureResult(fixture)
  if (!result.winnerSide) return 0
  const winnerTeamId = result.winnerSide === 'home' ? fixture.homeTeamId : fixture.awayTeamId
  if (winnerTeamId === a.team.id) return -1
  if (winnerTeamId === b.team.id) return 1
  return 0
}
