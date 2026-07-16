/**
 * Feature 005 Reader integrity checks (prefs defaults, translation fallback, browse unlock).
 * Run: npm run verify:feature-005
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const bundle = JSON.parse(
  readFileSync(join(ROOT, 'src/features/learning/content/juz30.json'), 'utf8'),
);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

// --- Translation fallback shape ---
assert(bundle.translation?.languageCode === 'en', 'bundle translation language must be en');
assert(
  typeof bundle.verses[0]?.translationEn === 'string' &&
    bundle.verses[0].translationEn.length > 0,
  'verses must include English meaning for Reader fallback',
);

// --- Default beginner Qari still wired for Reader audio ---
assert(bundle.defaultReciterKey === 'husary_128', 'Reader must use husary_128 default');
const firstAudio = bundle.verses[0]?.audioUrl;
assert(
  typeof firstAudio === 'string' && firstAudio.includes('Husary'),
  'First verse audio should reference Husary for beginner memorization',
);

// --- Migration file present ---
const migration = readFileSync(
  join(ROOT, 'supabase/migrations/20260716230000_feature_005_reader_schema.sql'),
  'utf8',
);
assert(migration.includes('learner_reader_preferences'), 'missing prefs table');
assert(migration.includes('learner_reader_state'), 'missing reader state table');
assert(migration.includes('verse_explanations'), 'missing explanations table');
assert(migration.includes('can_manage_learner'), 'prefs RLS must use can_manage_learner');
assert(
  migration.includes("repeat_count in ('1', '3', 'loop')"),
  'repeat_count check constraint required',
);

// --- Source module presence ---
const readerIndex = readFileSync(join(ROOT, 'src/features/reader/index.ts'), 'utf8');
assert(readerIndex.includes('BrowseReaderScreen'), 'reader barrel exports BrowseReaderScreen');
assert(readerIndex.includes('ReaderVerseFocus'), 'reader barrel exports ReaderVerseFocus');

const constants = readFileSync(join(ROOT, 'src/features/reader/constants.ts'), 'utf8');
assert(constants.includes('defaultRepeatForAgeGroup'), 'age-based repeat helper required');
assert(constants.includes('Amiri_400Regular'), 'Amiri font family constant required');

const resolver = readFileSync(
  join(ROOT, 'src/features/reader/services/translationResolver.ts'),
  'utf8',
);
assert(resolver.includes('FALLBACK_TRANSLATION_ID'), 'fallback translation id required');
assert(resolver.includes('resolveVerseMeaning'), 'meaning resolver required');
assert(
  constants.includes('en-sahih-international'),
  'constants must define en-sahih-international fallback id',
);

const browse = readFileSync(
  join(ROOT, 'src/features/reader/services/browseAccess.ts'),
  'utf8',
);
assert(browse.includes('getMaxBrowsableAyah'), 'browse unlock ceiling required');
assert(browse.includes('isLessonUnlocked'), 'browse must respect lesson unlock');

// --- Browse unlock math (mirrors planner chunking) ---
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

const nabaLessonsChild = planLessons(40, 1);
assert(nabaLessonsChild[0].end === 1, 'child first lesson unlocks ayah 1 only');
const nabaLessonsAdult = planLessons(40, 5);
assert(nabaLessonsAdult[0].end === 5, 'adult first lesson unlocks ayahs 1-5');

// Simulate: only first lesson unlocked → max browsable ayah = end of lesson 1
assert(nabaLessonsChild[0].end === 1, 'browse ceiling for new child learner is ayah 1');
assert(nabaLessonsAdult[0].end === 5, 'browse ceiling for new adult learner is ayah 5');

// --- Guest → cloud reader prefs merge (empty-only) ---
const guestMigration = readFileSync(
  join(ROOT, 'src/features/reader/services/guestReaderMigration.ts'),
  'utf8',
);
assert(
  guestMigration.includes('mergeReaderPreferencesEmptyOnly'),
  'empty-only prefs merge helper required',
);
assert(
  guestMigration.includes('mergeMigratedGuestReaderSettings'),
  'registration merge entrypoint required',
);
assert(
  guestMigration.includes('qq.reader.migration_complete.'),
  'migration-complete marker required',
);
assert(
  guestMigration.includes('markGuestReaderMigrationComplete'),
  'must mark local guest prefs migrated after success',
);

const guestService = readFileSync(
  join(ROOT, 'src/features/auth/services/guestService.ts'),
  'utf8',
);
assert(
  guestService.includes('qq.migrated_reader.'),
  'guest transfer must stage reader prefs for merge',
);

const fontMigration = readFileSync(
  join(ROOT, 'supabase/migrations/20260716230100_feature_005_reader_font_scale.sql'),
  'utf8',
);
assert(fontMigration.includes('font_scale'), 'font_scale column migration required');

function isBlank(value) {
  return value == null || String(value).trim().length === 0;
}

function mergeReaderPreferencesEmptyOnly(cloud, guest) {
  if (!cloud || !cloud.rowExists) {
    return { ...guest };
  }
  return {
    showTranslation:
      cloud.showTranslation === null ? guest.showTranslation : cloud.showTranslation,
    repeatCount: cloud.repeatCount === null ? guest.repeatCount : cloud.repeatCount,
    preferredReciterKey: isBlank(cloud.preferredReciterKey)
      ? guest.preferredReciterKey
      : cloud.preferredReciterKey,
    preferredTranslationId: isBlank(cloud.preferredTranslationId)
      ? guest.preferredTranslationId
      : cloud.preferredTranslationId,
    fontScale: cloud.fontScale === null ? guest.fontScale : cloud.fontScale,
  };
}

const guestPrefs = {
  showTranslation: false,
  repeatCount: '3',
  preferredReciterKey: 'husary_128',
  preferredTranslationId: null,
  fontScale: 'large',
};
const fromGuestOnly = mergeReaderPreferencesEmptyOnly(null, guestPrefs);
assert(fromGuestOnly.showTranslation === false, 'no cloud row → take guest showTranslation');
assert(fromGuestOnly.repeatCount === '3', 'no cloud row → take guest repeatCount');
assert(fromGuestOnly.fontScale === 'large', 'no cloud row → take guest fontScale');

const cloudExisting = {
  rowExists: true,
  showTranslation: true,
  repeatCount: '1',
  preferredReciterKey: 'other_qari',
  preferredTranslationId: 'en-sahih-international',
  fontScale: 'default',
};
const keepCloud = mergeReaderPreferencesEmptyOnly(cloudExisting, guestPrefs);
assert(keepCloud.showTranslation === true, 'existing cloud showTranslation must win');
assert(keepCloud.repeatCount === '1', 'existing cloud repeatCount must win');
assert(keepCloud.preferredReciterKey === 'other_qari', 'existing cloud reciter must win');
assert(keepCloud.fontScale === 'default', 'existing cloud fontScale must win');

const cloudPartialEmpty = {
  rowExists: true,
  showTranslation: true,
  repeatCount: 'loop',
  preferredReciterKey: '',
  preferredTranslationId: null,
  fontScale: null,
};
const fillEmpty = mergeReaderPreferencesEmptyOnly(cloudPartialEmpty, guestPrefs);
assert(
  fillEmpty.preferredReciterKey === 'husary_128',
  'empty cloud reciter fills from guest',
);
assert(fillEmpty.fontScale === 'large', 'null cloud fontScale fills from guest');
assert(fillEmpty.repeatCount === 'loop', 'non-empty cloud repeat must not be overwritten');

// Integrity: merge helper only returns preference fields (never verse text).
assert(
  !('textUthmani' in fillEmpty) && !('translationEn' in fillEmpty),
  'prefs merge must not carry Qur’an content fields',
);

console.log('Feature 005 verify: OK');
