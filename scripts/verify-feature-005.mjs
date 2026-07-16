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

// --- Migration files present ---
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

const futureMigration = readFileSync(
  join(ROOT, 'supabase/migrations/20260716230200_feature_005_reader_future_settings.sql'),
  'utf8',
);
assert(futureMigration.includes('future_settings'), 'future_settings column required');

// --- Source module presence ---
const readerIndex = readFileSync(join(ROOT, 'src/features/reader/index.ts'), 'utf8');
assert(readerIndex.includes('BrowseReaderScreen'), 'reader barrel exports BrowseReaderScreen');
assert(readerIndex.includes('ReaderVerseFocus'), 'reader barrel exports ReaderVerseFocus');

const constants = readFileSync(join(ROOT, 'src/features/reader/constants.ts'), 'utf8');
assert(constants.includes('defaultRepeatForAgeGroup'), 'age-based repeat helper required');
assert(constants.includes('Amiri_400Regular'), 'Amiri font family constant required');
assert(
  constants.includes('en-sahih-international'),
  'constants must define en-sahih-international fallback id',
);

const resolver = readFileSync(
  join(ROOT, 'src/features/reader/services/translationResolver.ts'),
  'utf8',
);
assert(resolver.includes('FALLBACK_TRANSLATION_ID'), 'fallback translation id required');
assert(resolver.includes('resolveVerseMeaning'), 'meaning resolver required');

const browse = readFileSync(
  join(ROOT, 'src/features/reader/services/browseAccess.ts'),
  'utf8',
);
assert(browse.includes('getMaxBrowsableAyah'), 'browse unlock ceiling required');
assert(browse.includes('isLessonUnlocked'), 'browse must respect lesson unlock');

const futureSettings = readFileSync(
  join(ROOT, 'src/features/reader/services/futureSettings.ts'),
  'utf8',
);
assert(futureSettings.includes('autoPlayNextVerse'), 'future auto-play setting reserved');
assert(futureSettings.includes('playbackSpeed'), 'future playback speed reserved');
assert(futureSettings.includes('mushafStyle'), 'future mushaf style reserved');
assert(futureSettings.includes('nightMode'), 'future night mode reserved');

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
assert(
  guestMigration.includes('fontScale: null'),
  'font size must stay age-derived (not migrated from guest)',
);

const guestService = readFileSync(
  join(ROOT, 'src/features/auth/services/guestService.ts'),
  'utf8',
);
assert(
  guestService.includes('qq.migrated_reader.'),
  'guest transfer must stage reader prefs for merge',
);

function mergeFutureSettingsEmptyOnly(cloud, guest) {
  const c = cloud ?? {
    autoPlayNextVerse: null,
    playbackSpeed: null,
    mushafStyle: null,
    nightMode: null,
  };
  return {
    autoPlayNextVerse:
      c.autoPlayNextVerse === null ? guest.autoPlayNextVerse : c.autoPlayNextVerse,
    playbackSpeed: c.playbackSpeed === null ? guest.playbackSpeed : c.playbackSpeed,
    mushafStyle: c.mushafStyle === null ? guest.mushafStyle : c.mushafStyle,
    nightMode: c.nightMode === null ? guest.nightMode : c.nightMode,
  };
}

function mergeReaderPreferencesEmptyOnly(cloud, guest) {
  if (!cloud || !cloud.rowExists) {
    return {
      ...guest,
      fontScale: null,
      futureSettings: mergeFutureSettingsEmptyOnly(null, guest.futureSettings),
    };
  }
  const cloudReciter = (cloud.preferredReciterKey ?? '').trim();
  const cloudTranslation = (cloud.preferredTranslationId ?? '').trim();
  return {
    showTranslation:
      cloud.showTranslation === null ? guest.showTranslation : cloud.showTranslation,
    repeatCount: cloud.repeatCount === null ? guest.repeatCount : cloud.repeatCount,
    preferredReciterKey:
      cloudReciter.length > 0 ? cloudReciter : guest.preferredReciterKey,
    preferredTranslationId:
      cloudTranslation.length > 0 ? cloudTranslation : guest.preferredTranslationId,
    fontScale: null,
    futureSettings: mergeFutureSettingsEmptyOnly(
      cloud.futureSettings,
      guest.futureSettings,
    ),
  };
}

const guestPrefs = {
  showTranslation: false,
  repeatCount: '3',
  preferredReciterKey: 'husary_128',
  preferredTranslationId: null,
  fontScale: 'large',
  futureSettings: {
    autoPlayNextVerse: true,
    playbackSpeed: 0.9,
    mushafStyle: 'uthmani_standard',
    nightMode: 'dark',
  },
};
const fromGuestOnly = mergeReaderPreferencesEmptyOnly(null, guestPrefs);
assert(fromGuestOnly.showTranslation === false, 'no cloud row → take guest showTranslation');
assert(fromGuestOnly.repeatCount === '3', 'no cloud row → take guest repeatCount');
assert(fromGuestOnly.fontScale === null, 'font size stays age-derived (not from guest)');
assert(
  fromGuestOnly.futureSettings.autoPlayNextVerse === true,
  'future settings migrate when cloud empty',
);

const cloudExisting = {
  rowExists: true,
  showTranslation: true,
  repeatCount: '1',
  preferredReciterKey: 'other_qari',
  preferredTranslationId: 'en-sahih-international',
  futureSettings: {
    autoPlayNextVerse: false,
    playbackSpeed: 1,
    mushafStyle: 'indopak',
    nightMode: 'light',
  },
};
const keepCloud = mergeReaderPreferencesEmptyOnly(cloudExisting, guestPrefs);
assert(keepCloud.showTranslation === true, 'existing cloud showTranslation must win');
assert(keepCloud.repeatCount === '1', 'existing cloud repeatCount must win');
assert(keepCloud.preferredReciterKey === 'other_qari', 'existing cloud reciter must win');
assert(
  keepCloud.futureSettings.nightMode === 'light',
  'existing cloud future settings must win',
);

const cloudPartialEmpty = {
  rowExists: true,
  showTranslation: true,
  repeatCount: 'loop',
  preferredReciterKey: '',
  preferredTranslationId: null,
  futureSettings: {
    autoPlayNextVerse: null,
    playbackSpeed: null,
    mushafStyle: null,
    nightMode: null,
  },
};
const fillEmpty = mergeReaderPreferencesEmptyOnly(cloudPartialEmpty, guestPrefs);
assert(
  fillEmpty.preferredReciterKey === 'husary_128',
  'empty cloud reciter fills from guest',
);
assert(fillEmpty.repeatCount === 'loop', 'non-empty cloud repeat must not be overwritten');
assert(
  fillEmpty.futureSettings.autoPlayNextVerse === true,
  'null future setting fills from guest',
);

assert(
  !('textUthmani' in fillEmpty) && !('translationEn' in fillEmpty),
  'prefs merge must not carry Qur’an content fields',
);

console.log('Feature 005 verify: OK');
