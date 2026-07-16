/**
 * Generates Juz 30 content from Quran.com API (Uthmani Arabic + Sahih International).
 * Writes:
 *  - src/features/learning/content/juz30.json (app bundle)
 *  - supabase/seed/feature_004_juz30_seed.sql (DB seed)
 *
 * Source: https://api.quran.com (Uthmani text, translation resource 20)
 * Default beginner audio: EveryAyah Husary_128kbps (Mahmoud Khalil Al-Husary)
 * Multi-reciter structure: reciters[] + defaultReciterKey (do not hard-code one Qari in app logic)
 */
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import https from 'node:https';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const JUZ_START = 78;
const JUZ_END = 114;
const TRANSLATION_RESOURCE_ID = 20; // Sahih International

/** V1 default beginner Qari — clear, slow, suitable for children. */
const DEFAULT_RECITER = {
  key: 'husary_128',
  name: 'Mahmoud Khalil Al-Husary',
  style: 'murattal',
  audioBaseUrl: 'https://everyayah.com/data/Husary_128kbps',
  isDefaultBeginner: true,
};

const CONTENT_VERSION = 1;

function get(url) {
  return new Promise((resolve, reject) => {
    https
      .get(
        url,
        {
          headers: {
            Accept: 'application/json',
            'User-Agent': 'quran-quest-content-seed/1.0',
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

function stripTranslationMarkup(text) {
  return text
    .replace(/<sup\b[^>]*>[\s\S]*?<\/sup>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function sqlString(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
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

async function main() {
  const surahs = [];
  for (let n = JUZ_START; n <= JUZ_END; n += 1) {
    process.stdout.write(`Fetching surah ${n}...\n`);
    surahs.push(await fetchSurah(n));
  }

  let verseOrderGlobal = 0;
  const allVerses = [];
  for (const surah of surahs) {
    for (const verse of surah.verses) {
      verseOrderGlobal += 1;
      allVerses.push({ ...verse, verseOrderGlobal });
    }
  }

  const corpusHash = hashText(allVerses.map((v) => `${v.id}|${v.textUthmani}`).join('\n'));

  const bundle = {
    meta: {
      juzNumber: 30,
      surahStart: JUZ_START,
      surahEnd: JUZ_END,
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

  if (bundle.surahs.length !== 37) {
    throw new Error(`Expected 37 surahs, got ${bundle.surahs.length}`);
  }
  const expectedAyahs = surahs.reduce((sum, s) => sum + s.ayahCount, 0);
  if (bundle.verses.length !== expectedAyahs) {
    throw new Error(`Expected ${expectedAyahs} verses, got ${bundle.verses.length}`);
  }

  const contentDir = join(ROOT, 'src/features/learning/content');
  const seedDir = join(ROOT, 'supabase/seed');
  await mkdir(contentDir, { recursive: true });
  await mkdir(seedDir, { recursive: true });

  const jsonPath = join(contentDir, 'juz30.json');
  await writeFile(jsonPath, `${JSON.stringify(bundle, null, 2)}\n`, 'utf8');

  const sqlLines = [];
  sqlLines.push('-- AUTO-GENERATED by scripts/generate-juz30-content.mjs — do not edit by hand');
  sqlLines.push(`-- corpus_hash: ${corpusHash}`);
  sqlLines.push(`-- content_version: ${CONTENT_VERSION}`);
  sqlLines.push(`-- default_beginner_reciter: ${DEFAULT_RECITER.key}`);
  sqlLines.push('-- Note: no BEGIN/COMMIT — Supabase migrations already run in a transaction.');
  sqlLines.push('');
  sqlLines.push(`insert into public.juz (number, name, surah_start, surah_end)`);
  sqlLines.push(`values (30, 'Juz Amma', ${JUZ_START}, ${JUZ_END})`);
  sqlLines.push('on conflict (number) do update set');
  sqlLines.push(`  name = excluded.name,`);
  sqlLines.push(`  surah_start = excluded.surah_start,`);
  sqlLines.push(`  surah_end = excluded.surah_end;`);
  sqlLines.push('');
  sqlLines.push(
    `insert into public.reciters (key, name, style, audio_base_url, is_default_beginner)`,
  );
  sqlLines.push(
    `values (${sqlString(DEFAULT_RECITER.key)}, ${sqlString(DEFAULT_RECITER.name)}, ${sqlString(DEFAULT_RECITER.style)}, ${sqlString(DEFAULT_RECITER.audioBaseUrl)}, true)`,
  );
  sqlLines.push('on conflict (key) do update set');
  sqlLines.push('  name = excluded.name,');
  sqlLines.push('  style = excluded.style,');
  sqlLines.push('  audio_base_url = excluded.audio_base_url,');
  sqlLines.push('  is_default_beginner = excluded.is_default_beginner;');
  sqlLines.push('');
  sqlLines.push(
    `insert into public.translations (id, language_code, name, source, approval_status)`,
  );
  sqlLines.push(
    `values ('en-sahih-international', 'en', 'Sahih International', 'quran.com:20', 'approved')`,
  );
  sqlLines.push('on conflict (id) do update set');
  sqlLines.push('  language_code = excluded.language_code,');
  sqlLines.push('  name = excluded.name,');
  sqlLines.push('  source = excluded.source,');
  sqlLines.push('  approval_status = excluded.approval_status;');
  sqlLines.push('');

  for (const surah of bundle.surahs) {
    sqlLines.push(
      `insert into public.surahs (number, juz_number, name_arabic, name_latin, ayah_count, revelation_type, sort_order)`,
    );
    sqlLines.push(
      `values (${surah.number}, 30, ${sqlString(surah.nameArabic)}, ${sqlString(surah.nameLatin)}, ${surah.ayahCount}, ${sqlString(surah.revelationPlace)}, ${surah.sortOrder})`,
    );
    sqlLines.push('on conflict (number) do update set');
    sqlLines.push('  juz_number = excluded.juz_number,');
    sqlLines.push('  name_arabic = excluded.name_arabic,');
    sqlLines.push('  name_latin = excluded.name_latin,');
    sqlLines.push('  ayah_count = excluded.ayah_count,');
    sqlLines.push('  revelation_type = excluded.revelation_type,');
    sqlLines.push('  sort_order = excluded.sort_order;');
    sqlLines.push('');
  }

  for (const verse of bundle.verses) {
    sqlLines.push(
      `insert into public.audio_assets (key, reciter_key, url, format, approval_status)`,
    );
    sqlLines.push(
      `values (${sqlString(verse.audioAssetKey)}, ${sqlString(DEFAULT_RECITER.key)}, ${sqlString(verse.audioUrl)}, 'mp3', 'approved')`,
    );
    sqlLines.push('on conflict (key) do update set');
    sqlLines.push('  reciter_key = excluded.reciter_key,');
    sqlLines.push('  url = excluded.url,');
    sqlLines.push('  format = excluded.format,');
    sqlLines.push('  approval_status = excluded.approval_status;');
  }
  sqlLines.push('');

  for (const verse of bundle.verses) {
    sqlLines.push(
      `insert into public.verses (id, surah_number, ayah_number, text_uthmani, verse_order_global, audio_asset_key, content_version, content_hash)`,
    );
    sqlLines.push(
      `values (${sqlString(verse.id)}, ${verse.surahNumber}, ${verse.ayahNumber}, ${sqlString(verse.textUthmani)}, ${verse.verseOrderGlobal}, ${sqlString(verse.audioAssetKey)}, ${verse.contentVersion}, ${sqlString(verse.contentHash)})`,
    );
    sqlLines.push('on conflict (id) do update set');
    sqlLines.push('  surah_number = excluded.surah_number,');
    sqlLines.push('  ayah_number = excluded.ayah_number,');
    sqlLines.push('  text_uthmani = excluded.text_uthmani,');
    sqlLines.push('  verse_order_global = excluded.verse_order_global,');
    sqlLines.push('  audio_asset_key = excluded.audio_asset_key,');
    sqlLines.push('  content_version = excluded.content_version,');
    sqlLines.push('  content_hash = excluded.content_hash;');
  }
  sqlLines.push('');

  for (const verse of bundle.verses) {
    sqlLines.push(
      `insert into public.verse_translations (verse_id, translation_id, text, approval_status, content_version)`,
    );
    sqlLines.push(
      `values (${sqlString(verse.id)}, 'en-sahih-international', ${sqlString(verse.translationEn)}, 'approved', ${CONTENT_VERSION})`,
    );
    sqlLines.push('on conflict (verse_id, translation_id) do update set');
    sqlLines.push('  text = excluded.text,');
    sqlLines.push('  approval_status = excluded.approval_status,');
    sqlLines.push('  content_version = excluded.content_version;');
  }
  sqlLines.push('');

  sqlLines.push(
    `insert into public.content_manifest (id, juz_number, content_version, corpus_hash, arabic_source, notes)`,
  );
  sqlLines.push(
    `values ('juz30-v${CONTENT_VERSION}', 30, ${CONTENT_VERSION}, ${sqlString(corpusHash)}, 'Quran.com API v4 text_uthmani', 'Feature 004 seed — default beginner Qari: Al-Husary')`,
  );
  sqlLines.push('on conflict (id) do update set');
  sqlLines.push('  corpus_hash = excluded.corpus_hash,');
  sqlLines.push('  content_version = excluded.content_version,');
  sqlLines.push('  arabic_source = excluded.arabic_source,');
  sqlLines.push('  notes = excluded.notes;');
  sqlLines.push('');

  const sqlPath = join(seedDir, 'feature_004_juz30_seed.sql');
  await writeFile(sqlPath, `${sqlLines.join('\n')}\n`, 'utf8');

  console.log(
    JSON.stringify(
      {
        surahs: bundle.surahs.length,
        verses: bundle.verses.length,
        corpusHash,
        defaultReciterKey: DEFAULT_RECITER.key,
        jsonPath,
        sqlPath,
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
