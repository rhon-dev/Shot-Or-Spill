/**
 * End-to-end smoke test of the built app in a real Chromium browser.
 *
 *   npm run build && npm run smoke
 *
 * Uses a locally installed Chromium-based browser via CHROME_PATH (defaults
 * to Brave or Chrome on macOS). Set SHOTS_DIR to save screenshots.
 * Fails on any console error, page error, or failed expectation.
 */
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { chromium, type Page } from "playwright-core";
import { preview } from "vite";

const CANDIDATES = [
  process.env.CHROME_PATH,
  "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/chromium",
  "/usr/bin/google-chrome",
].filter((p): p is string => !!p);
const executablePath = CANDIDATES.find((p) => existsSync(p));
if (!executablePath) {
  console.error("No Chromium-based browser found. Set CHROME_PATH.");
  process.exit(1);
}

const SHOTS = process.env.SHOTS_DIR;
if (SHOTS) mkdirSync(SHOTS, { recursive: true });

let step = 0;
function check(cond: unknown, message: string): asserts cond {
  if (!cond) throw new Error(`Check failed: ${message}`);
  console.log(`  ✓ ${message}`);
}
async function shot(page: Page, name: string) {
  if (!SHOTS) return;
  step += 1;
  await page.waitForTimeout(450); // let animations settle
  await page.screenshot({ path: join(SHOTS, `${String(step).padStart(2, "0")}-${name}.png`) });
}

// Serve with the production security headers from vercel.json, so a CSP
// violation shows up here as a console error instead of after deploy.
const vercel = JSON.parse(readFileSync(new URL("../vercel.json", import.meta.url), "utf8")) as {
  headers: { source: string; headers: { key: string; value: string }[] }[];
};
const headers = Object.fromEntries(
  (vercel.headers.find((h) => h.source === "/(.*)")?.headers ?? []).map((h) => [h.key, h.value]),
);
if (!headers["Content-Security-Policy"]) throw new Error("vercel.json has no Content-Security-Policy");

const server = await preview({ preview: { port: 4317, strictPort: true, headers }, logLevel: "error" });
const url = "http://localhost:4317/";
const browser = await chromium.launch({ executablePath, headless: true });
const context = await browser.newContext({
  viewport: { width: 360, height: 800 },
  deviceScaleFactor: 1,
  isMobile: true,
  hasTouch: true,
});
const page = await context.newPage();
const problems: string[] = [];
page.on("console", (msg) => msg.type() === "error" && problems.push(`console: ${msg.text()}`));
page.on("pageerror", (err) => problems.push(`pageerror: ${err.message}`));

const button = (name: RegExp | string) => page.getByRole("button", { name });
const visible = async (name: RegExp) => (await button(name).count()) > 0 && (await button(name).first().isVisible());

/** Resolve whatever card is face up, the way a table would. Returns the card type it saw. */
async function resolveCurrent(choice: "spill" | "shot"): Promise<string> {
  if (await visible(/^Done · next card/)) {
    await button(/^Done · next card/).click();
    return "water";
  }
  const group = page.getByRole("group", { name: /^Who drank\?/ });
  if (await group.count()) {
    await group.getByRole("button").first().click();
    await button(/^Done/).click();
    return "group";
  }
  if (await page.getByRole("group", { name: /^Shots .* took/ }).count()) {
    await page.getByRole("button", { name: /^More: Shots/ }).click();
    await button(/^Done/).click();
    return "hot_seat";
  }
  const pickGroup = page.getByRole("group", { name: /^Who did .* pick\?/ });
  if (await pickGroup.count()) {
    check(await button(/^Spill/).isDisabled(), "Tanggero card: Spill waits for a pick");
    await pickGroup.getByRole("button").nth(1).click();
  }
  await button(choice === "spill" ? /^Spill/ : /^Shot/).click();
  return "choice";
}

async function clearDialogs() {
  for (let i = 0; i < 3; i++) {
    if (await visible(/^Keep playing/)) await button(/^Keep playing/).click();
    else if (await visible(/^Shuffle again/)) await button(/^Shuffle again/).click();
    else break;
  }
}

async function flipIfNeeded() {
  const flip = button(/^Flip the card/);
  if ((await flip.count()) && (await flip.isVisible())) await flip.click();
  await page.getByText("Now reading").waitFor();
}

try {
  console.log(`Browser: ${executablePath}`);
  const response = await page.goto(url);
  check(response?.headers()["content-security-policy"] === headers["Content-Security-Policy"], "served with the production CSP");

  console.log("Age gate (F1)");
  await page.getByRole("heading", { name: "Shot or Spill" }).waitFor();
  await shot(page, "age-gate");
  await button(/^I'm 18 or older/).click();

  console.log("Players (F2)");
  await page.getByRole("heading", { name: "WHO'S DRINKING?" }).waitFor();
  check(await button(/^Next: pick decks/).isDisabled(), "Next is disabled with no players");
  const input = page.getByLabel("Player name");
  for (const name of ["Juan", "Maria", "Bea", "Carlo"]) {
    await input.fill(name);
    await input.press("Enter");
  }
  await input.fill("  juan ");
  await input.press("Enter");
  check(await page.getByText("That name is already in.").isVisible(), "duplicate names are rejected");
  await input.fill("");
  check((await page.getByRole("list", { name: "Players" }).getByRole("listitem").count()) === 4, "4 players listed");
  await shot(page, "players");
  await button(/^Next: pick decks/).click();

  console.log("Decks (F4, F5, D-14, D-15)");
  await page.getByRole("heading", { name: "PICK YOUR DECKS" }).waitFor();
  await button(/^No Filter/).click();
  await page.getByRole("heading", { name: "NO FILTER IS FOR ADULTS" }).waitFor();
  check(true, "No Filter deck asks for the adult confirmation");
  await shot(page, "adult-confirm");
  await button(/^Everyone's okay/).click();
  check((await button(/^No Filter/).getAttribute("aria-pressed")) === "true", "No Filter selected after confirming");
  // Turn everything off but No Filter, at Chill: too few cards.
  for (const deck of [/^Warm Up/, /^Barkada Tea/]) await button(deck).click();
  await page.getByRole("radio", { name: "Chill" }).click();
  check(await button(/^Start the night/).isDisabled(), "Start disabled below 10 eligible cards");
  check(await page.getByText(/you need at least 10/).isVisible(), "too-few-cards hint shown");
  await shot(page, "decks-too-few");
  for (const deck of [/^Warm Up/, /^Barkada Tea/, /^Love Life/]) await button(deck).click();
  await page.getByRole("radio", { name: "Spicy" }).click();
  check(!(await button(/^Start the night/).isDisabled()), "Start enabled with enough cards");
  await shot(page, "decks");
  await button(/^Start the night/).click();

  console.log("How to Play (first time)");
  await page.getByRole("heading", { name: "HOW TO PLAY" }).waitFor();
  await button(/^Let's go/).click();

  console.log("Game loop (F3, F6–F12)");
  await page.getByText("Pass the phone to").waitFor();
  const firstReader = (await page.locator("main h1").textContent())?.trim();
  check(firstReader === "JUAN", "first reader is the first player");
  check(await page.getByText(/^Tanggero: /).isVisible(), "Tanggero badge shown");
  await shot(page, "pass-the-phone");
  // F7: swipe works as well as tap. Drag the card back sideways to flip it.
  const back = await button(/^Flip the card/).boundingBox();
  check(back, "card back is on screen");
  const cy = back.y + back.height / 2;
  await page.mouse.move(back.x + back.width / 2, cy);
  await page.mouse.down();
  await page.mouse.move(back.x + back.width / 2 - 160, cy, { steps: 12 });
  await page.mouse.up();
  await page.getByText("Now reading").waitFor({ timeout: 3000 });
  check(true, "swiping the card back flips it (F7)");
  await shot(page, "card-face");

  // Skip: same reader, new card, nothing logged.
  const before = await page.getByRole("group").first().textContent();
  await button(/^Skip$/).click();
  await page.waitForTimeout(250);
  check((await page.locator("main h1").textContent())?.trim() === "JUAN", "skip keeps the same reader");
  check((await page.getByRole("group").first().textContent()) !== before, "skip shows a different card");

  const seen = new Set<string>();
  for (let i = 0; i < 26; i++) {
    await flipIfNeeded();
    if (SHOTS && !seen.has("water") && (await visible(/^Done · next card/))) await shot(page, "water-break");
    if (SHOTS && !seen.has("group") && (await page.getByRole("group", { name: /^Who drank\?/ }).count())) await shot(page, "who-drank");
    seen.add(await resolveCurrent(i % 2 ? "shot" : "spill"));
    await clearDialogs();
  }
  check(seen.has("water"), "a Water Break appeared within 26 cards (F12)");
  check(seen.has("choice"), "Spill or Shot cards resolved");

  // Undo restores the previous card. Clear any Water Break first: it doesn't pass the turn.
  await flipIfNeeded();
  while (await visible(/^Done · next card/)) {
    await button(/^Done · next card/).click();
    await clearDialogs();
    await flipIfNeeded();
  }
  const readerBeforeResolve = (await page.locator("main h1").textContent())?.trim();
  await resolveCurrent("shot");
  await clearDialogs();
  await button(/^Undo/).click();
  check((await page.locator("main h1").textContent())?.trim() === readerBeforeResolve, "undo returns to the previous reader (F16)");
  await page.getByRole("status").getByText(/^Undid/).waitFor({ timeout: 2000 });
  check(true, "undo toast announced");

  console.log("Scoreboard (F13)");
  await button(/^Scores/).click();
  await page.getByRole("heading", { name: "SCOREBOARD" }).waitFor();
  const scoresBefore = await page.getByRole("table").textContent();
  await shot(page, "scoreboard");
  await button("Close").click();

  console.log("Refresh restores the night (F15)");
  await flipIfNeeded();
  const cardBefore = await page.getByRole("group").first().textContent();
  const nameBefore = (await page.locator("main h1").textContent())?.trim();
  await page.reload();
  await page.getByText("Now reading").waitFor();
  check((await page.locator("main h1").textContent())?.trim() === nameBefore, "same reader after reload");
  check((await page.getByRole("group").first().textContent()) === cardBefore, "same card text after reload");
  await button(/^Scores/).click();
  check((await page.getByRole("table").textContent()) === scoresBefore, "same scores after reload");

  console.log("Reduced motion toggle");
  await page.getByRole("switch", { name: /Reduced motion/ }).click();
  check((await page.getByRole("switch", { name: /Reduced motion/ }).getAttribute("aria-checked")) === "true", "reduced motion turns on");
  await button("Close").click();
  await resolveCurrent("spill");
  await clearDialogs();
  await flipIfNeeded();
  check(true, "cards still flip with reduced motion");

  console.log("Info pages (lazy)");
  await page.goto(`${url}#terms`);
  await page.getByRole("heading", { name: "TERMS" }).waitFor();
  check(true, "Terms page loads");
  await shot(page, "terms");
  await page.goBack();
  await page.getByText("Now reading").waitFor();
  check(true, "back button closes the info page");

  console.log("Recap (F14)");
  await button(/^Scores/).click();
  await button(/^End the night/).click();
  await page.getByRole("heading", { name: "THAT'S THE NIGHT" }).waitFor();
  check(await page.getByText(/Most Honest|Most Secretive|Biggest Tea/).first().isVisible(), "awards shown");
  check((await button(/^Share/).count()) === 0, "no Share button in the MVP (D-17)");
  await shot(page, "recap");
  await button(/^Play again/).click();
  await page.getByText("Pass the phone to").waitFor();
  check(true, "Play again starts a new night with the same players");

  check(problems.length === 0, `no console or page errors${problems.length ? `:\n${problems.join("\n")}` : ""}`);
  console.log("\nSMOKE PASSED");
} catch (err) {
  console.error(`\nSMOKE FAILED: ${(err as Error).message}`);
  if (problems.length) console.error(problems.join("\n"));
  if (SHOTS) await page.screenshot({ path: join(SHOTS, "failure.png") }).catch(() => {});
  process.exitCode = 1;
} finally {
  await browser.close();
  await new Promise<void>((resolve) => server.httpServer.close(() => resolve()));
}
