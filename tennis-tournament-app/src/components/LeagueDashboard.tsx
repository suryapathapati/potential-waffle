import { useState } from 'react'
import type { Fixture, League, Player, Team } from '../types'
import { generateLeagueFixtures, generatePlayoffFixtures, propagatePlayoffResult } from '../lib/fixtures'
import { computeFixtureResult } from '../lib/fixtureResult'
import { computeStandings } from '../lib/standings'
import PlayersPanel from './PlayersPanel'
import TeamsPanel from './TeamsPanel'
import FixturesPanel from './FixturesPanel'
import StandingsPanel from './StandingsPanel'
import RulesPanel from './RulesPanel'

interface Props {
  league: League
  onUpdate: (league: League) => void
  onBack: () => void
}

type Tab = 'players' | 'teams' | 'fixtures' | 'playoffs' | 'standings' | 'rules'

export default function LeagueDashboard({ league, onUpdate, onBack }: Props) {
  const [tab, setTab] = useState<Tab>(league.teamsLocked ? 'fixtures' : 'players')

  function handlePlayersChange(players: Player[]) {
    onUpdate({ ...league, players })
  }

  function handleTeamsChange(teams: Team[]) {
    onUpdate({ ...league, teams })
  }

  function handleLockTeams() {
    const fixtures = generateLeagueFixtures(league.teams)
    onUpdate({ ...league, fixtures, teamsLocked: true })
    setTab('fixtures')
  }

  function handleResetTeams() {
    if (!confirm('Reset teams and all fixtures? Players will be kept.')) return
    onUpdate({
      ...league,
      teams: [],
      fixtures: [],
      teamsLocked: false,
      playoffsGenerated: false,
    })
    setTab('teams')
  }

  function handleSaveFixture(updatedFixture: Fixture) {
    let fixtures = league.fixtures.map((f) => (f.id === updatedFixture.id ? updatedFixture : f))

    if (updatedFixture.stage === 'semifinal') {
      const result = computeFixtureResult(updatedFixture)
      const winnerTeamId = updatedFixture.wholeForfeitWinnerTeamId
        ? updatedFixture.wholeForfeitWinnerTeamId
        : result.winnerSide === 'home'
          ? updatedFixture.homeTeamId
          : result.winnerSide === 'away'
            ? updatedFixture.awayTeamId
            : null
      if (winnerTeamId) {
        const loserTeamId =
          winnerTeamId === updatedFixture.homeTeamId
            ? updatedFixture.awayTeamId
            : updatedFixture.homeTeamId
        if (loserTeamId) {
          fixtures = propagatePlayoffResult(fixtures, updatedFixture, winnerTeamId, loserTeamId)
        }
      }
    }

    onUpdate({ ...league, fixtures })
  }

  function handleGeneratePlayoffs() {
    const standings = computeStandings(league.teams, league.fixtures)
    if (standings.length < 4) {
      alert('Need at least 4 teams to generate playoffs.')
      return
    }
    const topFour = standings.slice(0, 4).map((row) => row.team.id)
    const playoffFixtures = generatePlayoffFixtures(topFour)
    onUpdate({
      ...league,
      fixtures: [...league.fixtures, ...playoffFixtures],
      playoffsGenerated: true,
    })
    setTab('playoffs')
  }

  const standings = computeStandings(league.teams, league.fixtures)
  const leagueFixtures = league.fixtures.filter((f) => f.stage === 'league')
  const playoffFixtures = league.fixtures.filter((f) => f.stage !== 'league')

  const goldFixture = playoffFixtures.find((f) => f.stage === 'final')
  const goldResult = goldFixture ? computeFixtureResult(goldFixture) : null
  const champion =
    goldFixture && goldResult?.winnerSide
      ? league.teams.find(
          (t) =>
            t.id ===
            (goldResult.winnerSide === 'home' ? goldFixture.homeTeamId : goldFixture.awayTeamId),
        )
      : goldFixture?.wholeForfeitWinnerTeamId
        ? league.teams.find((t) => t.id === goldFixture.wholeForfeitWinnerTeamId)
        : undefined

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <button className="link-button" onClick={onBack}>
            ← All seasons
          </button>
          <h1>{league.name}</h1>
          <p className="hint-text">
            {league.teamCount} teams · {league.players.length} players
          </p>
        </div>
        {champion && <div className="champion-banner">🏆 Gold: {champion.name}</div>}
      </div>

      <nav className="tabs">
        <button className={tab === 'players' ? 'tab active' : 'tab'} onClick={() => setTab('players')}>
          Players
        </button>
        <button className={tab === 'teams' ? 'tab active' : 'tab'} onClick={() => setTab('teams')}>
          Teams
        </button>
        <button
          className={tab === 'fixtures' ? 'tab active' : 'tab'}
          onClick={() => setTab('fixtures')}
          disabled={!league.teamsLocked}
        >
          Fixtures
        </button>
        <button
          className={tab === 'playoffs' ? 'tab active' : 'tab'}
          onClick={() => setTab('playoffs')}
          disabled={!league.teamsLocked}
        >
          Playoffs
        </button>
        <button
          className={tab === 'standings' ? 'tab active' : 'tab'}
          onClick={() => setTab('standings')}
          disabled={!league.teamsLocked}
        >
          Standings
        </button>
        <button className={tab === 'rules' ? 'tab active' : 'tab'} onClick={() => setTab('rules')}>
          Rules
        </button>
      </nav>

      {tab === 'players' && (
        <div className="tab-panel">
          <PlayersPanel
            players={league.players}
            locked={league.teamsLocked}
            onChange={handlePlayersChange}
          />
        </div>
      )}

      {tab === 'teams' && (
        <div className="tab-panel">
          <TeamsPanel
            teams={league.teams}
            players={league.players}
            teamCount={league.teamCount}
            locked={league.teamsLocked}
            onChange={handleTeamsChange}
            onLock={handleLockTeams}
          />
          {league.teamsLocked && (
            <div className="form-actions">
              <button className="danger-outline" onClick={handleResetTeams}>
                Reset Teams &amp; Fixtures
              </button>
            </div>
          )}
        </div>
      )}

      {tab === 'fixtures' && league.teamsLocked && (
        <div className="tab-panel">
          <FixturesPanel
            fixtures={leagueFixtures}
            teams={league.teams}
            players={league.players}
            onSaveFixture={handleSaveFixture}
            emptyMessage="No fixtures yet."
          />
        </div>
      )}

      {tab === 'playoffs' && league.teamsLocked && (
        <div className="tab-panel">
          {!league.playoffsGenerated && (
            <div className="form-actions">
              <button
                className="primary"
                disabled={league.teams.length < 4}
                onClick={handleGeneratePlayoffs}
              >
                Generate Playoffs from Current Standings
              </button>
            </div>
          )}
          <FixturesPanel
            fixtures={playoffFixtures}
            teams={league.teams}
            players={league.players}
            onSaveFixture={handleSaveFixture}
            emptyMessage="Playoffs haven't been generated yet. Do this once the regular season is complete (or when the organiser is ready to lock in the top 4)."
          />
        </div>
      )}

      {tab === 'standings' && league.teamsLocked && (
        <div className="tab-panel">
          <StandingsPanel standings={standings} />
        </div>
      )}

      {tab === 'rules' && (
        <div className="tab-panel">
          <RulesPanel />
        </div>
      )}
    </div>
  )
}
