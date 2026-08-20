import { z } from 'zod';

import { CIRCLE_MESSAGE_MAX_LENGTH, SAFE_CIRCLE_EMOJIS } from './constants';

export const circleKindSchema = z.enum(['public', 'madrasah']);

export const createCircleSchema = z.object({
  kind: circleKindSchema,
  name: z
    .string()
    .trim()
    .min(2, 'Enter a circle name')
    .max(80, 'Name is too long'),
});

export const joinCircleSchema = z.object({
  joinCode: z
    .string()
    .trim()
    .min(4, 'Enter a valid join code')
    .max(16, 'Enter a valid join code'),
});

export const sendCircleMessageSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, 'Write a short message')
    .max(CIRCLE_MESSAGE_MAX_LENGTH, 'Message is too long'),
});

export const safeCircleEmojiSchema = z
  .string()
  .refine((value): value is (typeof SAFE_CIRCLE_EMOJIS)[number] =>
    (SAFE_CIRCLE_EMOJIS as readonly string[]).includes(value),
  );

export type CreateCircleInput = z.infer<typeof createCircleSchema>;
export type JoinCircleInput = z.infer<typeof joinCircleSchema>;
