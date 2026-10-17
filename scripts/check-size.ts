/**
 * First-load JS budget (PRD §11, D-18): 150 KB gzipped.
 *
 *   npm run build && npm run size
 *
 * "First load" = the entry script plus every chunk it preloads, read from
 * dist/index.html. Lazy chunks (info pages) are reported but not counted.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const BUDGET = 150 * 1024;
const DIST = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");

let html: string;
try {
  html = readFileSync(join(DIST, "index.html"), "utf8");
} catch {
  console.error("dist/index.html not found. Run `npm run build` first.");
  process.exit(1);
}

const firstLoad = new Set<string>();
for (const m of html.matchAll(/<script[^>]+src="\/([^"]+\.js)"/g)) firstLoad.add(m[1]!);
for (const m of html.matchAll(/<link[^>]+rel="modulepreload"[^>]+href="\/([^"]+\.js)"/g)) firstLoad.add(m[1]!);

const gz = (file: string) => gzipSync(readFileSync(join(DIST, file)), { level: 9 }).length;
const kb = (n: number) => `${(n / 1024).toFixed(1)} KB`;

const assets = readdirSync(join(DIST, "assets")).map((f) => `assets/${f}`);
const js = assets.filter((f) => f.endsWith(".js"));
const css = assets.filter((f) => f.endsWith(".css"));

let total = 0;
console.log("First-load JS (gzipped):");
for (const f of [...firstLoad].sort()) {
  const n = gz(f);
  total += n;
  console.log(`  ${kb(n).padStart(9)}  ${f}`);
}
const lazy = js.filter((f) => !firstLoad.has(f));
if (lazy.length) {
  console.log("Lazy JS (not counted):");
  for (const f of lazy) console.log(`  ${kb(gz(f)).padStart(9)}  ${f}`);
}
for (const f of css) console.log(`CSS ${kb(gz(f)).padStart(9)}  ${f}`);

console.log(`\nFirst-load JS: ${kb(total)} of ${kb(BUDGET)} budget.`);
if (firstLoad.size === 0) {
  console.error("FAILED: no entry script found in dist/index.html.");
  process.exit(1);
}
if (total > BUDGET) {
  console.error("FAILED: over the JS budget.");
  process.exit(1);
}
console.log("PASSED");
