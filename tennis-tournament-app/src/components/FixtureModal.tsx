import { useState } from 'react'
import type { Fixture, Group, Player, SetResult, SubMatch, Team } from '../types'
import { computeFixtureResult } from '../lib/fixtureResult'
import { emptySetResult, getSubMatchWinner } from '../lib/scoring'

interface Props {
  fixture: Fixture
  homeTeam: Team | undefined
  awayTeam: Team | undefined
  players: Player[]
  onCancel: () => void
  onSave: (fixture: Fixture) => void
}

function rosterNames(team: Team | undefined, groups: Group[], players: Player[]): string {
  if (!team) return 'TBD'
  return groups
    .map((g) => players.find((p) => p.id === team.playerIds[g])?.name ?? 'Unassigned')
    .join(' + ')
}

export default function FixtureModal({
  fixture,
  homeTeam,
  awayTeam,
  players,
  onCancel,
  onSave,
}: Props) {
  const [draft, setDraft] = useState<Fixture>(() => structuredClone(fixture))

  function updateSubMatch(id: string, updater: (sub: SubMatch) => SubMatch) {
    setDraft((prev) => ({
      ...prev,
      subMatches: prev.subMatches.map((s) => (s.id === id ? updater(s) : s)),
    }))
  }

  function updateResultField(id: string, field: 'homeGames' | 'awayGames', value: string) {
    const num = value === '' ? 0 : Math.max(0, Math.min(30, parseInt(value, 10) || 0))
    updateSubMatch(id, (s) => {
      const result: SetResult = s.result ? { ...s.result } : emptySetResult()
      result[field] = num
      if (!(result.homeGames === 6 && result.awayGames === 6) && result.tiebreak) {
        result.tiebreak = null
      }
      return { ...s, result, forfeitWinner: null }
    })
  }

  function updateTiebreakField(id: string, side: 'home' | 'away', value: string) {
    const num = value === '' ? 0 : Math.max(0, Math.min(99, parseInt(value, 10) || 0))
    updateSubMatch(id, (s) => {
      if (!s.result) return s
      const tiebreak = s.result.tiebreak ?? { home: 0, away: 0 }
      tiebreak[side] = num
      const winnerByBreak = tiebreak.home > tiebreak.away ? 'home' : 'away'
      const homeGames = winnerByBreak === 'home' ? 7 : 6
      const awayGames = winnerByBreak === 'home' ? 6 : 7
      return { ...s, result: { homeGames, awayGames, tiebreak } }
    })
  }

  function setForfeit(id: string, winner: 'home' | 'away' | null) {
    updateSubMatch(id, (s) => ({ ...s, forfeitWinner: winner, result: winner ? null : s.result }))
  }

  function setWholeForfeit(teamId: string | null) {
    setDraft((prev) => ({ ...prev, wholeForfeitWinnerTeamId: teamId }))
  }

  const result = computeFixtureResult(draft)
  const homeName = homeTeam?.name ?? 'TBD'
  const awayName = awayTeam?.name ?? 'TBD'

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal fixture-modal" onClick={(e) => e.stopPropagation()}>
        <h2>
          {homeName} vs {awayName}
        </h2>
        {fixture.label && <p className="modal-subtitle">{fixture.label}</p>}

        <label className="field">
          <span>Scheduled date</span>
          <input
            type="date"
            value={draft.scheduledDate ?? ''}
            onChange={(e) =>
              setDraft((prev) => ({ ...prev, scheduledDate: e.target.value || null }))
            }
          />
        </label>

        <div className="whole-forfeit-row">
          <span>Default / no-show:</span>
          <button
            type="button"
            className={draft.wholeForfeitWinnerTeamId === homeTeam?.id ? 'chip active' : 'chip'}
            onClick={() =>
              setWholeForfeit(draft.wholeForfeitWinnerTeamId === homeTeam?.id ? null : homeTeam?.id ?? null)
            }
            disabled={!homeTeam}
          >
            {awayName} defaults → {homeName} wins
          </button>
          <button
            type="button"
            className={draft.wholeForfeitWinnerTeamId === awayTeam?.id ? 'chip active' : 'chip'}
            onClick={() =>
              setWholeForfeit(draft.wholeForfeitWinnerTeamId === awayTeam?.id ? null : awayTeam?.id ?? null)
            }
            disabled={!awayTeam}
          >
            {homeName} defaults → {awayName} wins
          </button>
        </div>

        {!draft.wholeForfeitWinnerTeamId && (
          <div className="submatch-list">
            {draft.subMatches.map((sub) => {
              const homeRoster = rosterNames(homeTeam, sub.groups, players)
              const awayRoster = rosterNames(awayTeam, sub.groups, players)
              const needsTiebreak =
                (sub.result?.homeGames === 6 && sub.result?.awayGames === 6) ||
                !!sub.result?.tiebreak
              const winner = getSubMatchWinner(sub)
              return (
                <div className="submatch-row" key={sub.id}>
                  <div className="submatch-heading">
                    <span className="submatch-slot">{sub.label}</span>
                    <span className="submatch-players">
                      {homeRoster} <em>vs</em> {awayRoster}
                    </span>
                  </div>
                  <div className="submatch-inputs">
                    <input
                      type="number"
                      min={0}
                      max={30}
                      value={sub.result?.homeGames ?? 0}
                      disabled={!!sub.forfeitWinner}
                      onChange={(e) => updateResultField(sub.id, 'homeGames', e.target.value)}
                    />
                    <span className="submatch-dash">–</span>
                    <input
                      type="number"
                      min={0}
                      max={30}
                      value={sub.result?.awayGames ?? 0}
                      disabled={!!sub.forfeitWinner}
                      onChange={(e) => updateResultField(sub.id, 'awayGames', e.target.value)}
                    />
                    {needsTiebreak && (
                      <span className="tiebreak-inputs">
                        TB
                        <input
                          type="number"
                          min={0}
                          max={99}
                          value={sub.result?.tiebreak?.home ?? 0}
                          onChange={(e) => updateTiebreakField(sub.id, 'home', e.target.value)}
                        />
                        –
                        <input
                          type="number"
                          min={0}
                          max={99}
                          value={sub.result?.tiebreak?.away ?? 0}
                          onChange={(e) => updateTiebreakField(sub.id, 'away', e.target.value)}
                        />
                      </span>
                    )}
                    <button
                      type="button"
                      className={sub.forfeitWinner === 'home' ? 'chip active' : 'chip'}
                      onClick={() =>
                        setForfeit(sub.id, sub.forfeitWinner === 'home' ? null : 'home')
                      }
                    >
                      Forfeit → home
                    </button>
                    <button
                      type="button"
                      className={sub.forfeitWinner === 'away' ? 'chip active' : 'chip'}
                      onClick={() =>
                        setForfeit(sub.id, sub.forfeitWinner === 'away' ? null : 'away')
                      }
                    >
                      Forfeit → away
                    </button>
                  </div>
                  {winner && (
                    <div className="submatch-winner">
                      Winner: {winner === 'home' ? homeName : awayName}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <div className="fixture-summary-box">
          {draft.wholeForfeitWinnerTeamId ? (
            <p>
              <strong>
                {draft.wholeForfeitWinnerTeamId === homeTeam?.id ? homeName : awayName}
              </strong>{' '}
              awarded a default win.
            </p>
          ) : (
            <>
              <p>
                Matches: {homeName} {result.homeMatchesWon} – {result.awayMatchesWon} {awayName}
              </p>
              {result.wentToGamesCountback && (
                <p>
                  Games countback: {homeName} {result.homeGames} – {result.awayGames} {awayName}
                </p>
              )}
              <p>
                {result.winnerSide
                  ? `Fixture winner: ${result.winnerSide === 'home' ? homeName : awayName}`
                  : 'Fixture not yet decided.'}
              </p>
            </>
          )}
        </div>

        <label className="field">
          <span>Notes</span>
          <textarea
            rows={2}
            value={draft.notes}
            onChange={(e) => setDraft((prev) => ({ ...prev, notes: e.target.value }))}
            placeholder="Reschedule reason, dispute notes, overseas exception, etc."
          />
        </label>

        <div className="form-actions">
          <button className="secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className="primary" onClick={() => onSave(draft)}>
            Save Fixture
          </button>
        </div>
      </div>
    </div>
  )
}
