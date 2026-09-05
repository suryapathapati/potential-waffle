import { useState } from 'react'
import type { Match, MatchFormat, SetScore } from '../types'
import { emptySets, getMatchWinnerSide } from '../lib/scoring'

interface Props {
  match: Match
  matchFormat: MatchFormat
  player1Name: string
  player2Name: string
  onCancel: () => void
  onSave: (sets: SetScore[]) => void
}

export default function ScoreModal({
  match,
  matchFormat,
  player1Name,
  player2Name,
  onCancel,
  onSave,
}: Props) {
  const [sets, setSets] = useState<SetScore[]>(
    match.sets.length > 0 ? match.sets.map((s) => ({ ...s })) : emptySets(matchFormat),
  )

  function updateSet(index: number, side: 'p1' | 'p2', value: string) {
    const num = value === '' ? 0 : Math.max(0, Math.min(99, parseInt(value, 10) || 0))
    setSets((prev) => prev.map((s, i) => (i === index ? { ...s, [side]: num } : s)))
  }

  const winnerSide = getMatchWinnerSide(sets, matchFormat)

  function handleSave() {
    onSave(sets)
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Enter Score</h2>
        <p className="modal-subtitle">
          {player1Name} vs {player2Name}
        </p>

        <table className="score-table">
          <thead>
            <tr>
              <th></th>
              {sets.map((_, i) => (
                <th key={i}>Set {i + 1}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="score-table-name">{player1Name}</td>
              {sets.map((s, i) => (
                <td key={i}>
                  <input
                    type="number"
                    min={0}
                    max={99}
                    value={s.p1}
                    onChange={(e) => updateSet(i, 'p1', e.target.value)}
                  />
                </td>
              ))}
            </tr>
            <tr>
              <td className="score-table-name">{player2Name}</td>
              {sets.map((s, i) => (
                <td key={i}>
                  <input
                    type="number"
                    min={0}
                    max={99}
                    value={s.p2}
                    onChange={(e) => updateSet(i, 'p2', e.target.value)}
                  />
                </td>
              ))}
            </tr>
          </tbody>
        </table>

        <p className="modal-winner-preview">
          {winnerSide === 'p1' && `Winner: ${player1Name}`}
          {winnerSide === 'p2' && `Winner: ${player2Name}`}
          {winnerSide === null && 'No winner yet — complete enough sets to decide the match.'}
        </p>

        <div className="form-actions">
          <button className="secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className="primary" onClick={handleSave}>
            Save Score
          </button>
        </div>
      </div>
    </div>
  )
}
