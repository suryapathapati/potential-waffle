import { useState } from 'react'
import type { League } from './types'
import { useLeaguesStore } from './lib/leaguesStore'
import LeagueList from './components/LeagueList'
import NewLeagueForm from './components/NewLeagueForm'
import LeagueDashboard from './components/LeagueDashboard'
import './App.css'

type View = { type: 'list' } | { type: 'create' } | { type: 'detail'; id: string }

function App() {
  const { leagues, ready, createLeague, updateLeague, deleteLeague } = useLeaguesStore()
  const [view, setView] = useState<View>({ type: 'list' })

  const currentLeague = view.type === 'detail' ? leagues.find((l) => l.id === view.id) : undefined

  function handleCreate(league: League) {
    createLeague(league)
    setView({ type: 'detail', id: league.id })
  }

  function handleDelete(id: string) {
    deleteLeague(id)
    setView({ type: 'list' })
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <button className="brand" onClick={() => setView({ type: 'list' })}>
          🎾 Telugu Tennis League Coordinator
        </button>
      </header>

      <main className="app-main">
        {!ready && <p className="hint-text">Loading…</p>}

        {ready && view.type === 'list' && (
          <LeagueList
            leagues={leagues}
            onOpen={(id) => setView({ type: 'detail', id })}
            onCreateNew={() => setView({ type: 'create' })}
            onDelete={handleDelete}
          />
        )}

        {ready && view.type === 'create' && (
          <NewLeagueForm onCancel={() => setView({ type: 'list' })} onCreate={handleCreate} />
        )}

        {ready && view.type === 'detail' && currentLeague && (
          <LeagueDashboard
            league={currentLeague}
            onUpdate={updateLeague}
            onBack={() => setView({ type: 'list' })}
          />
        )}

        {ready && view.type === 'detail' && !currentLeague && (
          <div className="empty-state">
            <p>Season not found.</p>
            <button onClick={() => setView({ type: 'list' })}>Back to seasons</button>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
