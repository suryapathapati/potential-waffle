import { useEffect, useState } from 'react'
import type { League } from './types'
import { loadLeagues, saveLeagues } from './lib/storage'
import LeagueList from './components/LeagueList'
import NewLeagueForm from './components/NewLeagueForm'
import LeagueDashboard from './components/LeagueDashboard'
import './App.css'

type View = { type: 'list' } | { type: 'create' } | { type: 'detail'; id: string }

function App() {
  const [leagues, setLeagues] = useState<League[]>(() => loadLeagues())
  const [view, setView] = useState<View>({ type: 'list' })

  useEffect(() => {
    saveLeagues(leagues)
  }, [leagues])

  const currentLeague = view.type === 'detail' ? leagues.find((l) => l.id === view.id) : undefined

  function handleCreate(league: League) {
    setLeagues((prev) => [...prev, league])
    setView({ type: 'detail', id: league.id })
  }

  function handleUpdate(updated: League) {
    setLeagues((prev) => prev.map((l) => (l.id === updated.id ? updated : l)))
  }

  function handleDelete(id: string) {
    setLeagues((prev) => prev.filter((l) => l.id !== id))
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
        {view.type === 'list' && (
          <LeagueList
            leagues={leagues}
            onOpen={(id) => setView({ type: 'detail', id })}
            onCreateNew={() => setView({ type: 'create' })}
            onDelete={handleDelete}
          />
        )}

        {view.type === 'create' && (
          <NewLeagueForm onCancel={() => setView({ type: 'list' })} onCreate={handleCreate} />
        )}

        {view.type === 'detail' && currentLeague && (
          <LeagueDashboard
            league={currentLeague}
            onUpdate={handleUpdate}
            onBack={() => setView({ type: 'list' })}
          />
        )}

        {view.type === 'detail' && !currentLeague && (
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
