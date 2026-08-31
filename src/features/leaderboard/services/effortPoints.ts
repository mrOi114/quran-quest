import type { LearningSnapshot, VerseProgressRecord } from '@/features/learning';
import {
  countCompletedLessons,
  countCompletedSurahs,
  isLearnedStatus,
} from '@/features/learning';

import { JUZ_30_SURAH_RANGE } from '../constants';
import { CURRENT_POWER_DAILY_DECAY, CURRENT_POWER_GRACE_DAYS } from '../constants';

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

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

/** Monday 00:00 UTC — same week on every device. */
export function currentUtcWeekStart(now = new Date()): Date {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const weekday = start.getUTCDay();
  const daysFromMonday = (weekday + 6) % 7;
  start.setUTCDate(start.getUTCDate() - daysFromMonday);
  return start;
}

export function isInCurrentUtcWeek(iso: string | null | undefined, now = new Date()): boolean {
  if (!iso) {
    return false;
  }
  const value = Date.parse(iso);
  if (!Number.isFinite(value)) {
    return false;
  }
  const start = currentUtcWeekStart(now).getTime();
  return value >= start && value < start + MS_PER_WEEK;
}

/** Same effort rules as the lifetime board, limited to this UTC week. */
export function computeWeeklyEffortBreakdown(
  snapshot: LearningSnapshot,
  extras: EffortExtras = {},
  now = new Date(),
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
  const dayKeys = new Set<string>();

  for (const record of Object.values(snapshot.verseProgress)) {
    const learnedThisWeek = isInCurrentUtcWeek(record.learnedAt, now);
    const practicedThisWeek = isInCurrentUtcWeek(record.lastPracticedAt, now);
    if (!learnedThisWeek && !practicedThisWeek) {
      continue;
    }
    if (learnedThisWeek && record.learnedAt) {
      dayKeys.add(record.learnedAt.slice(0, 10));
    }
    if (practicedThisWeek && record.lastPracticedAt) {
      dayKeys.add(record.lastPracticedAt.slice(0, 10));
    }

    const scored = scoreVerse(record);
    if (learnedThisWeek) {
      versePoints += scored.verse;
      if (scored.mastered) {
        versesMastered += 1;
      } else if (scored.learned) {
        versesLearned += 1;
      } else if (scored.inProgress) {
        versesInProgress += 1;
      }
    }
    if (practicedThisWeek) {
      practicePoints += scored.practice;
      revisionPoints += scored.revision;
      practiceActions += Math.min(Math.max(record.practiceCount, 0), 5);
      if (scored.revision > 0 && record.revisionStatus === 'ok') {
        revisionOkCount += 1;
      }
    }

    const surahNumber = surahNumberFromVerseId(record.verseId);
    if (
      surahNumber != null &&
      surahNumber >= JUZ_30_SURAH_RANGE.start &&
      surahNumber <= JUZ_30_SURAH_RANGE.end
    ) {
      juz30VersePoints +=
        (learnedThisWeek ? scored.verse : 0) + (practicedThisWeek ? scored.practice + scored.revision : 0);
    }
  }

  const weeklyLessons = snapshot.lessonCompletions.filter((item) =>
    isInCurrentUtcWeek(item.completedAt, now),
  );
  for (const completion of weeklyLessons) {
    dayKeys.add(completion.completedAt.slice(0, 10));
  }

  let weeklySurahs = 0;
  for (const record of Object.values(snapshot.surahProgress)) {
    if (record.status === 'completed' && isInCurrentUtcWeek(record.completedAt, now)) {
      weeklySurahs += 1;
      if (record.completedAt) {
        dayKeys.add(record.completedAt.slice(0, 10));
      }
    }
  }

  const lessonsCompleted = weeklyLessons.length;
  const surahsCompleted = weeklySurahs;
  const streakDays = Math.min(dayKeys.size, 7);
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

export function isLearnedOrMastered(record: VerseProgressRecord | undefined): boolean {
  return isLearnedStatus(record?.status);
}

const MS_PER_DAY = 86_400_000;

export function latestLearningActivityAt(
  snapshot: LearningSnapshot,
  extraIso: Array<string | null | undefined> = [],
): string | null {
  const times: number[] = [];
  const push = (iso: string | null | undefined) => {
    if (!iso) {
      return;
    }
    const value = Date.parse(iso);
    if (Number.isFinite(value)) {
      times.push(value);
    }
  };

  push(snapshot.state.updatedAt);
  for (const record of Object.values(snapshot.verseProgress)) {
    push(record.learnedAt);
    push(record.lastPracticedAt);
  }
  for (const record of Object.values(snapshot.surahProgress)) {
    push(record.completedAt);
  }
  for (const completion of snapshot.lessonCompletions) {
    push(completion.completedAt);
  }
  for (const extra of extraIso) {
    push(extra);
  }

  if (times.length === 0) {
    return null;
  }
  return new Date(Math.max(...times)).toISOString();
}

/** Derived Current Power from Lifetime XP. Never writes, never lowers stored XP. */
export function computeCurrentPower(
  lifetimePoints: number,
  lastActivityAt: string | null,
  now = new Date(),
): number {
  const lifetime = Math.max(0, Math.round(lifetimePoints));
  if (lifetime === 0) {
    return 0;
  }
  if (!lastActivityAt) {
    return lifetime;
  }
  const last = Date.parse(lastActivityAt);
  if (!Number.isFinite(last)) {
    return lifetime;
  }
  const idleDays = Math.max(0, Math.floor((now.getTime() - last) / MS_PER_DAY));
  const extraDays = Math.max(0, idleDays - CURRENT_POWER_GRACE_DAYS);
  if (extraDays === 0) {
    return lifetime;
  }
  const kept = Math.max(0, 1 - extraDays * CURRENT_POWER_DAILY_DECAY);
  return Math.max(0, Math.round(lifetime * kept));
}
