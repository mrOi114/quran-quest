/**
 * Generates full mushaf (114 surahs) for the Learn/Quran Reader.
 * Writes: src/features/reader/content/fullQuran.json
 *
 * Does NOT replace Juz 30 lesson content (juz30.json stays for Hifz lessons).
 *
 * Source: https://api.quran.com (Uthmani text, translation resource 20)
 * Default beginner audio: EveryAyah Husary_128kbps (same as Lesson)
 */
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import https from 'node:https';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SURAH_START = 1;
const SURAH_END = 114;
const TRANSLATION_RESOURCE_ID = 20; // Sahih International
const CONTENT_VERSION = 1;

const DEFAULT_RECITER = {
  key: 'husary_128',
  name: 'Mahmoud Khalil Al-Husary',
  style: 'murattal',
  audioBaseUrl: 'https://everyayah.com/data/Husary_128kbps',
  isDefaultBeginner: true,
};

/** Standard mushaf Juz start positions (surah:ayah). */
const JUZ_STARTS = [
  [1, 1],
  [2, 142],
  [2, 253],
  [3, 92],
  [4, 24],
  [4, 148],
  [5, 82],
  [6, 111],
  [7, 88],
  [8, 41],
  [9, 93],
  [11, 6],
  [12, 53],
  [15, 1],
  [17, 1],
  [18, 75],
  [21, 1],
  [23, 1],
  [25, 21],
  [27, 56],
  [29, 46],
  [33, 31],
  [36, 28],
  [39, 32],
  [41, 47],
  [46, 1],
  [51, 31],
  [58, 1],
  [67, 1],
  [78, 1],
];

function get(url) {
  return new Promise((resolve, reject) => {
    https
      .get(
        url,
        {
          headers: {
            Accept: 'application/json',
            'User-Agent': 'quran-quest-full-mushaf/1.0',
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

function stripTranslationMarkup(text) {
  return text
    .replace(/<sup\b[^>]*>[\s\S]*?<\/sup>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function audioFileName(surahNumber, ayahNumber) {
  return `${String(surahNumber).padStart(3, '0')}${String(ayahNumber).padStart(3, '0')}.mp3`;
}

function verseId(surahNumber, ayahNumber) {
  return `${surahNumber}:${ayahNumber}`;
}

function hashText(text) {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

async function fetchSurah(surahNumber) {
  const [chapterRes, uthmaniRes, translationRes] = await Promise.all([
    get(`https://api.quran.com/api/v4/chapters/${surahNumber}`),
    get(
      `https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${surahNumber}`,
    ),
    get(
      `https://api.quran.com/api/v4/quran/translations/${TRANSLATION_RESOURCE_ID}?chapter_number=${surahNumber}`,
    ),
  ]);

  const chapter = chapterRes.chapter;
  const uthmaniVerses = uthmaniRes.verses;
  const translations = translationRes.translations;

  if (!chapter || !uthmaniVerses?.length) {
    throw new Error(`Missing data for surah ${surahNumber}`);
  }
  if (translations.length !== uthmaniVerses.length) {
    throw new Error(
      `Translation count mismatch for surah ${surahNumber}: ${translations.length} vs ${uthmaniVerses.length}`,
    );
  }
  if (chapter.verses_count !== uthmaniVerses.length) {
    throw new Error(
      `Verse count mismatch for surah ${surahNumber}: meta ${chapter.verses_count} vs ${uthmaniVerses.length}`,
    );
  }

  const verses = uthmaniVerses.map((verse, index) => {
    const ayahNumber = index + 1;
    const textUthmani = verse.text_uthmani.trim();
    if (!textUthmani) {
      throw new Error(`Empty Arabic text at ${surahNumber}:${ayahNumber}`);
    }
    const id = verseId(surahNumber, ayahNumber);
    const fileStem = audioFileName(surahNumber, ayahNumber).replace('.mp3', '');
    const audioKey = `${DEFAULT_RECITER.key}/${fileStem}`;
    return {
      id,
      surahNumber,
      ayahNumber,
      textUthmani,
      contentHash: hashText(textUthmani),
      contentVersion: CONTENT_VERSION,
      audioAssetKey: audioKey,
      audioUrl: `${DEFAULT_RECITER.audioBaseUrl}/${audioFileName(surahNumber, ayahNumber)}`,
      translationEn: stripTranslationMarkup(translations[index].text),
    };
  });

  return {
    number: surahNumber,
    nameArabic: chapter.name_arabic,
    nameLatin: chapter.name_simple,
    ayahCount: chapter.verses_count,
    revelationPlace: chapter.revelation_place,
    verses,
  };
}

function buildJuzMeta(allVerses) {
  const byOrder = allVerses;
  const juzList = [];

  for (let juz = 1; juz <= 30; juz += 1) {
    const [startSurah, startAyah] = JUZ_STARTS[juz - 1];
    const next = JUZ_STARTS[juz] ?? null;
    const startVerse = byOrder.find(
      (v) => v.surahNumber === startSurah && v.ayahNumber === startAyah,
    );
    if (!startVerse) {
      throw new Error(`Missing Juz ${juz} start ${startSurah}:${startAyah}`);
    }

    let endVerse;
    if (next) {
      const nextIndex = byOrder.findIndex(
        (v) => v.surahNumber === next[0] && v.ayahNumber === next[1],
      );
      endVerse = byOrder[nextIndex - 1];
    } else {
      endVerse = byOrder[byOrder.length - 1];
    }

    if (!endVerse) {
      throw new Error(`Missing Juz ${juz} end`);
    }

    juzList.push({
      number: juz,
      startSurahNumber: startVerse.surahNumber,
      startAyahNumber: startVerse.ayahNumber,
      endSurahNumber: endVerse.surahNumber,
      endAyahNumber: endVerse.ayahNumber,
    });
  }

  return juzList;
}

async function main() {
  const surahs = [];
  for (let n = SURAH_START; n <= SURAH_END; n += 1) {
    process.stdout.write(`Fetching surah ${n}/${SURAH_END}...\n`);
    let attempt = 0;
    for (;;) {
      attempt += 1;
      try {
        surahs.push(await fetchSurah(n));
        break;
      } catch (error) {
        if (attempt >= 4) {
          throw error;
        }
        process.stdout.write(
          `  retry ${attempt} for surah ${n}: ${error instanceof Error ? error.message : error}\n`,
        );
        await sleep(500 * attempt);
      }
    }
    await sleep(80);
  }

  let verseOrderGlobal = 0;
  const allVerses = [];
  for (const surah of surahs) {
    for (const verse of surah.verses) {
      verseOrderGlobal += 1;
      allVerses.push({ ...verse, verseOrderGlobal });
    }
  }

  if (allVerses.length !== 6236) {
    throw new Error(`Expected 6236 verses, got ${allVerses.length}`);
  }

  const corpusHash = hashText(allVerses.map((v) => `${v.id}|${v.textUthmani}`).join('\n'));
  const juz = buildJuzMeta(allVerses);

  const bundle = {
    meta: {
      surahStart: SURAH_START,
      surahEnd: SURAH_END,
      verseCount: allVerses.length,
      contentVersion: CONTENT_VERSION,
      corpusHash,
      arabicSource: 'Quran.com API v4 — text_uthmani (Uthmani script)',
      translationSource: 'Quran.com translation resource 20 — Sahih International',
      audioSource: `EveryAyah URL references (default beginner: ${DEFAULT_RECITER.key})`,
      generatedAt: new Date().toISOString(),
    },
    defaultReciterKey: DEFAULT_RECITER.key,
    reciters: [DEFAULT_RECITER],
    translation: {
      languageCode: 'en',
      name: 'Sahih International',
      source: 'quran.com:20',
      approvalStatus: 'approved',
    },
    juz,
    surahs: surahs.map((s) => ({
      number: s.number,
      nameArabic: s.nameArabic,
      nameLatin: s.nameLatin,
      ayahCount: s.ayahCount,
      revelationPlace: s.revelationPlace,
      sortOrder: s.number,
    })),
    verses: allVerses.map((v) => ({
      id: v.id,
      surahNumber: v.surahNumber,
      ayahNumber: v.ayahNumber,
      verseOrderGlobal: v.verseOrderGlobal,
      textUthmani: v.textUthmani,
      contentHash: v.contentHash,
      contentVersion: v.contentVersion,
      audioAssetKey: v.audioAssetKey,
      audioUrl: v.audioUrl,
      translationEn: v.translationEn,
    })),
  };

  const contentDir = join(ROOT, 'src/features/reader/content');
  await mkdir(contentDir, { recursive: true });
  const jsonPath = join(contentDir, 'fullQuran.json');
  // Compact JSON — bundle is large (~3MB+).
  await writeFile(jsonPath, `${JSON.stringify(bundle)}\n`, 'utf8');

  console.log(
    JSON.stringify(
      {
        surahs: bundle.surahs.length,
        verses: bundle.verses.length,
        juz: bundle.juz.length,
        corpusHash,
        defaultReciterKey: DEFAULT_RECITER.key,
        jsonPath,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
