import type { Match, Player } from '../types'
import { roundLabel, totalRounds } from '../lib/bracket'
import { formatScoreLine } from '../lib/scoring'

interface Props {
  matches: Match[]
  players: Player[]
  onSelectMatch: (match: Match) => void
}

function playerName(players: Player[], id: string | null): string {
  if (!id) return 'TBD'
  return players.find((p) => p.id === id)?.name ?? 'Unknown'
}

export default function BracketView({ matches, players, onSelectMatch }: Props) {
  const rounds = totalRounds(players.length)
  const roundNumbers = Array.from({ length: rounds }, (_, i) => i + 1)

  return (
    <div className="bracket">
      {roundNumbers.map((round) => {
        const roundMatches = matches
          .filter((m) => m.round === round)
          .sort((a, b) => a.matchIndex - b.matchIndex)
        return (
          <div className="bracket-round" key={round}>
            <h3 className="bracket-round-title">{roundLabel(round, players.length)}</h3>
            <div className="bracket-round-matches">
              {roundMatches.map((m) => {
                const p1Name = playerName(players, m.player1Id)
                const p2Name = playerName(players, m.player2Id)
                const playable = m.player1Id && m.player2Id && !m.isBye
                return (
                  <button
                    key={m.id}
                    className={`bracket-match ${playable ? '' : 'bracket-match-disabled'}`}
                    onClick={() => playable && onSelectMatch(m)}
                    disabled={!playable}
                  >
                    <div className={`bracket-slot ${m.winnerId === m.player1Id ? 'winner' : ''}`}>
                      <span>{p1Name}</span>
                    </div>
                    <div className={`bracket-slot ${m.winnerId === m.player2Id ? 'winner' : ''}`}>
                      <span>{p2Name}</span>
                    </div>
                    <div className="bracket-score">{formatScoreLine(m)}</div>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
