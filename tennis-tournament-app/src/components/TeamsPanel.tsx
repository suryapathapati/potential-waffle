import { GROUPS, type Group, type Player, type Team } from '../types'
import { canDrawTeams, drawTeamsRandomly, emptyTeams, isTeamComplete } from '../lib/teams'

interface Props {
  teams: Team[]
  players: Player[]
  teamCount: number
  locked: boolean
  onChange: (teams: Team[]) => void
  onLock: () => void
}

export default function TeamsPanel({
  teams,
  players,
  teamCount,
  locked,
  onChange,
  onLock,
}: Props) {
  const canDraw = canDrawTeams(players, teamCount)
  const displayTeams = teams.length > 0 ? teams : []

  function handleDraw() {
    onChange(drawTeamsRandomly(players, teamCount))
  }

  function handleStartManual() {
    if (teams.length === 0) onChange(emptyTeams(teamCount))
  }

  function handleRename(teamId: string, name: string) {
    onChange(teams.map((t) => (t.id === teamId ? { ...t, name } : t)))
  }

  function handleAssign(teamId: string, group: Group, playerId: string) {
    onChange(
      teams.map((t) =>
        t.id === teamId
          ? { ...t, playerIds: { ...t.playerIds, [group]: playerId || null } }
          : t,
      ),
    )
  }

  function availablePlayersFor(group: Group, currentTeamId: string): Player[] {
    const usedElsewhere = new Set(
      teams.filter((t) => t.id !== currentTeamId).map((t) => t.playerIds[group]),
    )
    return players.filter((p) => p.group === group && !usedElsewhere.has(p.id))
  }

  const allComplete = displayTeams.length > 0 && displayTeams.every(isTeamComplete)

  return (
    <div className="teams-panel">
      {!locked && displayTeams.length === 0 && (
        <div className="teams-setup-actions">
          <button className="primary" disabled={!canDraw} onClick={handleDraw}>
            Draw Teams Randomly
          </button>
          <button className="secondary" onClick={handleStartManual}>
            Assign Teams Manually
          </button>
        </div>
      )}
      {!locked && displayTeams.length === 0 && !canDraw && (
        <p className="error-text">
          Need at least {teamCount} players in each group (A, B, C) before a random draw.
        </p>
      )}

      {displayTeams.length > 0 && (
        <>
          <div className="team-cards">
            {displayTeams.map((team) => (
              <div className="team-card" key={team.id}>
                <input
                  className="team-name-input"
                  value={team.name}
                  disabled={locked}
                  onChange={(e) => handleRename(team.id, e.target.value)}
                />
                <div className="team-roster">
                  {GROUPS.map((g) => (
                    <div className="team-roster-row" key={g}>
                      <span className={`group-tag group-${g}`}>{g}</span>
                      {locked ? (
                        <span>
                          {players.find((p) => p.id === team.playerIds[g])?.name ?? 'Unassigned'}
                        </span>
                      ) : (
                        <select
                          value={team.playerIds[g] ?? ''}
                          onChange={(e) => handleAssign(team.id, g, e.target.value)}
                        >
                          <option value="">Unassigned</option>
                          {availablePlayersFor(g, team.id).map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {!locked && (
            <div className="form-actions">
              <button className="primary" disabled={!allComplete} onClick={onLock}>
                Lock Teams &amp; Generate Fixtures
              </button>
            </div>
          )}
          {!locked && !allComplete && (
            <p className="error-text">Every team needs one player from each group.</p>
          )}
        </>
      )}
    </div>
  )
}
