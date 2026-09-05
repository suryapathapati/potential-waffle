import { createId } from './id'
import type { Fixture, SubMatch, SubMatchSlot, Team } from '../types'

const SUB_MATCH_TEMPLATE: { slot: SubMatchSlot; label: string; groups: ('A' | 'B' | 'C')[] }[] = [
  { slot: 'S1', label: 'Singles 1 (Group A)', groups: ['A'] },
  { slot: 'S2', label: 'Singles 2 (Group B)', groups: ['B'] },
  { slot: 'S3', label: 'Singles 3 (Group C)', groups: ['C'] },
  { slot: 'D1', label: 'Doubles 1 (A + B)', groups: ['A', 'B'] },
  { slot: 'D2', label: 'Doubles 2 (B + C)', groups: ['B', 'C'] },
  { slot: 'D3', label: 'Doubles 3 (A + C)', groups: ['A', 'C'] },
]

export function createSubMatches(): SubMatch[] {
  return SUB_MATCH_TEMPLATE.map((t) => ({
    id: createId(),
    slot: t.slot,
    label: t.label,
    groups: t.groups,
    result: null,
    forfeitWinner: null,
  }))
}

function newFixture(
  stage: Fixture['stage'],
  round: number,
  homeTeamId: string | null,
  awayTeamId: string | null,
  label: string | null = null,
): Fixture {
  return {
    id: createId(),
    stage,
    round,
    label,
    homeTeamId,
    awayTeamId,
    scheduledDate: null,
    wholeForfeitWinnerTeamId: null,
    notes: '',
    subMatches: createSubMatches(),
  }
}

/** Generates a round-robin league schedule (every team plays every other team once). */
export function generateLeagueFixtures(teams: Team[]): Fixture[] {
  const ids: (string | null)[] = teams.map((t) => t.id)
  if (ids.length % 2 !== 0) ids.push(null)

  const n = ids.length
  const rounds = n - 1
  const half = n / 2
  const fixed = ids[0]
  let rotating = ids.slice(1)

  const fixtures: Fixture[] = []
  for (let r = 0; r < rounds; r++) {
    const roundIds = [fixed, ...rotating]
    for (let i = 0; i < half; i++) {
      const a = roundIds[i]
      const b = roundIds[n - 1 - i]
      if (a === null || b === null) continue
      fixtures.push(newFixture('league', r + 1, a, b))
    }
    rotating = [rotating[rotating.length - 1], ...rotating.slice(0, -1)]
  }

  return fixtures
}

export function generatePlayoffFixtures(seededTeamIds: string[]): Fixture[] {
  const [seed1, seed2, seed3, seed4] = seededTeamIds
  const semi1 = newFixture('semifinal', 1, seed1, seed4, 'Semifinal 1 (1st v 4th)')
  const semi2 = newFixture('semifinal', 1, seed2, seed3, 'Semifinal 2 (2nd v 3rd)')
  const final = newFixture('final', 2, null, null, 'Gold & Silver Medal Match')
  const bronze = newFixture('bronze', 2, null, null, 'Bronze Medal Match')
  return [semi1, semi2, final, bronze]
}

/** After a semifinal is decided, slots the winner into the final and the loser into the bronze match. */
export function propagatePlayoffResult(
  fixtures: Fixture[],
  decidedSemifinal: Fixture,
  winnerTeamId: string,
  loserTeamId: string,
): Fixture[] {
  const isSemi1 = decidedSemifinal.label?.startsWith('Semifinal 1')
  const slot = isSemi1 ? 'homeTeamId' : 'awayTeamId'

  return fixtures.map((f) => {
    if (f.stage === 'final') return { ...f, [slot]: winnerTeamId }
    if (f.stage === 'bronze') return { ...f, [slot]: loserTeamId }
    return f
  })
}
