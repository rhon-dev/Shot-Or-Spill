/**
 * Content validator for Shot or Spill.
 *
 *   npm run validate:cards
 *
 * Errors fail the run (exit 1). Warnings are for the human review in
 * docs/content-review.md: they flag wording that may break a content rule
 * but can't be judged automatically.
 */
import { readFileSync, readdirSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  BUNDLED_DECK_IDS,
  CARD_TYPES,
  DECKS,
  MIN_EASY_SHARE,
  STYLE_TAGS,
  TYPE_MIX_TARGET,
  type Card,
  type CardType,
  type DeckId,
} from "../src/content/meta";
import { CardSchema } from "../src/content/schema";

const DECKS_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "src",
  "content",
  "decks",
);

/**
 * Tagalog grammar words. Card text is English only (PRD §9); local nouns like
 * barkada, tita, or pulutan are fine, but Tagalog sentences are not.
 */
const TAGALOG_WORDS = [
  "ang", "mga", "ng", "naman", "kasi", "talaga", "ikaw", "ako", "siya",
  "kayo", "tayo", "sila", "hindi", "opo", "lang", "sino", "ano", "bakit",
  "paano", "kaya", "yung", "diba", "sana", "pala", "nga", "ba", "po",
];

/** Alcohol brands. Never named in cards or marketing (PRD §12). */
const ALCOHOL_BRANDS = [
  "san miguel", "red horse", "pale pilsen", "emperador", "tanduay",
  "ginebra", "gin bilog", "alfonso", "fundador", "smirnoff", "jack daniel",
  "johnnie walker", "jose cuervo", "bacardi", "heineken", "absolut",
  "jagermeister", "jinro", "colt 45", "gsm blue",
];

/** Phrases worth a second look during review (PRD §9 content rules). */
const REVIEW_PATTERNS: { re: RegExp; why: string }[] = [
  {
    re: /\b(show us|open your|unlock your|read (out )?your (last|latest)|go live|post (a|it|this|on)|send (a|it|this|them)|(call|text|dm|message) (your|them|someone|an?)\b)/i,
    why: "may require using a phone (no phone actions)",
  },
  {
    re: /\b(take off|strip|lick|lap dance|kiss (the|someone|a|your)|touch (the|someone|a|your))\b/i,
    why: "may be a physical dare (talking game only)",
  },
  {
    re: /\b(sex|sexual|naked|nude|porn|nsfw)\b/i,
    why: "check it stays adult but not explicit",
  },
  {
    re: /\b(fat|ugly|skinny|weight|religion|gay|lesbian|bakla|tomboy)\b/i,
    why: "check it doesn't mock looks, weight, religion, or sexuality",
  },
];

const WORD_LIMIT = 35;

type Problem = { where: string; message: string };
const errors: Problem[] = [];
const warnings: Problem[] = [];

function wordsIn(text: string): string[] {
  return text.toLowerCase().match(/[a-z']+/g) ?? [];
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/\{[^}]*\}/g, "{}")
    .replace(/[^a-z0-9{} ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function pct(n: number, total: number): string {
  return total === 0 ? "0%" : `${Math.round((n / total) * 100)}%`;
}

// ---------------------------------------------------------------------------
// Load deck files
// ---------------------------------------------------------------------------

const files = readdirSync(DECKS_DIR).filter((f) => f.endsWith(".json"));
const expectedFiles = new Set(BUNDLED_DECK_IDS.map((id) => `${id}.json`));

for (const id of BUNDLED_DECK_IDS) {
  if (!files.includes(`${id}.json`)) {
    errors.push({ where: `${id}.json`, message: "deck file is missing" });
  }
}
for (const file of files) {
  if (!expectedFiles.has(file)) {
    errors.push({ where: file, message: "not a known deck; remove or rename it" });
  }
}

const cards: Card[] = [];

for (const file of files.filter((f) => expectedFiles.has(f))) {
  const fileDeck = basename(file, ".json") as DeckId;
  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(join(DECKS_DIR, file), "utf8"));
  } catch (e) {
    errors.push({ where: file, message: `invalid JSON: ${(e as Error).message}` });
    continue;
  }
  if (!Array.isArray(raw)) {
    errors.push({ where: file, message: "must be a JSON array of cards" });
    continue;
  }

  raw.forEach((entry, i) => {
    const label = (entry as { id?: unknown })?.id;
    const where = typeof label === "string" ? label : `${file}[${i}]`;
    const result = CardSchema.safeParse(entry);
    if (!result.success) {
      for (const issue of result.error.issues) {
        const path = issue.path.join(".") || "card";
        errors.push({ where, message: `${path}: ${issue.message}` });
      }
      return;
    }
    const card = result.data;
    if (card.deck !== fileDeck) {
      errors.push({
        where,
        message: `deck is "${card.deck}" but the card is in ${file}`,
      });
    }
    cards.push(card);
  });
}

// ---------------------------------------------------------------------------
// Cross-card and wording checks
// ---------------------------------------------------------------------------

const seenIds = new Map<string, number>();
const seenText = new Map<string, string>();

for (const card of cards) {
  seenIds.set(card.id, (seenIds.get(card.id) ?? 0) + 1);

  const key = normalize(card.text);
  const dup = seenText.get(key);
  if (dup) {
    errors.push({ where: card.id, message: `same text as ${dup}` });
  } else {
    seenText.set(key, card.id);
  }

  const words = wordsIn(card.text);
  const tagalog = words.filter((w) => TAGALOG_WORDS.includes(w));
  if (tagalog.length > 0) {
    errors.push({
      where: card.id,
      message: `Tagalog words (${[...new Set(tagalog)].join(", ")}); card text is English only`,
    });
  }

  // Whole-word match, so "absolutely" doesn't count as "absolut".
  const brands = ALCOHOL_BRANDS.filter((b) =>
    new RegExp(`\\b${b.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(
      card.text,
    ),
  );
  if (brands.length > 0) {
    errors.push({
      where: card.id,
      message: `alcohol brand named (${brands.join(", ")}); never name brands`,
    });
  }

  if (words.length > WORD_LIMIT) {
    warnings.push({
      where: card.id,
      message: `${words.length} words; over ${WORD_LIMIT} is hard to read out loud`,
    });
  }

  for (const { re, why } of REVIEW_PATTERNS) {
    const m = card.text.match(re);
    if (m) warnings.push({ where: card.id, message: `"${m[0]}": ${why}` });
  }
}

// Question style (D-24): every Spill or Shot and Double Down card carries
// exactly one style tag, and most questions in each deck are easy to answer.
const isQuestion = (c: Card) => c.type === "spill_or_shot" || c.type === "double_down";
for (const card of cards.filter(isQuestion)) {
  const styles = card.tags.filter((t) => (STYLE_TAGS as readonly string[]).includes(t));
  if (styles.length !== 1) {
    errors.push({ where: card.id, message: `needs exactly one style tag (${STYLE_TAGS.join(", ")}); has ${styles.length}` });
  }
}
const styleRows: string[] = [];
for (const id of BUNDLED_DECK_IDS) {
  const qs = cards.filter((c) => c.deck === id && isQuestion(c));
  const count = (tag: string) => qs.filter((c) => c.tags.includes(tag)).length;
  const easy = count("hypothetical") + count("generic");
  styleRows.push(
    `${DECKS[id].name.padEnd(18)} ${String(qs.length).padStart(5)}  ${String(count("hypothetical")).padStart(5)}  ${String(count("generic")).padStart(5)}  ${String(count("personal")).padStart(5)}  ${pct(easy, qs.length).padStart(5)}`,
  );
  if (qs.length > 0 && easy / qs.length < MIN_EASY_SHARE) {
    errors.push({
      where: DECKS[id].name,
      message: `only ${pct(easy, qs.length)} of questions are hypothetical or generic; at least ${pct(MIN_EASY_SHARE, 1)} must be`,
    });
  }
}

for (const [id, count] of seenIds) {
  if (count > 1) errors.push({ where: id, message: `id used ${count} times` });
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

const out: string[] = [];
const total = cards.length;

out.push("Shot or Spill content report");
out.push("");
out.push("Deck               Cards  Launch  Short   I1  I2  I3");
const short: string[] = [];
for (const id of BUNDLED_DECK_IDS) {
  const deck = cards.filter((c) => c.deck === id);
  const byI = [1, 2, 3].map((i) => deck.filter((c) => c.intensity === i).length);
  const meta = DECKS[id];
  const gap = Math.max(0, meta.launchCount - deck.length);
  if (gap > 0) short.push(`${meta.name} is ${gap} short of its launch count (${meta.launchCount})`);
  out.push(
    `${meta.name.padEnd(18)} ${String(deck.length).padStart(5)}  ${String(meta.launchCount).padStart(6)}  ${String(gap || "-").padStart(5)}  ${byI.map((n) => String(n).padStart(3)).join(" ")}`,
  );
}
const launchTotal = BUNDLED_DECK_IDS.reduce((s, id) => s + DECKS[id].launchCount, 0);
out.push(`${"Total".padEnd(18)} ${String(total).padStart(5)}  ${String(launchTotal).padStart(6)}`);
// Cutting weak cards after playtests can drop a deck below its PRD §6 count: warn, don't fail.
for (const msg of short) warnings.push({ where: "launch", message: msg });

out.push("");
out.push("Question style     Total   Hypo    Gen   Pers   Easy");
out.push(...styleRows);

out.push("");
out.push("Type mix           Count  Share  Target");
for (const type of CARD_TYPES) {
  const n = cards.filter((c) => c.type === type).length;
  out.push(
    `${type.padEnd(18)} ${String(n).padStart(5)}  ${pct(n, total).padStart(5)}  ${pct(TYPE_MIX_TARGET[type as CardType], 1).padStart(6)}`,
  );
}

const placeholderCounts = ["{p1}", "{p2}", "{tanggero}"].map(
  (p) => `${p} ${cards.filter((c) => c.text.includes(p)).length}`,
);
const tanggeroTarget = cards.filter((c) => c.target === "tanggero").length;
out.push("");
out.push(`Placeholders: ${placeholderCounts.join(", ")}; tanggero-target cards: ${tanggeroTarget}`);

if (warnings.length > 0) {
  out.push("");
  out.push(`Review warnings (${warnings.length}), check by hand:`);
  for (const w of warnings) out.push(`  ! ${w.where}: ${w.message}`);
}

if (errors.length > 0) {
  out.push("");
  out.push(`Errors (${errors.length}):`);
  for (const e of errors) out.push(`  x ${e.where}: ${e.message}`);
  out.push("");
  out.push(`FAILED: ${errors.length} error(s) in ${total} valid-shaped card(s).`);
  console.error(out.join("\n"));
  process.exit(1);
}

out.push("");
out.push(`PASSED: ${total} cards, 0 errors, ${warnings.length} warning(s).`);
console.log(out.join("\n"));
