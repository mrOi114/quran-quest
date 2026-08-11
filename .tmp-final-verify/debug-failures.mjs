/**
 * Focused debug: auto-advance, surah switch, bottom nav leaves.
 */
import { chromium, devices } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.env.BASE_URL || 'http://localhost:8083';
const OUT = __dirname;

async function bodyText(page) {
  return (await page.locator('body').innerText().catch(() => '')).replace(/\s+/g, ' ').trim();
}

async function guestOnboard(page) {
  await page.goto(BASE + '/welcome', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(1500);
  if (/Continue as Guest/i.test(await bodyText(page))) {
    await page.getByText(/Continue as Guest/i).first().click();
    await page.waitForTimeout(1500);
  }
  const boxes = await page.getByRole('textbox').all();
  if (boxes.length) await boxes[0].fill('DbgVerify');
  const adult = page.getByText(/^18\+$/).first();
  if (await adult.count()) await adult.click();
  const start = page.getByRole('button', { name: /Start learning/i }).first();
  if (await start.count()) await start.click();
  await page.waitForTimeout(3500);
}

async function currentAyah(page) {
  const t = await bodyText(page);
  const m = t.match(/Ayah\s+(\d+)/i);
  return m ? Number(m[1]) : null;
}

async function surahTitle(page) {
  const t = await bodyText(page);
  const m = t.match(/Surah\s+(\d+)\s*·/);
  return m ? Number(m[1]) : null;
}

const log = [];
function note(msg, data) {
  console.log(msg, data !== undefined ? JSON.stringify(data) : '');
  log.push({ msg, data });
}

const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await context.newPage();
const audio = [];
page.on('request', (r) => {
  if (/everyayah|Husary|\.mp3/i.test(r.url())) audio.push({ t: Date.now(), url: r.url() });
});
page.on('console', (m) => {
  if (/audio|playback|ended|error|Listen/i.test(m.text())) {
    note('console', { type: m.type(), text: m.text().slice(0, 200) });
  }
});

await guestOnboard(page);
await page.goto(BASE + '/reader?surah=108&ayah=1', { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(3500);
note('opened-kawthar', { url: page.url(), surah: await surahTitle(page), ayah: await currentAyah(page) });

// Ensure Listen mode
const listenModeBtn = page.getByRole('button', { name: /Listen mode with auto advance/i }).first();
note('listen-mode-btn-count', await listenModeBtn.count());
await listenModeBtn.click();
await page.waitForTimeout(500);

// Check UI shows Listen selected (white bg hard; look for both buttons)
const textBefore = await bodyText(page);
note('ui-before-play', textBefore.slice(0, 400));

const playBtn = page.getByRole('button', { name: /^(Listen|Pause audio)$/ }).first();
note('play-btn', await playBtn.count());
const t0 = Date.now();
await playBtn.click();
await page.waitForTimeout(1500);
note('after-play-click', {
  ayah: await currentAyah(page),
  audio: audio.map((a) => a.url),
  body: (await bodyText(page)).match(/Pause|Listen|Playing|Beginner|Ayah \d+/g),
});

// Poll for advance OR second audio URL
let advanced = false;
let lastAudioCount = audio.length;
for (let i = 0; i < 40; i++) {
  await page.waitForTimeout(1000);
  const ayah = await currentAyah(page);
  const pauseVisible = (await page.getByRole('button', { name: /Pause audio/i }).count()) > 0;
  if (audio.length > lastAudioCount) {
    note('new-audio-request', { i, ayah, url: audio[audio.length - 1].url, elapsed: Date.now() - t0 });
    lastAudioCount = audio.length;
  }
  if (ayah != null && ayah > 1) {
    advanced = true;
    note('advanced', { i, ayah, elapsed: Date.now() - t0, pauseVisible });
    break;
  }
  if (i % 5 === 4) note('tick', { i, ayah, pauseVisible, audioN: audio.length, elapsed: Date.now() - t0 });
}
note('auto-advance-result', { advanced, ayah: await currentAyah(page), audio });

// Surah switch: An-Nas
await page.getByText(/Choose Surah\s*\/\s*Juz/i).first().click();
await page.waitForTimeout(600);
const search = page.getByLabel(/search surah/i).first();
await search.fill('Nas');
await page.waitForTimeout(700);
const nasBtn = page.getByRole('button', { name: /An-Nas|114\./i }).first();
note('nas-btn', await nasBtn.count());
await nasBtn.click();
await page.waitForTimeout(3000);
const ayahBtns = await page.getByRole('button', { name: /^Ayah \d+$/ }).count();
note('after-nas', {
  url: page.url(),
  surah: await surahTitle(page),
  ayah: await currentAyah(page),
  ayahBtns,
  hasNas: /An-Nas|الناس/i.test(await bodyText(page)),
  subtitle: (await bodyText(page)).match(/Surah \d+ · Juz \d+ · Ayah \d+/),
});
await page.screenshot({ path: path.join(OUT, 'dbg-nas.png'), fullPage: true });

// Juz path carefully
await page.getByText(/Choose Surah\s*\/\s*Juz/i).first().click();
await page.waitForTimeout(600);
if (await search.count()) await search.fill('');
const juz1 = page.getByLabel('Juz 1').first();
note('juz1', await juz1.count());
await juz1.click();
await page.waitForTimeout(800);
const fat = page.getByRole('button', { name: /Al-Fatihah|1\./i }).first();
note('fatiha-btn', await fat.count());
await fat.click();
await page.waitForTimeout(2500);
note('after-juz1-fatiha', {
  url: page.url(),
  surah: await surahTitle(page),
  ayahBtns: await page.getByRole('button', { name: /^Ayah \d+$/ }).count(),
  subtitle: (await bodyText(page)).match(/Surah \d+ · Juz \d+ · Ayah \d+/),
});

await context.close();

// Bottom nav leaf detection on Pixel 5
const mctx = await browser.newContext({ ...devices['Pixel 5'] });
const mpage = await mctx.newPage();
await guestOnboard(mpage);
await mpage.goto(BASE + '/home', { waitUntil: 'domcontentloaded' });
await mpage.waitForTimeout(2500);
const bottomLeaves = await mpage.evaluate(() => {
  const h = window.innerHeight;
  // Find the bottom bar row: elements near bottom with flex children
  const candidates = Array.from(document.querySelectorAll('[role="button"]'));
  return candidates
    .map((el) => {
      const r = el.getBoundingClientRect();
      return {
        text: (el.innerText || '').replace(/\s+/g, ' ').trim(),
        top: r.top,
        bottom: r.bottom,
        left: r.left,
        h: r.height,
        w: r.width,
        yRatio: r.top / h,
      };
    })
    .filter((x) => x.yRatio > 0.88 && x.h > 30 && x.h < 120 && x.w > 40 && x.w < 200)
    .sort((a, b) => a.left - b.left);
});
note('bottom-nav-leaves', bottomLeaves);
await mpage.screenshot({ path: path.join(OUT, 'dbg-mobile-nav.png'), fullPage: false });
await mctx.close();
await browser.close();

fs.writeFileSync(path.join(OUT, 'debug.json'), JSON.stringify(log, null, 2));
console.log('\nDONE');
