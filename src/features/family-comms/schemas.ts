import { z } from 'zod';

import { FAMILY_MESSAGE_MAX_LENGTH } from './constants';

export const familyMessageKindSchema = z.enum([
  'text',
  'encouragement',
  'practice_update',
  'dua',
]);

export const sendFamilyMessageSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, 'Write a short message')
    .max(FAMILY_MESSAGE_MAX_LENGTH, 'Message is too long'),
  kind: familyMessageKindSchema.default('text'),
});

export type SendFamilyMessageInput = z.infer<typeof sendFamilyMessageSchema>;
