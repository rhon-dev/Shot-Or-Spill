# Decisions Log

This is the Phase 0 deliverable. Every item starts as **Proposed**. Rhon marks each one
**Accepted**, **Changed** (with the new answer), or **Deferred**. If an accepted decision
changes what the PRD says, update [PRD.md](./PRD.md) and bump it to v0.3.

Statuses: Proposed · Accepted · Changed · Deferred

---

## A. PRD open questions (PRD §16)

| ID | Question | Proposal | Blocks | Status |
| --- | --- | --- | --- | --- |
| D-01 | Name | Keep **Shot or Spill**. It matches the SPILL / SHOT buttons one-to-one and is easy to say at a loud table. Check the domain and main social handles before locking it. The GitHub repo is named `Spill-Or-Shot`, the reverse order, so pick one order and use it for the repo, domain, and handles. | Phase 2 (brand) | Proposed |
| D-02 | Launch goal | Build it as a **real launch** that also works as a portfolio piece. Same codebase either way, and it keeps social promotion on the table for Phase 5. | Phase 5 | Proposed |
| D-03 | No Filter deck in v1 | **Ship in v1** behind the second opt-in. Make a final go/no-go call after the Phase 4 playtests. | Phase 1 (card split) | Proposed |
| D-04 | Monetization | **Free at launch.** Cards stay as data, so paid seasonal decks are possible later. Build nothing for payments now. | None | Proposed |
| D-05 | Domain | **.com** first, **.app** as fallback (.app is HTTPS-only, which Vercel handles). Skip .ph for v1. | Phase 5 | Proposed |

## B. Already settled

| ID | Decision | Reason | Status |
| --- | --- | --- | --- |
| D-06 | Framework: **Vite + React + TypeScript** (one of the two PRD §11 options) | Static game with no server rendering needs; lighter setup and an easier path to the 150 KB JS budget | Accepted |
| D-07 | Keep common Filipino terms (barkada, tita, pulutan, videoke, tanggero) in English card text | Already allowed by the PRD §9 writing rules; it's how Filipinos speak English and it carries the product identity | Accepted |

## C. Gaps found in PRD v0.2

These came up while planning the game engine. Each one needs an answer before the phase
it blocks.

| ID | Gap | Proposal | Blocks | Status |
| --- | --- | --- | --- | --- |
| D-08 | **Placeholders.** §7 and F8 list `{p1}`, `{p2}`, `{tanggero}`, but the §9 `target` field and every sample only use `{p1}`. | Support all three. `{p1}` and `{p2}` are filled with two different players, neither of them the reader. Cards that use `{p2}` are only drawn when there are 3+ players. Any card that uses `{p1}` sets `target: "p1"`. | Phase 1 (schema) | Proposed |
| D-09 | **Who gets logged.** F10 logs per player, but on a "{p1}, what's…" card the named player answers, not the reader. "The Tanggero picks who answers next" cards have no defined answerer. | Log Spill/Shot to whoever **answers**: the reader for `current`, the named player for `p1`. On `tanggero` cards, show a quick player picker and log to the picked player. Either way, the turn passes from the reader as normal. | Phase 2, 3 | Proposed |
| D-10 | **Group cards.** On Everyone Who and Most Likely To cards, several people drink, but F13 counters and the F12 soft cap depend on per-player shot counts. | After a group card, show a **"Who drank?"** row of player chips (tap to toggle) and a Done button. Log 1 shot for each selected player. No spill is logged. Without this, shot counts undercount and the soft cap stops working. | Phase 2, 3 | Proposed |
| D-11 | **Hot Seat logging.** One player answers 3 questions, and each skipped question costs a shot. | Show a **"Shots taken: 0–3"** stepper for the hot-seat player. Log that number of shots, and count each answered question as a spill. | Phase 2, 3 | Proposed |
| D-12 | **Water Break source.** §5 says ~5% of each deck is Water Break cards. F12 says one appears automatically every 12–15 cards. | Water Break cards are **not shuffled into the deck**. The engine inserts one after a random 12–15 completed cards and picks its text from the Water Break cards. Writers still write them so the text varies. That cadence works out to about 7% of cards, a little above the 5% share; F12 takes priority because it's a Must. | Phase 1, 3 | Proposed |
| D-13 | **Skip and counters.** F11 doesn't say whether a skip passes the phone or counts toward Tanggero rotation (F3) and pacing (F12). | A skip gives the **same player a new card**. The skipped card is done for this cycle, so it won't repeat (F9). Skips and Water Breaks **don't count** toward Tanggero rotation or Water Break cadence. Only completed cards do. | Phase 3 | Proposed |
| D-14 | **Adult opt-in trigger.** F4 only asks for confirmation on the No Filter deck, but Love Life has intensity-3 cards that show up whenever the No Filter intensity is selected. | Show the adult confirmation when the No Filter deck **or** the No Filter intensity is selected. | Phase 2, 3 | Proposed |
| D-15 | **Empty or tiny card pools.** Some combinations draw nothing. For example, Chill intensity with only the No Filter deck leaves zero cards. | Show a live **eligible card count** on deck select. Disable Start below a minimum (proposed: 10 cards) and show a hint explaining why. | Phase 2, 3 | Proposed |
| D-16 | **Analytics in v1.** The §13 metrics (spill rate, skip rate per card, cards per session) need anonymous events, but the §7 MVP list doesn't include analytics. | Add cookie-free analytics in v1. Choose **Plausible or Umami**. Track anonymous events only: `session_start`, `card_drawn`, `card_resolved` (spill/shot), `card_skipped`, `session_end`. Events carry card id, deck, and type. They never include player names. | Phase 3 (wrapper), 5 (live) | Proposed |
| D-17 | **Shares metric.** "Organic shares (link copies): 1 in 5 sessions" needs a share action, and none is in MVP scope. | Either add a small **Share the game** button on Recap (Web Share, falling back to copy link) or drop the metric. Owner's call, because it's a scope addition. | Phase 2 | Proposed |
| D-18 | **JS budget.** "Under 150 KB" doesn't say whether that's raw or gzipped. | **150 KB gzipped** for the JS needed on first load, checked in CI. Framer Motion is the biggest risk, so load only the animation features the app uses. | Phase 3 | Proposed |
| D-19 | **Recap awards.** F14 names "Most Honest," "Most Secretive," and "Biggest Tea" but doesn't define them. | **Most Honest** = most spills. **Most Secretive** = most shots taken by choice, not counting group-card shots. **Biggest Tea** = most spills on intensity-3 or Double Down cards. Ties are shared. If nobody qualifies, the award is hidden. | Phase 2, 3 | Proposed |

---

## Phase 0 sign-off

Phase 0 is done when:

- [ ] Every item above is Accepted, Changed, or Deferred, with nothing still Proposed
- [ ] The items that block Phase 1 (D-03, D-08, D-12) are resolved first
- [ ] Name availability is checked (domain + social handles) for D-01
- [ ] PRD.md is updated to v0.3 if any decision changed it
