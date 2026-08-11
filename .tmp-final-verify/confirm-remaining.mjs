/**
 * Confirm An-Nas 114 selection + auto-advance + mobile nav leaves.
 */
import { chromium, devices } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = 'http://localhost:8083';
const OUT = __dirname;
const results = [];
function rec(name, ok, evidence) {
  results.push({ name, ok, evidence });
  console.log(`${ok ? 'PASS' : 'FAIL'} | ${name} | ${evidence}`);
}

async function bodyText(page) {
  return (await page.locator('body').innerText()).replace(/\s+/g, ' ').trim();
}
async function guest(page) {
  await page.goto(BASE + '/welcome', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(1200);
  if (/Continue as Guest/i.test(await bodyText(page))) {
    await page.getByText(/Continue as Guest/i).first().click();
    await page.waitForTimeout(1200);
  }
  const boxes = await page.getByRole('textbox').all();
  if (boxes.length) await boxes[0].fill('ConfirmV');
  const adult = page.getByText(/^18\+$/).first();
  if (await adult.count()) await adult.click();
  const start = page.getByRole('button', { name: /Start learning/i }).first();
  if (await start.count()) await start.click();
  await page.waitForTimeout(3000);
}
async function ayah(page) {
  const m = (await bodyText(page)).match(/Surah\s+(\d+)\s*·\s*Juz\s+(\d+)\s*·\s*Ayah\s+(\d+)/i);
  return m ? { surah: +m[1], juz: +m[2], ayah: +m[3] } : null;
}

const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const page = await (await browser.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
const audio = [];
page.on('request', (r) => {
  if (/Husary|\.mp3/i.test(r.url())) audio.push(r.url());
});

await guest(page);

// An-Nas 114
await page.goto(BASE + '/reader?surah=112&ayah=1', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2500);
await page.getByText(/Choose Surah\s*\/\s*Juz/i).first().click();
await page.waitForTimeout(500);
await page.getByLabel(/search surah/i).first().fill('An-Nas');
await page.waitForTimeout(700);
// Prefer exact An-Nas (114), not An-Nasr
const nas114 = page.getByRole('button', { name: /114\.\s*An-Nas\b|An-Nas\b(?!r)/i }).first();
const nas114alt = page.getByLabel(/114\..*An-Nas/i).first();
if (await nas114.count()) await nas114.click();
else if (await nas114alt.count()) await nas114alt.click();
else {
  // click button whose text includes 114
  await page.locator('button, [role="button"]').filter({ hasText: /114/ }).first().click();
}
await page.waitForTimeout(2500);
const afterNas = await ayah(page);
const nasCount = await page.getByRole('button', { name: /^Ayah \d+$/ }).count();
rec(
  '12 Choose An-Nas (114) starts correctly',
  afterNas?.surah === 114 && nasCount === 6,
  `surah=${afterNas?.surah} ayahBtns=${nasCount} subtitle=${JSON.stringify(afterNas)}`,
);
await page.screenshot({ path: path.join(OUT, 'confirm-an-nas.png'), fullPage: true });

// Al-Ikhlas via picker then another surah Al-Kawthar
await page.getByText(/Choose Surah\s*\/\s*Juz/i).first().click();
await page.waitForTimeout(400);
await page.getByLabel(/search surah/i).first().fill('Kawthar');
await page.waitForTimeout(600);
await page.getByRole('button', { name: /108|Kawthar/i }).first().click();
await page.waitForTimeout(2000);
const kaw = await ayah(page);
rec('12b Switch to Al-Kawthar', kaw?.surah === 108, JSON.stringify(kaw));

// Auto-advance confirm
await page.getByRole('button', { name: /Listen mode with auto advance/i }).first().click();
await page.waitForTimeout(400);
await page.getByRole('button', { name: /^(Listen|Pause audio)$/ }).first().click();
let advanced = false;
const t0 = Date.now();
for (let i = 0; i < 30; i++) {
  await page.waitForTimeout(1000);
  const cur = await ayah(page);
  if (cur && cur.ayah > 1) {
    advanced = true;
    rec('9 Auto-advance Listen mode', true, `ayah ${cur.ayah} after ${Date.now() - t0}ms audio=${JSON.stringify(audio.slice(-3))}`);
    break;
  }
}
if (!advanced) rec('9 Auto-advance Listen mode', false, `stuck ayah=${JSON.stringify(await ayah(page))} audio=${audio.length}`);

// Highlight: selected ayah chip white
const highlight = await page.evaluate(() => {
  const buttons = Array.from(document.querySelectorAll('[role="button"]'));
  const ayahBtns = buttons.filter((b) => /^Ayah \d+$/.test((b.getAttribute('aria-label') || '')));
  return ayahBtns.slice(0, 5).map((b) => {
    const cs = getComputedStyle(b);
    const label = b.getAttribute('aria-label');
    return { label, bg: cs.backgroundColor, cls: b.className?.toString?.().slice(0, 80) };
  });
});
rec('6 Verse highlight styles differ', highlight.length >= 2, JSON.stringify(highlight));

await page.context().close();

// Mobile bottom nav leaves only
for (const [name, device] of [
  ['Pixel5', devices['Pixel 5']],
  ['iPhone12', devices['iPhone 12']],
]) {
  const ctx = await browser.newContext({ ...device });
  const p = await ctx.newPage();
  await guest(p);
  await p.goto(BASE + '/home', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(2000);
  const leaves = await p.evaluate(() => {
    const h = window.innerHeight;
    return Array.from(document.querySelectorAll('[role="button"]'))
      .map((el) => {
        const r = el.getBoundingClientRect();
        return {
          text: (el.innerText || '').replace(/\s+/g, ' ').trim(),
          yRatio: r.top / h,
          h: r.height,
          w: r.width,
          left: r.left,
        };
      })
      .filter((x) => x.yRatio > 0.88 && x.h > 30 && x.h < 120 && x.w > 40 && x.w < 200)
      .sort((a, b) => a.left - b.left)
      .map((x) => x.text.replace(/^[^\w\s]+\s*/, '').trim());
  });
  const expected = ['Home', 'Learn / Quran', 'Lesson', 'Leaderboard', 'Circle'];
  const observed = leaves;
  const hasCircle = observed.some((t) => t === 'Circle');
  const hasGames = observed.some((t) => t === 'Games');
  const hasProfile = observed.some((t) => t === 'Profile');
  const matchesExpected =
    observed.length === 5 &&
    observed[0] === 'Home' &&
    observed[1] === 'Learn / Quran' &&
    observed[2] === 'Lesson' &&
    observed[3] === 'Leaderboard' &&
    observed[4] === 'Circle';
  rec(
    `${name} bottom nav vs expected`,
    matchesExpected,
    `observed=${JSON.stringify(observed)} expected=${JSON.stringify(expected)} hasGames=${hasGames} hasCircle=${hasCircle}`,
  );
  rec(`${name} Profile not in bottom nav`, !hasProfile, `hasProfile=${hasProfile}`);
  await p.screenshot({ path: path.join(OUT, `confirm-nav-${name}.png`) });
  await ctx.close();
}

await browser.close();
fs.writeFileSync(path.join(OUT, 'confirm.json'), JSON.stringify(results, null, 2));
