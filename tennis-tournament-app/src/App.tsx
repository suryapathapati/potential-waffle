import { useEffect, useState } from 'react'
import type { Tournament } from './types'
import { loadTournaments, saveTournaments } from './lib/storage'
import TournamentList from './components/TournamentList'
import NewTournamentForm from './components/NewTournamentForm'
import TournamentDashboard from './components/TournamentDashboard'
import './App.css'

type View = { type: 'list' } | { type: 'create' } | { type: 'detail'; id: string }

function App() {
  const [tournaments, setTournaments] = useState<Tournament[]>(() => loadTournaments())
  const [view, setView] = useState<View>({ type: 'list' })

  useEffect(() => {
    saveTournaments(tournaments)
  }, [tournaments])

  const currentTournament =
    view.type === 'detail' ? tournaments.find((t) => t.id === view.id) : undefined

  function handleCreate(tournament: Tournament) {
    setTournaments((prev) => [...prev, tournament])
    setView({ type: 'detail', id: tournament.id })
  }

  function handleUpdate(updated: Tournament) {
    setTournaments((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
  }

  function handleDelete(id: string) {
    setTournaments((prev) => prev.filter((t) => t.id !== id))
    setView({ type: 'list' })
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <button className="brand" onClick={() => setView({ type: 'list' })}>
          🎾 Tennis Tournament Coordinator
        </button>
      </header>

      <main className="app-main">
        {view.type === 'list' && (
          <TournamentList
            tournaments={tournaments}
            onOpen={(id) => setView({ type: 'detail', id })}
            onCreateNew={() => setView({ type: 'create' })}
            onDelete={handleDelete}
          />
        )}

        {view.type === 'create' && (
          <NewTournamentForm onCancel={() => setView({ type: 'list' })} onCreate={handleCreate} />
        )}

        {view.type === 'detail' && currentTournament && (
          <TournamentDashboard
            tournament={currentTournament}
            onUpdate={handleUpdate}
            onBack={() => setView({ type: 'list' })}
          />
        )}

        {view.type === 'detail' && !currentTournament && (
          <div className="empty-state">
            <p>Tournament not found.</p>
            <button onClick={() => setView({ type: 'list' })}>Back to tournaments</button>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
