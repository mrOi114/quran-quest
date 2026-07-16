export type HomeLessonSummary = {
  /** Stable id for resume until Feature 004 owns lesson state. */
  lessonId: string;
  surahNumber: number;
  /** Transliterated / common English name for UI support text. */
  surahName: string;
  /** Authentic Arabic surah name — highest visual priority. */
  surahArabic: string;
  lessonLabel: string;
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

export type HomeDashboardModel = {
  nickname: string;
  greetingLine: string;
  encouragement: string;
  todaysLesson: HomeLessonSummary;
  revisionVerseCount: number;
  achievements: HomeAchievements;
  isGuest: boolean;
  /** Soft account nudge — never blocks learning. */
  showGuestReminder: boolean;
  showParentAccess: boolean;
  isChildSession: boolean;
};
