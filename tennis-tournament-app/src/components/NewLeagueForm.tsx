import { useState } from 'react'
import type { League } from '../types'
import { createId } from '../lib/id'

interface Props {
  onCancel: () => void
  onCreate: (league: League) => void
}

export default function NewLeagueForm({ onCancel, onCreate }: Props) {
  const [name, setName] = useState('TTL Season 3')
  const [teamCount, setTeamCount] = useState(7)
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Please enter a season name.')
      return
    }
    if (teamCount < 2) {
      setError('A season needs at least 2 teams.')
      return
    }

    const league: League = {
      id: createId(),
      name: trimmed,
      teamCount,
      players: [],
      teams: [],
      fixtures: [],
      teamsLocked: false,
      playoffsGenerated: false,
      createdAt: Date.now(),
    }
    onCreate(league)
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>New Season</h1>
      </div>

      <form className="form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Season name</span>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </label>

        <label className="field">
          <span>Number of teams</span>
          <input
            type="number"
            min={2}
            max={32}
            value={teamCount}
            onChange={(e) => setTeamCount(parseInt(e.target.value, 10) || 0)}
          />
          <span className="hint-text">
            Each team is one Group A, one Group B and one Group C player. Season 3 uses 7 teams.
          </span>
        </label>

        {error && <p className="error-text">{error}</p>}

        <div className="form-actions">
          <button type="button" className="secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="primary">
            Create Season
          </button>
        </div>
      </form>
    </div>
  )
}
