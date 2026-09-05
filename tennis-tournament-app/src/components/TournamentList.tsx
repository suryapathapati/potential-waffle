import type { Tournament } from '../types'

interface Props {
  tournaments: Tournament[]
  onOpen: (id: string) => void
  onCreateNew: () => void
  onDelete: (id: string) => void
}

export default function TournamentList({ tournaments, onOpen, onCreateNew, onDelete }: Props) {
  return (
    <div className="page">
      <div className="page-header">
        <h1>Tournaments</h1>
        <button className="primary" onClick={onCreateNew}>
          + New Tournament
        </button>
      </div>

      {tournaments.length === 0 ? (
        <div className="empty-state">
          <p>No tournaments yet. Create one to get started.</p>
        </div>
      ) : (
        <ul className="tournament-list">
          {tournaments
            .slice()
            .sort((a, b) => b.createdAt - a.createdAt)
            .map((t) => (
              <li key={t.id} className="tournament-card">
                <button className="tournament-card-main" onClick={() => onOpen(t.id)}>
                  <span className="tournament-card-name">{t.name}</span>
                  <span className="tournament-card-meta">
                    {t.format === 'single-elimination' ? 'Single Elimination' : 'Round Robin'} ·{' '}
                    {t.players.length} players ·{' '}
                    {t.started ? 'In Progress' : 'Not Started'}
                  </span>
                </button>
                <button
                  className="danger-outline"
                  onClick={() => {
                    if (confirm(`Delete "${t.name}"? This cannot be undone.`)) {
                      onDelete(t.id)
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
