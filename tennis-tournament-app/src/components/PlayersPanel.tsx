import { useState } from 'react'
import { GROUPS, type Group, type Player } from '../types'
import { createId } from '../lib/id'
import { playersByGroup } from '../lib/teams'

interface Props {
  players: Player[]
  locked: boolean
  onChange: (players: Player[]) => void
}

const GROUP_DESCRIPTIONS: Record<Group, string> = {
  A: 'Advanced & Highly Competitive',
  B: 'Intermediate & Competitive',
  C: 'Passionate & Committed',
}

export default function PlayersPanel({ players, locked, onChange }: Props) {
  const [name, setName] = useState('')
  const [group, setGroup] = useState<Group>('A')
  const [error, setError] = useState<string | null>(null)

  const byGroup = playersByGroup(players)

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    if (players.some((p) => p.name.toLowerCase() === trimmed.toLowerCase())) {
      setError('A player with that name already exists.')
      return
    }
    setError(null)
    onChange([...players, { id: createId(), name: trimmed, group }])
    setName('')
  }

  function handleRemove(id: string) {
    onChange(players.filter((p) => p.id !== id))
  }

  function handleRename(id: string, newName: string) {
    onChange(players.map((p) => (p.id === id ? { ...p, name: newName } : p)))
  }

  return (
    <div className="players-panel">
      {locked && (
        <p className="hint-text">
          Teams have been drawn, so players can be renamed but not added or removed here.
        </p>
      )}

      <div className="group-columns">
        {GROUPS.map((g) => (
          <div className="group-column" key={g}>
            <h3 className={`group-heading group-${g}`}>
              Group {g}
              <span className="group-count">{byGroup[g].length}</span>
            </h3>
            <p className="hint-text">{GROUP_DESCRIPTIONS[g]}</p>
            <ul className="player-manage-list">
              {byGroup[g].map((p) => (
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
          </div>
        ))}
      </div>

      {!locked && (
        <form className="player-add-form" onSubmit={handleAdd}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Player name"
          />
          <select value={group} onChange={(e) => setGroup(e.target.value as Group)}>
            {GROUPS.map((g) => (
              <option key={g} value={g}>
                Group {g}
              </option>
            ))}
          </select>
          <button type="submit" className="secondary">
            + Add player
          </button>
        </form>
      )}
      {error && <p className="error-text">{error}</p>}
    </div>
  )
}
