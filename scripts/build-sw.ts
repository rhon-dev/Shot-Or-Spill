/**
 * Generate the service worker after `vite build` (PWA offline play, v1.1).
 *
 *   npm run build   (runs this via the build script)
 *
 * Why a hand-written SW instead of vite-plugin-pwa: the whole game is one
 * small static bundle, so a tiny precache-everything worker does the job and
 * adds nothing to the first-load budget (D-18). This script reads the built
 * dist/, lists every asset to precache, stamps a version from the file
 * hashes, and writes dist/sw.js from the template in scripts/sw-template.js.
 *
 * The worker is same-origin only, so it stays within the CSP in vercel.json.
 */
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, writeFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");
const TEMPLATE = join(ROOT, "scripts", "sw-template.js");

/** Every file under dist/, as root-relative URLs ("/assets/index-abc.js"). */
function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else out.push("/" + relative(DIST, full).split(/[\\/]/).join("/"));
  }
  return out;
}

try {
  statSync(join(DIST, "index.html"));
} catch {
  console.error("dist/ not found. Run `vite build` first.");
  process.exit(1);
}

// Precache everything except the service worker itself and source maps.
const files = walk(DIST)
  .filter((f) => f !== "/sw.js" && !f.endsWith(".map"))
  .sort();

// Version = short hash of all precached bytes, so the SW only changes when
// the content does, and clients update exactly when something shipped.
const hash = createHash("sha256");
for (const f of files) hash.update(f).update(readFileSync(join(DIST, f.slice(1))));
const version = hash.digest("hex").slice(0, 12);

const template = readFileSync(TEMPLATE, "utf8");
const sw = template
  .replace("__SW_VERSION__", version)
  .replace("__PRECACHE_MANIFEST__", JSON.stringify(files));

writeFileSync(join(DIST, "sw.js"), sw);
console.log(`sw.js written: ${files.length} files precached, version ${version}.`);
