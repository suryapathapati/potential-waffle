import type { StandingsRow } from '../lib/roundRobin'

interface Props {
  standings: StandingsRow[]
}

export default function StandingsTable({ standings }: Props) {
  return (
    <table className="standings-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Player</th>
          <th>Played</th>
          <th>W</th>
          <th>L</th>
          <th>Sets</th>
          <th>Games</th>
        </tr>
      </thead>
      <tbody>
        {standings.map((row, i) => (
          <tr key={row.player.id}>
            <td>{i + 1}</td>
            <td>{row.player.name}</td>
            <td>{row.played}</td>
            <td>{row.wins}</td>
            <td>{row.losses}</td>
            <td>
              {row.setsWon}-{row.setsLost}
            </td>
            <td>
              {row.gamesWon}-{row.gamesLost}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
