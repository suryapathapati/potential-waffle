import { useState } from 'react'
import type { Player } from '../types'
import { createId } from '../lib/id'

interface Props {
  players: Player[]
  locked: boolean
  onChange: (players: Player[]) => void
}

export default function PlayerManager({ players, locked, onChange }: Props) {
  const [newName, setNewName] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = newName.trim()
    if (!trimmed) return
    if (players.some((p) => p.name.toLowerCase() === trimmed.toLowerCase())) {
      setError('A player with that name already exists.')
      return
    }
    setError(null)
    onChange([...players, { id: createId(), name: trimmed }])
    setNewName('')
  }

  function handleRemove(id: string) {
    onChange(players.filter((p) => p.id !== id))
  }

  function handleRename(id: string, name: string) {
    onChange(players.map((p) => (p.id === id ? { ...p, name } : p)))
  }

  return (
    <div className="player-manager">
      {locked && (
        <p className="hint-text">
          The tournament has started, so players can be renamed but not added or removed.
        </p>
      )}
      <ul className="player-manage-list">
        {players.map((p) => (
          <li key={p.id} className="player-manage-row">
            <input
              type="text"
              value={p.name}
              onChange={(e) => handleRename(p.id, e.target.value)}
            />
            {!locked && (
              <button
                type="button"
                className="icon-button"
                onClick={() => handleRemove(p.id)}
                aria-label={`Remove ${p.name}`}
              >
                ✕
              </button>
            )}
          </li>
        ))}
      </ul>

      {!locked && (
        <form className="player-add-form" onSubmit={handleAdd}>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New player name"
          />
          <button type="submit" className="secondary">
            + Add
          </button>
        </form>
      )}
      {error && <p className="error-text">{error}</p>}
    </div>
  )
}
