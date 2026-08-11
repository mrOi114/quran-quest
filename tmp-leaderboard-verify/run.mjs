import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BASE = 'http://localhost:8083';
const OUT = join(process.cwd(), 'tmp-leaderboard-verify');
mkdirSync(OUT, { recursive: true });

const findings = [];
function log(ok, area, detail) {
  findings.push({ ok, area, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'} | ${area} | ${detail}`);
}

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(`console:${m.text()}`);
});

async function body() {
  return page.locator('body').innerText();
}

try {
  await page.goto(`${BASE}/welcome`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1500);
  let text = await body();
  if (text.includes('Continue as Guest')) {
    await page.getByText('Continue as Guest', { exact: false }).first().click({ force: true });
  } else {
    await page.goto(`${BASE}/guest-onboarding`, { waitUntil: 'networkidle' });
  }
  await page.waitForTimeout(2000);
  text = await body();
  if (!/Start learning|nickname|Guest/i.test(text)) {
    await page.goto(`${BASE}/guest-onboarding`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
  }
  const boxes = await page.getByRole('textbox').all();
  if (boxes.length) await boxes[0].fill('LbTester');
  for (const label of ['Ages 7–10', 'Ages 7-10', '7–10']) {
    const el = page.getByText(label, { exact: false }).first();
    if ((await el.count()) > 0) {
      await el.click({ force: true }).catch(() => undefined);
      break;
    }
  }
  const start = page.getByRole('button', { name: /Start learning|Continue|Begin/i }).first();
  if ((await start.count()) > 0) await start.click({ force: true });
  await page.waitForTimeout(4000);
  log(true, 'guest-onboard', `reached ${page.url()}`);

  await page.goto(`${BASE}/home`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  text = await body();
  await page.screenshot({ path: join(OUT, '01-home-mobile.png'), fullPage: true });
  for (const label of ['Home', 'Learn / Quran', 'Lesson', 'Leaderboard', 'Circle']) {
    log(text.includes(label), 'bottom-nav', `${label}${text.includes(label) ? ' present' : ' MISSING'}`);
  }

  const profileBottom = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('[role="button"], button, a, div'));
    const h = window.innerHeight;
    return buttons
      .filter((el) => {
        const t = (el.innerText || '').trim();
        return t === 'Profile' || t.includes('👤');
      })
      .map((el) => {
        const r = el.getBoundingClientRect();
        return {
          text: (el.innerText || '').slice(0, 40),
          yRatio: r.top / h,
        };
      });
  });
  const profileInBottomNav = profileBottom.some((p) => p.yRatio > 0.85);
  log(
    !profileInBottomNav,
    'bottom-nav-profile',
    profileInBottomNav
      ? `Profile appears in bottom area: ${JSON.stringify(profileBottom)}`
      : `Profile not in bottom nav; header/menu candidates: ${JSON.stringify(profileBottom)}`,
  );

  await page.goto(`${BASE}/leaderboard`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(4000);
  text = await body();
  await page.screenshot({ path: join(OUT, '02-leaderboard.png'), fullPage: true });
  log(
    text.includes('Leaderboard') || text.includes('🏆'),
    'leaderboard-load',
    `url=${page.url()} snippet=${text.slice(0, 180).replace(/\n/g, ' | ')}`,
  );
  log(text.includes('Age Group'), 'tabs', 'Age Group');
  log(text.includes('Juz Challenge'), 'tabs', 'Juz Challenge');
  log(text.includes('All Students'), 'tabs', 'All Students');
  log(text.includes('Your Position'), 'your-position', text.includes('Your Position') ? 'shown' : 'missing');
  log(/pts|points/i.test(text), 'points', /pts|points/i.test(text) ? 'points visible' : 'missing');
  log(
    !text.toLowerCase().includes('phone') && !/@[a-z0-9.-]+\.[a-z]{2,}/i.test(text),
    'privacy',
    'no email/phone detected in body',
  );
  log(
    text.includes('Create Free Account') || text.includes('Keep your'),
    'guest-prompt',
    text.includes('Create Free Account')
      ? 'Create Free Account present'
      : text.includes('Keep your')
        ? 'Keep your messaging present'
        : 'guest registration prompt missing',
  );

  const ageBands = ['Ages 3–6', 'Ages 7–10', 'Ages 11–14', 'Ages 15–17', '18+'];
  const visibleAge = ageBands.filter((a) => text.includes(a));
  log(visibleAge.length > 0, 'age-band-current', visibleAge.join(',') || 'none visible');
  const switchableAges = ageBands.filter((a) => text.includes(a)).length >= 3;
  log(
    !switchableAges,
    'age-band-switcher',
    switchableAges
      ? 'multiple age bands listed as switcher (unexpected for current UI)'
      : 'UI shows current age band only (no full age-band switcher)',
  );

  const juzTab = page.getByText('Juz Challenge', { exact: false }).first();
  if ((await juzTab.count()) > 0) {
    await juzTab.click({ force: true });
    await page.waitForTimeout(1200);
    text = await body();
    await page.screenshot({ path: join(OUT, '03-juz.png'), fullPage: true });
    log(text.includes('Juz 30'), 'juz-30', 'Juz 30 present');
    log(text.includes('Juz 29'), 'juz-29', text.includes('Soon') || text.toLowerCase().includes('soon') ? 'Juz 29 + Soon' : 'Juz 29 present');
    log(text.includes('Juz 28'), 'juz-28', text.includes('Soon') || text.toLowerCase().includes('soon') ? 'Juz 28 + Soon' : 'Juz 28 present');

    const juz29 = page.getByText('Juz 29', { exact: false }).first();
    if ((await juz29.count()) > 0) {
      await juz29.click({ force: true });
      await page.waitForTimeout(1000);
      text = await body();
      log(
        text.toLowerCase().includes('opening soon') || text.toLowerCase().includes('soon'),
        'juz-29-upcoming-copy',
        text.toLowerCase().includes('opening soon') ? 'opening soon copy shown' : 'soon wording present',
      );
    }
  } else {
    log(false, 'juz-tab', 'could not click Juz Challenge');
  }

  const allTab = page.getByText('All Students', { exact: false }).first();
  if ((await allTab.count()) > 0) {
    await allTab.click({ force: true });
    await page.waitForTimeout(1200);
    text = await body();
    await page.screenshot({ path: join(OUT, '04-all.png'), fullPage: true });
    log(text.includes('All Students') || text.includes('🌍'), 'all-students', 'board visible');
    log(/pts/i.test(text), 'ranking-rows', 'points rows appear present');
    log(
      text.includes('Rank') && text.includes('Student') && text.includes('Country') && text.includes('Points'),
      'column-headers',
      'Rank/Student/Country/Points headers',
    );
  }

  await page.goto(`${BASE}/leaderboard`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  text = await body();
  const motivation =
    text.includes('Challenge') ||
    /streak|points away|Keep going|lesson/i.test(text);
  log(motivation, 'motivation', 'encouragement signals present');
  log(!/shame|loser|last place|failing|worst/i.test(text), 'no-shame', 'no shame language detected');

  // Gap / weekly movement signals
  log(
    /points behind|points away|Your Position/i.test(text),
    'gap-to-next',
    /points behind|points away/i.test(text) ? 'gap messaging present' : 'Your Position only / gap may depend on rank',
  );
  log(
    /places this week|moved up|Keep learning — your next climb/i.test(text),
    'weekly-movement',
    /places this week|moved up/i.test(text)
      ? 'weekly movement shown'
      : 'weekly movement not shown on first visit (expected if no prior snapshot delta)',
  );

  await page.goto(`${BASE}/gates/circle`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3500);
  text = await body();
  await page.screenshot({ path: join(OUT, '05-circle.png'), fullPage: true });
  const gate = /Create Free Account|Keep your|Circles need|account/i.test(text);
  const hub =
    text.includes('My Circle') &&
    text.includes('Find') &&
    text.includes('Join') &&
    text.includes('Create');
  log(
    gate || hub,
    'circle',
    gate
      ? 'Guest sees registration gate (expected)'
      : hub
        ? 'Circle hub My/Find/Join/Create visible'
        : `unexpected: ${text.slice(0, 220).replace(/\n/g, ' | ')}`,
  );

  await page.goto(`${BASE}/home`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  const bottomOrder = await page.evaluate(() => {
    const h = window.innerHeight;
    const nodes = Array.from(document.querySelectorAll('*'))
      .filter((el) => {
        const r = el.getBoundingClientRect();
        const t = (el.innerText || '').trim();
        return r.top > h * 0.82 && r.height > 10 && r.height < 140 && t.length > 0 && t.length < 50;
      })
      .map((el) => (el.innerText || '').replace(/\s+/g, ' ').trim());
    const uniq = [];
    for (const n of nodes) if (!uniq.includes(n)) uniq.push(n);
    return uniq.slice(0, 25);
  });
  log(true, 'bottom-order-raw', JSON.stringify(bottomOrder));
  const joined = bottomOrder.join(' || ');
  const hasFive =
    /Home/i.test(joined) &&
    /Learn/i.test(joined) &&
    /Lesson/i.test(joined) &&
    /Leaderboard/i.test(joined) &&
    /Circle/i.test(joined);
  const hasProfileTab = bottomOrder.some((s) => /^👤?\s*Profile$/.test(s) || s === 'Profile');
  log(hasFive && !hasProfileTab, 'bottom-order', joined);

  log(errors.filter((e) => !e.includes('Download the React DevTools')).length === 0, 'runtime-errors', errors.slice(0, 8).join(' || ') || 'none');
} catch (e) {
  log(false, 'fatal', String(e));
  await page.screenshot({ path: join(OUT, 'fatal.png'), fullPage: true }).catch(() => undefined);
}

writeFileSync(join(OUT, 'findings.json'), JSON.stringify(findings, null, 2));
const fails = findings.filter((f) => !f.ok);
console.log(`\nSUMMARY ${fails.length} failures / ${findings.length} checks`);
await browser.close();
process.exit(fails.some((f) => f.area === 'fatal' || f.area === 'leaderboard-load') ? 1 : 0);
