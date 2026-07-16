import AsyncStorage from '@react-native-async-storage/async-storage';

import { FIRST_LESSON } from '../constants';
import type { HomeLessonSummary } from '../types';

const LAST_LESSON_PREFIX = 'qq.home.last_lesson.';

type StoredLastLesson = {
  lessonId: string;
  surahNumber: number;
  surahName: string;
  surahArabic: string;
  lessonLabel: string;
  progressPercent: number;
};

function storageKey(learnerId: string): string {
  return `${LAST_LESSON_PREFIX}${learnerId}`;
}

function toSummary(stored: StoredLastLesson): HomeLessonSummary {
  return {
    lessonId: stored.lessonId,
    surahNumber: stored.surahNumber,
    surahName: stored.surahName,
    surahArabic: stored.surahArabic,
    lessonLabel: stored.lessonLabel,
    progressPercent: Math.min(100, Math.max(0, stored.progressPercent)),
    hasStarted: true,
  };
}

export function getDefaultFirstLesson(): HomeLessonSummary {
  return {
    ...FIRST_LESSON,
    hasStarted: false,
  };
}

export async function getLastLesson(
  learnerId: string,
): Promise<HomeLessonSummary | null> {
  const raw = await AsyncStorage.getItem(storageKey(learnerId));
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as StoredLastLesson;
    if (!parsed.lessonId || !parsed.surahName) {
      return null;
    }
    return toSummary(parsed);
  } catch {
    return null;
  }
}

export async function saveLastLesson(
  learnerId: string,
  lesson: Omit<HomeLessonSummary, 'hasStarted'>,
): Promise<void> {
  const payload: StoredLastLesson = {
    lessonId: lesson.lessonId,
    surahNumber: lesson.surahNumber,
    surahName: lesson.surahName,
    surahArabic: lesson.surahArabic,
    lessonLabel: lesson.lessonLabel,
    progressPercent: lesson.progressPercent,
  };
  await AsyncStorage.setItem(storageKey(learnerId), JSON.stringify(payload));
}

/**
 * Resume target for Continue Learning.
 * Persists the first lesson automatically when the learner has none yet.
 */
export async function resolveContinueLesson(
  learnerId: string,
): Promise<HomeLessonSummary> {
  const existing = await getLastLesson(learnerId);
  if (existing) {
    return existing;
  }

  const first = getDefaultFirstLesson();
  await saveLastLesson(learnerId, first);
  return { ...first, hasStarted: true };
}
