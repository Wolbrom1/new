/**
 * Cross-browser check for the Fifth Season motion kit.
 *
 * Runs the same flow in Chromium (Chrome, Edge, Comet, Arc, Brave, Opera,
 * Atlas), WebKit (Safari, desktop and iPhone) and Gecko (Firefox), and
 * records for each whether every branded surface renders and animates.
 *
 *   PLAYWRIGHT=True pnpm build && AUTH_TRUST_HOST=true PLAYWRIGHT=True pnpm start --port 3300
 *   node scripts/browser-matrix.mjs http://localhost:3300 ./matrix
 *
 * Needs the WebKit and Firefox engines: `npx playwright install webkit firefox`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { chromium, devices, firefox, webkit } from '@playwright/test';

const BASE = process.argv[2] ?? 'http://localhost:3300';
const OUT = path.resolve(process.argv[3] ?? './matrix');
fs.mkdirSync(OUT, { recursive: true });

const chromiumPath =
  process.env.CHROMIUM_PATH ??
  (fs.existsSync('/opt/pw-browsers/chromium')
    ? '/opt/pw-browsers/chromium'
    : undefined);

const TARGETS = [
  {
    id: 'chromium',
    label: 'Chromium — Chrome, Edge, Comet, Arc, Brave, Opera, Atlas',
    launch: () =>
      chromium.launch({
        executablePath: chromiumPath,
        args: [
          '--use-fake-ui-for-media-stream',
          '--use-fake-device-for-media-stream',
        ],
      }),
    context: { permissions: ['microphone'] },
    fakeMic: true,
  },
  {
    id: 'webkit',
    label: 'WebKit — Safari (macOS)',
    launch: () => webkit.launch(),
    context: {},
    fakeMic: false,
  },
  {
    id: 'webkit-iphone',
    label: 'WebKit — Safari (iPhone)',
    launch: () => webkit.launch(),
    context: { ...devices['iPhone 15'] },
    fakeMic: false,
    mobile: true,
  },
  {
    id: 'firefox',
    label: 'Gecko — Firefox',
    launch: () =>
      firefox.launch({
        firefoxUserPrefs: {
          'media.navigator.streams.fake': true,
          'media.navigator.permission.disabled': true,
        },
      }),
    context: {},
    fakeMic: true,
  },
];

/** What the browser natively offers, recorded before any test stubs load. */
const NATIVE_PROBE = () => ({
  SpeechRecognition: 'SpeechRecognition' in window,
  webkitSpeechRecognition: 'webkitSpeechRecognition' in window,
  getUserMedia: Boolean(navigator.mediaDevices?.getUserMedia),
  AudioContext: 'AudioContext' in window,
  backgroundClipText:
    CSS.supports('background-clip', 'text') ||
    CSS.supports('-webkit-background-clip', 'text'),
  transformBoxFill: CSS.supports('transform-box', 'fill-box'),
  colorMix: CSS.supports('color', 'color-mix(in srgb, red 50%, blue)'),
  backdropFilter:
    CSS.supports('backdrop-filter', 'blur(2px)') ||
    CSS.supports('-webkit-backdrop-filter', 'blur(2px)'),
});

const results = [];

for (const t of TARGETS) {
  const r = { id: t.id, label: t.label, checks: {}, errors: [] };
  const check = (name, ok, detail = '') => {
    r.checks[name] = { ok: Boolean(ok), detail };
  };
  let browser;
  try {
    browser = await t.launch();
    const ctx = await browser.newContext({
      viewport: t.mobile ? undefined : { width: 1280, height: 820 },
      ...t.context,
    });

    // Native capability probe on a clean page, before any stubs.
    const probe = await ctx.newPage();
    await probe.goto(`${BASE}/login`);
    r.native = await probe.evaluate(NATIVE_PROBE);
    await probe.close();

    // Then a scripted recogniser, so the dictation code path can be driven
    // where the engine has no speech service (all headless engines). Only
    // installed where the browser really ships the API, so the mic button's
    // visibility still reflects reality.
    await ctx.addInitScript(() => {
      if (
        !('SpeechRecognition' in window) &&
        !('webkitSpeechRecognition' in window)
      )
        return;
      class FakeRec {
        start() {
          this.t = [
            setTimeout(
              () =>
                this.onresult?.({
                  resultIndex: 0,
                  results: [
                    Object.assign([{ transcript: 'why is the' }], {
                      isFinal: false,
                    }),
                  ],
                }),
              300,
            ),
            setTimeout(
              () =>
                this.onresult?.({
                  resultIndex: 0,
                  results: [
                    Object.assign([{ transcript: 'why is the sky blue' }], {
                      isFinal: true,
                    }),
                  ],
                }),
              700,
            ),
          ];
        }
        stop() {
          for (const x of this.t ?? []) clearTimeout(x);
          setTimeout(() => this.onend?.(), 0);
        }
      }
      window.SpeechRecognition = FakeRec;
      window.webkitSpeechRecognition = FakeRec;
    });

    // The chat layout loads Pyodide from cdn.jsdelivr.net. Where that host is
    // unreachable (sandboxed CI) the failed load logs an error in every
    // engine; serve an empty script so only real problems are reported.
    if (process.env.STUB_PYODIDE) {
      await ctx.route('https://cdn.jsdelivr.net/pyodide/**', (route) =>
        route.fulfill({ contentType: 'text/javascript', body: '' }),
      );
    }

    const p = await ctx.newPage();
    p.on('pageerror', (e) => r.errors.push(`pageerror: ${e.message}`));
    p.on('console', (m) => {
      if (m.type() !== 'error') return;
      const text = m.text();
      // The sandbox cannot reach the avatar CDN; not a browser issue.
      if (/avatar\.vercel\.sh|_next\/image|Failed to load resource/.test(text))
        return;
      r.errors.push(`console: ${text.slice(0, 160)}`);
    });
    const shot = (name) =>
      p.screenshot({ path: path.join(OUT, `${t.id}-${name}.png`) });

    // Sign-up: success toast + first-visit greeting
    await p.goto(`${BASE}/register`);
    await p
      .getByPlaceholder('user@acme.com')
      .fill(`mx-${t.id}-${Date.now()}@example.com`);
    await p.getByLabel('Password').fill('matrix-password-1');
    await p.getByRole('button', { name: 'Sign Up' }).click();
    await p.waitForURL(`${BASE}/`, { timeout: 30_000 });
    await p.waitForTimeout(700);
    check(
      'Toast plays the Success animation',
      await p.locator('[data-testid="toast"] svg').count(),
    );
    await p.waitForTimeout(1600);
    check(
      'First-visit logo opening',
      await p.locator('[data-testid="greeting-mark"] .fsw').count(),
    );
    await shot('1-home');

    // Thinking state
    await p.getByTestId('multimodal-input').fill('Why is the sky blue?');
    await p.getByTestId('send-button').click();
    await p.waitForTimeout(400);
    const thinking = await p.evaluate(() => {
      const label = document.querySelector('.fs-shimmer-text');
      if (!label) return null;
      const cs = getComputedStyle(label);
      const cells = [...document.querySelectorAll('.ms-cell')];
      const anims = document
        .getAnimations()
        .filter((a) => a.animationName === 'fs-ms');
      return {
        clip: cs.backgroundClip || cs.webkitBackgroundClip,
        fill: cs.webkitTextFillColor,
        width: label.getBoundingClientRect().width,
        cells: cells.length,
        running: anims.filter((a) => a.playState === 'running').length,
      };
    });
    check('Thinking indicator shows', thinking, JSON.stringify(thinking));
    check(
      'Shimmer label clips to text',
      thinking && /text/.test(thinking.clip),
      thinking?.clip,
    );
    check(
      'Mark spinner animates',
      thinking && thinking.running >= 4,
      `${thinking?.running ?? 0} running`,
    );
    await shot('2-thinking');
    await p.waitForTimeout(2200);
    check(
      'Stop button visible mid-stream',
      await p.getByTestId('stop-button').isVisible(),
    );
    await p
      .waitForFunction(
        () => !document.querySelector('[data-testid="stop-button"]'),
        null,
        { timeout: 30_000 },
      )
      .catch(() => {});
    const firstChat = p.url();

    // Dictation
    const mic = p.getByTestId('mic-button');
    const micShown = (await mic.count()) > 0;
    const speechNative =
      r.native.SpeechRecognition || r.native.webkitSpeechRecognition;
    check(
      'Mic shown only where speech recognition exists',
      micShown === speechNative,
      `mic ${micShown ? 'shown' : 'hidden'}, speech API ${speechNative ? 'present' : 'absent'}`,
    );
    if (micShown && t.fakeMic) {
      await p.getByTestId('multimodal-input').fill('Quick question:');
      await mic.click();
      await p.waitForTimeout(1100);
      const d = await p.evaluate(() => ({
        pressed: document
          .querySelector('[data-testid="mic-button"]')
          ?.getAttribute('aria-pressed'),
        anim: Boolean(
          document.querySelector('[data-testid="mic-button"] [role="status"]'),
        ),
        text: document.querySelector('[data-testid="multimodal-input"]')?.value,
      }));
      check(
        'Dictation: listening animation',
        d.pressed === 'true' && d.anim,
        JSON.stringify(d),
      );
      check(
        'Dictation: transcript appended',
        d.text === 'Quick question: why is the sky blue',
        d.text,
      );
      await shot('3-dictation');
      if (d.pressed === 'true') await mic.click();
      await p.getByTestId('multimodal-input').fill('');
    }

    // Route loading bar between chats
    await p.goto(`${BASE}/`);
    await p.waitForLoadState('networkidle');
    await p.getByTestId('multimodal-input').fill('Why is grass green?');
    await p.getByTestId('send-button').click();
    await p
      .waitForFunction(
        () =>
          !document.querySelector('[data-testid="stop-button"]') &&
          !document.querySelector('[data-testid="message-assistant-loading"]'),
        null,
        { timeout: 30_000 },
      )
      .catch(() => {});
    // Watch for the loading bar rather than slowing the network: the route
    // is partially prerendered, so the bar may be on screen only briefly,
    // and delaying requests makes Next log its own fallback warnings.
    if (t.mobile) {
      // On phones the history lives in a closed drawer; open it first.
      await p
        .getByRole('button')
        .filter({ has: p.locator('svg') })
        .first()
        .click();
      await p.waitForTimeout(500);
    }
    await p.evaluate(() => {
      window.__sawRouteBar = false;
      new MutationObserver(() => {
        if (
          document.querySelector(
            '[role="progressbar"][aria-label="Loading chat"]',
          )
        ) {
          window.__sawRouteBar = true;
        }
      }).observe(document.body, { childList: true, subtree: true });
    });
    const id = firstChat.split('/chat/')[1];
    const link = p.locator(`a[href="/chat/${id}"]`).first();
    if (await link.count()) {
      await link.evaluate((a) => a.click());
      await p
        .waitForURL((u) => u.toString().endsWith(id), { timeout: 15_000 })
        .catch(() => {});
      await p.waitForLoadState('networkidle').catch(() => {});
      check('Route loading bar', await p.evaluate(() => window.__sawRouteBar));
    } else {
      check('Route loading bar', false, 'no sidebar link to switch with');
    }

    // Style guide: every loader, Lottie and opening
    await p.goto(`${BASE}/spinners/logo`);
    await p.waitForLoadState('networkidle');
    await p.waitForTimeout(2200);
    const sg = await p.evaluate(() => ({
      cssAnims: document
        .getAnimations()
        .filter((a) => a.playState === 'running').length,
      lottieSvgs: document.querySelectorAll('svg[preserveAspectRatio]').length,
      loaders: document.querySelectorAll('.fsl').length,
      openings: document.querySelectorAll('.fsw').length,
    }));
    check(
      'Style guide: CSS loaders animate',
      sg.cssAnims > 20,
      `${sg.cssAnims} running animations`,
    );
    check(
      'Style guide: Lotties render',
      sg.lottieSvgs >= 6,
      `${sg.lottieSvgs} Lottie players`,
    );
    check(
      'Style guide: logo openings render',
      sg.openings >= 5,
      `${sg.openings} lockups`,
    );
    await p.screenshot({
      path: path.join(OUT, `${t.id}-4-styleguide.png`),
      fullPage: true,
    });
    check(
      'No page or console errors',
      r.errors.length === 0,
      r.errors.slice(0, 3).join(' | '),
    );
  } catch (e) {
    r.fatal = String(e.message ?? e).split('\n')[0];
  } finally {
    await browser?.close();
  }
  const fails = Object.entries(r.checks).filter(([, v]) => !v.ok);
  console.log(`\n${r.label}${r.fatal ? `  FATAL: ${r.fatal}` : ''}`);
  console.log(`  native: ${JSON.stringify(r.native)}`);
  for (const [k, v] of Object.entries(r.checks)) {
    console.log(
      `  ${v.ok ? 'PASS' : 'FAIL'}  ${k}${v.detail && !v.ok ? `  — ${v.detail}` : ''}`,
    );
  }
  if (!fails.length && !r.fatal) console.log('  all checks passed');
  results.push(r);
}

fs.writeFileSync(
  path.join(OUT, 'matrix.json'),
  JSON.stringify(results, null, 2),
);
