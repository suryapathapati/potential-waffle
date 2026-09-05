import { useState } from 'react'
import type { Match, Player, SetScore, Tournament } from '../types'
import { generateSingleEliminationBracket, recordMatchResult, getChampion } from '../lib/bracket'
import { generateRoundRobinSchedule, recordRoundRobinResult, computeStandings } from '../lib/roundRobin'
import PlayerManager from './PlayerManager'
import BracketView from './BracketView'
import RoundRobinView from './RoundRobinView'
import StandingsTable from './StandingsTable'
import ScoreModal from './ScoreModal'

interface Props {
  tournament: Tournament
  onUpdate: (tournament: Tournament) => void
  onBack: () => void
}

type Tab = 'players' | 'matches' | 'standings'

export default function TournamentDashboard({ tournament, onUpdate, onBack }: Props) {
  const [tab, setTab] = useState<Tab>(tournament.started ? 'matches' : 'players')
  const [activeMatch, setActiveMatch] = useState<Match | null>(null)

  function handlePlayersChange(players: Player[]) {
    onUpdate({ ...tournament, players })
  }

  function handleStart() {
    const matches =
      tournament.format === 'single-elimination'
        ? generateSingleEliminationBracket(tournament.players)
        : generateRoundRobinSchedule(tournament.players)
    onUpdate({ ...tournament, matches, started: true })
    setTab('matches')
  }

  function handleReset() {
    if (!confirm('Reset all matches and scores? Players will be kept.')) return
    onUpdate({ ...tournament, matches: [], started: false })
    setTab('players')
  }

  function handleSaveScore(sets: SetScore[]) {
    if (!activeMatch) return
    const matches =
      tournament.format === 'single-elimination'
        ? recordMatchResult(
            tournament.matches,
            activeMatch.id,
            sets,
            tournament.matchFormat,
            tournament.players.length,
          )
        : recordRoundRobinResult(tournament.matches, activeMatch.id, sets, tournament.matchFormat)
    onUpdate({ ...tournament, matches })
    setActiveMatch(null)
  }

  const champion =
    tournament.format === 'single-elimination' && tournament.started
      ? getChampion(tournament.matches, tournament.players.length)
      : null
  const championName = champion ? tournament.players.find((p) => p.id === champion)?.name : null

  const standings =
    tournament.format === 'round-robin'
      ? computeStandings(tournament.players, tournament.matches)
      : []

  const activeMatchPlayers = activeMatch
    ? {
        p1: tournament.players.find((p) => p.id === activeMatch.player1Id)?.name ?? 'Unknown',
        p2: tournament.players.find((p) => p.id === activeMatch.player2Id)?.name ?? 'Unknown',
      }
    : null

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <button className="link-button" onClick={onBack}>
            ← All tournaments
          </button>
          <h1>{tournament.name}</h1>
          <p className="hint-text">
            {tournament.format === 'single-elimination' ? 'Single Elimination' : 'Round Robin'} ·{' '}
            {tournament.players.length} players
          </p>
        </div>
        {championName && <div className="champion-banner">🏆 Champion: {championName}</div>}
      </div>

      <nav className="tabs">
        <button className={tab === 'players' ? 'tab active' : 'tab'} onClick={() => setTab('players')}>
          Players
        </button>
        <button
          className={tab === 'matches' ? 'tab active' : 'tab'}
          onClick={() => setTab('matches')}
          disabled={!tournament.started}
        >
          {tournament.format === 'single-elimination' ? 'Bracket' : 'Matches'}
        </button>
        {tournament.format === 'round-robin' && (
          <button
            className={tab === 'standings' ? 'tab active' : 'tab'}
            onClick={() => setTab('standings')}
            disabled={!tournament.started}
          >
            Standings
          </button>
        )}
      </nav>

      {tab === 'players' && (
        <div className="tab-panel">
          <PlayerManager
            players={tournament.players}
            locked={tournament.started}
            onChange={handlePlayersChange}
          />
          <div className="form-actions">
            {!tournament.started ? (
              <button
                className="primary"
                disabled={tournament.players.length < 2}
                onClick={handleStart}
              >
                Start Tournament
              </button>
            ) : (
              <button className="danger-outline" onClick={handleReset}>
                Reset Matches
              </button>
            )}
          </div>
          {!tournament.started && tournament.players.length < 2 && (
            <p className="error-text">Add at least 2 players to start.</p>
          )}
        </div>
      )}

      {tab === 'matches' && tournament.started && (
        <div className="tab-panel">
          {tournament.format === 'single-elimination' ? (
            <BracketView
              matches={tournament.matches}
              players={tournament.players}
              onSelectMatch={setActiveMatch}
            />
          ) : (
            <RoundRobinView
              matches={tournament.matches}
              players={tournament.players}
              onSelectMatch={setActiveMatch}
            />
          )}
        </div>
      )}

      {tab === 'standings' && tournament.format === 'round-robin' && (
        <div className="tab-panel">
          <StandingsTable standings={standings} />
        </div>
      )}

      {activeMatch && activeMatchPlayers && (
        <ScoreModal
          match={activeMatch}
          matchFormat={tournament.matchFormat}
          player1Name={activeMatchPlayers.p1}
          player2Name={activeMatchPlayers.p2}
          onCancel={() => setActiveMatch(null)}
          onSave={handleSaveScore}
        />
      )}
    </div>
  )
}
