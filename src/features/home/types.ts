export type HomeLessonSummary = {
  /** Stable id for resume until Feature 004 owns lesson state. */
  lessonId: string;
  surahNumber: number;
  /** Transliterated / common English name for UI support text. */
  surahName: string;
  /** Authentic Arabic surah name — highest visual priority. */
  surahArabic: string;
  lessonLabel: string;
  lessonIndex: number;
  /** 0–100 progress through the current lesson. */
  progressPercent: number;
  /** False when the learner has never opened a lesson. */
  hasStarted: boolean;
};

export type HomeAchievements = {
  streakDays: number;
  lessonsCompleted: number;
  surahsCompleted: number;
};

export type HomeCirclePreview = {
  title: string;
  subtitle: string;
  trackLabel: string;
  roomCountLabel: string;
};

export type HomeFeaturedVerse = {
  verseId: string;
  surahNumber: number;
  surahName: string;
  surahArabic: string;
  ayahNumber: number;
  textUthmani: string;
  translationText: string;
  translationSourceLabel: string;
  isTranslationFallback: boolean;
};

export type HomeDashboardModel = {
  nickname: string;
  greetingLine: string;
  encouragement: string;
  todaysLesson: HomeLessonSummary;
  revisionVerseCount: number;
  achievements: HomeAchievements;
  xpPoints: number;
  nextMilestoneXp: number;
  circlePreview: HomeCirclePreview;
  featuredVerse: HomeFeaturedVerse;
  isGuest: boolean;
  /** Soft account nudge — never blocks learning. */
  showGuestReminder: boolean;
  showParentAccess: boolean;
  isChildSession: boolean;
};
