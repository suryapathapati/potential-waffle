export type Group = 'A' | 'B' | 'C'

export const GROUPS: Group[] = ['A', 'B', 'C']

export interface Player {
  id: string
  name: string
  group: Group
}

export interface Team {
  id: string
  name: string
  playerIds: Record<Group, string | null>
}

export type SubMatchSlot = 'S1' | 'S2' | 'S3' | 'D1' | 'D2' | 'D3'

export interface SetResult {
  homeGames: number
  awayGames: number
  tiebreak: { home: number; away: number } | null
}

export interface SubMatch {
  id: string
  slot: SubMatchSlot
  label: string
  groups: Group[]
  result: SetResult | null
  forfeitWinner: 'home' | 'away' | null
}

export type FixtureStage = 'league' | 'semifinal' | 'final' | 'bronze'

export interface Fixture {
  id: string
  stage: FixtureStage
  round: number
  label: string | null
  homeTeamId: string | null
  awayTeamId: string | null
  scheduledDate: string | null
  wholeForfeitWinnerTeamId: string | null
  notes: string
  subMatches: SubMatch[]
}

export type LeagueStage = 'setup' | 'in-progress'

export interface League {
  id: string
  name: string
  teamCount: number
  players: Player[]
  teams: Team[]
  fixtures: Fixture[]
  teamsLocked: boolean
  playoffsGenerated: boolean
  createdAt: number
}
