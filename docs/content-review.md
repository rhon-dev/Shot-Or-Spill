# Content Review Log

Covers the PRD §15 mitigations "review log per deck" and "Filipino context check on every
card", and Phase 1 tasks 5–6 in [PHASES.md](./PHASES.md#phase-1--content-v1-1-week).
Rules come from [content-guide.md](./content-guide.md).

This log has two batches. **Batch 1** is the first 150 cards (Phase 1), below. **Batch 2** is
the 160 cards that bring the deck to its 310-card launch count (Phase 4); it starts at
[Batch 2](#batch-2-phase-4-launch-deck-160-cards).

**Batch 1:** Content v1, 150 cards · **Written and self-reviewed:** Kiro, 2026-10-17 ·
**Owner:** Rhon approved continuing (2026-10-17). The table read and the judgment calls
move to Phase 4. (The counts in the sections below are for batch 1 only.)

## Automated checks

`npm run validate:cards` passes: 150 cards, 0 errors, 1 warning.

| Check | Result |
| --- | --- |
| Schema, ids, deck files, intensity ceilings | Pass |
| Placeholder and target rules (D-08) | Pass: `{p1}` 17, `{p2}` 4, `{tanggero}` 2, Tanggero-target cards 6 |
| Shots (Double Down = 2, all others = 1) | Pass |
| Water Break format (D-12) | Pass: 8 texts, all intensity 1 |
| Duplicate text across all decks | Pass |
| Tagalog grammar words | Pass |
| Alcohol brand names | Pass |
| Length | Pass: longest is 22 words / 120 characters; average 14.8 words |

To confirm the validator catches real problems, I added 9 deliberately broken cards. It
flagged all 9: Tagalog text, a brand name, a placeholder/target mismatch, wrong Double
Down shots, an intensity over the ceiling, an unknown placeholder, a wrong id prefix, an
unknown field, and duplicate text. I removed the test cards afterward.

**Warning cleared by review:** `love-026` "Most likely to drunk-text an ex after
tonight's inuman." This is a vote about a hypothetical, so nobody has to use a phone.
Kept.

## Type mix (PRD §5)

| Type | Count | Share | Target |
| --- | --- | --- | --- |
| Spill or Shot | 90 | 60% | ~60% |
| Everyone Who | 22 | 15% | ~15% |
| Most Likely To | 15 | 10% | ~10% |
| Hot Seat | 8 | 5% | ~5% |
| Double Down | 7 | 5% | ~5% |
| Water Break | 8 | 5% | ~5% (inserted by the engine, D-12) |

## Per-deck review

Notes on the checks:

- **Local ref** counts non-Water-Break cards that name something Filipino: a local
  term, family, a reunion, and so on. Cards without one still have to land at a Filipino
  table; they just don't name anything local.
- **Originality:** I wrote every card new for this batch, without using any existing
  list as a source. I did **not** run a web search for near-matches. Rhon should
  spot-check the most universal-sounding questions before launch.
- **Intensity:** I set each card's level by hand, against the content guide §4.

| Deck | Cards | I1 / I2 / I3 | Local ref | Originality | Intensity | Content rules | Table read |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Warm Up | 29 | 29 / 0 / 0 | 15 of 27 | Self-checked | Checked | Checked | Pending |
| Barkada Tea | 34 | 8 / 26 / 0 | 14 of 33 | Self-checked | Checked | Checked | Pending |
| Love Life | 34 | 2 / 26 / 6 | 14 of 32 | Self-checked | Checked | Checked | Pending |
| Family & Adulting | 24 | 9 / 15 / 0 | 16 of 22 | Self-checked | Checked | Checked | Pending |
| No Filter | 29 | 1 / 1 / 27 | 11 of 28 | Self-checked | Checked | Checked | Pending |

**Changes made during self-review:**

- **More local context.** 16 cards were rewritten because they read as generic or
  Western. For example, "red flag you ignored because they were cute" became "red flag
  you ignored even after your barkada warned you". "Faked an emergency to escape a bad
  date" became "used 'my mom is looking for me'".
- **Intensity.** `love-014` moved from 3 to 2 after its rewrite to a lie told to a date's
  parents.
- **Validator fix.** It flagged "absolutely" as the brand "Absolut", so brand matching is
  now whole-word.
- **Your sample cards.** The PRD §9 sample cards and schema example are in the batch as
  written: `warm-001`, `warm-018`, `barkada-001`, `barkada-026`, `love-001`, `love-002`,
  `love-003`, `family-001`, `family-002`, `nofilter-001`, `nofilter-025`. The §5 example
  is `love-021`, with "online" added.

## Cards for Rhon to judge

These pass every rule, but they're judgment calls for the owner.

| Card | Why it's flagged |
| --- | --- |
| `love-007` | It uses Simbang Gabi, a religious setting. It doesn't mock religion, and the "Simbang Gabi crush" is a well-known local joke, but some tables may not like it. |
| `nofilter-002` | Body count. The PRD lists it under the No Filter theme. It's adult but not explicit. |
| `family-005`, `family-021` | Salary and money sent to family. These are real pressure points that may sting at an office-crew table. |
| `barkada-032` | "Who would you cut from your life?" Double Down. It's the harshest card in the barkada deck. |
| `nofilter-004`, `nofilter-028` | These target relationships within the group itself. They're high-tea, but couples or exes playing together could get awkward. |

## Table read (Phase 1 task 6)

**Status: pending.** This needs real people reading out loud, so it has to happen at a
table, not here.

The 30 cards below are every 5th card in deck order. Read each one out loud and time it,
then mark whether it's answerable within 60 seconds. Keep, rewrite, or cut any card that
fails.

| Card | Type | I | Text | ≤ 60 s? | Keep / rewrite / cut |
| --- | --- | --- | --- | --- | --- |
| warm-005 | spill_or_shot | 1 | What's the strangest merienda combination you've eaten and secretly loved? | | |
| warm-010 | spill_or_shot | 1 | Tanggero {tanggero} picks someone to answer: what's the most cups of rice you've eaten in one sitting? | | |
| warm-015 | spill_or_shot | 1 | {p1}, if {p2} had to cook for this whole table tonight, what would we end up eating? | | |
| warm-020 | everyone_who | 1 | Everyone who has sung the wrong lyrics at videoke with full confidence, drink. | | |
| warm-025 | most_likely | 1 | Most likely to grab the videoke mic and refuse to give it back. Point on 3. | | |
| barkada-001 | spill_or_shot | 2 | Who in this group would you NOT trust to keep a secret? Say it or take a shot. | | |
| barkada-006 | spill_or_shot | 2 | Have you ever had a crush on someone in this barkada? You don't have to say who. | | |
| barkada-011 | spill_or_shot | 2 | Have you ever made up an excuse to skip a barkada hangout? What was the real reason? | | |
| barkada-016 | spill_or_shot | 2 | Have you ever been jealous of a friend's success? Spill or shot. | | |
| barkada-021 | everyone_who | 1 | Everyone who has muted this barkada's group chat at least once, drink. | | |
| barkada-026 | most_likely | 1 | Most likely to leave the group chat on 'seen' for three days. Point on 3. | | |
| barkada-031 | hot_seat | 2 | Hot Seat: you take three questions from the group about the worst barkada fight you've been part of. One shot skips one. | | |
| love-002 | spill_or_shot | 2 | {p1}, what's the most 'delulu' thing you've done for a crush? | | |
| love-007 | spill_or_shot | 2 | Have you ever kept going to Simbang Gabi mostly to see a crush? | | |
| love-012 | spill_or_shot | 2 | What's the most embarrassing thing you've done to get an ex's attention after the breakup? | | |
| love-017 | spill_or_shot | 3 | Have you ever stayed in a relationship only because you were scared to be alone? | | |
| love-022 | everyone_who | 2 | Everyone who has been left on read by a crush and kept the conversation going anyway, drink. | | |
| love-027 | most_likely | 2 | Most likely to bring a date to a family gathering by the second week. Point on 3. | | |
| love-032 | double_down | 3 | Which ex would you take back if they asked tonight? Say the name, or take 2 shots. | | |
| family-003 | spill_or_shot | 1 | What career did your family plan for you, and how far did you end up from it? | | |
| family-008 | spill_or_shot | 2 | What's the biggest lie you've told your parents that they still believe? | | |
| family-013 | spill_or_shot | 2 | The Tanggero picks someone to answer: what's the most you've ever lent a relative, and did you get it back? | | |
| family-018 | everyone_who | 2 | Everyone who was already broke within three days of their last payday, drink. | | |
| family-023 | water_break | 1 | Water Break. Everyone drinks water. Adulting is hard enough without a hangover tomorrow. | | |
| nofilter-004 | spill_or_shot | 3 | Have you ever hooked up with someone from this barkada's circle and kept it from the group? | | |
| nofilter-009 | spill_or_shot | 3 | What's a grudge you're still holding against someone in this room? | | |
| nofilter-014 | spill_or_shot | 3 | Have you ever hooked up with an ex after the breakup? How many times? | | |
| nofilter-019 | everyone_who | 3 | Everyone who has snuck someone into their room while their parents were home, drink. | | |
| nofilter-024 | most_likely | 3 | Most likely to wake up tomorrow regretting something they confessed at this inuman. Point on 3. | | |
| nofilter-029 | water_break | 1 | Water Break. Everyone drinks water. Big confessions deserve a clear head. | | |

## Phase 1 sign-off

- [x] 150 cards pass `npm run validate:cards`
- [x] Every card self-reviewed against the content guide checklist
- [x] Rhon approved moving on to Phase 2 (2026-10-17)
- [ ] Table read of the 30 cards above: **deferred to the Phase 4 playtests**
- [ ] Owner review of the "Cards for Rhon to judge" list: **deferred to Phase 4**. All
      flagged cards stay in the deck until then.

---

# Batch 2: Phase 4 launch deck (160 cards)

**Written and self-reviewed:** Kiro, 2026-10-18 · **Owner review:** pending. Reviewing
this batch is part of the Phase 4 playtests ([PLAYTEST.md](./PLAYTEST.md)).

This batch takes each deck to its PRD §6 launch count: 310 cards in total.

## Automated checks

`npm run validate:cards` passes on all 310 cards: 0 errors, 1 warning (the same
`love-026` warning already cleared above).

| Check | Result |
| --- | --- |
| Deck counts vs PRD §6 | Warm Up 60 · Barkada Tea 70 · Love Life 70 · Family & Adulting 50 · No Filter 60. All at launch count. |
| Type mix | Spill or Shot 188 (61%) · Everyone Who 45 (15%) · Most Likely To 30 (10%) · Hot Seat 15 (5%) · Double Down 15 (5%) · Water Break 17 (5%). On target. |
| Placeholders | `{p1}` 32, `{p2}` 5, `{tanggero}` 2, Tanggero-target cards 11 |
| Duplicate ids, duplicate text, Tagalog words, brand names | None |
| Length | Longest is 23 words; average 14.8 |

The validator now also warns when a deck drops below its launch count, which will matter
once playtests start cutting cards.

## What this batch added

| Deck | New cards | I1 / I2 / I3 | Explicit local reference |
| --- | --- | --- | --- |
| Warm Up | 31 | 31 / 0 / 0 | 12 of 28 |
| Barkada Tea | 36 | 10 / 26 / 0 | 21 of 34 |
| Love Life | 36 | 3 / 28 / 5 | 23 of 34 |
| Family & Adulting | 26 | 6 / 20 / 0 | 18 of 25 |
| No Filter | 31 | 1 / 1 / 29 | 15 of 30 |

"Explicit local reference" counts non-Water-Break cards that name something Filipino, as
in batch 1.

**The self-review caught a drift.** My first draft of Love Life and No Filter had only
32% and 26% of cards naming anything local, which is the "generic or Western" risk from
PRD §15. I rewrote 30 of those cards (16 in Love Life, 14 in No Filter) to bring in
barkada, titas, videoke nights, church fiestas, debuts, and the province. After the
rewrite, every deck is at 45% or above, and the whole deck is at 55% (160 of 293).

Cards without an explicit local term can still work at a Filipino table. They just
carry less of the identity, so the playtests should pay attention to them.

## Playable pools

How many cards a group can draw in typical setups (6 to 8 players, `{p2}` cards included):

| Setup | Cards |
| --- | --- |
| Barkada host: Warm Up + Barkada Tea, Spicy | 122 |
| Old friends: Barkada Tea + Love Life, Spicy | 122 |
| Office crew: Warm Up + Family + Barkada Tea, Chill | 82 |
| Office crew, Spicy | 169 |
| Warm Up alone, Chill | 55 |
| Everything, No Filter | 293 |

The PRD target is a median of 30+ cards per session, so even the smallest setup lasts a
full night.

## Originality

I wrote every card new, without using any existing list as a source, and I did **not**
run a web search for near-matches. Several questions are common party-game topics
(first love, worst date, biggest lie), so the Filipino framing is what makes them ours.
Rhon should spot-check the most universal-sounding ones before launch.

## Cards for Rhon to judge (batch 2)

These pass every rule, but they're judgment calls for the owner and the playtests.

| Card | Why it's flagged |
| --- | --- |
| `nofilter-031` | Hooking up with a coworker. It's the office-crew persona's most awkward card, though only No Filter ever shows it. |
| `nofilter-037` | Hooking up with someone you didn't like. Adult but not explicit; may read as judgmental. |
| `nofilter-042`, `nofilter-058` | About cheating (knowing a friend's partner cheated; having cheated or been cheated on). A real wound for some tables. |
| `love-043` | Being attracted to a friend's partner. It can put one person at the table on the spot. |
| `love-067`, `love-068` | Double Downs on cruelty in a fight and staying after falling out of love. Heavy for a Spicy table. |
| `barkada-067` | "Who is the most two-faced?" Names a person at the table; the harshest Barkada Tea card. |
| `nofilter-057`, `nofilter-059` | Double Downs on a secret kept from someone at the table and on lifelong regret. |
| `family-030` | "Your honest opinion of your boss." Safe at a barkada table, risky when the boss's friend is at the table. |
| `nofilter-044` | "The most inappropriate thing you've said at a family gathering after a few drinks." Mentions drinking in the question itself. |

## Table-read sheet (batch 2)

**Status: pending**, to be done during the Phase 4 playtests. These 32 cards are every 5th
new card in deck order. Read each one out loud and time it, then mark whether it's
answerable within 60 seconds. Keep, rewrite, or cut any card that fails.

| Card | Type | I | Text | ≤ 60 s? | Keep / rewrite / cut |
| --- | --- | --- | --- | --- | --- |
| warm-034 | spill_or_shot | 1 | What's the weirdest thing you've ever bought from a sari-sari store at midnight? | | |
| warm-039 | spill_or_shot | 1 | What's the most overdramatic thing you've done because of a bad hair day? | | |
| warm-044 | spill_or_shot | 1 | What's the most you've ever spent on a single meal, and was it worth it? | | |
| warm-049 | everyone_who | 1 | Everyone who has eaten rice for breakfast, lunch, and dinner on the same day, drink. | | |
| warm-054 | most_likely | 1 | Most likely to order too much food and then ask for a take-out container. Point on 3. | | |
| warm-059 | water_break | 1 | Water Break. Everyone drinks water before anyone sings the next videoke song. | | |
| barkada-038 | spill_or_shot | 2 | {p1}, what's one thing this barkada misunderstands about you? | | |
| barkada-043 | spill_or_shot | 2 | What's the longest you've gone without talking to someone in this barkada, and why? | | |
| barkada-048 | spill_or_shot | 1 | What was the first thing you noticed about this barkada when you joined it? | | |
| barkada-053 | spill_or_shot | 2 | What's the most random thing you've ever asked a barkada member to lend you? | | |
| barkada-058 | everyone_who | 1 | Everyone who has complained that the group chat is too noisy and then sent twenty messages, drink. | | |
| barkada-063 | most_likely | 2 | Most likely to start drama and then act completely innocent. Point on 3. | | |
| barkada-068 | double_down | 2 | What's the biggest lie you've told this barkada, and do they know yet? Spill, or take 2 shots. | | |
| love-037 | spill_or_shot | 2 | What's the longest you've waited for a crush to reply, and did the barkada notice you checking? | | |
| love-042 | spill_or_shot | 2 | What's the best advice a tita or a barkada member gave you after a heartbreak, and did you follow it? | | |
| love-047 | spill_or_shot | 2 | Have you ever liked someone mainly because your whole barkada approved of them? | | |
| love-052 | spill_or_shot | 3 | Have you ever lied about your relationship status to avoid an awkward conversation? | | |
| love-057 | everyone_who | 1 | Everyone who has rewatched a romantic teleserye just to feel something, drink. | | |
| love-062 | most_likely | 2 | Most likely to marry their first love and invite the whole barkada. Point on 3. | | |
| love-067 | double_down | 3 | What's the most hurtful thing you've ever said to a partner during a fight? Spill, or take 2 shots. | | |
| family-026 | spill_or_shot | 2 | Has a relative ever compared you to a cousin? What was the comparison? | | |
| family-031 | spill_or_shot | 2 | {p1}, which relative's party dish always disappears first, and which one is left on the table? | | |
| family-036 | spill_or_shot | 2 | Have you ever pretended to have plans just to skip a family gathering? | | |
| family-041 | everyone_who | 1 | Everyone who has been asked to sing or dance for relatives at a family gathering, drink. | | |
| family-046 | most_likely | 1 | Most likely to cry at a family reunion. Point on 3. | | |
| nofilter-030 | spill_or_shot | 3 | What's the most reckless thing you've done for love or attraction, and did anyone in the barkada have to bail you out? | | |
| nofilter-035 | spill_or_shot | 3 | Have you ever been so jealous that you went through a partner's messages or tracked where they were? | | |
| nofilter-040 | spill_or_shot | 3 | Have you ever said 'I'm fine' to your family while falling apart? When was the last time? | | |
| nofilter-045 | spill_or_shot | 3 | Have you ever lied about your age, your job, or your salary to impress someone? | | |
| nofilter-050 | everyone_who | 3 | Everyone who has deleted old photos of an ex to hide them from a new partner, drink. | | |
| nofilter-055 | most_likely | 3 | Most likely to go silent in the barkada group chat after tonight's confessions. Point on 3. | | |
| nofilter-060 | water_break | 1 | Water Break. Everyone drinks water. Whatever is said here stays here, hydrated. | | |

## Phase 4 card checklist

- [x] 310 cards pass `npm run validate:cards`
- [x] Every new card self-reviewed against the content guide checklist
- [x] Local-context pass done (30 cards rewritten)
- [ ] Table reads: the 30 cards in batch 1's sheet and the 32 above (Rhon, in the playtests)
- [ ] Owner review of both "Cards for Rhon to judge" lists
- [ ] Cards that fail in playtests are rewritten or cut, and the deck stays at its launch count
