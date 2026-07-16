import { z } from 'zod';

export const audioRepeatCountSchema = z.enum(['1', '3', 'loop']);
export const readerFontScaleSchema = z.enum(['default', 'large', 'xlarge']);

export const readerPreferencesSchema = z.object({
  showTranslation: z.boolean(),
  repeatCount: audioRepeatCountSchema,
  preferredReciterKey: z.string().min(1),
  preferredTranslationId: z.string().nullable(),
  fontScale: readerFontScaleSchema.nullable().default(null),
});

export const readerBrowseStateSchema = z.object({
  lastSurahNumber: z.number().int().min(78).max(114),
  lastAyahNumber: z.number().int().min(1),
});
