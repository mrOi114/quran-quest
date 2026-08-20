import type { ActiveLearner } from '@/features/auth';
import { getCurrentLessonSummary, resolveContinueLessonKey } from '@/features/learning';

import type { HomeLessonSummary } from '../types';

/**
 * Resume target for Continue Learning (Feature 004 learning engine).
 */
export async function resolveContinueLesson(
  learner: ActiveLearner,
): Promise<HomeLessonSummary> {
  const lessonKey = await resolveContinueLessonKey(learner);
  const summary = await getCurrentLessonSummary(learner);

  return {
    lessonId: summary.lessonKey || lessonKey,
    surahNumber: summary.surahNumber,
    surahName: summary.surahName,
    surahArabic: summary.surahArabic,
    lessonLabel: summary.lessonLabel,
    lessonIndex: summary.lessonIndex,
    progressPercent: summary.progressPercent,
    hasStarted: true,
  };
}
