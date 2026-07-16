import type { GuestProgress } from '@/features/auth';
import { canManageFamily } from '@/features/auth';
import type { ActiveLearner } from '@/features/auth';
import {
  countCompletedLessons,
  countCompletedSurahs,
  getCurrentLessonSummary,
  loadLearningSnapshot,
} from '@/features/learning';
import type { Profile } from '@/types';

import { ABU_HAFIDUL_QURAN_ENCOURAGEMENT, GUEST_REMINDER_MIN_SURAHS } from '../constants';
import type { HomeAchievements, HomeDashboardModel, HomeLessonSummary } from '../types';

function buildGreeting(nickname: string): string {
  return `Assalamu Alaikum, ${nickname}.`;
}

function placeholderAchievements(
  lessonsCompleted: number,
  surahsCompleted: number,
): HomeAchievements {
  return {
    streakDays: lessonsCompleted > 0 ? Math.min(lessonsCompleted, 7) : 0,
    lessonsCompleted,
    surahsCompleted,
  };
}

function toHomeLesson(
  summary: Awaited<ReturnType<typeof getCurrentLessonSummary>>,
): HomeLessonSummary {
  return {
    lessonId: summary.lessonKey,
    surahNumber: summary.surahNumber,
    surahName: summary.surahName,
    surahArabic: summary.surahArabic,
    lessonLabel: summary.lessonLabel,
    progressPercent: summary.progressPercent,
    hasStarted: summary.hasStarted,
  };
}

export async function buildHomeDashboard(options: {
  activeLearner: ActiveLearner;
  profile: Profile | null;
  isGuest: boolean;
  guestProgress: GuestProgress | null;
}): Promise<HomeDashboardModel> {
  const { activeLearner, profile, isGuest, guestProgress } = options;
  const nickname = activeLearner.display_name.trim() || 'Friend';

  const snapshot = await loadLearningSnapshot(activeLearner);
  const lessonSummary = await getCurrentLessonSummary(activeLearner);
  const todaysLesson = toHomeLesson(lessonSummary);

  const surahsCompleted = isGuest
    ? (guestProgress?.juz30SurahsCompleted ?? countCompletedSurahs(snapshot))
    : countCompletedSurahs(snapshot);
  const lessonsCompleted = countCompletedLessons(snapshot);

  return {
    nickname,
    greetingLine: buildGreeting(nickname),
    encouragement: ABU_HAFIDUL_QURAN_ENCOURAGEMENT,
    todaysLesson,
    revisionVerseCount: surahsCompleted > 0 ? Math.min(surahsCompleted * 2, 12) : 0,
    achievements: placeholderAchievements(lessonsCompleted, surahsCompleted),
    isGuest,
    showGuestReminder: isGuest && surahsCompleted >= GUEST_REMINDER_MIN_SURAHS,
    showParentAccess: canManageFamily({
      profileRole: profile?.role,
      activeLearner,
    }),
    isChildSession: activeLearner.role === 'child',
  };
}
