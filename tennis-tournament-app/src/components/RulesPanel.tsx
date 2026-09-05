export default function RulesPanel() {
  return (
    <div className="rules-panel">
      <section>
        <h3>Player groups</h3>
        <ul>
          <li>
            <strong>Group A</strong> — Advanced &amp; Highly Competitive
          </li>
          <li>
            <strong>Group B</strong> — Intermediate &amp; Competitive
          </li>
          <li>
            <strong>Group C</strong> — Passionate &amp; Committed
          </li>
        </ul>
        <p className="hint-text">Each team has exactly one player from each group.</p>
      </section>

      <section>
        <h3>Fixture format — 6 one-set matches</h3>
        <table className="standings-table">
          <thead>
            <tr>
              <th>Match</th>
              <th>Format</th>
              <th>Players</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Singles 1</td>
              <td>A vs A</td>
              <td>Group A</td>
            </tr>
            <tr>
              <td>Singles 2</td>
              <td>B vs B</td>
              <td>Group B</td>
            </tr>
            <tr>
              <td>Singles 3</td>
              <td>C vs C</td>
              <td>Group C</td>
            </tr>
            <tr>
              <td>Doubles 1</td>
              <td>A+B vs A+B</td>
              <td>Groups A &amp; B</td>
            </tr>
            <tr>
              <td>Doubles 2</td>
              <td>B+C vs B+C</td>
              <td>Groups B &amp; C</td>
            </tr>
            <tr>
              <td>Doubles 3</td>
              <td>A+C vs A+C</td>
              <td>Groups A &amp; C</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h3>Scoring</h3>
        <p>
          Every match is one set only, traditional scoring (15–30–40–Game). At 6–6, a 10-point
          tie-break decides the set and the match.
        </p>
      </section>

      <section>
        <h3>Fixture winner</h3>
        <p>
          The team that wins the most of the six matches wins the fixture. If the match count is
          tied 3–3, the team with the greater total games won across all six matches wins.
        </p>
      </section>

      <section>
        <h3>League &amp; playoffs</h3>
        <p>
          Round robin — every team plays every other team once. The top 4 teams qualify: 1st plays
          4th and 2nd plays 3rd in the semifinals. Semifinal winners play for Gold &amp; Silver;
          semifinal losers play for Bronze.
        </p>
      </section>

      <section>
        <h3>Standings tiebreakers</h3>
        <ol>
          <li>Head-to-head result</li>
          <li>Number of individual matches won</li>
          <li>Total games won</li>
          <li>Other criteria at the League Organisers' discretion</li>
        </ol>
      </section>

      <section>
        <h3>Attendance, rescheduling &amp; forfeiture</h3>
        <p>
          A team unable to attend must give prior notice; failing to do so may result in a default
          win for the opponent. If a fixture can't be completed as scheduled, both teams must make
          a genuine effort to agree an alternative date, normally within 2 weeks, with a court
          booked and confirmed. If one team fails to commit to or cooperate with rescheduling, that
          team forfeits the outstanding match(es). Genuine disputes are decided by the League
          Organisers. An overseas player may be granted a substitute from another group, or an
          extension beyond 2 weeks, subject to agreement from both teams and the Organisers.
        </p>
      </section>

      <section>
        <h3>Venue</h3>
        <p>Kippax Tennis Club. Fixtures are generally played Wednesdays from 7:30 PM.</p>
      </section>
    </div>
  )
}
