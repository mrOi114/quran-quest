/**
 * Feature 004 integrity checks (content bundle + lesson sizing math).
 * Run: npm run verify:feature-004
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const bundle = JSON.parse(
  readFileSync(join(ROOT, 'src/features/learning/content/juz30.json'), 'utf8'),
);

const VERSES_PER_LESSON = {
  child_3_6: 1,
  child_7_10: 2,
  child_11_14: 3,
  teen_15_17: 4,
  adult_18_plus: 5,
};

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function hashText(text) {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

function planLessons(ayahCount, chunk) {
  const lessons = [];
  let index = 1;
  for (let start = 1; start <= ayahCount; start += chunk) {
    const end = Math.min(start + chunk - 1, ayahCount);
    lessons.push({ index, start, end });
    index += 1;
  }
  return lessons;
}

assert(bundle.surahs.length === 37, `Expected 37 surahs, got ${bundle.surahs.length}`);
assert(bundle.verses.length === 564, `Expected 564 verses, got ${bundle.verses.length}`);
assert(bundle.meta.surahStart === 78 && bundle.meta.surahEnd === 114, 'Juz 30 bounds');

const recomputed = hashText(
  bundle.verses.map((v) => `${v.id}|${v.textUthmani}`).join('\n'),
);
assert(
  recomputed === bundle.meta.corpusHash,
  `Corpus hash mismatch: ${recomputed} vs ${bundle.meta.corpusHash}`,
);

for (const verse of bundle.verses) {
  assert(verse.textUthmani.trim().length > 0, `Empty Arabic at ${verse.id}`);
  assert(
    hashText(verse.textUthmani) === verse.contentHash,
    `Verse hash mismatch at ${verse.id}`,
  );
  assert(verse.translationEn.trim().length > 0, `Empty translation at ${verse.id}`);
  assert(verse.audioUrl.startsWith('https://'), `Bad audio URL at ${verse.id}`);
}

const naba = bundle.surahs.find((s) => s.number === 78);
assert(naba?.ayahCount === 40, 'An-Naba should have 40 ayahs');
const childLessons = planLessons(40, VERSES_PER_LESSON.child_3_6);
assert(childLessons.length === 40, 'child_3_6 should be 1 ayah per lesson');
const adultLessons = planLessons(40, VERSES_PER_LESSON.adult_18_plus);
assert(adultLessons.length === 8, 'adult_18_plus An-Naba should be 8 lessons');
assert(adultLessons[0].start === 1 && adultLessons[0].end === 5, 'first adult lesson 1-5');
assert(adultLessons[7].start === 36 && adultLessons[7].end === 40, 'last adult lesson 36-40');

const ikhlas = bundle.surahs.find((s) => s.number === 112);
assert(ikhlas?.ayahCount === 4, 'Al-Ikhlas ayah count');
assert(planLessons(4, 5).length === 1, 'short surah stays one lesson for adults');

// Default beginner Qari: Mahmoud Khalil Al-Husary (multi-reciter catalog, not hard-coded UI)
assert(bundle.defaultReciterKey === 'husary_128', 'defaultReciterKey must be husary_128');
assert(Array.isArray(bundle.reciters) && bundle.reciters.length >= 1, 'reciters catalog required');
const defaultReciter = bundle.reciters.find((r) => r.isDefaultBeginner);
assert(defaultReciter?.key === 'husary_128', 'isDefaultBeginner must be husary_128');
assert(
  defaultReciter?.name === 'Mahmoud Khalil Al-Husary',
  'Default beginner Qari name mismatch',
);
assert(
  defaultReciter?.audioBaseUrl.includes('Husary_128kbps'),
  'Default audio base must be Husary_128kbps',
);
assert(
  bundle.verses.every((v) => v.audioUrl.includes('Husary_128kbps')),
  'Verse audio URLs must use Husary_128kbps',
);
assert(
  bundle.verses.every((v) => v.audioAssetKey.startsWith('husary_128/')),
  'Verse audio keys must be under husary_128/',
);
assert(
  !JSON.stringify(bundle).includes('alafasy_128'),
  'Bundle must not hard-require Alafasy as default',
);

const schema = readFileSync(
  join(ROOT, 'supabase/migrations/20260716220000_feature_004_learning_schema.sql'),
  'utf8',
);
const seedSql = readFileSync(
  join(ROOT, 'supabase/migrations/20260716220100_feature_004_juz30_seed.sql'),
  'utf8',
);
const beginnerSql = readFileSync(
  join(ROOT, 'supabase/migrations/20260716220200_feature_004_beginner_qari.sql'),
  'utf8',
);

const requiredSchema = [
  'create table public.juz',
  'create table public.verses',
  'create table public.verse_translations',
  'create table public.verse_tajweed',
  'create table public.learner_learning_state',
  'create table public.verse_progress',
  'create or replace function public.can_manage_learner',
  'revoke insert, update, delete on public.verses',
  'is_default_beginner',
  'reciters_one_default_beginner_idx',
];
for (const snippet of requiredSchema) {
  assert(schema.toLowerCase().includes(snippet.toLowerCase()), `Schema missing: ${snippet}`);
}
assert(
  beginnerSql.includes('is_default_beginner'),
  'Beginner Qari migration must set is_default_beginner',
);
assert(beginnerSql.includes('husary_128'), 'Beginner Qari migration must reference husary_128');

const verseInserts = (seedSql.match(/insert into public\.verses/gi) || []).length;
const translationInserts = (seedSql.match(/insert into public\.verse_translations/gi) || [])
  .length;
assert(verseInserts === 564, `Seed verse inserts expected 564, got ${verseInserts}`);
assert(
  translationInserts === 564,
  `Seed translation inserts expected 564, got ${translationInserts}`,
);
assert(!/^\s*begin;/im.test(seedSql), 'Seed migration must not wrap BEGIN/COMMIT');
assert(seedSql.includes('husary_128'), 'Seed must include husary_128 reciter');
assert(seedSql.includes('Husary_128kbps'), 'Seed must include Husary_128kbps URLs');
assert(seedSql.includes('is_default_beginner'), 'Seed must set is_default_beginner');
assert(!seedSql.includes('alafasy_128'), 'Seed must not default to Alafasy');

console.log(
  JSON.stringify(
    {
      ok: true,
      surahs: bundle.surahs.length,
      verses: bundle.verses.length,
      corpusHash: bundle.meta.corpusHash,
      arabicSource: bundle.meta.arabicSource,
      translationSource: bundle.meta.translationSource,
      defaultReciterKey: bundle.defaultReciterKey,
      defaultReciterName: defaultReciter.name,
      migrationVerseInserts: verseInserts,
      migrationTranslationInserts: translationInserts,
      dockerNote:
        'Local supabase start requires Docker Desktop; SQL structure validated statically here.',
    },
    null,
    2,
  ),
);
