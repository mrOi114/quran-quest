/**
 * Verify mobile bottom nav: Home → Learn / Quran → Lesson → Leaderboard → Circle
 */
import { chromium, devices } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.env.BASE_URL || 'http://localhost:8083';
const OUT = __dirname;
fs.mkdirSync(OUT, { recursive: true });

const results = [];
function rec(name, ok, evidence) {
  results.push({ name, ok, evidence });
  console.log(`${ok ? 'PASS' : 'FAIL'} | ${name} | ${evidence}`);
}

async function bodyText(page) {
  return (await page.locator('body').innerText().catch(() => '')).replace(/\s+/g, ' ').trim();
}

async function guest(page, name) {
  await page.goto(BASE + '/welcome', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(1500);
  if (/Continue as Guest/i.test(await bodyText(page))) {
    await page.getByText(/Continue as Guest/i).first().click();
    await page.waitForTimeout(1500);
  }
  const boxes = await page.getByRole('textbox').all();
  if (boxes.length) await boxes[0].fill(name);
  const adult = page.getByText(/^18\+$/).first();
  if (await adult.count()) await adult.click();
  const start = page.getByRole('button', { name: /Start learning/i }).first();
  if (await start.count()) await start.click();
  await page.waitForTimeout(3500);
}

async function bottomLeaves(page) {
  return page.evaluate(() => {
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
      .map((x) => x.text.replace(/^[^\w\s/]+\s*/, '').trim());
  });
}

async function runDevice(browser, label, contextOptions) {
  const context = await browser.newContext(contextOptions);
  const page = await context.newPage();
  try {
    await guest(page, label.replace(/\s+/g, ''));
    await page.goto(BASE + '/home', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(OUT, `${label}-home.png`) });

    const leaves = await bottomLeaves(page);
    const expected = ['Home', 'Learn / Quran', 'Lesson', 'Leaderboard', 'Circle'];
    const match =
      leaves.length === 5 &&
      leaves[0] === 'Home' &&
      leaves[1] === 'Learn / Quran' &&
      leaves[2] === 'Lesson' &&
      leaves[3] === 'Leaderboard' &&
      leaves[4] === 'Circle';
    rec(`${label} bottom tabs order`, match, `observed=${JSON.stringify(leaves)}`);
    rec(`${label} no Games in bottom`, !leaves.includes('Games'), `leaves=${JSON.stringify(leaves)}`);
    rec(`${label} no Profile in bottom`, !leaves.includes('Profile'), `leaves=${JSON.stringify(leaves)}`);

    // Open each tab via bottom-bar leaves (emoji + label)
    const tabs = [
      { name: 'Home', re: /Home/i, expectUrl: '/home', expect: /Assalamu|Today|Home/i },
      { name: 'Learn / Quran', re: /Learn\s*\/\s*Quran/i, expectUrl: '/reader', expect: /Choose Surah|Qur/i },
      { name: 'Lesson', re: /^🧠?\s*Lesson$/m, expectUrl: '/lesson', expect: /Choose Juz|Lesson/i },
      { name: 'Leaderboard', re: /Leaderboard/i, expectUrl: '/leaderboard', expect: /Leaderboard|Age Group|Juz/i },
      { name: 'Circle', re: /Circle/i, expectUrl: '/gates/circle', expect: /Circle/i },
    ];

    for (const tab of tabs) {
      const clicked = await page.evaluate((tabName) => {
        const h = window.innerHeight;
        const buttons = Array.from(document.querySelectorAll('[role="button"]'));
        const match = buttons.find((el) => {
          const r = el.getBoundingClientRect();
          if (r.top < h * 0.88) return false;
          const t = (el.innerText || '').replace(/\s+/g, ' ').trim();
          return t.includes(tabName);
        });
        if (!match) return false;
        match.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
        // RN-web often needs a pressable activation
        match.click();
        return true;
      }, tab.name);
      if (!clicked) {
        // fallback: getByText near bottom
        await page.getByText(tab.re).last().click({ force: true });
      }
      await page.waitForTimeout(2800);
      const url = page.url();
      const text = await bodyText(page);
      const okUrl = tab.expectUrl ? url.includes(tab.expectUrl) : true;
      const okText = tab.expect.test(text);
      rec(`${label} open ${tab.name}`, okUrl || okText, `url=${url}`);
      await page.screenshot({ path: path.join(OUT, `${label}-${tab.name.replace(/\s+/g, '-')}.png`) });
    }

    // Games via Menu drawer
    await page.getByRole('button', { name: /Open navigation menu|Menu/i }).first().click();
    await page.waitForTimeout(800);
    const drawerText = await bodyText(page);
    const gamesInDrawer = /\bGames\b/i.test(drawerText);
    rec(`${label} Games in Menu/drawer`, gamesInDrawer, gamesInDrawer ? 'Games label present in drawer' : 'missing');
    if (gamesInDrawer) {
      const gamesBtn = page.getByRole('button', { name: /Games/i }).first();
      await gamesBtn.click();
      await page.waitForTimeout(2800);
      rec(
        `${label} Games opens from drawer`,
        page.url().includes('/games') || /Game|Play|category/i.test(await bodyText(page)),
        page.url(),
      );
    }
  } catch (err) {
    rec(`${label} suite`, false, String(err && err.stack ? err.stack : err));
  } finally {
    await context.close();
  }
}

const browser = await chromium.launch({ headless: true, channel: 'chrome' });
try {
  await runDevice(browser, 'vp390', { viewport: { width: 390, height: 844 } });
  await runDevice(browser, 'Pixel5', devices['Pixel 5']);
  await runDevice(browser, 'iPhone12', devices['iPhone 12']);
} finally {
  await browser.close();
}

const fail = results.filter((r) => !r.ok).length;
fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify({ results, fail }, null, 2));
console.log(`\n==== SUMMARY fail=${fail} ====`);
if (fail) process.exitCode = 1;
