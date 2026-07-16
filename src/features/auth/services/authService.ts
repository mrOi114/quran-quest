import type { Session, User } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types';

import type { AdultOrParentRole } from '../types';
import type { LoginInput, RegisterInput } from '../schemas';

export type AuthResult = {
  user: User | null;
  session: Session | null;
};

function getAuthRedirectTo(): string | undefined {
  // Deep link handled by Expo scheme; configure the same URL in Supabase Auth settings.
  return 'quranquest://auth/callback';
}

export async function registerAccount(input: RegisterInput): Promise<AuthResult> {
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
    throw new Error(error.message);
  }

  return { user: data.user, session: data.session };
}

export async function loginAccount(input: LoginInput): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email.trim().toLowerCase(),
    password: input.password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return { user: data.user, session: data.session };
}

export async function requestPasswordReset(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(
    email.trim().toLowerCase(),
    {
      redirectTo: getAuthRedirectTo(),
    },
  );

  if (error) {
    throw new Error(error.message);
  }
}

export async function resendVerificationEmail(email: string): Promise<void> {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: email.trim().toLowerCase(),
    options: { emailRedirectTo: getAuthRedirectTo() },
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function logoutAccount(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
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
  return Boolean(user.email_confirmed_at ?? user.confirmed_at);
}

const profileSelect =
  'id, role, email, display_name, age, avatar_key, country_code, preferred_language, parent_id, created_at, updated_at';

function normalizeProfile(
  row: Omit<Profile, 'pin_hash' | 'pin_failed_attempts' | 'pin_locked_until'> & {
    pin_hash?: string | null;
    pin_failed_attempts?: number;
    pin_locked_until?: string | null;
  },
): Profile {
  return {
    ...row,
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
    throw new Error(error.message);
  }

  return data ? normalizeProfile(data) : null;
}

export async function fetchChildren(parentId: string): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select(profileSelect)
    .eq('parent_id', parentId)
    .eq('role', 'child')
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(normalizeProfile);
}
