import { z } from 'zod';

import { AGE_GROUPS } from '@/features/auth';

import { GAME_PROGRESS_VERSION } from './constants';

const ageGroupIds = AGE_GROUPS.map((group) => group.id) as [
  (typeof AGE_GROUPS)[number]['id'],
  ...(typeof AGE_GROUPS)[number]['id'][],
];

const gameIdSchema = z.enum([
  'wudu',
  'salah',
  'prophets',
  'character',
  'knowledge',
  'hajj',
  'ramadan',
  'quran',
  'dua',
  'history',
  'memory',
  'adventure',
  'daily',
]);

const categorySchema = z.enum([
  'islam_basics',
  'quran',
  'salah',
  'wudu',
  'ramadan',
  'hajj',
  'prophets',
  'character',
  'dua',
  'history',
  'knowledge',
  'daily',
]);

const achievementSchema = z.enum([
  'islam_explorer',
  'wudu_master',
  'salah_star',
  'prophet_explorer',
  'ramadan_explorer',
  'quran_explorer',
  'character_hero',
  'knowledge_seeker',
]);

export const gameCompletionRecordSchema = z.object({
  challengeKey: z.string().min(1),
  gameId: gameIdSchema,
  category: categorySchema,
  completedAt: z.string(),
  correctCount: z.number().int().nonnegative(),
  totalCount: z.number().int().positive(),
  ageGroup: z.enum(ageGroupIds),
});

export const gameProgressSnapshotSchema = z.object({
  version: z.literal(GAME_PROGRESS_VERSION),
  completions: z.array(gameCompletionRecordSchema),
  achievements: z.array(achievementSchema),
  streakDays: z.number().int().nonnegative(),
  lastPlayedDate: z.string().nullable(),
  dailyChallengeDate: z.string().nullable(),
});
