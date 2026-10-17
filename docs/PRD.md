# Shot or Spill — Product Requirements Document

A Filipino barkada drinking card game for adults (18+)

Draft v0.2 | Owner: Rhon | Status: For review

> This file is the source of truth for scope. The phase plan, architecture, and decisions
> log all follow it. If something here changes, bump the version and log why in
> [DECISIONS.md](./DECISIONS.md).

---

## 1. Summary

Shot or Spill is a mobile-first web game for one phone passed around the table at an
inuman. Each card asks a player a personal, funny, or awkward question. They either
answer honestly (spill) or take a shot. Every card is in English and written around
Filipino life: barkada, tagay, titas, exes, situationships, videoke, family group chats,
and office drama.

**Core loop:** Draw a card → read it out loud → spill or shot → pass the phone.

**Positioning:** Truth or Drink, made for the Filipino barkada. No install, no account,
no ads.

### What changed from v0.1

| v0.1 | v0.2 |
| --- | --- |
| General prompt deck with mixed mechanics | One clear core mechanic: Answer or Take a Shot |
| Pinoy pack was one pack among several | Filipino culture is the identity of the whole product |
| English + Taglish | English only (Filipino references, no Tagalog card text) |
| Mild to wild, mixed ages | 18+ only, with adult themes on purpose |
| 4 loosely defined packs | 5 decks with a clear intensity ladder |
| No drink tracking | Shot counter, pacing, and water-break cards |

## 2. Problem and Opportunity

- Filipino inuman is a social ritual: one glass, one tanggero pouring, and stories that
  run until 3 AM. No digital game is built for it.
- Popular Truth or Drink decks (the BuzzFeed-style lists, Cut's card game) are Western.
  Questions about prom, college frats, or Thanksgiving don't land at a Manila or Cebu
  table.
- Group nights stall when nobody can think of a good question, and the same people end
  up talking all night.

**Opportunity:** a game that feels local and adult, and that you can start in 20 seconds
on any phone.

## 3. Goals and Non-Goals

### Goals

- A group goes from opening the link to the first card in under 20 seconds.
- The questions are good enough that players choose to answer more often than they
  drink (target: 60%+ spill rate).
- Launch with 300+ original cards across 5 decks.
- Card flips stay smooth on budget Android phones (the real device at most inuman
  tables).
- Responsible drinking is part of the game design itself, not just a disclaimer.

### Non-Goals (v1)

- Accounts, payments, ads
- Multi-phone sync
- Tagalog or Taglish card text
- Alcohol brand partnerships or promotion
- Explicit sexual content (adult themes are fine, graphic content is not)

## 4. Target Users

| Persona | Setting | What they want |
| --- | --- | --- |
| Barkada host (22–30) | Condo or house inuman, 4–8 people | Instant start, cards that get the group laughing |
| Old friends reunion (25–35) | Homecoming, batch reunion | Nostalgia, tea about exes and old crushes |
| Office crew (23–35) | After-work bar, team night out | Funny but not career-ending; a safer deck |
| Couples / close friends (21+) | Quiet night in, 2–4 people | Deeper and spicier personal questions |

## 5. Gameplay

### Basic rules (shown on the How to Play screen)

1. Pass the phone. Whoever holds it draws the card.
2. Read the card out loud.
3. Spill (answer honestly) or Shot (drink and keep your secret).
4. The group decides whether an answer is too vague. If it is, that person drinks.
5. Tap Spill or Shot, then pass the phone to the next player.

### The Tanggero

To match the real inuman ritual, the app picks a Tanggero (the one who pours) at the
start of the game and rotates the role every 10 cards. The Tanggero shows up in some
cards ("The Tanggero picks who answers next").

### Card types

| Type | How it works | Share of deck |
| --- | --- | --- |
| Spill or Shot | One player answers the question or drinks | ~60% |
| Everyone Who… | Everyone it applies to drinks ("Everyone who has stalked an ex's new partner, drink") | ~15% |
| Most Likely To | Everyone points on 3; whoever gets the most votes drinks or explains | ~10% |
| Hot Seat | Group asks one player 3 questions in a row; one shot covers a skip | ~5% |
| Double Down | Answer, or take 2 shots instead of 1 (rare, high-tea questions) | ~5% |
| Water Break | Everyone drinks water, no exceptions (pacing card) | ~5% |

## 6. Decks

| Deck | Intensity | Theme | Cards |
| --- | --- | --- | --- |
| Warm Up | 1 | Light icebreakers, food, habits, childhood | 60 |
| Barkada Tea | 2 | Friendships, group chat secrets, old crushes, betrayals | 70 |
| Love Life | 2–3 | Exes, situationships, ghosting, "talking stage," jealousy | 70 |
| Family & Adulting | 2 | Titas, family pressure, work, money, salary | 50 |
| No Filter 🔞 | 3 | Bold adult questions, body count, regrets, confessions | 60 |

- Players can mix decks.
- No Filter needs a second confirmation ("Everyone here is okay with adult questions").
- Intensity filter: Chill / Spicy / No Filter. Cards above the selected level never
  appear.

## 7. Scope

### MVP (v1)

- 18+ age gate with a responsible-drinking pledge
- Player setup (2–12 names), Tanggero assigned
- Deck and intensity selection
- Game screen: card flip, swipe for next, Spill / Shot buttons
- Player name substitution (`{p1}`, `{p2}`, `{tanggero}`)
- No repeated cards until the deck runs out
- Skip card (no penalty, always visible)
- Shot counter per player, shown on a scoreboard
- Pacing: automatic Water Break cards and a soft warning when a player reaches a shot
  threshold
- End-of-night recap ("Most Honest," "Most Secretive," "Biggest Tea")
- How to Play, About, and Drink Responsibly pages
- Game state saved locally so a refresh doesn't lose progress

### v1.1

- Custom cards (inside jokes), stored locally
- Favorite and report a card
- Sound effects and haptics
- PWA install and offline play

### v2

- Room codes: every phone shows the same card
- Shareable custom decks via link
- Seasonal decks (Christmas reunion, Holy Week, wedding afterparty)
- Non-alcoholic mode (shots become forfeits)
- Hosted card library with analytics on skip and spill rates

## 8. Functional Requirements

| ID | Requirement | Acceptance criteria | Priority |
| --- | --- | --- | --- |
| F1 | Age gate | Blocks the app until 18+ is confirmed; remembered for 30 days | Must |
| F2 | Player setup | Add, edit, and remove 2–12 players; no duplicate names | Must |
| F3 | Tanggero | Randomly assigned at start; rotates every 10 cards; shown on screen | Must |
| F4 | Deck select | One or more decks; No Filter needs a second confirmation | Must |
| F5 | Intensity filter | No card above the selected intensity is ever drawn | Must |
| F6 | Turn order | Current player is shown; advances after Spill or Shot | Must |
| F7 | Card draw | Flip animation under 400 ms; swipe and tap both work | Must |
| F8 | Name substitution | `{p1}`, `{p2}` filled with different players, never the current reader unless intended | Must |
| F9 | Shuffle | No repeats until all eligible cards are drawn, then reshuffle prompt | Must |
| F10 | Spill / Shot | Logs the choice per player and updates the counter | Must |
| F11 | Skip | Draws a new card, nothing logged | Must |
| F12 | Pacing | Water Break every 12–15 cards; soft warning at a configurable shot count (default 6) | Must |
| F13 | Scoreboard | Shot and spill counts per player, open at any time | Must |
| F14 | Recap | Summary screen with fun awards when the game ends | Should |
| F15 | Persistence | Refreshing restores players, deck position, and scores | Must |
| F16 | Undo | Reverts the last Spill/Shot action | Should |
| F17 | Custom cards | Create, edit, and delete local cards | v1.1 |

## 9. Content System

### Card schema

```json
{
  "id": "love-031",
  "deck": "love-life",
  "type": "spill_or_shot",
  "intensity": 2,
  "target": "current",
  "text": "Have you ever gone back to an ex after swearing to the whole barkada you wouldn't?",
  "shots": 1,
  "tags": ["ex", "barkada"]
}
```

- `type`: `spill_or_shot` | `everyone_who` | `most_likely` | `hot_seat` | `double_down` | `water_break`
- `target`: `current` | `p1` | `group` | `tanggero`

### Writing rules

- English only. Filipino culture comes through situations and references, not Tagalog
  text. Common local terms that Filipinos use in English (barkada, tita, pulutan,
  videoke, jeepney, balikbayan) are allowed.
- 100% original. BuzzFeed, BeerBaller, and similar lists are references for format and
  tone only. No copied or lightly reworded questions.
- Each question must be answerable at the table, out loud, within 60 seconds.
- No cards that require phones, posting, calling, or messaging someone.
- No cards that target a specific person's looks, weight, religion, or sexuality in a
  mocking way.
- No physical dares, nudity, or touching.
- Shots stay at 1 per card (2 max for Double Down).
- Every card is skippable.

### Sample cards

**Warm Up**

- "What's your most embarrassing videoke song choice, and did you finish it?"
- "Everyone who has secretly eaten the last piece of pulutan and blamed someone else,
  drink."

**Barkada Tea**

- "Who in this group would you NOT trust to keep a secret? Say it or take a shot."
- "Most likely to leave the group chat on 'seen' for three days. Point on 3."

**Love Life**

- "Have you ever stayed in a situationship longer than a real relationship?"
- "{p1}, what's the most 'delulu' thing you've done for a crush?"

**Family & Adulting**

- "What's the most awkward question a tita asked you at a family reunion, and how did
  you answer?"
- "Would you tell this group your actual monthly salary? Spill or shot."

**No Filter 🔞**

- "What's the biggest secret you've kept from your current or last partner?"
- "Hot Seat: {p1} answers three questions from the group about their last relationship.
  One shot skips one."

## 10. UX and Design

### Flow

Age Gate → Add Players → Pick Decks + Intensity → How to Play (first time only) → Game →
Recap

### Game screen (top to bottom)

1. Current player name and Tanggero badge
2. The card (big, centered, high contrast)
3. Two large buttons: SPILL and SHOT
4. Small actions: Skip, Undo, Scoreboard

### Design principles

- One-handed use, thumb-zone buttons, 48px+ tap targets
- Readable in a dim room after a few drinks: big type, strong contrast
- Card text auto-resizes for long questions
- Reduced-motion setting for low-end phones

### Visual direction

- Mood: Filipino night out: sari-sari store neon, tarpaulin typography, fiesta energy
- Palette: near-black background, hot pink (Spill), amber (Shot), teal accents
- Type: chunky display font for cards, clean sans for UI
- Card back: neon "SHOT or SPILL" mark with bunting or a tagay-glass motif
- Each deck has its own accent color so players can tell decks apart at a glance

## 11. Technical Approach

| Layer | Choice |
| --- | --- |
| Framework | Next.js (static export) or Vite + React |
| Styling | Tailwind CSS |
| Animation | Framer Motion (flip, swipe) |
| State | Zustand, persisted to localStorage |
| Content | JSON per deck, validated with Zod at build time |
| Hosting | Vercel |
| Analytics | Plausible or Umami (cookie-free, anonymous) |
| v2 backend | Supabase Realtime for rooms |

**Quality bar:** Lighthouse mobile 90+, WCAG AA contrast, JS bundle under 150 KB,
playable on a 3G connection after first load.

**Privacy:** No accounts. Player names never leave the device. Analytics only track
anonymous events (card drawn, spill or shot, skip) to find weak cards.

## 12. Safety, Legal, and Responsible Drinking

- 18+ gate on entry (the legal drinking age in the Philippines is 18). Check local rules
  if you launch anywhere else.
- Pledge on start: "No one drives tonight. Skipping is always okay. Drink water."
- Built-in pacing: Water Break cards, per-player shot counters, and a soft cap warning
  ("Juan, that's 6. Water round for you?").
- A "shot" is defined in How to Play as a small tagay-sized pour, not a full glass.
- Every card can be skipped, no questions asked.
- Terms page: entertainment only, the site doesn't sell alcohol, players are
  responsible for themselves.
- A report-a-card button in v1.1.
- Marketing never targets minors and never uses brand logos or alcohol brand names.

## 13. Success Metrics (first 60 days)

| Metric | Target |
| --- | --- |
| Landing to first card | < 20 seconds |
| Cards per session (median) | 30+ |
| Session length | 25+ minutes |
| Spill rate | 60%+ (people want to answer) |
| Skip rate per card | < 15% (higher means the card gets rewritten) |
| 14-day return rate | 25%+ |
| Organic shares (link copies) | 1 in 5 sessions |

## 14. Milestones

| Phase | Output | Time |
| --- | --- | --- |
| 0. Lock decisions | Name, visuals, open questions answered | 2 days |
| 1. Content v1 | Writing guide + 150 cards | 1 week |
| 2. Design | Brand, card back, 6 key screens in Figma | 1 week |
| 3. Build MVP | Setup, game loop, counters, recap | 2 weeks |
| 4. Playtest | 4–5 real inuman sessions, cut weak cards, reach 300 | 1 week |
| 5. Launch | Deploy, legal pages, share with barkadas and socials | 3–4 days |
| 6. v1.1 / v2 | Custom cards, PWA, then rooms | After launch |

## 15. Risks and Mitigations

| Risk | Mitigation |
| --- | --- |
| Questions feel generic or Western | Filipino context check on every card; playtest with local groups |
| Content looks copied | Original-only rule, review log per deck |
| Excessive drinking | Pacing cards, counters, soft caps, skip always allowed |
| Underage users | Age gate, terms, no marketing to minors |
| No Filter deck goes too far | Clear content rules, second opt-in, report button |
| Lag on budget phones | Test on low-end Android, reduced-motion mode |
| Scope creep | Freeze the MVP list; everything else goes to v1.1 or v2 |

## 16. Open Questions

1. Name: keep Shot or Spill, or other options (Tagay or Tell, Spill the Tagay, Inuman
   Cards)?
2. Launch goal: portfolio piece first, or a real launch with social promotion?
3. No Filter deck: in v1, or held back for v1.1 after playtesting?
4. Monetization later: always free, or paid seasonal decks?
5. Domain: .com, .ph, or a .app domain?

Proposed answers, plus gaps found while planning the build, are tracked in
[DECISIONS.md](./DECISIONS.md).
