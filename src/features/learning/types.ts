import type { AgeGroupId } from '@/features/auth';

import type { LEARNING_PAYLOAD_VERSION } from './constants';

export type VerseLearningStatus = 'not_started' | 'in_progress' | 'learned' | 'mastered';

export type RevisionStatus = 'none' | 'due' | 'ok';

export type SurahLearningStatus = 'not_started' | 'in_progress' | 'completed';

export type LearningEventType =
  | 'lesson_started'
  | 'lesson_completed'
  | 'verse_marked_learned'
  | 'verse_reviewed'
  | 'recitation_attempt';

export type SurahMeta = {
  number: number;
  nameArabic: string;
  nameLatin: string;
  ayahCount: number;
  revelationPlace: string;
  sortOrder: number;
};

export type VerseContent = {
  id: string;
  surahNumber: number;
  ayahNumber: number;
  verseOrderGlobal: number;
  textUthmani: string;
  contentHash: string;
  contentVersion: number;
  audioAssetKey: string;
  audioUrl: string;
  translationEn: string;
};

export type LessonPlan = {
  lessonKey: string;
  surahNumber: number;
  lessonIndex: number;
  startAyah: number;
  endAyah: number;
  ageGroup: AgeGroupId;
  verseIds: string[];
};

export type LessonSummary = {
  lessonKey: string;
  surahNumber: number;
  surahName: string;
  surahArabic: string;
  lessonLabel: string;
  lessonIndex: number;
  startAyah: number;
  endAyah: number;
  progressPercent: number;
  hasStarted: boolean;
  isComplete: boolean;
  isLocked: boolean;
  isCurrent: boolean;
};

export type VerseProgressRecord = {
  verseId: string;
  status: VerseLearningStatus;
  learnedAt: string | null;
  revisionStatus: RevisionStatus;
  memoryScore: number | null;
  lastPracticedAt: string | null;
  practiceCount: number;
};

export type LearnerLearningState = {
  currentSurahNumber: number;
  currentAyahNumber: number;
  currentLessonKey: string;
  ageGroupSnapshot: AgeGroupId;
  updatedAt: string;
};

export type SurahProgressRecord = {
  surahNumber: number;
  versesLearned: number;
  versesTotal: number;
  status: SurahLearningStatus;
  completedAt: string | null;
};

export type LessonCompletionRecord = {
  lessonKey: string;
  surahNumber: number;
  startAyah: number;
  endAyah: number;
  ageGroup: AgeGroupId;
  completedAt: string;
  /** 0–100 when the lesson was passed via a mastery test. Optional for older records. */
  testScorePercent?: number;
};

export type LearningSnapshot = {
  state: LearnerLearningState;
  verseProgress: Record<string, VerseProgressRecord>;
  surahProgress: Record<number, SurahProgressRecord>;
  lessonCompletions: LessonCompletionRecord[];
  hasStarted: boolean;
};

export type GuestLearningPayloadV1 = {
  version: typeof LEARNING_PAYLOAD_VERSION;
  state: LearnerLearningState | null;
  verseProgress: Record<string, VerseProgressRecord>;
  lessonCompletions: LessonCompletionRecord[];
  surahProgress: Record<number, SurahProgressRecord>;
};

export type LessonSessionVerse = VerseContent & {
  progress: VerseProgressRecord;
};

export type LessonTestChoice = {
  id: string;
  label: string;
  isArabic?: boolean;
};

export type LessonTestQuestion = {
  id: string;
  prompt: string;
  promptArabic?: string;
  choices: LessonTestChoice[];
  correctChoiceId: string;
};

export type LessonMasteryResult = {
  passed: boolean;
  percent: number;
  correctCount: number;
  totalCount: number;
  nextLessonKey: string | null;
  practiceLessonKey: string | null;
  message: string;
};

export type LessonSession = {
  lesson: LessonPlan;
  summary: LessonSummary;
  verses: LessonSessionVerse[];
  mode: 'learn' | 'review' | 'locked';
  canCompleteLesson: boolean;
  nextLessonKey: string | null;
  /** First incomplete prior lesson to practise when a knowledge check is not passed. */
  unlockPracticeLessonKey: string | null;
};
