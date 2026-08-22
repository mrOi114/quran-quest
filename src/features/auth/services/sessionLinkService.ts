import type { EmailOtpType } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

import { supabase } from '@/lib/supabase';
import { logAuthError, toFriendlyAuthError } from '../utils/authErrors';

export type AuthLinkKind =
  | 'recovery'
  | 'signup'
  | 'invite'
  | 'magiclink'
  | 'email'
  | 'unknown';

export type AuthLinkResult = {
  kind: AuthLinkKind;
  handled: boolean;
};

const handledSecrets = new Set<string>();
const inFlight = new Map<string, Promise<AuthLinkResult>>();

/**
 * Parse query + hash params from a Supabase auth redirect URL.
 * Hash params are used for implicit tokens; query `code` is used for PKCE.
 */
export function parseAuthUrl(urlString: string): {
  code: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  tokenHash: string | null;
  type: string | null;
  error: string | null;
  errorDescription: string | null;
} {
  const empty = {
    code: null,
    accessToken: null,
    refreshToken: null,
    tokenHash: null,
    type: null,
    error: null,
    errorDescription: null,
  };

  try {
    const url = new URL(urlString);
    const hash = url.hash.startsWith('#') ? url.hash.slice(1) : url.hash;
    const hashParams = new URLSearchParams(hash);

    return {
      code: url.searchParams.get('code') || hashParams.get('code'),
      accessToken: url.searchParams.get('access_token') || hashParams.get('access_token'),
      refreshToken:
        url.searchParams.get('refresh_token') || hashParams.get('refresh_token'),
      tokenHash: url.searchParams.get('token_hash') || hashParams.get('token_hash'),
      type: url.searchParams.get('type') || hashParams.get('type'),
      error: url.searchParams.get('error') || hashParams.get('error'),
      errorDescription:
        url.searchParams.get('error_description') || hashParams.get('error_description'),
    };
  } catch {
    return empty;
  }
}

function resolveKind(type: string | null): AuthLinkKind {
  switch (type) {
    case 'recovery':
      return 'recovery';
    case 'signup':
      return 'signup';
    case 'invite':
      return 'invite';
    case 'magiclink':
      return 'magiclink';
    case 'email':
      return 'email';
    default:
      return 'unknown';
  }
}

function looksLikeAuthRedirect(urlString: string): boolean {
  return (
    urlString.includes('auth/callback') ||
    urlString.includes('/callback') ||
    urlString.includes('access_token') ||
    urlString.includes('token_hash') ||
    urlString.includes('code=') ||
    urlString.includes('type=recovery')
  );
}

export function isAuthCallbackLocation(urlString?: string | null): boolean {
  const target =
    urlString ??
    (Platform.OS === 'web' && typeof globalThis.location?.href === 'string'
      ? globalThis.location.href
      : '');
  if (!target) {
    return false;
  }
  return target.includes('/callback') || target.includes('auth/callback');
}

function secretKey(parsed: ReturnType<typeof parseAuthUrl>): string | null {
  return parsed.tokenHash || parsed.code || parsed.accessToken;
}

function isConsumedSessionError(message: string): boolean {
  const text = message.toLowerCase();
  return (
    text.includes('already been used') ||
    text.includes('code verifier') ||
    text.includes('both auth code and code verifier') ||
    text.includes('invalid flow state') ||
    text.includes('expired')
  );
}

function cleanAuthParamsFromUrl(): void {
  if (Platform.OS !== 'web' || typeof globalThis.history?.replaceState !== 'function') {
    return;
  }
  const { location } = globalThis;
  if (!location?.origin || !location.pathname) {
    return;
  }
  if (!looksLikeAuthRedirect(location.href)) {
    return;
  }
  globalThis.history.replaceState(globalThis.history.state, '', `${location.origin}${location.pathname}`);
}

async function exchangeParsed(parsed: ReturnType<typeof parseAuthUrl>): Promise<AuthLinkResult> {
  if (parsed.errorDescription || parsed.error) {
    const description = parsed.errorDescription
      ? decodeURIComponent(parsed.errorDescription.replace(/\+/g, ' '))
      : parsed.error;
    logAuthError(description || parsed.error);
    throw toFriendlyAuthError(
      description || parsed.error || 'Verification could not be completed. Please try again.',
    );
  }

  if (parsed.tokenHash) {
    const otpType = (parsed.type ?? 'signup') as EmailOtpType;
    const { error } = await supabase.auth.verifyOtp({
      type: otpType,
      token_hash: parsed.tokenHash,
    });
    if (error) {
      logAuthError(error);
      throw toFriendlyAuthError(error);
    }
    return { kind: resolveKind(parsed.type), handled: true };
  }

  if (parsed.code) {
    const { error } = await supabase.auth.exchangeCodeForSession(parsed.code);
    if (error) {
      if (isConsumedSessionError(error.message)) {
        const existing = await supabase.auth.getSession();
        if (existing.data.session) {
          return { kind: resolveKind(parsed.type), handled: true };
        }
      }
      logAuthError(error);
      throw toFriendlyAuthError(error);
    }
    return { kind: resolveKind(parsed.type), handled: true };
  }

  if (parsed.accessToken && parsed.refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: parsed.accessToken,
      refresh_token: parsed.refreshToken,
    });
    if (error) {
      logAuthError(error);
      throw toFriendlyAuthError(error);
    }
    return { kind: resolveKind(parsed.type), handled: true };
  }

  return { kind: resolveKind(parsed.type), handled: false };
}

/**
 * Exchange a deep-link auth redirect for a Supabase session.
 * Safe to call with non-auth URLs — returns handled: false.
 * Identical codes/tokens are exchanged at most once (PKCE codes are single-use).
 */
export async function handleAuthRedirectUrl(urlString: string): Promise<AuthLinkResult> {
  if (!looksLikeAuthRedirect(urlString)) {
    return { kind: 'unknown', handled: false };
  }

  const parsed = parseAuthUrl(urlString);
  const key = secretKey(parsed);

  if (key && handledSecrets.has(key)) {
    return { kind: resolveKind(parsed.type), handled: true };
  }

  if (key) {
    const pending = inFlight.get(key);
    if (pending) {
      return pending;
    }
  }

  const work = (async () => {
    try {
      const result = await exchangeParsed(parsed);
      if (result.handled && key) {
        handledSecrets.add(key);
        cleanAuthParamsFromUrl();
      }
      return result;
    } catch (error) {
      if (key && isConsumedSessionError(error instanceof Error ? error.message : '')) {
        const existing = await supabase.auth.getSession();
        if (existing.data.session) {
          handledSecrets.add(key);
          cleanAuthParamsFromUrl();
          return { kind: resolveKind(parsed.type), handled: true };
        }
      }
      throw error;
    }
  })();

  if (key) {
    inFlight.set(key, work);
  }

  try {
    return await work;
  } finally {
    if (key) {
      inFlight.delete(key);
    }
  }
}

export async function getInitialAuthUrl(): Promise<string | null> {
  if (Platform.OS === 'web' && typeof globalThis.location?.href === 'string') {
    return globalThis.location.href;
  }
  return Linking.getInitialURL();
}

export function subscribeToAuthUrls(onUrl: (url: string) => void): () => void {
  const subscription = Linking.addEventListener('url', ({ url }) => {
    onUrl(url);
  });
  return () => subscription.remove();
}
