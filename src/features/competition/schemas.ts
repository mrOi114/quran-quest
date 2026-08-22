import { z } from 'zod';

export const challengeCodeSchema = z
  .string()
  .trim()
  .transform((value) => value.toUpperCase().replace(/[^A-Z0-9]/g, ''))
  .refine((value) => /^[A-Z0-9]{4,8}$/.test(value), 'Enter a valid challenge code');
