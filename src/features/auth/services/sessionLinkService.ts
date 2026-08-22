import type { EmailOtpType, Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

import { supabase } from '@/lib/supabase';
import {
  RESET_EXPIRED_MESSAGE,
  logAuthError,
  toFriendlyAuthError,
  type AuthErrorFlow,
} from '../utils/authErrors';

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
  duplicate: boolean;
  session: Session | null;
};

const handledSecrets = new Set<string>();
const inFlight = new Map<string, Promise<AuthLinkResult>>();
const processingListeners = new Set<(busy: boolean) => void>();
let processingCount = 0;
let capturedLaunchUrl: string | null = null;
let lastHandledKind: AuthLinkKind = 'unknown';

function captureLaunchUrl(): void {
  if (capturedLaunchUrl) {
    return;
  }
  if (Platform.OS === 'web' && typeof globalThis.location?.href === 'string') {
    capturedLaunchUrl = globalThis.location.href;
  }
}

captureLaunchUrl();

function notifyProcessing(): void {
  const busy = processingCount > 0;
  processingListeners.forEach((listener) => listener(busy));
}

function beginCallbackProcessing(): void {
  processingCount += 1;
  notifyProcessing();
}

function endCallbackProcessing(): void {
  processingCount = Math.max(0, processingCount - 1);
  notifyProcessing();
}

export function isAuthCallbackProcessing(): boolean {
  return processingCount > 0;
}

export function subscribeAuthCallbackProcessing(listener: (busy: boolean) => void): () => void {
  processingListeners.add(listener);
  listener(processingCount > 0);
  return () => {
    processingListeners.delete(listener);
  };
}

export function getLastHandledAuthLinkKind(): AuthLinkKind {
  return lastHandledKind;
}

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

export function hasAuthSecret(url: string | null | undefined): boolean {
  if (!url) {
    return false;
  }
  const parsed = parseAuthUrl(url);
  return Boolean(
    parsed.code ||
      parsed.tokenHash ||
      parsed.accessToken ||
      parsed.errorDescription ||
      parsed.error,
  );
}

function resolveKind(type: string | null, urlString?: string): AuthLinkKind {
  if (type === 'recovery' || urlString?.includes('type=recovery')) {
    return 'recovery';
  }
  switch (type) {
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
    urlString.includes('type=recovery') ||
    urlString.includes('type=signup')
  );
}

export function isAuthCallbackLocation(urlString?: string | null): boolean {
  const target =
    urlString ??
    (Platform.OS === 'web' && typeof globalThis.location?.href === 'string'
      ? globalThis.location.href
      : capturedLaunchUrl ?? '');
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
    text.includes('already used') ||
    text.includes('code verifier') ||
    text.includes('both auth code and code verifier') ||
    text.includes('invalid flow state') ||
    text.includes('expired')
  );
}

function errorFlow(kind: AuthLinkKind): AuthErrorFlow {
  return kind === 'recovery' ? 'recovery' : 'verify';
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
  globalThis.history.replaceState(
    globalThis.history.state,
    '',
    `${location.origin}${location.pathname}`,
  );
}

async function currentSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session ?? null;
}

function sessionIsVerified(session: Session | null): boolean {
  const user = session?.user;
  if (!user) {
    return false;
  }
  if (user.app_metadata?.role === 'child' || user.user_metadata?.role === 'child') {
    return true;
  }
  return Boolean(user.email_confirmed_at ?? user.confirmed_at);
}

async function duplicateResult(kind: AuthLinkKind): Promise<AuthLinkResult> {
  const session = await currentSession();
  lastHandledKind = kind;
  return {
    kind,
    handled: true,
    duplicate: true,
    session,
  };
}

async function exchangeParsed(
  parsed: ReturnType<typeof parseAuthUrl>,
  urlString: string,
): Promise<AuthLinkResult> {
  const kind = resolveKind(parsed.type, urlString);

  if (parsed.errorDescription || parsed.error) {
    const description = parsed.errorDescription
      ? decodeURIComponent(parsed.errorDescription.replace(/\+/g, ' '))
      : parsed.error;
    logAuthError(description || parsed.error);
    const session = await currentSession();
    if (kind !== 'recovery' && session && sessionIsVerified(session)) {
      return { kind, handled: true, duplicate: true, session };
    }
    throw toFriendlyAuthError(description || parsed.error || RESET_EXPIRED_MESSAGE, errorFlow(kind));
  }

  if (parsed.tokenHash) {
    const otpType = (parsed.type ?? 'signup') as EmailOtpType;
    const { error } = await supabase.auth.verifyOtp({
      type: otpType,
      token_hash: parsed.tokenHash,
    });
    if (error) {
      const session = await currentSession();
      if (kind !== 'recovery' && session && sessionIsVerified(session)) {
        return { kind, handled: true, duplicate: true, session };
      }
      logAuthError(error);
      throw toFriendlyAuthError(error, errorFlow(kind));
    }
    return { kind, handled: true, duplicate: false, session: await currentSession() };
  }

  if (parsed.code) {
    const { error } = await supabase.auth.exchangeCodeForSession(parsed.code);
    if (error) {
      const session = await currentSession();
      if (kind !== 'recovery' && session && sessionIsVerified(session)) {
        return { kind, handled: true, duplicate: true, session };
      }
      if (kind === 'recovery' && isConsumedSessionError(error.message)) {
        logAuthError(error);
        throw toFriendlyAuthError(error, 'recovery');
      }
      logAuthError(error);
      throw toFriendlyAuthError(error, errorFlow(kind));
    }
    return { kind, handled: true, duplicate: false, session: await currentSession() };
  }

  if (parsed.accessToken && parsed.refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: parsed.accessToken,
      refresh_token: parsed.refreshToken,
    });
    if (error) {
      const session = await currentSession();
      if (kind !== 'recovery' && session && sessionIsVerified(session)) {
        return { kind, handled: true, duplicate: true, session };
      }
      logAuthError(error);
      throw toFriendlyAuthError(error, errorFlow(kind));
    }
    return { kind, handled: true, duplicate: false, session: await currentSession() };
  }

  return { kind, handled: false, duplicate: false, session: await currentSession() };
}

/**
 * Exchange a deep-link auth redirect for a Supabase session.
 * Safe to call with non-auth URLs — returns handled: false.
 * Identical codes/tokens are exchanged at most once (PKCE codes are single-use).
 */
export async function handleAuthRedirectUrl(urlString: string): Promise<AuthLinkResult> {
  if (!looksLikeAuthRedirect(urlString)) {
    return { kind: 'unknown', handled: false, duplicate: false, session: await currentSession() };
  }

  beginCallbackProcessing();
  try {
    const parsed = parseAuthUrl(urlString);
    const key = secretKey(parsed);
    const kind = resolveKind(parsed.type, urlString);

    if (key && handledSecrets.has(key)) {
      return duplicateResult(kind);
    }

    if (key) {
      const pending = inFlight.get(key);
      if (pending) {
        return pending;
      }
    }

    const work = (async () => {
      try {
        const result = await exchangeParsed(parsed, urlString);
        if (result.handled && key) {
          handledSecrets.add(key);
          lastHandledKind = result.kind;
          cleanAuthParamsFromUrl();
        }
        return result;
      } catch (error) {
        if (key && kind !== 'recovery' && isConsumedSessionError(error instanceof Error ? error.message : '')) {
          const session = await currentSession();
          if (session && sessionIsVerified(session)) {
            handledSecrets.add(key);
            lastHandledKind = kind;
            cleanAuthParamsFromUrl();
            return { kind, handled: true, duplicate: true, session };
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
  } finally {
    endCallbackProcessing();
  }
}

export async function getInitialAuthUrl(): Promise<string | null> {
  captureLaunchUrl();
  if (Platform.OS === 'web' && typeof globalThis.location?.href === 'string') {
    const current = globalThis.location.href;
    if (hasAuthSecret(current)) {
      return current;
    }
    if (hasAuthSecret(capturedLaunchUrl)) {
      return capturedLaunchUrl;
    }
    return current;
  }
  return Linking.getInitialURL();
}

export function subscribeToAuthUrls(onUrl: (url: string) => void): () => void {
  const subscription = Linking.addEventListener('url', ({ url }) => {
    onUrl(url);
  });
  return () => subscription.remove();
}
