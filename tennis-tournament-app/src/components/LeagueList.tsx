import type { League } from '../types'

interface Props {
  leagues: League[]
  onOpen: (id: string) => void
  onCreateNew: () => void
  onDelete: (id: string) => void
}

export default function LeagueList({ leagues, onOpen, onCreateNew, onDelete }: Props) {
  return (
    <div className="page">
      <div className="page-header">
        <h1>Seasons</h1>
        <button className="primary" onClick={onCreateNew}>
          + New Season
        </button>
      </div>

      {leagues.length === 0 ? (
        <div className="empty-state">
          <p>No seasons yet. Create one to get started.</p>
        </div>
      ) : (
        <ul className="tournament-list">
          {leagues
            .slice()
            .sort((a, b) => b.createdAt - a.createdAt)
            .map((l) => (
              <li key={l.id} className="tournament-card">
                <button className="tournament-card-main" onClick={() => onOpen(l.id)}>
                  <span className="tournament-card-name">{l.name}</span>
                  <span className="tournament-card-meta">
                    {l.teamCount} teams · {l.players.length} players ·{' '}
                    {l.teamsLocked ? 'Fixtures generated' : 'Setting up'}
                  </span>
                </button>
                <button
                  className="danger-outline"
                  onClick={() => {
                    if (confirm(`Delete "${l.name}"? This cannot be undone.`)) {
                      onDelete(l.id)
                    }
                  }}
                >
                  Delete
                </button>
              </li>
            ))}
        </ul>
      )}
    </div>
  )
}
