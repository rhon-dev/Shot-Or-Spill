# Content Writing Guide

Every Shot or Spill card follows this guide. It turns [PRD §9](./PRD.md#9-content-system)
and the Phase 0 decisions (D-08, D-12) into rules a writer can check. Rules marked
**[auto]** are enforced by `npm run validate:cards`. The rest are checked by hand during
review ([content-review.md](./content-review.md)).

The goal is questions a Filipino barkada actually wants to answer, out loud, at a real
inuman table, in under a minute.

---

## 1. Language

- **English only.** No Tagalog or Taglish sentences. **[auto]** The validator rejects
  Tagalog grammar words such as _ang, mga, ng, lang, naman, kasi, ba, po, ano, sino_.
- **Filipino through situations, not translation.** Write about videoke nights, the
  family group chat, a tita's reunion questions, utang between friends, the jeepney
  ride home, the balikbayan box, the Tanggero.
- **Allowed local terms:** use these naturally, the way Filipinos do in English.

  | Term | Means |
  | --- | --- |
  | barkada | friend group |
  | tita, tito | aunt, uncle (or any older relative or family friend) |
  | lola, lolo | grandma, grandpa |
  | kuya, ate | older brother, older sister |
  | pulutan | food eaten with drinks |
  | inuman, tagay | drinking session; a pour |
  | tanggero | the one who pours |
  | videoke | karaoke machine |
  | jeepney | shared public jeep |
  | sari-sari store | neighborhood corner store |
  | balikbayan (box) | Filipino returning from abroad (and the box they send) |
  | utang | money owed |
  | ulam | the main dish eaten with rice |
  | pasalubong | gift brought home from a trip |
  | teleserye | Filipino TV drama series |
  | Noche Buena | Christmas Eve family dinner |
  | Simbang Gabi | the nine dawn Masses before Christmas |
  | ber months | September to December, when Christmas season starts |
  | debut | an 18th birthday celebration |
  | third party | the other person in an affair (Filipino English) |
  | merienda | afternoon snack |
  | despedida | going-away party |
  | ninong, ninang | godfather, godmother |

  If a term isn't on this list, ask before using it. Common English internet slang
  (delulu, situationship, talking stage, ghosting) is fine.

## 2. Originality

- **100% original.** BuzzFeed, Cut, BeerBaller, and similar lists are references for
  format and tone only. Never copy one of their questions or lightly reword it.
- If a card feels familiar, assume it is and rewrite it. Making it more specifically
  Filipino usually makes it original.
- **[auto]** No two cards may have the same text, even across decks.

## 3. Hard content rules

Reject any card that breaks one of these.

1. It can be answered **out loud, at the table, in under 60 seconds**.
2. **No phone actions:** no posting, texting, calling, showing photos, or reading
   messages. Asking about something someone _did_ on their phone is fine ("Have you ever
   stalked an ex's new partner?"). Asking them to do it now is not.
3. **No physical dares, nudity, or touching.** This is a talking game.
4. **No mocking** anyone's looks, weight, religion, sexuality, or disability.
5. **Adult themes are fine, explicit content is not.** "What's your body count?" is in.
   Describing a sex act is out.
6. **[auto]** **No alcohol brand names** (PRD §12).
7. **[auto]** **Shots:** 1 per card. Double Down is always 2, and only Double Down.
8. Every card is skippable, so never write "you can't skip this one".

**[auto]** The validator flags wording that may break rules 2–5 as a _warning_. A
reviewer decides whether the card is actually a problem.

## 4. Intensity

Pick the intensity honestly. The intensity filter is a safety feature, so a mislabeled
card breaks it.

| Level | Filter label | Feels like |
| --- | --- | --- |
| 1 | Chill | Safe with anyone: food, habits, childhood, harmless embarrassment |
| 2 | Spicy | Real tea: crushes, exes, group-chat secrets, money, family pressure |
| 3 | No Filter | Bold adult territory: body count, cheating, deep regrets, confessions |

**[auto]** Deck ceilings: Warm Up 1 · Barkada Tea 2 · Love Life 3 · Family & Adulting 2 ·
No Filter 3. No Filter cards should be intensity 3 unless a card works better as a 2.

## 5. Card types, targets, and placeholders

The **reader** is the player holding the phone. The engine fills placeholders when the
card is drawn (D-08):

- `{p1}`: a random player who isn't the reader
- `{p2}`: a second random player, different from `{p1}` and the reader. These cards
  only appear with 3+ players.
- `{tanggero}`: the current Tanggero

| Type | Target | Required wording **[auto]** | Shots |
| --- | --- | --- | --- |
| `spill_or_shot` | `current`, `p1`, or `tanggero` | none | 1 |
| `double_down` | `current`, `p1`, or `tanggero` | none (end with "or take 2 shots") | 2 |
| `hot_seat` | `current` or `p1` | includes "Hot Seat" | 1 |
| `everyone_who` | `group` | includes "Everyone who" | 1 |
| `most_likely` | `group` | includes "Most likely" | 1 |
| `water_break` | `group` | starts with "Water Break." | 1 (not logged) |

**[auto]** Placeholder rules:

- A card that uses `{p1}` sets `target: "p1"`, and a `p1` card must use `{p1}`.
- `{p2}` only appears together with `{p1}`.
- A `tanggero` card mentions the Tanggero.

Who the card is for:

- **`current`:** the reader answers. Write "you".
- **`p1`:** start the card with the name: "{p1}, …". The named player answers (D-09).
- **`tanggero`:** the Tanggero picks who answers, and the app then asks who was picked
  (D-09). Example: "The Tanggero picks someone to answer: …".
- Never write "I" or "me" in card text, except inside quoted speech ("said 'I love
  you'"). The reader reads the card out loud, so "I" sounds like the reader is talking
  about themselves.

**Water Break cards** are not shuffled into the deck. The app inserts one every 12–15
cards and picks one of these texts at random (D-12). **[auto]** They are intensity 1 so
they appear under every filter. Write them as pacing reminders with some deck flavor.

## 6. Voice and craft

- Talk to the player directly: "Have you ever…", "What's the…", "Who here…".
- One question per card. If you wrote "and" twice, trim it.
- **[auto]** 15–200 characters. Cards over 35 words get a warning, because long cards
  are hard to read out loud in a loud room.
- End with the choice when it helps: "Spill or shot." / "Say it or drink."
- Specific beats generic: "the last piece of pulutan" lands harder than "the last
  snack".
- Funny beats clever. Writing for the room means getting a laugh or a groan.

## 7. Card format

One JSON array per deck in `src/content/decks/<deck>.json`:

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

**[auto]** Field rules:

- `id`: the deck prefix plus 3 digits, unique across every deck. Prefixes: `warm`,
  `barkada`, `love`, `family`, `nofilter`.
- `deck`: must match the file name.
- `tags`: 1–4 tags in lowercase-kebab-case, e.g. `group-chat`.
- Unknown fields are rejected.

## 8. Checklist before a card ships

- [ ] English only; Filipino through situation and the allowed terms
- [ ] Original, not copied or reworded from any list
- [ ] Answerable out loud in under 60 seconds
- [ ] No phone action, physical dare, mocking, or explicit content
- [ ] Intensity is honest
- [ ] Target and placeholders match who actually answers
- [ ] Reads well out loud in a dim, noisy room
- [ ] `npm run validate:cards` passes
