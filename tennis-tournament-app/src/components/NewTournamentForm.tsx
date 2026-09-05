import { useState } from 'react'
import type { MatchFormat, Tournament, TournamentFormat } from '../types'
import { createId } from '../lib/id'

interface Props {
  onCancel: () => void
  onCreate: (tournament: Tournament) => void
}

export default function NewTournamentForm({ onCancel, onCreate }: Props) {
  const [name, setName] = useState('')
  const [format, setFormat] = useState<TournamentFormat>('single-elimination')
  const [matchFormat, setMatchFormat] = useState<MatchFormat>('best-of-3')
  const [playerNames, setPlayerNames] = useState<string[]>(['', ''])
  const [error, setError] = useState<string | null>(null)

  function updatePlayerName(index: number, value: string) {
    setPlayerNames((prev) => prev.map((p, i) => (i === index ? value : p)))
  }

  function addPlayerField() {
    setPlayerNames((prev) => [...prev, ''])
  }

  function removePlayerField(index: number) {
    setPlayerNames((prev) => prev.filter((_, i) => i !== index))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmedName = name.trim()
    const names = playerNames.map((p) => p.trim()).filter(Boolean)

    if (!trimmedName) {
      setError('Please enter a tournament name.')
      return
    }
    if (names.length < 2) {
      setError('Please enter at least 2 players.')
      return
    }
    const duplicates = names.filter((n, i) => names.indexOf(n) !== i)
    if (duplicates.length > 0) {
      setError(`Duplicate player name(s): ${[...new Set(duplicates)].join(', ')}`)
      return
    }

    const tournament: Tournament = {
      id: createId(),
      name: trimmedName,
      format,
      matchFormat,
      players: names.map((n) => ({ id: createId(), name: n })),
      matches: [],
      createdAt: Date.now(),
      started: false,
    }
    onCreate(tournament)
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>New Tournament</h1>
      </div>

      <form className="form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Tournament name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Summer Club Championship"
          />
        </label>

        <label className="field">
          <span>Format</span>
          <select value={format} onChange={(e) => setFormat(e.target.value as TournamentFormat)}>
            <option value="single-elimination">Single Elimination</option>
            <option value="round-robin">Round Robin</option>
          </select>
        </label>

        <label className="field">
          <span>Match scoring</span>
          <select
            value={matchFormat}
            onChange={(e) => setMatchFormat(e.target.value as MatchFormat)}
          >
            <option value="single-set">Single set</option>
            <option value="best-of-3">Best of 3 sets</option>
            <option value="best-of-5">Best of 5 sets</option>
          </select>
        </label>

        <div className="field">
          <span>Players</span>
          <div className="player-inputs">
            {playerNames.map((p, i) => (
              <div key={i} className="player-input-row">
                <input
                  type="text"
                  value={p}
                  onChange={(e) => updatePlayerName(i, e.target.value)}
                  placeholder={`Player ${i + 1}`}
                />
                {playerNames.length > 2 && (
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => removePlayerField(i)}
                    aria-label="Remove player"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          <button type="button" className="secondary" onClick={addPlayerField}>
            + Add player
          </button>
        </div>

        {error && <p className="error-text">{error}</p>}

        <div className="form-actions">
          <button type="button" className="secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="primary">
            Create Tournament
          </button>
        </div>
      </form>
    </div>
  )
}
