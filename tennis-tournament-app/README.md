# Tennis Tournament Coordinator

A single-page web app for running a tennis tournament: manage players, generate a bracket or round-robin schedule, record match scores, and track standings.

## Features

- **Two tournament formats**
  - **Single elimination** — automatically seeds a bracket, handles byes when the player count isn't a power of two, and advances winners round by round to the Final.
  - **Round robin** — generates a full schedule (everyone plays everyone) and ranks players by wins, then set difference, then game difference.
- **Configurable match scoring** — single set, best of 3, or best of 5.
- **Player management** — add, remove, or rename players before the tournament starts; rename only once it's underway.
- **Score entry** — enter set scores per match; the app determines the winner and advances the bracket automatically.
- **Persistence** — tournaments are saved to your browser's local storage, so your data survives a page reload.

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

React + TypeScript + Vite, with no backend — all tournament state lives in the browser.
