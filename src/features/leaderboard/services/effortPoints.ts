import type { LearningSnapshot, VerseProgressRecord } from '@/features/learning';
import {
  countCompletedLessons,
  countCompletedSurahs,
  isLearnedStatus,
} from '@/features/learning';

import { JUZ_30_SURAH_RANGE } from '../constants';

/**
 * Single source of truth for Leaderboard / Home effort points.
 *
 * Rules:
 * - Each verse contributes once (status + capped practice + revision).
 * - Lesson completions add a small “test passed” bonus only (verses already scored).
 * - Surah completions add a finish bonus only (verses already scored).
 * - Streak adds consistency points.
 * - Never double-count the same action as a second full award.
 */
export type EffortBreakdown = {
  versePoints: number;
  practicePoints: number;
  revisionPoints: number;
  lessonBonusPoints: number;
  surahBonusPoints: number;
  streakPoints: number;
  /** Unique Islamic game challenge completions — same ledger, never a second XP system. */
  gameBonusPoints: number;
  totalPoints: number;
  versesLearned: number;
  versesMastered: number;
  versesInProgress: number;
  practiceActions: number;
  revisionOkCount: number;
  lessonsCompleted: number;
  surahsCompleted: number;
  streakDays: number;
  juz30VersePoints: number;
};

export type EffortExtras = {
  /** Precomputed from game progress (unique completions × GAME_CHALLENGE_POINTS). */
  gameBonusPoints?: number;
};

function surahNumberFromVerseId(verseId: string): number | null {
  const match = /^(\d+):/.exec(verseId);
  if (!match) {
    return null;
  }
  return Number(match[1]);
}

function scoreVerse(record: VerseProgressRecord): {
  verse: number;
  practice: number;
  revision: number;
  learned: boolean;
  mastered: boolean;
  inProgress: boolean;
} {
  let verse = 0;
  let learned = false;
  let mastered = false;
  let inProgress = false;

  if (record.status === 'mastered') {
    verse = 40;
    mastered = true;
    learned = true;
  } else if (record.status === 'learned') {
    verse = 25;
    learned = true;
  } else if (record.status === 'in_progress') {
    verse = 5;
    inProgress = true;
  }

  // Practice beyond the mark-learned action — capped so repeats cannot farm endlessly.
  const practice = Math.min(Math.max(record.practiceCount, 0), 5) * 2;
  const revision =
    record.revisionStatus === 'ok' ? 8 : record.revisionStatus === 'due' ? 3 : 0;

  return { verse, practice, revision, learned, mastered, inProgress };
}

export function estimateStreakDays(snapshot: LearningSnapshot): number {
  const dayKeys = new Set<string>();

  for (const record of Object.values(snapshot.verseProgress)) {
    if (record.learnedAt) {
      dayKeys.add(record.learnedAt.slice(0, 10));
    }
    if (record.lastPracticedAt) {
      dayKeys.add(record.lastPracticedAt.slice(0, 10));
    }
  }

  for (const completion of snapshot.lessonCompletions) {
    dayKeys.add(completion.completedAt.slice(0, 10));
  }

  if (dayKeys.size > 0) {
    return Math.min(dayKeys.size, 30);
  }

  const lessons = countCompletedLessons(snapshot);
  return lessons > 0 ? Math.min(lessons, 7) : 0;
}

export function computeEffortBreakdown(
  snapshot: LearningSnapshot,
  extras: EffortExtras = {},
): EffortBreakdown {
  let versePoints = 0;
  let practicePoints = 0;
  let revisionPoints = 0;
  let versesLearned = 0;
  let versesMastered = 0;
  let versesInProgress = 0;
  let practiceActions = 0;
  let revisionOkCount = 0;
  let juz30VersePoints = 0;

  for (const record of Object.values(snapshot.verseProgress)) {
    const scored = scoreVerse(record);
    versePoints += scored.verse;
    practicePoints += scored.practice;
    revisionPoints += scored.revision;
    practiceActions += Math.min(Math.max(record.practiceCount, 0), 5);
    if (scored.revision > 0 && record.revisionStatus === 'ok') {
      revisionOkCount += 1;
    }
    if (scored.mastered) {
      versesMastered += 1;
    } else if (scored.learned) {
      versesLearned += 1;
    } else if (scored.inProgress) {
      versesInProgress += 1;
    }

    const surahNumber = surahNumberFromVerseId(record.verseId);
    if (
      surahNumber != null &&
      surahNumber >= JUZ_30_SURAH_RANGE.start &&
      surahNumber <= JUZ_30_SURAH_RANGE.end
    ) {
      juz30VersePoints += scored.verse + scored.practice + scored.revision;
    }
  }

  const lessonsCompleted = countCompletedLessons(snapshot);
  const surahsCompleted = countCompletedSurahs(snapshot);
  const streakDays = estimateStreakDays(snapshot);

  // Small completion bonuses — not a second full award for the same verses.
  const lessonBonusPoints = lessonsCompleted * 35;
  const surahBonusPoints = surahsCompleted * 50;
  const streakPoints = streakDays * 15;
  const gameBonusPoints = Math.max(0, extras.gameBonusPoints ?? 0);

  const totalPoints =
    versePoints +
    practicePoints +
    revisionPoints +
    lessonBonusPoints +
    surahBonusPoints +
    streakPoints +
    gameBonusPoints;

  return {
    versePoints,
    practicePoints,
    revisionPoints,
    lessonBonusPoints,
    surahBonusPoints,
    streakPoints,
    gameBonusPoints,
    totalPoints,
    versesLearned: versesLearned + versesMastered,
    versesMastered,
    versesInProgress,
    practiceActions,
    revisionOkCount,
    lessonsCompleted,
    surahsCompleted,
    streakDays,
    juz30VersePoints:
      juz30VersePoints + lessonsCompleted * 10 + Math.min(surahsCompleted, 37) * 15,
  };
}

export function computeEffortPoints(
  snapshot: LearningSnapshot,
  extras: EffortExtras = {},
): number {
  return computeEffortBreakdown(snapshot, extras).totalPoints;
}

export function isLearnedOrMastered(record: VerseProgressRecord | undefined): boolean {
  return isLearnedStatus(record?.status);
}
