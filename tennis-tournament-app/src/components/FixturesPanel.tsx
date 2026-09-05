import { useState } from 'react'
import type { Fixture, Player, Team } from '../types'
import { computeFixtureResult } from '../lib/fixtureResult'
import FixtureModal from './FixtureModal'

interface Props {
  fixtures: Fixture[]
  teams: Team[]
  players: Player[]
  onSaveFixture: (fixture: Fixture) => void
  emptyMessage: string
}

function teamName(teams: Team[], id: string | null): string {
  if (!id) return 'TBD'
  return teams.find((t) => t.id === id)?.name ?? 'Unknown'
}

function FixtureCard({
  fixture,
  teams,
  onClick,
}: {
  fixture: Fixture
  teams: Team[]
  onClick: () => void
}) {
  const result = computeFixtureResult(fixture)
  const homeName = teamName(teams, fixture.homeTeamId)
  const awayName = teamName(teams, fixture.awayTeamId)
  const playable = fixture.homeTeamId && fixture.awayTeamId

  let statusLabel = 'Not started'
  if (fixture.wholeForfeitWinnerTeamId) statusLabel = 'Default win'
  else if (result.winnerSide) statusLabel = 'Complete'
  else if (result.decidedCount > 0) statusLabel = 'In progress'

  return (
    <button
      className={`fixture-card ${playable ? '' : 'fixture-card-disabled'}`}
      onClick={onClick}
      disabled={!playable}
    >
      {fixture.label && <div className="fixture-card-label">{fixture.label}</div>}
      <div className="fixture-card-teams">
        <span className={result.winnerSide === 'home' ? 'winner' : ''}>{homeName}</span>
        <span className="fixture-card-vs">vs</span>
        <span className={result.winnerSide === 'away' ? 'winner' : ''}>{awayName}</span>
      </div>
      <div className="fixture-card-meta">
        <span className={`status-badge status-${statusLabel.toLowerCase().replace(' ', '-')}`}>
          {statusLabel}
        </span>
        {!fixture.wholeForfeitWinnerTeamId && result.decidedCount > 0 && (
          <span>
            {result.homeMatchesWon}-{result.awayMatchesWon}
          </span>
        )}
        {fixture.scheduledDate && <span>{fixture.scheduledDate}</span>}
      </div>
    </button>
  )
}

export default function FixturesPanel({
  fixtures,
  teams,
  players,
  onSaveFixture,
  emptyMessage,
}: Props) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const active = fixtures.find((f) => f.id === activeId) ?? null

  if (fixtures.length === 0) {
    return <p className="hint-text">{emptyMessage}</p>
  }

  const rounds = Array.from(new Set(fixtures.map((f) => f.round))).sort((a, b) => a - b)
  const groupedByRound = fixtures[0].stage === 'league'

  return (
    <div className="fixtures-panel">
      {groupedByRound ? (
        rounds.map((round) => (
          <div className="fixture-round" key={round}>
            <h3 className="rr-round-title">Week {round}</h3>
            <div className="fixture-round-cards">
              {fixtures
                .filter((f) => f.round === round)
                .map((f) => (
                  <FixtureCard
                    key={f.id}
                    fixture={f}
                    teams={teams}
                    onClick={() => setActiveId(f.id)}
                  />
                ))}
            </div>
          </div>
        ))
      ) : (
        <div className="fixture-round-cards">
          {fixtures.map((f) => (
            <FixtureCard key={f.id} fixture={f} teams={teams} onClick={() => setActiveId(f.id)} />
          ))}
        </div>
      )}

      {active && (
        <FixtureModal
          fixture={active}
          homeTeam={teams.find((t) => t.id === active.homeTeamId)}
          awayTeam={teams.find((t) => t.id === active.awayTeamId)}
          players={players}
          onCancel={() => setActiveId(null)}
          onSave={(fixture) => {
            onSaveFixture(fixture)
            setActiveId(null)
          }}
        />
      )}
    </div>
  )
}
