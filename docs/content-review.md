# Content Review Log

Covers the PRD §15 mitigations "review log per deck" and "Filipino context check on every
card", and Phase 1 tasks 5–6 in [PHASES.md](./PHASES.md#phase-1--content-v1-1-week).
Rules come from [content-guide.md](./content-guide.md).

**Batch:** Content v1, 150 cards · **Written and self-reviewed:** Kiro, 2026-10-17 ·
**Owner sign-off:** pending (Rhon)

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
- [ ] Table read of the 30 cards above (Rhon)
- [ ] Owner review of the "Cards for Rhon to judge" list
- [ ] Rhon signs off on Phase 1
