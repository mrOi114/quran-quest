import type { Session, User } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types';

import type { AdultOrParentRole } from '../types';
import type { LoginInput, RegisterInput } from '../schemas';
import {
  ALREADY_REGISTERED_MESSAGE,
  EMAIL_NOT_CONFIRMED_MESSAGE,
  EmailAuthError,
  RESEND_FAILURE_MESSAGE,
  classifyAuthError,
  logAuthError,
  toFriendlyAuthError,
} from '../utils/authErrors';

export type AuthResult = {
  user: User | null;
  session: Session | null;
};

function throwAuthError(error: unknown, flow: 'recovery' | 'signup' | 'login' | 'verify' | 'unknown' = 'unknown'): never {
  logAuthError(error);
  throw toFriendlyAuthError(error, flow);
}

function getAuthRedirectTo(): string {
  // Web must return an https callback already allow-listed in Supabase Auth.
  // Native keeps the existing custom scheme already listed in those settings.
  if (Platform.OS === 'web') {
    const origin =
      typeof globalThis.location?.origin === 'string' ? globalThis.location.origin : '';
    if (origin) {
      return `${origin}/callback`;
    }
    return Linking.createURL('/callback');
  }
  return 'quranfamily://auth/callback';
}

export async function registerAccount(input: RegisterInput): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: input.email.trim().toLowerCase(),
      password: input.password,
      options: {
        emailRedirectTo: getAuthRedirectTo(),
        data: {
          role: input.role as AdultOrParentRole,
          display_name: input.displayName.trim(),
        },
      },
    });

    if (error) {
      const mapped = classifyAuthError(error, 'signup');
      if (mapped.kind === 'already_registered' || mapped.kind === 'rate_limited') {
        throw new EmailAuthError(
          ALREADY_REGISTERED_MESSAGE,
          mapped.code || 'user_already_exists',
          'already_registered',
        );
      }
      throwAuthError(error, 'signup');
    }

    // Duplicate signup: empty identities, or an already-confirmed user without a session.
    const identities = data.user?.identities;
    const alreadyConfirmed = Boolean(data.user?.email_confirmed_at ?? data.user?.confirmed_at);
    if (
      !data.session &&
      data.user &&
      ((Array.isArray(identities) && identities.length === 0) || alreadyConfirmed)
    ) {
      throw new EmailAuthError(
        ALREADY_REGISTERED_MESSAGE,
        'user_already_exists',
        'already_registered',
      );
    }

    return { user: data.user, session: data.session };
  } catch (error) {
    if (error instanceof EmailAuthError) {
      throw error;
    }
    throwAuthError(error, 'signup');
  }
}

export async function loginAccount(input: LoginInput): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: input.email.trim().toLowerCase(),
      password: input.password,
    });

    if (error) {
      if (error.code === 'email_not_confirmed' || /email not confirmed/i.test(error.message)) {
        throw new EmailAuthError(
          EMAIL_NOT_CONFIRMED_MESSAGE,
          'email_not_confirmed',
          'email_not_confirmed',
        );
      }
      throwAuthError(error, 'login');
    }

    return { user: data.user, session: data.session };
  } catch (error) {
    if (error instanceof EmailAuthError) {
      throw error;
    }
    throwAuthError(error, 'login');
  }
}

export async function requestPasswordReset(email: string): Promise<void> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: getAuthRedirectTo(),
    });

    if (error) {
      throwAuthError(error, 'recovery');
    }
  } catch (error) {
    if (error instanceof EmailAuthError) {
      throw error;
    }
    throwAuthError(error, 'recovery');
  }
}

export async function updatePassword(password: string): Promise<void> {
  try {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      throwAuthError(error, 'recovery');
    }
  } catch (error) {
    if (error instanceof EmailAuthError) {
      throw error;
    }
    throwAuthError(error, 'recovery');
  }
}

export async function resendVerificationEmail(email: string): Promise<void> {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) {
    throw new EmailAuthError(RESEND_FAILURE_MESSAGE, undefined, 'generic');
  }

  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: trimmed,
      options: { emailRedirectTo: getAuthRedirectTo() },
    });

    if (error) {
      throwAuthError(error, 'verify');
    }
  } catch (error) {
    if (error instanceof EmailAuthError) {
      throw error;
    }
    throwAuthError(error, 'verify');
  }
}

export async function verifySignupOtp(email: string, token: string): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: token.trim(),
      type: 'signup',
    });

    if (error) {
      const existing = await getSession();
      if (existing && isEmailVerified(existing.user)) {
        return { user: existing.user, session: existing };
      }
      throwAuthError(error, 'verify');
    }

    return { user: data.user, session: data.session };
  } catch (error) {
    if (error instanceof EmailAuthError) {
      throw error;
    }
    const existing = await getSession();
    if (existing && isEmailVerified(existing.user)) {
      return { user: existing.user, session: existing };
    }
    throwAuthError(error, 'verify');
  }
}

export async function logoutAccount(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throwAuthError(error);
  }
}

export async function getSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw new Error(error.message);
  }
  return data.session;
}

export function isEmailVerified(user: User | null | undefined): boolean {
  if (!user) {
    return false;
  }
  if (user.app_metadata?.role === 'child' || user.user_metadata?.role === 'child') {
    return true;
  }
  return Boolean(user.email_confirmed_at ?? user.confirmed_at);
}

const profileSelect =
  'id, role, email, display_name, age, avatar_key, country_code, preferred_language, parent_id, family_code, chat_enabled, calls_enabled, created_at, updated_at';
const profileSelectLegacy =
  'id, role, email, display_name, age, avatar_key, country_code, preferred_language, parent_id, created_at, updated_at';

function isMissingFamilyCodeColumn(message: string | undefined): boolean {
  const text = (message ?? '').toLowerCase();
  return (
    text.includes('family_code') &&
    (text.includes('does not exist') ||
      text.includes('schema cache') ||
      text.includes('42703') ||
      text.includes('permission denied') ||
      text.includes('column'))
  );
}

function isMissingCommsColumn(message: string | undefined): boolean {
  const text = (message ?? '').toLowerCase();
  return (
    (text.includes('chat_enabled') || text.includes('calls_enabled')) &&
    (text.includes('does not exist') ||
      text.includes('schema cache') ||
      text.includes('42703') ||
      text.includes('permission denied') ||
      text.includes('column'))
  );
}

type ProfileRow = Omit<Profile, 'pin_hash' | 'pin_failed_attempts' | 'pin_locked_until'> & {
  pin_hash?: string | null;
  pin_failed_attempts?: number;
  pin_locked_until?: string | null;
  family_code?: string | null;
  chat_enabled?: boolean | null;
  calls_enabled?: boolean | null;
};

function normalizeProfile(row: ProfileRow): Profile {
  return {
    ...row,
    family_code: row.family_code ?? null,
    chat_enabled: row.chat_enabled ?? true,
    calls_enabled: row.calls_enabled ?? true,
    email: row.role === 'child' ? null : row.email,
    pin_hash: null,
    pin_failed_attempts: row.pin_failed_attempts ?? 0,
    pin_locked_until: null,
  };
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select(profileSelect)
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    if (isMissingCommsColumn(error.message) || isMissingFamilyCodeColumn(error.message)) {
      const fallback = await supabase
        .from('profiles')
        .select(profileSelectLegacy)
        .eq('id', userId)
        .maybeSingle();
      if (fallback.error) {
        throw new Error(fallback.error.message);
      }
      return fallback.data
        ? normalizeProfile({
            ...(fallback.data as object),
            family_code: null,
            chat_enabled: true,
            calls_enabled: true,
          } as ProfileRow)
        : null;
    }
    throw new Error(error.message);
  }

  return data ? normalizeProfile(data as unknown as ProfileRow) : null;
}

export async function fetchChildren(parentId: string): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select(profileSelect)
    .eq('parent_id', parentId)
    .eq('role', 'child')
    .order('created_at', { ascending: true });

  if (error) {
    if (isMissingCommsColumn(error.message) || isMissingFamilyCodeColumn(error.message)) {
      const fallback = await supabase
        .from('profiles')
        .select(profileSelectLegacy)
        .eq('parent_id', parentId)
        .eq('role', 'child')
        .order('created_at', { ascending: true });
      if (fallback.error) {
        throw new Error(fallback.error.message);
      }
      return (fallback.data ?? []).map((row) =>
        normalizeProfile({
          ...(row as object),
          family_code: null,
          chat_enabled: true,
          calls_enabled: true,
        } as ProfileRow),
      );
    }
    throw new Error(error.message);
  }

  return ((data ?? []) as unknown as ProfileRow[]).map(normalizeProfile);
}

/**
 * Applies guest country / language onto a freshly registered profile when still defaults.
 * Learning progress is merged separately — this only preserves identity fields.
 */
export async function applyGuestIdentityToProfile(
  userId: string,
  guest: {
    countryCode?: string;
    preferredLanguage?: string;
    displayName?: string;
  },
): Promise<Profile | null> {
  const current = await fetchProfile(userId);
  if (!current) {
    return null;
  }

  const updates: Partial<Profile> = {};
  const country = guest.countryCode?.trim().toUpperCase();
  const language = guest.preferredLanguage?.trim().toLowerCase();
  const displayName = guest.displayName?.trim();

  if (country && (!current.country_code || current.country_code === 'US')) {
    updates.country_code = country;
  }
  if (language && (!current.preferred_language || current.preferred_language === 'en')) {
    updates.preferred_language = language;
  }
  if (
    displayName &&
    (!current.display_name ||
      current.display_name.trim().toLowerCase() === 'friend' ||
      current.display_name.trim().length === 0)
  ) {
    updates.display_name = displayName;
  }

  if (Object.keys(updates).length === 0) {
    return current;
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select(profileSelect)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? normalizeProfile(data as unknown as ProfileRow) : current;
}

export async function updateProfilePreferredLanguage(
  profileId: string,
  language: string,
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ preferred_language: language.trim().toLowerCase() })
    .eq('id', profileId);

  if (error) {
    throw new Error(error.message || 'Could not save language preference');
  }
}
