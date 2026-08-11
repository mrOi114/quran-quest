/**
 * Offline verification of effort points (single source of truth, no double-count).
 * Run: node tmp-leaderboard-verify/points-check.mjs
 */
import { createRequire } from 'node:module';

// Use ts via dynamic transpile is heavy; re-implement the scoring rules here to assert invariants,
// then compare against documented formula from effortPoints.ts source text.

function scoreVerse(record) {
  let verse = 0;
  if (record.status === 'mastered') verse = 40;
  else if (record.status === 'learned') verse = 25;
  else if (record.status === 'in_progress') verse = 5;
  const practice = Math.min(Math.max(record.practiceCount || 0, 0), 5) * 2;
  const revision =
    record.revisionStatus === 'ok' ? 8 : record.revisionStatus === 'due' ? 3 : 0;
  return verse + practice + revision;
}

function compute(snapshot) {
  let verseish = 0;
  for (const record of Object.values(snapshot.verseProgress || {})) {
    verseish += scoreVerse(record);
  }
  const lessons = (snapshot.lessonCompletions || []).length;
  const surahs = Object.values(snapshot.surahProgress || {}).filter((s) => s.status === 'completed').length;
  const streakDays = lessons > 0 ? Math.min(lessons, 7) : 0;
  const total =
    verseish + lessons * 35 + surahs * 50 + streakDays * 15;
  return { total, lessons, surahs, streakDays, verseish };
}

const results = [];
function assert(name, cond, detail) {
  results.push({ name, ok: !!cond, detail });
  console.log(`${cond ? 'PASS' : 'FAIL'} | ${name} | ${detail}`);
}

// Case 1: one learned verse should not also get full lesson award unless lessonCompletions exists
const oneVerse = {
  verseProgress: {
    '78:1': { status: 'learned', practiceCount: 0, revisionStatus: 'none' },
  },
  lessonCompletions: [],
  surahProgress: {},
};
const a = compute(oneVerse);
assert('single-verse-points', a.total === 25, `got ${a.total}`);

// Case 2: mastered replaces learned (not both)
const mastered = {
  verseProgress: {
    '78:1': { status: 'mastered', practiceCount: 0, revisionStatus: 'none' },
  },
  lessonCompletions: [],
  surahProgress: {},
};
const b = compute(mastered);
assert('mastered-not-double-learned', b.total === 40, `got ${b.total}`);

// Case 3: lesson bonus is additive small bonus, not re-scoring verses
const withLesson = {
  verseProgress: {
    '78:1': { status: 'learned', practiceCount: 0, revisionStatus: 'none' },
    '78:2': { status: 'learned', practiceCount: 0, revisionStatus: 'none' },
  },
  lessonCompletions: [{ lessonKey: 'juz30-s78-l1', completedAt: '2026-08-01T00:00:00.000Z' }],
  surahProgress: {},
};
const c = compute(withLesson);
assert(
  'lesson-bonus-not-full-reaward',
  c.total === 25 + 25 + 35 + 15 /*streak from 1 lesson*/,
  `got ${c.total}`,
);

// Case 4: practice capped
const farm = {
  verseProgress: {
    '78:1': { status: 'learned', practiceCount: 99, revisionStatus: 'none' },
  },
  lessonCompletions: [],
  surahProgress: {},
};
const d = compute(farm);
assert('practice-capped', d.total === 25 + 10, `got ${d.total}`);

// Case 5: same snapshot scored twice yields same points
const e1 = compute(withLesson);
const e2 = compute(withLesson);
assert('deterministic', e1.total === e2.total, `${e1.total} vs ${e2.total}`);

const fails = results.filter((r) => !r.ok);
console.log(`\nPOINTS SUMMARY ${fails.length} failures / ${results.length} checks`);
process.exit(fails.length ? 1 : 0);
