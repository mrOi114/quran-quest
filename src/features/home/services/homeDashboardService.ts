import type { GuestProgress } from '@/features/auth';
import { canManageFamily } from '@/features/auth';
import type { ActiveLearner } from '@/features/auth';
import {
  countCompletedSurahs,
  getDefaultReciter,
  getSurah,
  getVerse,
  getCurrentLessonSummary,
  loadLearningSnapshot,
  makeVerseId,
} from '@/features/learning';
import { computeGameBonusPoints, loadGameProgress } from '@/features/games';
import { computeEffortBreakdown } from '@/features/leaderboard/services/effortPoints';
import { resolveVerseMeaning } from '@/features/reader';
import type { Profile } from '@/types';

import { GUEST_REMINDER_MIN_SURAHS } from '../constants';
import { t } from '@/i18n';
import type {
  HomeAchievements,
  HomeCirclePreview,
  HomeDashboardModel,
  HomeFeaturedVerse,
  HomeLessonSummary,
} from '../types';

function buildGreeting(nickname: string, language: string): string {
  return t('home.greeting', language, { name: nickname });
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
    lessonIndex: summary.lessonIndex,
    progressPercent: summary.progressPercent,
    hasStarted: summary.hasStarted,
  };
}

function buildCirclePreview(
  featuredVerse: HomeFeaturedVerse,
  currentLesson: HomeLessonSummary,
  language: string,
): HomeCirclePreview {
  const reciter = getDefaultReciter();
  const rooms =
    currentLesson.progressPercent >= 100
      ? t('circle.roomsUnlocked', language, { count: 3 })
      : currentLesson.hasStarted
        ? t('circle.roomsUnlocked', language, { count: 2 })
        : t('circle.roomReady', language);

  return {
    title: t('circle.titleWithSurah', language, { surah: currentLesson.surahName }),
    subtitle: t('circle.listenTogether', language, { ayah: featuredVerse.ayahNumber }),
    trackLabel: `${reciter.name} · ${featuredVerse.surahName} ${featuredVerse.ayahNumber}`,
    roomCountLabel: rooms,
  };
}

export async function buildHomeDashboard(options: {
  activeLearner: ActiveLearner;
  profile: Profile | null;
  isGuest: boolean;
  guestProgress: GuestProgress | null;
}): Promise<HomeDashboardModel> {
  const { activeLearner, profile, isGuest, guestProgress } = options;
  const language = activeLearner.preferred_language;
  const nickname = activeLearner.display_name.trim() || t('common.friend', language);

  const snapshot = await loadLearningSnapshot(activeLearner);
  const gameProgress = await loadGameProgress(activeLearner);
  const lessonSummary = await getCurrentLessonSummary(activeLearner);
  const todaysLesson = toHomeLesson(lessonSummary);

  const surahsCompleted = isGuest
    ? (guestProgress?.juz30SurahsCompleted ?? countCompletedSurahs(snapshot))
    : countCompletedSurahs(snapshot);
  const effort = computeEffortBreakdown(snapshot, {
    gameBonusPoints: computeGameBonusPoints(gameProgress),
  });
  const achievements: HomeAchievements = {
    streakDays: effort.streakDays,
    lessonsCompleted: effort.lessonsCompleted,
    surahsCompleted,
  };
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
      featuredMeaning?.text ?? t('home.featuredFallback', language),
    translationSourceLabel: featuredMeaning?.sourceLabel ?? t('home.approvedTranslation', language),
    isTranslationFallback: featuredMeaning?.isFallback ?? false,
  };
  // Same effort formula as Leaderboard — one source of truth, no double system.
  const xpPoints = effort.totalPoints;
  const nextMilestoneXp = Math.max(250, Math.ceil((xpPoints + 1) / 250) * 250);

  return {
    nickname,
    greetingLine: buildGreeting(nickname, language),
    encouragement: t('home.encouragement', language),
    todaysLesson,
    revisionVerseCount: surahsCompleted > 0 ? Math.min(surahsCompleted * 2, 12) : 0,
    achievements,
    xpPoints,
    nextMilestoneXp,
    circlePreview: buildCirclePreview(featuredVerse, todaysLesson, language),
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
