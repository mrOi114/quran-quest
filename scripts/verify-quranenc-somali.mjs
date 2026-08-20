/**
 * Verifies the bundled QuranEnc somali_yacob translation against the local mushaf.
 * Use --live to re-check Al-Fatiha and Juz 30 against the official API.
 */
import { readFile } from 'node:fs/promises';
import https from 'node:https';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const TRANSLATION_KEY = 'somali_yacob';
const EXPECTED_SURAHS = 114;
const EXPECTED_AYAHS = 6236;
const JUZ30_START = 78;
const BUNDLE_PATH = join(ROOT, 'src/features/reader/content/somaliYacob.json');
const MUSHAF_PATH = join(ROOT, 'src/features/reader/content/fullQuran.json');

function get(url) {
  return new Promise((resolve, reject) => {
    https
      .get(
        url,
        {
          headers: {
            Accept: 'application/json',
            'User-Agent': 'quran-quest-somali-yacob-verify/1.0',
          },
        },
        (res) => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => {
            if (res.statusCode && res.statusCode >= 400) {
              reject(new Error(`HTTP ${res.statusCode} for ${url}`));
              return;
            }
            try {
              resolve(JSON.parse(data));
            } catch (error) {
              reject(error);
            }
          });
        },
      )
      .on('error', reject);
  });
}

function verify(bundle, mushaf) {
  const errors = [];
  const expected = new Map(mushaf.surahs.map((surah) => [surah.number, surah.ayahCount]));
  if (bundle.meta.key !== TRANSLATION_KEY) {
    errors.push(`key ${bundle.meta.key} !== ${TRANSLATION_KEY}`);
  }
  if (!bundle.meta.version) {
    errors.push('missing version');
  }
  if (bundle.meta.source !== 'QuranEnc.com') {
    errors.push(`source ${bundle.meta.source} !== QuranEnc.com`);
  }
  if (bundle.verses.length !== EXPECTED_AYAHS) {
    errors.push(`ayah count ${bundle.verses.length} !== ${EXPECTED_AYAHS}`);
  }
  if (expected.size !== EXPECTED_SURAHS || mushaf.verses.length !== EXPECTED_AYAHS) {
    errors.push('mushaf map is not 114/6236');
  }

  const seen = new Set();
  const perSurah = new Map();
  for (const verse of bundle.verses) {
    const key = `${verse.surah}:${verse.ayah}`;
    if (seen.has(key)) {
      errors.push(`duplicate ${key}`);
    }
    seen.add(key);
    if (typeof verse.translation !== 'string' || !verse.translation.length) {
      errors.push(`bad translation at ${key}`);
    }
    if (typeof verse.footnotes !== 'string') {
      errors.push(`bad footnotes at ${key}`);
    }
    perSurah.set(verse.surah, (perSurah.get(verse.surah) ?? 0) + 1);
  }

  for (let surah = 1; surah <= EXPECTED_SURAHS; surah += 1) {
    const expectedCount = expected.get(surah);
    if ((perSurah.get(surah) ?? 0) !== expectedCount) {
      errors.push(`surah ${surah} count mismatch`);
    }
    for (let ayah = 1; ayah <= expectedCount; ayah += 1) {
      if (!seen.has(`${surah}:${ayah}`)) {
        errors.push(`missing ${surah}:${ayah}`);
      }
    }
  }

  for (const verse of mushaf.verses) {
    if (!seen.has(`${verse.surahNumber}:${verse.ayahNumber}`)) {
      errors.push(`mushaf ayah missing Somali: ${verse.surahNumber}:${verse.ayahNumber}`);
    }
  }

  return errors;
}

async function liveSpotCheck(bundle) {
  const errors = [];
  const surahs = [1, ...Array.from({ length: 114 - JUZ30_START + 1 }, (_, i) => JUZ30_START + i)];
  const stored = new Map(
    bundle.verses.map((verse) => [`${verse.surah}:${verse.ayah}`, verse]),
  );
  for (const surah of surahs) {
    const payload = await get(
      `https://quranenc.com/api/v1/translation/sura/${TRANSLATION_KEY}/${surah}`,
    );
    for (const row of payload.result) {
      const key = `${Number(row.sura)}:${Number(row.aya)}`;
      const verse = stored.get(key);
      if (!verse) {
        errors.push(`live missing locally ${key}`);
        continue;
      }
      if (verse.translation !== row.translation || verse.footnotes !== (row.footnotes ?? '')) {
        errors.push(`live wording mismatch ${key}`);
      }
    }
  }
  return errors;
}

async function main() {
  const live = process.argv.includes('--live');
  const bundle = JSON.parse(await readFile(BUNDLE_PATH, 'utf8'));
  const mushaf = JSON.parse(await readFile(MUSHAF_PATH, 'utf8'));
  const errors = verify(bundle, mushaf);
  if (live) {
    errors.push(...(await liveSpotCheck(bundle)));
  }
  if (errors.length) {
    console.error(errors.slice(0, 40).join('\n'));
    process.exit(1);
  }
  console.log(
    `OK ${bundle.meta.key} v${bundle.meta.version} — ${EXPECTED_SURAHS} surahs, ${EXPECTED_AYAHS} ayahs` +
      (live ? ' — live Fatiha + Juz 30 match' : ''),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
