import type { AgeGroupId } from '@/features/auth';

import {
  JUZ_30_SURAH_END,
  JUZ_30_SURAH_START,
  MUSHAF_SURAH_END,
  MUSHAF_SURAH_START,
  VERSES_PER_LESSON,
} from '../constants';
import { getSurah, listSurahs, makeVerseId } from '../content';
import type { LessonPlan, LessonSummary, LearningSnapshot } from '../types';

/**
 * Canonical lesson keys:
 * - Legacy Juz 30 progress: `juz30-s{surah}-l{index}` (surahs 78–114)
 * - Full mushaf: `s{surah}-l{index}` (surahs 1–77; also accepted for 78–114)
 */
export function buildLessonKey(surahNumber: number, lessonIndex: number): string {
  if (surahNumber >= JUZ_30_SURAH_START && surahNumber <= JUZ_30_SURAH_END) {
    return `juz30-s${surahNumber}-l${lessonIndex}`;
  }
  return `s${surahNumber}-l${lessonIndex}`;
}

export function parseLessonKey(
  lessonKey: string,
): { surahNumber: number; lessonIndex: number } | null {
  const legacy = /^juz30-s(\d+)-l(\d+)$/.exec(lessonKey);
  const modern = /^s(\d+)-l(\d+)$/.exec(lessonKey);
  const match = legacy ?? modern;
  if (!match) {
    return null;
  }
  const surahNumber = Number(match[1]);
  const lessonIndex = Number(match[2]);
  if (
    !Number.isInteger(surahNumber) ||
    !Number.isInteger(lessonIndex) ||
    surahNumber < MUSHAF_SURAH_START ||
    surahNumber > MUSHAF_SURAH_END ||
    lessonIndex < 1
  ) {
    return null;
  }
  return { surahNumber, lessonIndex };
}

export function planSurahLessons(
  surahNumber: number,
  ageGroup: AgeGroupId,
): LessonPlan[] {
  const surah = getSurah(surahNumber);
  if (!surah) {
    return [];
  }

  const chunk = VERSES_PER_LESSON[ageGroup];
  const plans: LessonPlan[] = [];
  let lessonIndex = 1;

  for (let start = 1; start <= surah.ayahCount; start += chunk) {
    const end = Math.min(start + chunk - 1, surah.ayahCount);
    const verseIds: string[] = [];
    for (let ayah = start; ayah <= end; ayah += 1) {
      verseIds.push(makeVerseId(surahNumber, ayah));
    }
    plans.push({
      lessonKey: buildLessonKey(surahNumber, lessonIndex),
      surahNumber,
      lessonIndex,
      startAyah: start,
      endAyah: end,
      ageGroup,
      verseIds,
    });
    lessonIndex += 1;
  }

  return plans;
}

export function getLessonPlan(
  lessonKey: string,
  ageGroup: AgeGroupId,
): LessonPlan | null {
  const parsed = parseLessonKey(lessonKey);
  if (!parsed) {
    return null;
  }
  const plans = planSurahLessons(parsed.surahNumber, ageGroup);
  return plans.find((plan) => plan.lessonIndex === parsed.lessonIndex) ?? null;
}

export function getFirstLessonPlan(ageGroup: AgeGroupId): LessonPlan {
  const plans = planSurahLessons(MUSHAF_SURAH_START, ageGroup);
  const first = plans[0];
  if (!first) {
    throw new Error('Full Qur’an content missing first lesson');
  }
  return first;
}

export function getNextLessonPlan(
  current: LessonPlan,
  ageGroup: AgeGroupId,
): LessonPlan | null {
  const sameSurah = planSurahLessons(current.surahNumber, ageGroup);
  const nextInSurah = sameSurah.find(
    (plan) => plan.lessonIndex === current.lessonIndex + 1,
  );
  if (nextInSurah) {
    return nextInSurah;
  }

  if (current.surahNumber >= MUSHAF_SURAH_END) {
    return null;
  }

  const nextSurahPlans = planSurahLessons(current.surahNumber + 1, ageGroup);
  return nextSurahPlans[0] ?? null;
}

export function isLessonCompleted(
  lesson: LessonPlan,
  snapshot: LearningSnapshot,
): boolean {
  return snapshot.lessonCompletions.some((item) => item.lessonKey === lesson.lessonKey);
}

/**
 * Per-surah unlock: any surah’s first lesson is available; later chunks
 * unlock after prior lessons in the same surah are complete.
 * (Enables Juz → Surah choice across all 30 Juz without a 6k-verse gate.)
 */
/**
 * Incomplete prior lessons in the same surah that must be known to unlock `lesson`.
 */
export function getRequiredPriorLessons(
  lesson: LessonPlan,
  snapshot: LearningSnapshot,
  ageGroup: AgeGroupId,
): LessonPlan[] {
  return planSurahLessons(lesson.surahNumber, ageGroup).filter(
    (prior) =>
      prior.lessonIndex < lesson.lessonIndex && !isLessonCompleted(prior, snapshot),
  );
}

export function isLessonUnlocked(
  lesson: LessonPlan,
  snapshot: LearningSnapshot,
  ageGroup: AgeGroupId,
): boolean {
  if (snapshot.state.currentLessonKey === lesson.lessonKey) {
    return true;
  }
  if (isLessonCompleted(lesson, snapshot)) {
    return true;
  }

  if (lesson.lessonIndex <= 1) {
    return true;
  }

  const sameSurah = planSurahLessons(lesson.surahNumber, ageGroup);
  for (const prior of sameSurah) {
    if (prior.lessonIndex >= lesson.lessonIndex) {
      break;
    }
    if (!isLessonCompleted(prior, snapshot)) {
      return false;
    }
  }
  return true;
}

export function buildLinearLessonPath(ageGroup: AgeGroupId): LessonPlan[] {
  const path: LessonPlan[] = [];
  for (const surah of listSurahs()) {
    path.push(...planSurahLessons(surah.number, ageGroup));
  }
  return path;
}

export function buildSurahLessonPath(
  surahNumber: number,
  ageGroup: AgeGroupId,
): LessonPlan[] {
  return planSurahLessons(surahNumber, ageGroup);
}

export function lessonProgressPercent(
  lesson: LessonPlan,
  snapshot: LearningSnapshot,
): number {
  if (lesson.verseIds.length === 0) {
    return 0;
  }
  const learned = lesson.verseIds.filter((verseId) => {
    const status = snapshot.verseProgress[verseId]?.status;
    return status === 'learned' || status === 'mastered';
  }).length;
  return Math.round((learned / lesson.verseIds.length) * 100);
}

export function toLessonSummary(
  lesson: LessonPlan,
  snapshot: LearningSnapshot,
  ageGroup: AgeGroupId,
): LessonSummary {
  const surah = getSurah(lesson.surahNumber);
  const complete = isLessonCompleted(lesson, snapshot);
  const progressPercent = lessonProgressPercent(lesson, snapshot);
  const unlocked = isLessonUnlocked(lesson, snapshot, ageGroup);

  return {
    lessonKey: lesson.lessonKey,
    surahNumber: lesson.surahNumber,
    surahName: surah?.nameLatin ?? `Surah ${lesson.surahNumber}`,
    surahArabic: surah?.nameArabic ?? '',
    lessonLabel: `Lesson ${lesson.lessonIndex}`,
    lessonIndex: lesson.lessonIndex,
    startAyah: lesson.startAyah,
    endAyah: lesson.endAyah,
    progressPercent,
    hasStarted: snapshot.hasStarted || progressPercent > 0 || complete,
    isComplete: complete,
    isLocked: !unlocked,
    isCurrent: snapshot.state.currentLessonKey === lesson.lessonKey,
  };
}

export function listLessonSummariesForSurah(
  surahNumber: number,
  snapshot: LearningSnapshot,
  ageGroup: AgeGroupId,
): LessonSummary[] {
  return planSurahLessons(surahNumber, ageGroup).map((lesson) =>
    toLessonSummary(lesson, snapshot, ageGroup),
  );
}

export function resolveCurrentLessonPlan(
  snapshot: LearningSnapshot,
  ageGroup: AgeGroupId,
): LessonPlan {
  const fromState = getLessonPlan(snapshot.state.currentLessonKey, ageGroup);
  if (fromState && !isLessonCompleted(fromState, snapshot)) {
    return fromState;
  }

  // Prefer continuing within the current surah, then walk the full mushaf path.
  if (fromState) {
    const nextInSurah = getNextLessonPlan(fromState, ageGroup);
    if (nextInSurah && nextInSurah.surahNumber === fromState.surahNumber) {
      if (!isLessonCompleted(nextInSurah, snapshot)) {
        return nextInSurah;
      }
    }
  }

  const path = buildLinearLessonPath(ageGroup);
  for (const plan of path) {
    if (!isLessonCompleted(plan, snapshot)) {
      return plan;
    }
  }

  return path[path.length - 1] ?? getFirstLessonPlan(ageGroup);
}

export function countCompletedSurahs(snapshot: LearningSnapshot): number {
  return Object.values(snapshot.surahProgress).filter(
    (item) => item.status === 'completed',
  ).length;
}

export function countCompletedLessons(snapshot: LearningSnapshot): number {
  return snapshot.lessonCompletions.length;
}
