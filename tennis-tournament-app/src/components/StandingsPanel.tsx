import type { StandingsRow } from '../lib/standings'

interface Props {
  standings: StandingsRow[]
}

export default function StandingsPanel({ standings }: Props) {
  return (
    <div className="standings-wrap">
      <table className="standings-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Team</th>
            <th>Played</th>
            <th>Won</th>
            <th>Lost</th>
            <th>Matches (F-A)</th>
            <th>Games (F-A)</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((row, i) => (
            <tr key={row.team.id} className={i < 4 ? 'standings-qualified' : ''}>
              <td>{i + 1}</td>
              <td>{row.team.name}</td>
              <td>{row.played}</td>
              <td>{row.won}</td>
              <td>{row.lost}</td>
              <td>
                {row.matchesWon}-{row.matchesLost}
              </td>
              <td>
                {row.gamesWon}-{row.gamesLost}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="hint-text">
        Top 4 (highlighted) qualify for the semifinals. Ties are broken by head-to-head result,
        then individual matches won, then total games won.
      </p>
    </div>
  )
}
