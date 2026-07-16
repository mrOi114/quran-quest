import { z } from 'zod';

import { AGE_GROUPS } from '@/features/auth';

import { LEARNING_PAYLOAD_VERSION } from './constants';

const ageGroupIds = AGE_GROUPS.map((group) => group.id) as [
  (typeof AGE_GROUPS)[number]['id'],
  ...(typeof AGE_GROUPS)[number]['id'][],
];

export const ageGroupSchema = z.enum(ageGroupIds);

export const verseLearningStatusSchema = z.enum([
  'not_started',
  'in_progress',
  'learned',
  'mastered',
]);

export const revisionStatusSchema = z.enum(['none', 'due', 'ok']);

export const verseProgressRecordSchema = z.object({
  verseId: z.string().regex(/^\d+:\d+$/),
  status: verseLearningStatusSchema,
  learnedAt: z.string().nullable(),
  revisionStatus: revisionStatusSchema,
  memoryScore: z.number().nullable(),
  lastPracticedAt: z.string().nullable(),
  practiceCount: z.number().int().nonnegative(),
});

export const learnerLearningStateSchema = z.object({
  currentSurahNumber: z.number().int().min(78).max(114),
  currentAyahNumber: z.number().int().positive(),
  currentLessonKey: z.string().min(1),
  ageGroupSnapshot: ageGroupSchema,
  updatedAt: z.string(),
});

export const surahProgressRecordSchema = z.object({
  surahNumber: z.number().int().min(78).max(114),
  versesLearned: z.number().int().nonnegative(),
  versesTotal: z.number().int().positive(),
  status: z.enum(['not_started', 'in_progress', 'completed']),
  completedAt: z.string().nullable(),
});

export const lessonCompletionRecordSchema = z.object({
  lessonKey: z.string().min(1),
  surahNumber: z.number().int().min(78).max(114),
  startAyah: z.number().int().positive(),
  endAyah: z.number().int().positive(),
  ageGroup: ageGroupSchema,
  completedAt: z.string(),
});

export const guestLearningPayloadSchema = z.object({
  version: z.literal(LEARNING_PAYLOAD_VERSION),
  state: learnerLearningStateSchema.nullable(),
  verseProgress: z.record(z.string(), verseProgressRecordSchema),
  lessonCompletions: z.array(lessonCompletionRecordSchema),
  surahProgress: z.record(z.string(), surahProgressRecordSchema),
});

export const markVerseLearnedInputSchema = z.object({
  learnerId: z.string().uuid().or(z.string().min(1)),
  verseId: z.string().regex(/^\d+:\d+$/),
  lessonKey: z.string().min(1),
});
