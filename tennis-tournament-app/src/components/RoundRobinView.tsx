import type { Match, Player } from '../types'
import { formatScoreLine } from '../lib/scoring'

interface Props {
  matches: Match[]
  players: Player[]
  onSelectMatch: (match: Match) => void
}

function playerName(players: Player[], id: string | null): string {
  return players.find((p) => p.id === id)?.name ?? 'Unknown'
}

export default function RoundRobinView({ matches, players, onSelectMatch }: Props) {
  const rounds = Array.from(new Set(matches.map((m) => m.round))).sort((a, b) => a - b)

  return (
    <div className="round-robin">
      {rounds.map((round) => (
        <div className="rr-round" key={round}>
          <h3 className="rr-round-title">Round {round}</h3>
          <div className="rr-round-matches">
            {matches
              .filter((m) => m.round === round)
              .map((m) => (
                <button key={m.id} className="rr-match" onClick={() => onSelectMatch(m)}>
                  <div className={`rr-slot ${m.winnerId === m.player1Id ? 'winner' : ''}`}>
                    {playerName(players, m.player1Id)}
                  </div>
                  <div className="rr-vs">vs</div>
                  <div className={`rr-slot ${m.winnerId === m.player2Id ? 'winner' : ''}`}>
                    {playerName(players, m.player2Id)}
                  </div>
                  <div className="rr-score">{formatScoreLine(m)}</div>
                </button>
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}
