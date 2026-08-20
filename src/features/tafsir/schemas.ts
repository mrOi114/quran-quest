import { z } from 'zod';

export const tafsirSourceMetaSchema = z.object({
  scholar: z.string(),
  translator: z.string(),
  publisher: z.string(),
  version: z.string(),
  license: z.string(),
  permissionVerified: z.boolean(),
  sourceUrl: z.string(),
  surahStart: z.number().int().min(1).max(114),
  surahEnd: z.number().int().min(1).max(114),
  ayahRangeLabel: z.string(),
});

export const tafsirAyahRecordSchema = z.object({
  surahNumber: z.number().int().min(1).max(114),
  ayahNumber: z.number().int().positive(),
  startAyah: z.number().int().positive(),
  endAyah: z.number().int().positive(),
  audioUrl: z.string().url().nullable(),
});

export const tafsirVerseProgressSchema = z.object({
  verseId: z.string(),
  listenedSeconds: z.number().nonnegative(),
  durationSeconds: z.number().nonnegative(),
  lastPosition: z.number().nonnegative(),
  completed: z.boolean(),
  understood: z.boolean(),
  understandingCorrect: z.boolean().nullable(),
});

export const tafsirProgressPayloadSchema = z.object({
  version: z.literal(1),
  enabled: z.boolean(),
  verses: z.record(z.string(), tafsirVerseProgressSchema),
});

export type TafsirSourceMeta = z.infer<typeof tafsirSourceMetaSchema>;
export type TafsirAyahRecord = z.infer<typeof tafsirAyahRecordSchema>;
export type TafsirVerseProgress = z.infer<typeof tafsirVerseProgressSchema>;
export type TafsirProgressPayload = z.infer<typeof tafsirProgressPayloadSchema>;
