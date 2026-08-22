import { z } from 'zod';

export const audioRepeatCountSchema = z.enum(['1', '2', '3', 'loop']);
export const readerFontScaleSchema = z.enum(['default', 'large', 'xlarge']);

export const readerFutureSettingsSchema = z.object({
  autoPlayNextVerse: z.boolean().nullable(),
  playbackSpeed: z.number().positive().max(2).nullable(),
  mushafStyle: z.enum(['uthmani_standard', 'indopak']).nullable(),
  nightMode: z.enum(['system', 'light', 'dark']).nullable(),
});

export const defaultFutureSettings = {
  autoPlayNextVerse: null,
  playbackSpeed: null,
  mushafStyle: null,
  nightMode: null,
} as const;

export const readerPreferencesSchema = z.object({
  showTranslation: z.boolean(),
  repeatCount: audioRepeatCountSchema,
  preferredReciterKey: z.string().min(1),
  preferredTranslationId: z.string().nullable(),
  fontScale: readerFontScaleSchema.nullable().default(null),
  futureSettings: readerFutureSettingsSchema.default({ ...defaultFutureSettings }),
});

export const readerBrowseStateSchema = z.object({
  lastSurahNumber: z.number().int().min(1).max(114),
  lastAyahNumber: z.number().int().min(1),
});
