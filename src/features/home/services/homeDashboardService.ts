import type { GuestProgress } from '@/features/auth';
import { canManageFamily } from '@/features/auth';
import type { ActiveLearner } from '@/features/auth';
import type { Profile } from '@/types';

import { ABU_HAFIDUL_QURAN_ENCOURAGEMENT, GUEST_REMINDER_MIN_SURAHS } from '../constants';
import type { HomeAchievements, HomeDashboardModel, HomeLessonSummary } from '../types';
import { getDefaultFirstLesson, getLastLesson } from './lastLessonStorage';

function buildGreeting(nickname: string): string {
  return `Assalamu Alaikum, ${nickname}.`;
}

function placeholderAchievements(surahsCompleted: number): HomeAchievements {
  return {
    streakDays: surahsCompleted > 0 ? Math.min(surahsCompleted, 7) : 0,
    lessonsCompleted: surahsCompleted,
    surahsCompleted,
  };
}

function lessonFromGuestProgress(
  base: HomeLessonSummary,
  guestProgress: GuestProgress | null,
): HomeLessonSummary {
  const completed = guestProgress?.juz30SurahsCompleted ?? 0;
  if (completed <= 0) {
    return base;
  }

  // Guest demo progress maps to a gentle “in progress” state until Feature 004.
  return {
    ...base,
    hasStarted: true,
    progressPercent: Math.min(90, 20 + completed * 5),
    lessonLabel: `Lesson ${Math.min(completed, 5)}`,
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
  const savedLesson = await getLastLesson(activeLearner.id);
  const baseLesson = savedLesson ?? getDefaultFirstLesson();

  const todaysLesson = isGuest
    ? lessonFromGuestProgress(baseLesson, guestProgress)
    : baseLesson;

  const surahsCompleted = isGuest ? (guestProgress?.juz30SurahsCompleted ?? 0) : 0;

  return {
    nickname,
    greetingLine: buildGreeting(nickname),
    encouragement: ABU_HAFIDUL_QURAN_ENCOURAGEMENT,
    todaysLesson,
    revisionVerseCount: surahsCompleted > 0 ? Math.min(surahsCompleted * 2, 12) : 0,
    achievements: placeholderAchievements(surahsCompleted),
    isGuest,
    showGuestReminder: isGuest && surahsCompleted >= GUEST_REMINDER_MIN_SURAHS,
    showParentAccess: canManageFamily({
      profileRole: profile?.role,
      activeLearner,
    }),
    isChildSession: activeLearner.role === 'child',
  };
}
