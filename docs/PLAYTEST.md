# Playtest Guide (Phase 4)

How to run the 4–5 real inuman sessions that Phase 4 needs
([PHASES.md](./PHASES.md#phase-4--playtest-1-week)), and how to turn what you see into
card cuts and fixes. Results go in [playtest-log.md](./playtest-log.md).

**Who runs it:** Rhon, or a friend who is part of the group. I can't run these: they need
real people at real tables, and a real budget Android phone.

## What the sessions are for

| We want to know | How we find out |
| --- | --- |
| Which cards land, and which flop | Facilitator notes on cards (section 4) |
| Whether any card is too far, too vague, or too long | Notes plus the debrief (section 5) |
| Whether the app is easy for a drunk, tired group | Observation of taps, mistakes, and confusion |
| Whether the first card comes up in under 20 s | Stopwatch (section 3) |
| Whether Spill beats Shot at 60% or more | Tally per card (section 3) |
| Whether the No Filter deck stays in v1 | The go/no-go test (section 7) |

**What 4–5 sessions can't tell us.** At about 30 cards each, the sessions draw roughly
150 of the 310 cards, and most cards will be seen once or never. So a per-card skip rate
(PRD §13 target: under 15%) can't be measured yet. Treat card feedback as qualitative:
one clear flop is enough to rewrite a card. Real skip and spill rates need the
anonymous analytics that go live in Phase 5 (D-16).

## 1. Before you start

**Get the app on a phone.**

- *Quickest:* on your laptop, run `npm run dev -- --host`, and open the "Network" URL on
  the phone while both are on the same Wi-Fi.
- *Closest to launch:* connect the repo to Vercel and use the preview URL (needs your
  Vercel account; settings are ready in `vercel.json`).

**Pick the sessions.** Aim for one of each persona (PRD §4), and a fifth if you can:

| # | Persona | Group | Suggested setup | What to watch |
| --- | --- | --- | --- | --- |
| 1 | Barkada host | 4–8 friends at a condo or house | Warm Up + Barkada Tea, Spicy | The default experience; does it get the table laughing? |
| 2 | Old friends reunion | 4–8 people who haven't seen each other in a while | Barkada Tea + Love Life, Spicy | Exes and old crushes; is anything too sharp? |
| 3 | Office crew | 4–8 coworkers | Warm Up + Family & Adulting + Barkada Tea, Chill | Is it funny without being career-ending? |
| 4 | Couples / close friends | 2–4 people, 21+ | Love Life + No Filter, No Filter | Deeper cards; also tests the 18+ and No Filter confirmations |
| 5 | (optional) Mixed barkada | 6–10 | Everything, Spicy, then No Filter | Big-group flow, 10+ players, Tanggero rotation |

**Rules for every session.**

- Everyone is 18+, and everyone knows this is a test of a new game.
- Say the pledge out loud: *No one drives tonight. Skipping is always okay. Drink water.*
- Nobody is pressured to drink. The facilitator stays sober enough to watch and take
  notes.
- Use real first names or nicknames in the app. Names never leave the phone, and nothing
  in the notes needs a full name.
- If anyone looks uncomfortable, skip the card and move on. Write the card down.

## 2. Running a session (about 60 minutes)

| Time | What happens |
| --- | --- |
| 5 min | Explain the game in one sentence. Don't explain the rules: the app's How to Play screen should do that. Hand over the phone. |
| 30–35 min | Play. Aim for 30+ cards. Watch; don't help unless they're stuck, and note when you did. |
| 5 min | Check the scoreboard and recap together (this also tests the recap). |
| 10–15 min | Debrief (section 5). |

## 3. What to measure

**Stopwatch (start when the link is opened):**

- Time until the **first card is face up**, with names typed by the group. Target: under
  20 s. (My scripted run takes 0.4 s with names typed instantly, so anything above that
  is people, not the app.)
- Total session length (target: 25+ minutes).

**Counts (tally on paper as you go):**

- Cards played (the scoreboard shows "Card N").
- Skips, per card if you can.
- For **Spill or Shot** cards only: how many chose Spill, and how many chose Shot. Spill
  rate = Spill ÷ (Spill + Shot). The target is 60% or more. The scoreboard mixes in group
  shots, so a paper tally is more accurate.

**App observations (circle if it happens):**

- Someone taps the wrong button and wants to undo
- Someone doesn't know what to do on a card (which type?)
- Someone can't read the text (dim room, far away, small)
- The card flip stutters or lags
- The phone gets hot, or the battery drops noticeably
- Someone refreshes or closes the tab by accident (does the game come back?)
- A Water Break gets ignored or resented
- The 6-shot warning appears and what the table does about it

## 4. Logging cards

Write down the **first few words** of any card that gets a strong reaction, plus a
reaction code. You don't need to log every card.

| Code | Meaning | Usual verdict |
| --- | --- | --- |
| 😂 **Hit** | Big laugh, or a story that kept going | Keep. Note it as a model for new cards. |
| 😐 **Flat** | Nobody cared; answered in one word | Rewrite, or cut if it happens twice |
| ❓ **Confused** | They didn't understand the question or the card type | Rewrite |
| ⏱ **Too long** | Hard to answer in 60 seconds, or too many parts | Rewrite shorter |
| 🚫 **Too far** | Made someone uncomfortable or angry | Cut, or move to a higher intensity |
| ⏭ **Skipped** | Skipped right away | Note why; cut if skipped in 2+ sessions |

Look up a card's id from its first words:

```sh
npm run card -- "ghosted by someone"
```

## 5. Debrief questions

Ask these out loud and write down the answers in the group's own words.

1. Which card got the biggest laugh? Which one made the table go quiet?
2. Was any card too far? (No judgment: this is what we're here to find.)
3. Did the questions feel like *your* table, or like a game from somewhere else?
4. Did the Water Breaks and the 6-shot warning feel helpful, or annoying?
5. Was it easy to pass the phone and use the buttons after a few drinks?
6. Could you read the cards in this lighting?
7. Would you play again? Would you send the link to your barkada?

## 6. Device checklist (budget Android phone)

PRD §10 and §15 name the budget Android phone as the real test. Run these on a phone
that's a few years old, in Chrome, ideally in a dim room.

- [ ] Card flip looks smooth. If it stutters, turn on Reduced motion and see if it helps.
- [ ] Text is readable at arm's length in a dim room
- [ ] SPILL and SHOT are easy to hit one-handed with the thumb
- [ ] Swiping the card back flips it; swiping a face-up card left skips it
- [ ] The phone's back button closes the info pages (Terms, About) and doesn't exit the game
- [ ] Refreshing mid-game brings back the same card, the same reader, and the same scores
- [ ] Rotating the phone doesn't break the layout
- [ ] Battery and heat after 30 minutes
- [ ] **3G check (PRD §11):** load the page once, then switch to a slow connection
  (Chrome DevTools "Slow 4G" or "Fast 3G" on a laptop, or a real weak signal on the
  phone). Play a few cards. They should keep working with no waiting, because every card
  is bundled with the app. Then reload: the scripts and fonts come from the browser
  cache, so only the small HTML page is fetched again. There's no offline mode until
  v1.1 (PWA), so a reload with no connection at all will fail.

## 7. No Filter: go or no-go (D-03)

The PRD says to decide on the No Filter deck after playtesting. Use these tests:

| | Go | No-go (hold the deck for v1.1) |
| --- | --- | --- |
| Sessions with No Filter played | 2 or more | Fewer than 2 |
| Cards marked 🚫 Too far | Cut or rewritten, and fewer than 1 in 10 of the cards played | More than 1 in 10 of the cards played, or anyone got seriously upset |
| The table's reaction | Asked to keep playing it, or called it the best part | Asked to turn it off |
| Confirmation screen | Nobody was surprised by what came after it | People said it didn't prepare them |

If it's a **no-go**, the cheapest change is to take No Filter out of the deck picker. The
cards stay in the repo, so nothing is lost. I'll make that change when you tell me.

## 8. After the sessions

1. Fill in [playtest-log.md](./playtest-log.md) for each session.
2. List every card with a 😐, ❓, ⏱, or 🚫 mark. Give me the list (or the first words), and
   I'll look up the ids, rewrite or cut them, run `npm run validate:cards`, and record the
   changes in the log.
3. Bring each deck back to its launch count (Warm Up 60, Barkada Tea 70, Love Life 70,
   Family & Adulting 50, No Filter 60) with replacement cards. The validator warns if a
   deck is short.
4. List app bugs and friction separately. I'll fix them and re-run the smoke test.
5. Make the No Filter decision (section 7) and mark Phase 4's exit criteria.

## Phase 4 exit criteria

From PHASES.md. Tick these when they're true:

- [ ] 300+ cards pass validation (**310 now**; must stay 300+ after cuts)
- [ ] First card in under 20 seconds with a real group
- [ ] No open blocking bugs
- [ ] No Filter decision made
- [ ] Table reads and the owner review of flagged cards are done (D-21)
