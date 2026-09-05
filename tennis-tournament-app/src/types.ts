export type TournamentFormat = 'single-elimination' | 'round-robin'

export type MatchFormat = 'single-set' | 'best-of-3' | 'best-of-5'

export interface Player {
  id: string
  name: string
}

export interface SetScore {
  p1: number
  p2: number
}

export interface Match {
  id: string
  round: number
  matchIndex: number
  player1Id: string | null
  player2Id: string | null
  sets: SetScore[]
  winnerId: string | null
  isBye: boolean
}

export interface Tournament {
  id: string
  name: string
  format: TournamentFormat
  matchFormat: MatchFormat
  players: Player[]
  matches: Match[]
  createdAt: number
  started: boolean
}
