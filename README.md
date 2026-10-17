# Shot or Spill

A Filipino barkada drinking card game for adults (18+). It runs on one phone passed
around the table at an inuman. Each card asks a personal, funny, or awkward question,
and the player answers honestly (spill) or takes a shot.

**Core loop:** Draw a card → read it out loud → spill or shot → pass the phone.

It's a mobile-first web app with no install, no account, and no ads.

> **Status:** Planning. There's no app code yet. Next up is Phase 0, locking decisions.

Repo: [github.com/rhon-dev/Spill-Or-Shot](https://github.com/rhon-dev/Spill-Or-Shot)

## Docs

| Doc | What's in it |
| --- | --- |
| [docs/PRD.md](docs/PRD.md) | Product requirements v0.2 (source of truth) |
| [docs/PHASES.md](docs/PHASES.md) | Phase-by-phase plan with gates, tasks, and requirement traceability |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Planned technical design for the MVP build |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Open questions and PRD gaps to lock in Phase 0 |

## Roadmap

| Phase | Output | Time | Status |
| --- | --- | --- | --- |
| 0. Lock decisions | Open questions and PRD gaps resolved, PRD v0.3 | 2 days | Next |
| 1. Content v1 | Writing guide + 150 validated cards | 1 week | Not started |
| 2. Design | Brand, card back, 6 key screens in Figma | 1 week | Not started |
| 3. Build MVP | Setup, game loop, counters, recap | 2 weeks | Not started |
| 4. Playtest | 4–5 real inuman sessions, reach 300+ cards | 1 week | Not started |
| 5. Launch | Deploy, legal pages, analytics, share | 3–4 days | Not started |
| 6. v1.1 / v2 | Custom cards, PWA, then rooms | After launch | Not started |

## MVP scope (v1)

- 18+ age gate with a responsible-drinking pledge
- 2–12 players, plus a Tanggero who rotates every 10 cards
- 5 decks (Warm Up, Barkada Tea, Love Life, Family & Adulting, No Filter) with an
  intensity filter (Chill / Spicy / No Filter)
- Card flip and swipe, SPILL and SHOT buttons, Skip always available, Undo
- Shot counters, a scoreboard, Water Break pacing, and a soft-cap warning
- End-of-night recap with awards
- Game state saved on the device, so a refresh keeps progress

**Not in v1:** accounts, payments, ads, multi-phone sync, Tagalog or Taglish card text,
alcohol brand partnerships, and explicit sexual content. The full list is in
[PRD §3 and §7](docs/PRD.md#3-goals-and-non-goals).

## Planned stack

Vite + React + TypeScript, Tailwind CSS, Framer Motion, Zustand persisted to
localStorage, Zod-validated JSON content, and Vercel hosting. Details are in
[ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Drink responsibly

Shot or Spill is for adults 18+, the legal drinking age in the Philippines. The game
opens with this pledge: _No one drives tonight. Skipping is always okay. Drink water._

## Owner

Rhon
