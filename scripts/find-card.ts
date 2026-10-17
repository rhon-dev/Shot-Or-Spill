/**
 * Look up cards by id or by a snippet of their text.
 *
 *   npm run card -- love-043
 *   npm run card -- "ghosted by someone"
 *
 * Playtest facilitators write down the first few words of a card that fell flat;
 * this finds its id so it can be rewritten or cut (docs/PLAYTEST.md).
 */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Card } from "../src/content/meta";

const DECKS_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "content", "decks");
const query = process.argv.slice(2).join(" ").trim().toLowerCase();

if (!query) {
  console.error('Usage: npm run card -- <card id or text snippet>\n  e.g. npm run card -- love-043\n       npm run card -- "ghosted by someone"');
  process.exit(1);
}

const cards: Card[] = readdirSync(DECKS_DIR)
  .filter((f) => f.endsWith(".json"))
  .flatMap((f) => JSON.parse(readFileSync(join(DECKS_DIR, f), "utf8")) as Card[]);

// Card text still holds {p1} / {p2} / {tanggero}, while the app shows real names.
// Search for the words around the name, e.g. "most romantic thing you've ever done".
const matches = cards.filter((c) => c.id === query || c.text.toLowerCase().includes(query));

if (matches.length === 0) {
  console.error(`No card matches "${query}".`);
  process.exit(1);
}

for (const c of matches.slice(0, 10)) {
  console.log(`${c.id}  ${c.type}  intensity ${c.intensity}  target ${c.target}`);
  console.log(`  ${c.text}`);
}
if (matches.length > 10) console.log(`...and ${matches.length - 10} more. Narrow your search.`);
