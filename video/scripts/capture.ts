/**
 * Captures the real site for the walkthrough: section screenshots of the Desk and About pages,
 * plus the agents demo mid-run / finished, and the mandate builder before / after a compromised agent.
 *
 *   npm run capture                       # live site
 *   SITE_URL=http://localhost:5173 npm run capture
 */
import fs from 'node:fs';
import path from 'node:path';
import puppeteer, { type Page } from 'puppeteer-core';

const SITE = (process.env.SITE_URL ?? 'https://mn-demo.vercel.app').replace(/\/$/, '');
const OUT = path.resolve('public/shots');
const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
].filter(Boolean) as string[];

const VIEWPORT = { width: 1440, height: 900, deviceScaleFactor: 1.5 };
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const HIDE_NAV = `.nav-wrap{opacity:0 !important;pointer-events:none !important}`;
// Scroll reveals depend on IntersectionObserver timing; pin them to their final state instead.
const FORCE_REVEAL = `.reveal{opacity:1 !important;transform:none !important;transition:none !important}`;

async function open(page: Page, url: string, ready: string) {
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 90_000 });
  await page.waitForSelector(ready, { timeout: 60_000 });
  await page.addStyleTag({ content: FORCE_REVEAL });
  await page.evaluate(() => document.fonts.ready);
}

async function revealAll(page: Page) {
  // Reveal components animate in on IntersectionObserver, so walk the whole page once.
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += 450) {
    await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' as ScrollBehavior }), y);
    await sleep(140);
  }
  await sleep(900);
}

async function shotSection(page: Page, selector: string, name: string) {
  const el = await page.waitForSelector(selector, { timeout: 20_000 });
  if (!el) throw new Error(`missing ${selector}`);
  await el.evaluate((n) => n.scrollIntoView({ block: 'start', behavior: 'instant' as ScrollBehavior }));
  await sleep(700);
  await el.screenshot({ path: path.join(OUT, `${name}.png`) as `${string}.png` });
  console.log(`  ✓ ${name}.png`);
}

async function clickByText(page: Page, selector: string, text: string) {
  const ok = await page.evaluate(
    (sel, t) => {
      const el = [...document.querySelectorAll<HTMLElement>(sel)].find((n) => n.textContent?.trim().includes(t));
      if (!el) return false;
      el.click();
      return true;
    },
    selector,
    text,
  );
  if (!ok) throw new Error(`no ${selector} containing "${text}"`);
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const executablePath = CHROME_CANDIDATES.find((p) => fs.existsSync(p));
  if (!executablePath) throw new Error('No Chrome/Edge found. Set CHROME_PATH.');

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    defaultViewport: VIEWPORT,
    args: ['--hide-scrollbars', '--force-color-profile=srgb', '--enable-webgl', '--ignore-gpu-blocklist'],
  });

  try {
    const page = await browser.newPage();
    page.on('pageerror', (e) => console.warn('  page error:', (e as Error).message));

    // ── Desk page ──
    console.log(`Desk page: ${SITE}/#/`);
    await open(page, `${SITE}/#/`, '#hero-title');
    await revealAll(page);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }));
    await sleep(1500);
    await page.screenshot({ path: path.join(OUT, 'hero.png') });
    console.log('  ✓ hero.png');
    await page.addStyleTag({ content: HIDE_NAV });

    await shotSection(page, '.terminal-stage', 'terminal');
    await shotSection(page, 'section:has(#features-title)', 'features');
    await shotSection(page, 'section:has(#audience-title)', 'audience');
    await shotSection(page, 'section:has(#capabilities-title)', 'capabilities');
    await shotSection(page, '#desk', 'live');
    await shotSection(page, 'section:has(#faq-title)', 'faq');

    // Mandate builder: honest agent, then a compromised one claiming a looser mandate.
    await page.waitForFunction(() => /Proof valid/.test(document.querySelector('.verdict-badge')?.textContent ?? ''), {
      timeout: 60_000,
    });
    await shotSection(page, '.mandate-builder', 'mandate-ok');
    await page.click('.mb-toggle input');
    await page.waitForFunction(() => /No valid proof/.test(document.querySelector('.verdict-badge')?.textContent ?? ''), {
      timeout: 60_000,
    });
    await sleep(400);
    await shotSection(page, '.mandate-builder', 'mandate-blocked');

    // Agents: idle, running, finished, then a blocked order selected.
    await shotSection(page, '#agents .ad-controls', 'agents-controls');
    await shotSection(page, '#agents', 'agents-idle');
    await clickByText(page, '#agents .segmented[aria-label="Playback speed"] button', '4×');
    await clickByText(page, '#agents button', 'Run the desk');
    await sleep(4200);
    await shotSection(page, '#agents', 'agents-running');
    await page.waitForSelector('#agents .ad-summary', { timeout: 120_000 });
    await sleep(800);
    await shotSection(page, '#agents', 'agents-done');
    await clickByText(page, '#agents button.ad-event.rejected', 'at $0.8842');
    await sleep(600);
    await shotSection(page, '#agents', 'agents-rejected');

    // ── About page ──
    console.log(`About page: ${SITE}/#/about`);
    await open(page, `${SITE}/#/about`, '#about-title');
    await revealAll(page);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }));
    await sleep(1500);
    await page.screenshot({ path: path.join(OUT, 'about-hero.png') });
    console.log('  ✓ about-hero.png');
    await page.addStyleTag({ content: HIDE_NAV });
    await shotSection(page, '#problem .flow', 'about-lanes');
    await shotSection(page, '#problem', 'about-problem');
    await shotSection(page, 'section:has(#solution-title)', 'about-solution');
    await shotSection(page, 'section:has(#circuit-title)', 'about-circuit');
    await shotSection(page, 'section:has(#matrix-title)', 'about-matrix');
    await shotSection(page, 'section:has(#roadmap-title)', 'about-roadmap');
  } finally {
    await browser.close();
  }
  console.log(`Done → ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
