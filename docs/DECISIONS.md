# Decisions Log

This log is the Phase 0 deliverable. Each item is marked **Accepted**, **Changed** (with
the new answer), or **Deferred**. Accepted decisions that change the PRD are already
folded into [PRD.md](./PRD.md) v0.3.

Statuses: Proposed · Accepted · Changed · Deferred

**Phase 0 result (2026-10-17):** Rhon accepted every proposal. D-17 had no default, so it
is Deferred to Phase 2.

---

## A. PRD open questions (PRD §16)

| ID | Question | Decision | Blocks | Status |
| --- | --- | --- | --- | --- |
| D-01 | Name | **Shot or Spill.** It matches the SPILL / SHOT buttons one-to-one and is easy to say at a loud table. Follow-ups: the GitHub repo is named `Spill-Or-Shot`, the reverse order, and the social handles still need to be checked by hand (see below). | Phase 2 (brand) | Accepted |
| D-02 | Launch goal | A **real launch** that also works as a portfolio piece. It's the same codebase either way, and it leaves room for social promotion in Phase 5. | Phase 5 | Accepted |
| D-03 | No Filter deck in v1 | **Ship it in v1** behind the second opt-in. Make the final go/no-go call after the Phase 4 playtests. | Phase 1 (card split) | Accepted |
| D-04 | Monetization | **Free at launch.** Cards are stored as data, so paid seasonal decks stay possible later. Nothing gets built for payments now. | None | Accepted |
| D-05 | Domain | **shotorspill.com** first, with **shotorspill.app** as the fallback (.app is HTTPS-only, which Vercel handles). Skip .ph for v1. Register the domain soon, because availability can change at any time. | Phase 5 | Accepted |

### Name availability check (Phase 0, 2026-10-17)

Checked against the .com registry (Verisign whois) and the .app registry (Google RDAP).
The known-taken control domains (`google.com`, `web.app`) came back as taken, so the check
works. Pricing, including premium-domain pricing, wasn't checked.

| Name | .com | .app |
| --- | --- | --- |
| shotorspill | Unregistered | Unregistered |
| spillorshot | Unregistered | Unregistered |
| tagayortell | Unregistered | Unregistered |
| spillthetagay | Unregistered | Not checked |
| inumancards | Unregistered | Not checked |

Social handles on Instagram, TikTok, Facebook, and X were **not checked**, because those
sites block automated lookups. Rhon will check them by hand before Phase 2 brand work.

## B. Already settled

| ID | Decision | Reason | Status |
| --- | --- | --- | --- |
| D-06 | Framework: **Vite + React + TypeScript** (one of the two PRD §11 options) | It's a static game with no server rendering. The setup is lighter, and the 150 KB JS budget is easier to hit. | Accepted |
| D-07 | Keep common Filipino terms (barkada, tita, pulutan, videoke, tanggero) in English card text | The PRD §9 writing rules already allow it. It's how Filipinos speak English, and it carries the product's identity. | Accepted |

## C. Gaps found in PRD v0.2

These came up while planning the game engine.

| ID | Gap | Decision | Blocks | Status |
| --- | --- | --- | --- | --- |
| D-08 | **Placeholders.** §7 and F8 list `{p1}`, `{p2}`, and `{tanggero}`, but the §9 `target` field and every sample use only `{p1}`. | Support all three. `{p1}` and `{p2}` are filled with two different players, and neither is the reader. Cards that use `{p2}` are only drawn when there are 3 or more players. Any card that uses `{p1}` sets `target: "p1"`. | Phase 1 (schema) | Accepted |
| D-09 | **Who gets logged.** F10 logs per player, but on a "{p1}, what's…" card the named player answers, not the reader. "The Tanggero picks who answers next" cards have no defined answerer. | Log Spill or Shot to whoever **answers**: the reader for `current` cards, the named player for `p1` cards. On `tanggero` cards, show a quick player picker and log to the player picked. The turn still passes from the reader as normal. | Phase 2, 3 | Accepted |
| D-10 | **Group cards.** On Everyone Who and Most Likely To cards, several people drink, but the F13 counters and the F12 soft cap depend on per-player shot counts. | After a group card, show a **"Who drank?"** row of player chips (tap to toggle) and a Done button. Log 1 shot for each selected player and no spill. Without this step, shot counts come out too low and the soft cap stops working. | Phase 2, 3 | Accepted |
| D-11 | **Hot Seat logging.** One player answers 3 questions, and each skipped question costs a shot. | Show a **"Shots taken: 0–3"** stepper for the hot-seat player. Log that number of shots, and count each answered question as a spill. | Phase 2, 3 | Accepted |
| D-12 | **Water Break source.** §5 says about 5% of each deck is Water Break cards, but F12 says one appears automatically every 12–15 cards. | Water Break cards are **not shuffled into the deck**. The engine inserts one after a random 12–15 completed cards and takes its text from the Water Break cards. Writers still write them so the text varies. At that cadence, Water Breaks come out to about 7% of cards, slightly above the 5% share. F12 is a Must, so its cadence wins. | Phase 1, 3 | Accepted |
| D-13 | **Skip and counters.** F11 doesn't say whether a skip passes the phone, or whether it counts toward Tanggero rotation (F3) and pacing (F12). | A skip gives the **same player a new card**. The skipped card is used up for this cycle, so it won't repeat (F9). Skips and Water Breaks **don't count** toward Tanggero rotation or the Water Break cadence. Only completed cards do. | Phase 3 | Accepted |
| D-14 | **Adult opt-in trigger.** F4 only asks for confirmation on the No Filter deck, but Love Life has intensity-3 cards that appear whenever the No Filter intensity is selected. | Show the adult confirmation when the No Filter deck **or** the No Filter intensity is selected. | Phase 2, 3 | Accepted |
| D-15 | **Empty or tiny card pools.** Some combinations draw nothing. For example, Chill intensity with only the No Filter deck leaves zero cards. | Show a live **eligible card count** on deck select. Disable Start below 10 cards, with a hint explaining why. | Phase 2, 3 | Accepted |
| D-16 | **Analytics in v1.** The §13 metrics (spill rate, skip rate per card, cards per session) need anonymous events, but the §7 MVP list doesn't include analytics. | Add cookie-free analytics in v1, either **Plausible or Umami** (pick one in Phase 5). Track anonymous events only: `session_start`, `card_drawn`, `card_resolved` (spill or shot), `card_skipped`, and `session_end`. Events carry card id, deck, and type, and never player names. | Phase 3 (wrapper), 5 (live) | Accepted |
| D-17 | **Shares metric.** The "Organic shares (link copies): 1 in 5 sessions" metric needs a share action, and none is in MVP scope. | Two options: add a small **Share the game** button on Recap (Web Share, falling back to copy link), or drop the metric. This is the owner's call because it adds scope. **Deferred to Phase 5.** It still had no answer at the Phase 2 gate, so the MVP follows the PRD §7 list: Recap ships **without** a Share button, and the shares metric can't be measured until this is decided. | Phase 5 | Deferred |
| D-18 | **JS budget.** "Under 150 KB" doesn't say whether that's raw or gzipped. | **150 KB gzipped** for the JS needed on first load, checked in CI. Framer Motion is the biggest risk, so load only the animation features the app uses. | Phase 3 | Accepted |
| D-19 | **Recap awards.** F14 names "Most Honest," "Most Secretive," and "Biggest Tea" but doesn't define them. | **Most Honest** goes to whoever has the most spills. **Most Secretive** goes to whoever took the most shots by choice, not counting group-card shots. **Biggest Tea** goes to whoever has the most spills on intensity-3 or Double Down cards. Ties are shared, and an award is hidden when nobody qualifies. | Phase 2, 3 | Accepted |

## D. Added after Phase 0

| ID | Topic | Decision | Phase | Status |
| --- | --- | --- | --- | --- |
| D-20 | **Design files.** PRD §14 says "6 key screens in Figma", but Kiro can't create or edit Figma files. | Phase 2 produces the screens as **SVG mocks in the repo** (`docs/design/`), generated from the same design tokens Phase 3 will use. SVGs import into Figma by drag and drop, so Rhon can keep refining them there. | Phase 2 | Accepted (Rhon: "approve all", Phase 2 gate) |
| D-22 | **Seating order.** Turns already went in the order players were added, but the host couldn't change it. | The host sorts players to match how the table is sitting: drag the handle, tap the up/down arrows, or use the arrow keys (WCAG 2.5.7 needs a non-drag way). Seat 1 starts, and turns and the Tanggero role go around in that order, like the tagay. The order can be changed mid-night from the scoreboard ("Change seating") without losing scores. Adding or removing someone still starts a new night. | Post-launch | Accepted (Rhon's request, 2026-10-18) |
| D-21 | **Phase 1 review items.** The table read and the owner review of flagged cards weren't done before Phase 2 started. | Move both into the Phase 4 playtests, which read real cards at real tables. Flagged cards stay in the deck until then. | Phase 1 → 4 | Accepted (Rhon: "you can continue") |

---

## Phase 0 sign-off

- [x] Every item above is Accepted, Changed, or Deferred, with nothing still Proposed
- [x] The items that block Phase 1 (D-03, D-08, D-12) are resolved
- [ ] Name availability: domains checked (all unregistered); **social handles still to be
      checked by hand** before Phase 2 brand work
- [x] PRD.md updated to v0.3

**Carried forward:**

- **D-17:** decide on the Share button before Phase 2 designs the Recap screen.
- **Social handles:** check them by hand before Phase 2.
- **Repo name:** rename the repo to match "Shot or Spill" (optional; GitHub redirects
  the old URL).
