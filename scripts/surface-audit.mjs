/**
 * Loading-surface audit.
 *
 * Drives the real app through every place it waits — auth, the empty chat,
 * the sidebar, a streamed reply, a reasoning reply and a document artifact —
 * and screenshots each moment, recording which loading indicators were on
 * screen. Run against a dev server started with PLAYWRIGHT=True so the mock
 * models stream canned replies and no API key is needed.
 *
 *   PLAYWRIGHT=True pnpm dev --port 3200
 *   node scripts/surface-audit.mjs http://localhost:3200 ./audit
 *
 * Writes PNGs plus report.json into the output folder.
 */
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';

const BASE = process.argv[2] ?? 'http://localhost:3200';
const OUT = path.resolve(process.argv[3] ?? './audit');
fs.mkdirSync(OUT, { recursive: true });

// The cloud sandbox ships a newer Chromium than this @playwright/test pins.
const executablePath =
  process.env.CHROMIUM_PATH ??
  (fs.existsSync('/opt/pw-browsers/chromium')
    ? '/opt/pw-browsers/chromium'
    : undefined);

const browser = await chromium.launch({ executablePath });
const context = await browser.newContext({
  viewport: { width: 1280, height: 820 },
  deviceScaleFactor: 1,
});
const page = await context.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));

const report = [];

/** Every loading indicator the codebase uses, by the selector that finds it. */
async function indicators() {
  return page.evaluate(() => {
    const count = (sel) => document.querySelectorAll(sel).length;
    const text = document.body.innerText;
    return {
      spin: count('.animate-spin'),
      pulse: count('.animate-pulse'),
      skeleton: count('.skeleton, [class*="skeleton"]:not(.fs-skeleton)'),
      brandLoader: count('.fsl, .fsx, .fs-spin, .fs-mark-spinner, [data-fs-loader]'),
      brandSkeleton: count('.fs-skeleton'),
      brandShimmer: count('.fs-shimmer-text'),
      thinkingText: /Thinking|Hmm/.test(text),
      reasoningText: /Reasoning|Reasoned/.test(text),
    };
  });
}

async function snap(name, note) {
  const file = `${String(report.length + 1).padStart(2, '0')}-${name}.png`;
  await page.screenshot({ path: path.join(OUT, file) });
  report.push({ file, name, note, url: page.url(), ...(await indicators()) });
  console.log(file, JSON.stringify(report.at(-1)));
}

/** Pick a model and let the page settle — typing straight after the switch
 *  can land before the input re-hydrates, and the message is never sent. */
async function chooseModel(id) {
  await page.goto(`${BASE}/`);
  await page.waitForLoadState('networkidle');
  await page.getByTestId('model-selector').click();
  await page.getByTestId(`model-selector-item-${id}`).click();
  await page.waitForTimeout(1500);
}

async function send(text, moments) {
  await page.getByTestId('multimodal-input').fill(text);
  const t0 = Date.now();
  await page.getByTestId('send-button').click();
  for (const [ms, name, note] of moments) {
    await page.waitForTimeout(Math.max(0, ms - (Date.now() - t0)));
    await snap(name, note);
  }
  // "Done" means every working indicator has cleared, not just that the
  // send button is back: reasoning and documents keep streaming after it.
  await page
    .waitForFunction(
      () =>
        !document.querySelector('[data-testid="stop-button"]') &&
        !document.querySelector('.fs-shimmer-text, .animate-spin') &&
        !document.querySelector('[data-testid="message-assistant-loading"]'),
      undefined,
      { timeout: 45_000, polling: 250 },
    )
    .catch(() => console.warn(`  still working after 45s: "${text}"`));
}

// --- auth ------------------------------------------------------------------
await page.goto(`${BASE}/register`);
await snap('register', 'Sign-up form at rest');
const email = `audit-${Date.now()}@example.com`;
await page.getByPlaceholder('user@acme.com').fill(email);
await page.getByLabel('Password').fill('audit-password-1');
await page.getByRole('button', { name: 'Sign Up' }).click();
await page.waitForTimeout(120);
await snap('register-pending', 'Submit button while the account is created');
await page.waitForURL(`${BASE}/`, { timeout: 30_000 });

// --- empty chat ------------------------------------------------------------
await page.waitForTimeout(150);
await snap('home-first-paint', 'Empty chat just after load: sidebar history fetching');
await page.waitForTimeout(1500);
await snap('home-settled', 'Empty chat settled: greeting and suggestions');

// --- plain chat ------------------------------------------------------------
await send('Why is the sky blue?', [
  [250, 'chat-submitted', 'Request sent, nothing back yet'],
  [1300, 'chat-first-tokens', 'First chunk arriving'],
  [2600, 'chat-streaming', 'Mid-stream'],
]);
await page.waitForTimeout(800);
await snap('chat-done', 'Reply complete');

// --- reasoning -------------------------------------------------------------
await chooseModel('chat-model-reasoning');
await send('Why is grass green?', [
  [250, 'reasoning-submitted', 'Reasoning model, request sent'],
  [1400, 'reasoning-thinking', 'Reasoning stream in progress'],
  [3000, 'reasoning-answer', 'Answer streaming after reasoning'],
]);
await page.waitForTimeout(800);
await snap('reasoning-done', 'Reasoning reply complete');

// --- document artifact -----------------------------------------------------
await chooseModel('chat-model');
await send('Help me write an essay about Silicon Valley', [
  [250, 'artifact-submitted', 'Asked for a document'],
  [1600, 'artifact-creating', 'Document being created'],
  [3500, 'artifact-streaming', 'Document content streaming'],
]);
await page.waitForTimeout(1500);
await snap('artifact-done', 'Document complete');

fs.writeFileSync(
  path.join(OUT, 'report.json'),
  JSON.stringify({ base: BASE, errors, moments: report }, null, 2),
);
console.log(`\n${report.length} moments, ${errors.length} page errors → ${OUT}`);
await browser.close();
