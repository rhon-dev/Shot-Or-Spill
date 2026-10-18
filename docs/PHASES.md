# Phase Development Plan

Follows the milestones in [PRD §14](./PRD.md#14-milestones). This plan doesn't add scope.
Gaps and open calls live in [DECISIONS.md](./DECISIONS.md), referenced here as D-xx.

## Working rules

- **One phase at a time, in order.** Each phase ends at a review gate, and the next one
  starts only after Rhon approves.
- **Scope is frozen** to the PRD §7 MVP list. New ideas go to v1.1 or v2 (PRD §15, scope
  creep).
- **PRD changes go through the log.** If a phase needs a PRD change, record it in
  DECISIONS.md and bump the PRD version before building it.
- **Traceable.** Tasks reference PRD requirement IDs (F1–F17) so every Must is covered.

## Overview

| Phase | Output | Time | Gate to move on |
| --- | --- | --- | --- |
| 0. Lock decisions | DECISIONS.md signed off, PRD v0.3 | 2 days | Nothing left in Proposed |
| 1. Content v1 | Writing guide + 150 validated cards | 1 week | 150 cards pass validation and review |
| 2. Design | Brand, card back, 6 key screens (SVG mocks in the repo, D-20) | 1 week | Screens approved, contrast checked |
| 3. Build MVP | Playable MVP on a preview URL | 2 weeks | Every Must requirement passes |
| 4. Playtest | 4–5 real sessions, 300+ cards, fixes | 1 week | Playtest exit criteria met |
| 5. Launch | Production site, legal pages, analytics | 3–4 days | Launch checklist complete |
| 6. v1.1 / v2 | Post-launch roadmap | After launch | Planned separately |

Time to launch: about 6 weeks.

---

## Phase 0 — Lock decisions (2 days)

**Goal:** settle everything that would cause rework later.

Tasks:

1. Answer the five PRD open questions (D-01 to D-05).
2. Resolve the PRD gaps (D-08 to D-19). These are game rules that affect the card
   schema, the screens, and the engine.
3. Check name availability: domain plus the main social handles (D-01).
4. Update PRD.md to v0.3 with anything that changed.

Deliverables: DECISIONS.md fully resolved, PRD v0.3.

Exit criteria: no item left in Proposed. Resolve D-03, D-08, and D-12 first, because
Phase 1 depends on them.

---

## Phase 1 — Content v1 (1 week)

**Goal:** 150 original cards that follow the PRD §9 writing rules, in the final data
format.

Tasks:

1. **Writing guide** (`docs/content-guide.md`) covering:
   - voice and the English-only rule, with the allowed local terms
   - the originality rule and the hard content rules
   - the intensity ladder
   - targets and placeholders (D-08)
   - templates for each card type
   - a pre-ship checklist
2. **Lock the card schema** from PRD §9 plus D-08. The rules:
   - `shots: 2` only on Double Down
   - Water Break cards target the group
   - any card that uses a placeholder sets the matching target
   - intensity stays at or below the deck's ceiling
   - ids are unique and use the `deck-000` format
3. **Content tooling:** one JSON file per deck, plus a Zod validator script. The script
   checks the schema, deck ceilings, and duplicate ids or text. This is the only code in
   Phase 1.
4. **Write 150 cards**, split by deck (table below). Follow the PRD §5 type mix:
   - about 60% Spill or Shot
   - 15% Everyone Who
   - 10% Most Likely To
   - 5% Hot Seat
   - 5% Double Down
   - Water Break text per D-12
5. **Review log per deck:** originality check, Filipino-context check, and intensity
   check (PRD §15).
6. **Table read:** read 30 random cards out loud to test the 60-second rule.

| Deck | Phase 1 | Launch target (PRD §6) |
| --- | --- | --- |
| Warm Up | 29 | 60 |
| Barkada Tea | 34 | 70 |
| Love Life | 34 | 70 |
| Family & Adulting | 24 | 50 |
| No Filter (if D-03 = v1) | 29 | 60 |
| **Total** | **150** | **310** |

Exit criteria: all 150 cards pass the validator, every card is ticked on the review
checklist, and Rhon signs off.

---

## Phase 2 — Design (1 week)

**Goal:** the visual identity and the six key screens, ready to build.

Per D-20, the PRD's Figma deliverable is replaced by SVG mocks in `docs/design/`. They're
generated from the design tokens and documented in [DESIGN.md](./DESIGN.md).

Tasks:

1. **Brand:** wordmark, the neon "SHOT or SPILL" mark, and a card back with bunting or a
   tagay-glass motif (PRD §10).
2. **Design tokens:**
   - palette: near-black background, hot pink for Spill, amber for Shot, teal accents
   - one accent color for each of the 5 decks
   - type scale: chunky display font for cards, clean sans for UI
   - spacing and corner radii
3. **Six key screens** at a 360×800 mobile baseline:
   - Age Gate
   - Add Players
   - Pick Decks + Intensity
   - How to Play
   - Game
   - Recap
4. **Secondary states:**
   - scoreboard sheet
   - soft-cap warning
   - adult-content confirmation (D-14)
   - eligible-card count and a disabled Start (D-15)
   - reshuffle prompt
   - Water Break card
   - "Who drank?" picker (D-10)
   - Hot Seat stepper (D-11)
   - Tanggero player picker (D-09)
   - Share button, if D-17 is accepted
5. **Info pages:** About, Drink Responsibly, Terms.
6. **Card text sizing:** rules for long questions (auto-resize with a minimum size).
7. **Motion spec:** flip under 400 ms (F7), swipe, and a reduced-motion fallback.
8. **Accessibility check:**
   - WCAG AA contrast for every text and button pair
   - 48px+ tap targets
   - primary actions within thumb reach

Exit criteria: Rhon approves the designs (D-20), the contrast check passes, and every
state Phase 3 builds has a design.

---

## Phase 3 — Build MVP (2 weeks)

**Goal:** a playable MVP on a Vercel preview URL that meets every Must requirement. The
build has five steps, and each one ends with a working build. The technical design is in
[ARCHITECTURE.md](./ARCHITECTURE.md).

### 3.1 Foundation (days 1–2)

- Vite + React + TypeScript scaffold (D-06), with Tailwind tokens from Phase 2
- Zustand store with versioned localStorage persistence (F15)
- Phase 1 content and validator wired into the build
- Self-hosted fonts
- Vitest setup
- JS size check in CI (D-18)
- Vercel preview deploy

### 3.2 Setup flow (days 3–4)

- Age gate with the pledge, remembered for 30 days (F1)
- Player setup for 2–12 players with no duplicate names (F2)
- Deck select with the adult confirmation (F4, D-14)
- Intensity filter (F5) and eligible-card count (D-15)
- How to Play, shown the first time only

### 3.3 Game loop (days 5–7)

- Engine:
  - eligible pool filtered by deck and intensity (F5)
  - shuffle with no repeats, then a reshuffle prompt (F9)
- Turn order and current player display (F6)
- Card flip under 400 ms, swipe and tap (F7)
- Name substitution, resolved once per draw (F8, D-08)
- Spill / Shot logging to the answering player (F10, D-09)
- Skip: same player gets a new card, nothing logged (F11, D-13)
- Tanggero assigned at random, rotates every 10 cards, badge on screen (F3, D-13). Later changed to a host pick, D-23
- Card-type behaviors:
  - "Who drank?" for group cards (D-10)
  - Hot Seat stepper (D-11)
  - Double Down logs 2 shots
  - Tanggero player picker (D-09)

### 3.4 Pacing, scores, recap (days 8–9)

- Water Break after every 12–15 completed cards (F12, D-12)
- Soft-cap warning at a configurable shot count, default 6 (F12)
- Scoreboard, open at any time (F13)
- Undo for the last resolved card (F16)
- Recap with awards (F14, D-19)
- Restore check: a refresh mid-game resumes the same card, turn, and scores (F15)

### 3.5 Polish and quality (day 10)

- Reduced-motion setting, plus respecting the OS setting
- Auto-resizing card text
- About and Drink Responsibly pages
- Analytics wrapper with anonymous events, turned off until Phase 5 (D-16)
- Lighthouse mobile check
- Bundle budget check
- Smoke test on a budget Android phone

Exit criteria: every Must requirement passes its acceptance criterion (see the
traceability table), engine unit tests pass, Lighthouse mobile scores 90+ on the
preview, and the JS budget is met.

### Phase 3 result (2026-10-18): in review

| Exit criterion | Result |
| --- | --- |
| Every Must requirement | Built. Each one is checked by unit tests and/or the browser smoke test (see the traceability table). |
| Unit tests | 41 pass (`npm test`): 27 engine, 14 store and persistence. Two deliberate rule mutations were each caught. |
| End-to-end | `npm run smoke` plays a full night in headless Chromium at 360×800 with the production CSP. It covers setup through recap, including refresh restore, Undo, swipe-to-flip, and the adult opt-in. There are no console errors, and it passed on repeated runs. |
| JS budget (D-18) | 102.2 KB gzipped on first load, out of 150 KB, with the first 150 cards. It's 107.7 KB with the full 310-card deck. Animation features (30.8 KB) and info pages (1.4 KB) load lazily. |
| Lighthouse mobile | 97 Performance · 100 Accessibility · 100 Best Practices · 100 SEO, on a local `vite preview` with simulated mobile throttling. FCP 2.0 s, TBT 0 ms, CLS 0.003. |
| Vercel preview URL | **Done.** Live at https://spill-or-shot.vercel.app/ and auto-deploys from `main`. |
| Budget Android smoke test | **Not done.** It needs a real phone and moves to Phase 4. |

**Rules the build settled.** None of these change a decision; they fill gaps the
decisions didn't cover.

- **Water Breaks and turns:** a Water Break doesn't use up a turn. Whoever is holding the
  phone taps Done, and the turn order carries on.
- **Skips:** a skipped card is replaced face up, because the same reader is still holding
  the phone.
- **Undo after a Water Break:** it goes back past the Water Break to the last real card.
- **Changing decks mid-night:** this keeps players and scores and rebuilds the deck. Undo
  history is cleared.
- **Help links:** the scoreboard sheet links to How to Play, Drink Responsibly, and Terms,
  so they can be reached mid-game. The mocks didn't show these links.

---

## Phase 4 — Playtest (1 week)

**Goal:** real tables, real feedback, and 300+ cards.

Tasks:

1. Run 4–5 real inuman sessions across the PRD §4 personas: barkada, reunion, office
   crew, couples.
2. Collect per session:
   - facilitator notes on cards that fell flat, confused people, or got skipped
   - anonymous preview analytics, if D-16 is turned on for the preview
3. Rewrite or cut weak cards. The PRD §13 target is a skip rate under 15% per card.
4. Write the remaining ~160 cards to reach 310 (PRD §6), using the same validation and
   review log.
5. Test on budget Android phones: flip smoothness and readability in a dim room.
6. Time "open link to first card" against the 20-second target.
7. Fix bugs and UX friction found at the table.
8. Make the final No Filter call for v1 (D-03).

Exit criteria: 300+ cards pass validation, first card under 20 seconds in testing, no
open blocking bugs, and the No Filter decision is made.

### Phase 4 progress (2026-10-18)

The parts that don't need people at a table are done. The rest needs Rhon.

| Task | Status |
| --- | --- |
| 4. Write the remaining ~160 cards | **Done.** 310 cards pass validation, each deck at its PRD §6 count, and type mix on target. 30 cards were rewritten after a local-context check. See [content-review.md](./content-review.md#batch-2-phase-4-launch-deck-160-cards). |
| Playtest kit | **Done.** [PLAYTEST.md](./PLAYTEST.md) (protocol, measures, device checklist, No Filter test), [playtest-log.md](./playtest-log.md) (blank results sheet), and `npm run card` to look up a card from its first words. |
| 6. Time open-to-first-card | **Partly.** The smoke test now runs the fastest path in 0.4 s with names typed instantly. That's a floor; the real number needs a stopwatch with a real group. |
| 1–2. Run 4–5 sessions and collect notes | **Needs Rhon.** |
| 3. Rewrite or cut weak cards | **Waiting on the sessions.** |
| 5. Budget Android test | **Needs a real phone.** |
| 7. Fix bugs found at the table | **Waiting on the sessions.** |
| 8. No Filter go/no-go (D-03) | **Waiting on the sessions** (test in PLAYTEST.md §7). |

Per-card skip rates can't be measured by 4–5 sessions (about 150 of 310 cards get seen),
so card feedback is qualitative until the Phase 5 analytics are live.

---

## Phase 5 — Launch (3–4 days)

**Goal:** production site live, safe, and measurable.

Tasks:

1. Domain (D-05) and the Vercel production deploy over HTTPS.
2. Legal and info pages (PRD §12):
   - Terms: entertainment only, the site doesn't sell alcohol, players are responsible
     for themselves
   - Drink Responsibly
   - About
3. Turn on cookie-free analytics (D-16).
4. Final audits:
   - Lighthouse mobile 90+
   - WCAG AA contrast, plus a manual pass with a screen reader
   - JS budget
   - repeat visit on throttled 3G
5. Launch checklist:
   - [ ] 18+ gate and pledge on entry
   - [ ] Every card skippable
   - [ ] "Shot" defined as a small tagay-sized pour in How to Play
   - [ ] No alcohol brand names or logos anywhere
   - [ ] Marketing copy doesn't target minors
   - [ ] Player names never leave the device (check network requests)
6. Share with barkadas and socials (if D-02 is a real launch).

Exit criteria: production is live and every checklist item is ticked.

---

## Phase 6 — v1.1 / v2 (after launch)

Not planned in detail until the first launch metrics come in (PRD §13). The order comes
from PRD §7:

- **v1.1:**
  - custom cards (F17)
  - favorite and report a card — **done (2026-10-18, D-25).** A face-up card can be
    hearted or flagged; both are device-only, and the recap lists tonight's favorites.
  - sound effects and haptics — **done (2026-10-18, D-26).** Web Audio tones on
    flip/spill/shot/water, plus Android vibration, with off switches in Scores.
  - PWA install and offline play — **done early (2026-10-18).** A hand-written
    service worker (`scripts/build-sw.ts` + `scripts/sw-template.js`) precaches the
    whole app on first visit, so the game installs to the home screen and keeps
    working with no signal. A web manifest and icons ship in `public/`, and an
    "Update ready" / "Ready to play offline" banner handles new versions. The smoke
    test loads the app with the network cut to prove it boots offline. Adds about
    0.6 KB to first-load JS.
- **v2:**
  - room codes (Supabase Realtime)
  - shareable custom decks
  - seasonal decks
  - non-alcoholic mode
  - hosted card library with skip and spill analytics

Each release gets its own plan and gate when it's picked up.

---

## Requirements traceability

| ID | Requirement | Priority | Built in | Notes | Verified by (Phase 3) |
| --- | --- | --- | --- | --- | --- |
| F1 | Age gate | Must | 3.2 | 30-day memory | Store tests (30-day expiry, under-18 not saved), smoke |
| F2 | Player setup | Must | 3.2 | 2–12, no duplicates | Store tests (limits, duplicates, rename), smoke |
| F3 | Tanggero | Must | 3.3 | D-13 for counting | Engine test (rotation every 10 completed cards, skips ignored), smoke (badge) |
| F4 | Deck select | Must | 3.2 | D-14 for the opt-in trigger | Store test, smoke (No Filter confirmation) |
| F5 | Intensity filter | Must | 3.2 (UI), 3.3 (engine) | D-15 for the minimum pool | Engine test (never above filter), smoke (Start disabled under 10) |
| F6 | Turn order | Must | 3.3 | | Engine test, smoke |
| F7 | Card draw | Must | 3.3 | Motion spec from Phase 2 | Smoke (tap and swipe flip). 320 ms flip in tokens; not timed on a real device |
| F8 | Name substitution | Must | 3.3 | D-08 | Engine tests ({p1} ≠ {p2} ≠ reader over 200 seeds, resolved once), smoke (same text after reload) |
| F9 | Shuffle | Must | 3.3 | | Engine test (every card once, then reshuffle) |
| F10 | Spill / Shot | Must | 3.3 | D-09, D-10, D-11 | Engine tests for every card type, smoke |
| F11 | Skip | Must | 3.3 | D-13 | Engine test, smoke |
| F12 | Pacing | Must | 3.4 | D-12 | Engine tests (12–15 cadence, soft cap once, re-fires after Undo), smoke |
| F13 | Scoreboard | Must | 3.4 | | Smoke |
| F14 | Recap | Should | 3.4 | D-19 | Engine tests (awards, ties, hidden when empty), smoke |
| F15 | Persistence | Must | 3.1 (store), 3.4 (restore check) | | Store tests (round trip, stale cards, corrupt data, old versions), smoke (reload mid-game) |
| F16 | Undo | Should | 3.4 | | Engine tests (full restore, across a Water Break), smoke |
| F17 | Custom cards | v1.1 | 6 | Out of MVP | Not built |

| Quality bar (PRD §11) | Planned in | Verified in | Phase 3 result |
| --- | --- | --- | --- |
| Lighthouse mobile 90+ | 3.1 | 3.5, 5 | 97 / 100 / 100 / 100 locally; re-run on the live site in Phase 5 |
| WCAG AA contrast | 2 | 5 | 46 color pairs pass (`npm run check:contrast`). Lighthouse a11y 100. Manual screen-reader pass still due in Phase 5 |
| JS bundle under 150 KB (D-18) | 3.1 | 3.5, 5 | 114.6 KB gzipped with all 360 cards, seating, Tanggero pick, and icons, enforced in CI |
| Playable on 3G after first load | 3.1 | 5 | Not yet tested |
| Smooth on budget Android | 2 (motion spec) | 3.5, 4 | Not yet tested on a device |

## Risk coverage (PRD §15)

| Risk | Handled in |
| --- | --- |
| Questions feel generic or Western | 1 (context check per card), 4 (local playtests) |
| Content looks copied | 1 (original-only rule, review log) |
| Excessive drinking | 3.3–3.4 (pacing, counters, soft cap, skip), D-10 |
| Underage users | 3.2 (age gate), 5 (terms, marketing rules) |
| No Filter deck goes too far | 1 (content rules), 3.2 (second opt-in, D-14), 4 (go/no-go), v1.1 (report button) |
| Lag on budget phones | 2 (motion spec), 3.5 and 4 (device tests, reduced motion) |
| Scope creep | Every phase (scope freeze, decisions log) |
