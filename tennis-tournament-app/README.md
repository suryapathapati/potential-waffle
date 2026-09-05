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
- **Persistence** — synced to a Supabase project when configured (survives across browsers/devices, live updates between anyone viewing the same data); falls back to your browser's local storage otherwise.

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL in your browser.

### Optional: persistent storage with Supabase

Without any setup, seasons are kept in your browser's local storage only (each browser/device has its own separate data). To make data persist reliably and sync across sessions and devices, connect a free [Supabase](https://supabase.com) project:

1. Create a project at [supabase.com](https://supabase.com), then open its SQL editor and run:

   ```sql
   create table public.leagues (
     id text primary key,
     data jsonb not null,
     updated_at timestamptz not null default now()
   );

   alter table public.leagues enable row level security;

   -- No login system in this app, so every reader/writer is anonymous.
   -- If you want to restrict this later, add Supabase Auth and scope
   -- these policies to authenticated users instead.
   create policy "Anyone can read leagues" on public.leagues
     for select using (true);
   create policy "Anyone can write leagues" on public.leagues
     for all using (true) with check (true);

   alter publication supabase_realtime add table public.leagues;
   ```

2. Copy `.env.example` to `.env` and fill in your project's URL and `anon` `public` API key (Project Settings → API) — **never** the `service_role` key, which must stay server-side only.
3. Restart `npm run dev`. Without step 2, the app just uses local storage — no code changes needed either way.

Note: because there's no login system, the `anon` key and the policies above mean anyone who has the key (which ships in the built app) can read and write your league data. That's a reasonable tradeoff for a small, trusted group coordinating a league; add Supabase Auth if you need to restrict access.

## Other scripts

```bash
npm run build    # type-check and build for production
npm run preview  # preview the production build
npm run lint     # lint the source
```

## Tech stack

React + TypeScript + Vite. Persistence is via Supabase when configured, otherwise the browser's local storage — no custom backend to run.
