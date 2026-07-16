import { z } from 'zod';

import { AGE_GROUPS } from './constants';

export const adultOrParentRoleSchema = z.enum(['adult', 'parent']);

const ageGroupIds = AGE_GROUPS.map((group) => group.id) as [
  (typeof AGE_GROUPS)[number]['id'],
  ...(typeof AGE_GROUPS)[number]['id'][],
];

export const guestOnboardingSchema = z.object({
  displayName: z.string().trim().min(2, 'Nickname is required').max(30),
  ageGroup: z.enum(ageGroupIds),
  countryCode: z
    .string()
    .trim()
    .length(2, 'Use a 2-letter country code')
    .transform((value) => value.toUpperCase()),
  preferredLanguage: z.string().trim().min(2).max(10),
});

export const registerSchema = z
  .object({
    displayName: z.string().trim().min(2, 'Name must be at least 2 characters').max(40),
    email: z.email('Enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    role: adultOrParentRoleSchema,
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z.email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.email('Enter a valid email'),
});

export const childPinSchema = z.object({
  pin: z.string().regex(/^\d{4,6}$/, 'PIN must be 4 to 6 digits'),
});

export const createChildSchema = z
  .object({
    displayName: z.string().trim().min(2, 'Nickname is required').max(30),
    age: z.coerce.number().int().min(3, 'Age must be 3–17').max(17, 'Age must be 3–17'),
    avatarKey: z.string().min(1).default('default-1'),
    countryCode: z
      .string()
      .trim()
      .length(2, 'Use a 2-letter country code')
      .transform((value) => value.toUpperCase()),
    preferredLanguage: z.string().trim().min(2).max(10),
    pin: z.string().regex(/^\d{4,6}$/, 'PIN must be 4 to 6 digits'),
    confirmPin: z.string(),
  })
  .refine((value) => value.pin === value.confirmPin, {
    message: 'PINs do not match',
    path: ['confirmPin'],
  });

export const updateChildSchema = z.object({
  displayName: z.string().trim().min(2, 'Nickname is required').max(30),
  age: z.coerce.number().int().min(3, 'Age must be 3–17').max(17, 'Age must be 3–17'),
  avatarKey: z.string().min(1),
  countryCode: z
    .string()
    .trim()
    .length(2, 'Use a 2-letter country code')
    .transform((value) => value.toUpperCase()),
  preferredLanguage: z.string().trim().min(2).max(10),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type CreateChildFormInput = z.infer<typeof createChildSchema>;
export type UpdateChildFormInput = z.infer<typeof updateChildSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type GuestOnboardingInput = z.infer<typeof guestOnboardingSchema>;
