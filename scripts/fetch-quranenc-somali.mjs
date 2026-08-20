/**
 * Fetches the published QuranEnc Somali translation (somali_yacob)
 * and writes it verbatim for Quran Quest.
 *
 * Does not modify translation wording. Does not use QuranEnc Arabic text.
 * Verifies 114 surahs and 6236 ayahs against the existing mushaf map.
 */
import { readFile, writeFile } from 'node:fs/promises';
import https from 'node:https';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const TRANSLATION_KEY = 'somali_yacob';
const TRANSLATOR_ATTRIBUTION = 'Cabdullaahi Xasan Yacquub';
const SOURCE = 'QuranEnc.com';
const LIST_URL = 'https://quranenc.com/api/v1/translations/list/so';
const SURAH_URL = (sura) =>
  `https://quranenc.com/api/v1/translation/sura/${TRANSLATION_KEY}/${sura}`;
const OUT_PATH = join(ROOT, 'src/features/reader/content/somaliYacob.json');
const MUSHAF_PATH = join(ROOT, 'src/features/reader/content/fullQuran.json');
const EXPECTED_SURAHS = 114;
const EXPECTED_AYAHS = 6236;
const JUZ30_START = 78;

function get(url) {
  return new Promise((resolve, reject) => {
    https
      .get(
        url,
        {
          headers: {
            Accept: 'application/json',
            'User-Agent': 'quran-quest-somali-yacob/1.0',
          },
        },
        (res) => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => {
            if (res.statusCode && res.statusCode >= 400) {
              reject(new Error(`HTTP ${res.statusCode} for ${url}: ${data.slice(0, 200)}`));
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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function asInt(value, label) {
  const n = typeof value === 'number' ? value : Number.parseInt(String(value), 10);
  if (!Number.isInteger(n) || n < 1) {
    throw new Error(`Invalid ${label}: ${value}`);
  }
  return n;
}

async function fetchWithRetry(url, attempts = 4) {
  let lastError;
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await get(url);
    } catch (error) {
      lastError = error;
      await sleep(400 * (i + 1));
    }
  }
  throw lastError;
}

function expectedAyahCounts(mushaf) {
  const counts = new Map();
  for (const surah of mushaf.surahs) {
    counts.set(surah.number, surah.ayahCount);
  }
  if (counts.size !== EXPECTED_SURAHS) {
    throw new Error(`Mushaf surah count is ${counts.size}, expected ${EXPECTED_SURAHS}`);
  }
  if (mushaf.verses.length !== EXPECTED_AYAHS) {
    throw new Error(`Mushaf verse count is ${mushaf.verses.length}, expected ${EXPECTED_AYAHS}`);
  }
  return counts;
}

function verifyBundle(bundle, mushaf, liveByKey) {
  const expected = expectedAyahCounts(mushaf);
  const errors = [];

  if (bundle.meta.key !== TRANSLATION_KEY) {
    errors.push(`key ${bundle.meta.key} !== ${TRANSLATION_KEY}`);
  }
  if (!bundle.meta.version) {
    errors.push('missing version');
  }
  if (bundle.meta.surahCount !== EXPECTED_SURAHS) {
    errors.push(`surahCount ${bundle.meta.surahCount} !== ${EXPECTED_SURAHS}`);
  }
  if (bundle.meta.ayahCount !== EXPECTED_AYAHS) {
    errors.push(`ayahCount ${bundle.meta.ayahCount} !== ${EXPECTED_AYAHS}`);
  }
  if (bundle.verses.length !== EXPECTED_AYAHS) {
    errors.push(`stored verses ${bundle.verses.length} !== ${EXPECTED_AYAHS}`);
  }

  const seen = new Set();
  const perSurah = new Map();
  for (const verse of bundle.verses) {
    const key = `${verse.surah}:${verse.ayah}`;
    if (seen.has(key)) {
      errors.push(`duplicate ${key}`);
    }
    seen.add(key);
    if (typeof verse.translation !== 'string') {
      errors.push(`non-string translation at ${key}`);
    } else if (!verse.translation.length) {
      errors.push(`empty translation at ${key}`);
    }
    if (typeof verse.footnotes !== 'string') {
      errors.push(`non-string footnotes at ${key}`);
    }
    perSurah.set(verse.surah, (perSurah.get(verse.surah) ?? 0) + 1);
  }

  for (let surah = 1; surah <= EXPECTED_SURAHS; surah += 1) {
    const expectedCount = expected.get(surah);
    const got = perSurah.get(surah) ?? 0;
    if (got !== expectedCount) {
      errors.push(`surah ${surah} has ${got} ayahs, mushaf expects ${expectedCount}`);
    }
    for (let ayah = 1; ayah <= expectedCount; ayah += 1) {
      const key = `${surah}:${ayah}`;
      if (!seen.has(key)) {
        errors.push(`missing ${key}`);
      }
    }
  }

  for (const verse of mushaf.verses) {
    const key = `${verse.surahNumber}:${verse.ayahNumber}`;
    if (!seen.has(key)) {
      errors.push(`mushaf ayah missing from Somali bundle: ${key}`);
    }
  }

  if (liveByKey) {
    for (const [key, live] of liveByKey) {
      const stored = bundle.verses.find((item) => `${item.surah}:${item.ayah}` === key);
      if (!stored) {
        errors.push(`spot-check missing ${key}`);
        continue;
      }
      if (stored.translation !== live.translation) {
        errors.push(`spot-check wording changed at ${key}`);
      }
      if (stored.footnotes !== live.footnotes) {
        errors.push(`spot-check footnotes changed at ${key}`);
      }
    }
  }

  return errors;
}

async function fetchLiveVerses(surahNumbers) {
  const liveByKey = new Map();
  for (const surah of surahNumbers) {
    const payload = await fetchWithRetry(SURAH_URL(surah));
    const rows = payload.result;
    if (!Array.isArray(rows)) {
      throw new Error(`Unexpected payload for surah ${surah}`);
    }
    for (const row of rows) {
      const s = asInt(row.sura, 'sura');
      const a = asInt(row.aya, 'aya');
      liveByKey.set(`${s}:${a}`, {
        translation: row.translation,
        footnotes: typeof row.footnotes === 'string' ? row.footnotes : '',
      });
    }
  }
  return liveByKey;
}

async function main() {
  const mushaf = JSON.parse(await readFile(MUSHAF_PATH, 'utf8'));
  const expected = expectedAyahCounts(mushaf);

  const list = await fetchWithRetry(LIST_URL);
  const metaRow = (list.translations ?? []).find((item) => item.key === TRANSLATION_KEY);
  if (!metaRow) {
    throw new Error(`QuranEnc list did not include ${TRANSLATION_KEY}`);
  }
  if (metaRow.language_iso_code !== 'so') {
    throw new Error(`Unexpected language_iso_code: ${metaRow.language_iso_code}`);
  }

  const verses = [];
  for (let surah = 1; surah <= EXPECTED_SURAHS; surah += 1) {
    const payload = await fetchWithRetry(SURAH_URL(surah));
    const rows = payload.result;
    if (!Array.isArray(rows)) {
      throw new Error(`Surah ${surah} did not return a result array`);
    }
    const expectedCount = expected.get(surah);
    if (rows.length !== expectedCount) {
      throw new Error(
        `Surah ${surah}: QuranEnc returned ${rows.length} ayahs, mushaf has ${expectedCount}`,
      );
    }
    const seenAyah = new Set();
    for (const row of rows) {
      const surahNumber = asInt(row.sura, 'sura');
      const ayahNumber = asInt(row.aya, 'aya');
      if (surahNumber !== surah) {
        throw new Error(`Surah ${surah} contained sura ${surahNumber}`);
      }
      if (seenAyah.has(ayahNumber)) {
        throw new Error(`Duplicate ayah ${surah}:${ayahNumber} from API`);
      }
      seenAyah.add(ayahNumber);
      if (typeof row.translation !== 'string') {
        throw new Error(`Non-string translation at ${surah}:${ayahNumber}`);
      }
      verses.push({
        surah: surahNumber,
        ayah: ayahNumber,
        translation: row.translation,
        footnotes: typeof row.footnotes === 'string' ? row.footnotes : '',
      });
    }
    for (let ayah = 1; ayah <= expectedCount; ayah += 1) {
      if (!seenAyah.has(ayah)) {
        throw new Error(`API missing ${surah}:${ayah}`);
      }
    }
    process.stdout.write(`fetched ${surah}/${EXPECTED_SURAHS}\r`);
    await sleep(40);
  }
  process.stdout.write('\n');

  verses.sort((a, b) => a.surah - b.surah || a.ayah - b.ayah);

  const bundle = {
    meta: {
      key: TRANSLATION_KEY,
      translator: TRANSLATOR_ATTRIBUTION,
      translatorAsPublished: metaRow.description,
      titleAsPublished: metaRow.title,
      source: SOURCE,
      sourceUrl: 'https://quranenc.com/en/browse/somali_yacob',
      api: 'https://quranenc.com/api/v1/translation/sura/somali_yacob/{sura_number}',
      version: metaRow.version,
      lastUpdate: metaRow.last_update,
      languageIsoCode: metaRow.language_iso_code,
      surahCount: EXPECTED_SURAHS,
      ayahCount: verses.length,
      fetchedAt: new Date().toISOString(),
      arabicSource: 'Unchanged local mushaf. QuranEnc arabic_text was not imported.',
    },
    verses,
  };

  const spotSurahs = [1, ...Array.from({ length: 114 - JUZ30_START + 1 }, (_, i) => JUZ30_START + i)];
  const liveByKey = await fetchLiveVerses(spotSurahs);
  const errors = verifyBundle(bundle, mushaf, liveByKey);
  if (errors.length) {
    throw new Error(`Verification failed:\n${errors.slice(0, 40).join('\n')}`);
  }

  await writeFile(OUT_PATH, `${JSON.stringify(bundle)}\n`, 'utf8');
  console.log(
    `Wrote ${OUT_PATH} — ${bundle.meta.surahCount} surahs, ${bundle.meta.ayahCount} ayahs, version ${bundle.meta.version}`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
