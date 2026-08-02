import type { GuestProgress } from '@/features/auth';
import { canManageFamily } from '@/features/auth';
import type { ActiveLearner } from '@/features/auth';
import {
  countCompletedLessons,
  countCompletedSurahs,
  getDefaultReciter,
  getSurah,
  getVerse,
  getCurrentLessonSummary,
  loadLearningSnapshot,
  makeVerseId,
} from '@/features/learning';
import { resolveVerseMeaning } from '@/features/reader';
import type { Profile } from '@/types';

import { ABU_HAFIDUL_QURAN_ENCOURAGEMENT, GUEST_REMINDER_MIN_SURAHS } from '../constants';
import type {
  HomeAchievements,
  HomeCirclePreview,
  HomeDashboardModel,
  HomeFeaturedVerse,
  HomeLessonSummary,
} from '../types';

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

function buildXpPoints(achievements: HomeAchievements, progressPercent: number): number {
  return (
    achievements.streakDays * 40 +
    achievements.lessonsCompleted * 120 +
    achievements.surahsCompleted * 180 +
    progressPercent
  );
}

function buildCirclePreview(
  featuredVerse: HomeFeaturedVerse,
  currentLesson: HomeLessonSummary,
): HomeCirclePreview {
  const reciter = getDefaultReciter();

  return {
    title: `${currentLesson.surahName} Circle`,
    subtitle: `Listen together to ayah ${featuredVerse.ayahNumber} from today's focus.`,
    trackLabel: `${reciter.name} · ${featuredVerse.surahName} ${featuredVerse.ayahNumber}`,
    roomCountLabel:
      currentLesson.progressPercent >= 100
        ? '3 rooms unlocked'
        : currentLesson.hasStarted
          ? '2 rooms unlocked'
          : '1 room ready',
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
  const achievements = placeholderAchievements(lessonsCompleted, surahsCompleted);
  const currentVerseId = makeVerseId(
    snapshot.state.currentSurahNumber,
    snapshot.state.currentAyahNumber,
  );
  const fallbackVerseId = makeVerseId(
    todaysLesson.surahNumber,
    Math.max(lessonSummary.startAyah, 1),
  );
  const featuredVerseContent =
    getVerse(currentVerseId) ?? getVerse(fallbackVerseId) ?? getVerse('114:1');
  const featuredSurah =
    getSurah(featuredVerseContent?.surahNumber ?? todaysLesson.surahNumber) ??
    getSurah(todaysLesson.surahNumber);

  if (!featuredVerseContent || !featuredSurah) {
    throw new Error('Could not build the home spotlight verse.');
  }

  const featuredMeaning = resolveVerseMeaning(
    featuredVerseContent.id,
    activeLearner.preferred_language,
    null,
  );
  const featuredVerse: HomeFeaturedVerse = {
    verseId: featuredVerseContent.id,
    surahNumber: featuredVerseContent.surahNumber,
    surahName: featuredSurah.nameLatin,
    surahArabic: featuredSurah.nameArabic,
    ayahNumber: featuredVerseContent.ayahNumber,
    textUthmani: featuredVerseContent.textUthmani,
    translationText:
      featuredMeaning?.text ?? 'Open the reader to view the approved translation.',
    translationSourceLabel: featuredMeaning?.sourceLabel ?? 'Approved translation',
    isTranslationFallback: featuredMeaning?.isFallback ?? false,
  };
  const xpPoints = buildXpPoints(achievements, todaysLesson.progressPercent);
  const nextMilestoneXp = Math.max(250, Math.ceil((xpPoints + 1) / 250) * 250);

  return {
    nickname,
    greetingLine: buildGreeting(nickname),
    encouragement: ABU_HAFIDUL_QURAN_ENCOURAGEMENT,
    todaysLesson,
    revisionVerseCount: surahsCompleted > 0 ? Math.min(surahsCompleted * 2, 12) : 0,
    achievements,
    xpPoints,
    nextMilestoneXp,
    circlePreview: buildCirclePreview(featuredVerse, todaysLesson),
    featuredVerse,
    isGuest,
    showGuestReminder: isGuest && surahsCompleted >= GUEST_REMINDER_MIN_SURAHS,
    showParentAccess: canManageFamily({
      profileRole: profile?.role,
      activeLearner,
    }),
    isChildSession: activeLearner.role === 'child',
  };
}
