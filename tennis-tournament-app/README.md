# Telugu Tennis League Coordinator

A single-page web app for running the Telugu Tennis League (TTL): draw teams from graded players, generate the round-robin fixture schedule, record scores for each fixture's 6 one-set matches, track standings, and run the semifinal/final/bronze playoffs.

## Features

- **Players & groups** — register players into Group A (Advanced), Group B (Intermediate) or Group C (Passionate & Committed).
- **Team formation** — draw teams randomly by ballot (one player per group per team) or assign manually; lock teams once set to generate the season's fixtures.
- **Fixture format** — each fixture is the full TTL tie: Singles 1 (A v A), Singles 2 (B v B), Singles 3 (C v C), Doubles 1 (A+B), Doubles 2 (B+C), Doubles 3 (A+C) — all one-set matches with a 10-point tie-break at 6–6.
- **Fixture winner logic** — most matches won out of six decides the fixture; a 3–3 split is resolved by total games won across all six matches, per the rules.
- **Attendance & rescheduling** — mark a fixture as a default win for one team, edit the scheduled date for a reschedule, and record notes (dispute context, overseas exceptions, etc.).
- **Round-robin league** — every team plays every other team once, grouped by week.
- **Standings** — ranked by fixture wins, then individual matches won, then total games won, then head-to-head.
- **Playoffs** — generate semifinals from the top 4 in the standings (1v4, 2v3); winners play for Gold & Silver, losers play for Bronze.
- **Rules reference** — an in-app summary of the league format and policies for quick lookup.
- **Persistence** — everything is saved to your browser's local storage.

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL in your browser.

## Other scripts

```bash
npm run build    # type-check and build for production
npm run preview  # preview the production build
npm run lint     # lint the source
```

## Tech stack

React + TypeScript + Vite, with no backend — all league state lives in the browser.
