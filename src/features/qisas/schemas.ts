import { z } from 'zod';

export const qisasPermissionStatusSchema = z.enum([
  'PERMISSION_REQUIRED',
  'REQUEST_SENT',
  'PERMISSION_GRANTED',
  'LICENSED',
  'DECLINED',
  'UNAVAILABLE',
]);

export const qisasLanguageSchema = z.enum(['en', 'so']);

export const qisasModeSchema = z.enum(['read', 'listen', 'learn', 'play']);

export const qisasContentReviewStatusSchema = z.enum([
  'draft',
  'approved',
  'needs_review',
]);

export const qisasAudioSlotSchema = z.object({
  narratorId: z.string().min(1),
  permissionStatus: qisasPermissionStatusSchema,
  audioUrl: z.string().url().nullable(),
  license: z.string(),
  attribution: z.string(),
  sourceLabel: z.string(),
  catalogUrl: z.string(),
  offlineCacheAllowed: z.boolean().nullable(),
});

export const qisasStoryProgressSchema = z.object({
  storyId: z.string(),
  language: qisasLanguageSchema,
  readCompleted: z.boolean(),
  listenCompleted: z.boolean(),
  questionsAnswered: z.number().int().nonnegative(),
  questionsCorrect: z.number().int().nonnegative(),
  gameCompleted: z.boolean(),
  lastMode: qisasModeSchema.nullable(),
  updatedAt: z.string(),
});

export const qisasProgressPayloadSchema = z.object({
  version: z.literal(1),
  stories: z.record(z.string(), qisasStoryProgressSchema),
});

export type QisasPermissionStatus = z.infer<typeof qisasPermissionStatusSchema>;
export type QisasLanguage = z.infer<typeof qisasLanguageSchema>;
export type QisasMode = z.infer<typeof qisasModeSchema>;
export type QisasContentReviewStatus = z.infer<typeof qisasContentReviewStatusSchema>;
export type QisasAudioSlot = z.infer<typeof qisasAudioSlotSchema>;
export type QisasStoryProgress = z.infer<typeof qisasStoryProgressSchema>;
export type QisasProgressPayload = z.infer<typeof qisasProgressPayloadSchema>;
