import * as Linking from 'expo-linking';

import { supabase } from '@/lib/supabase';

export type AuthLinkKind =
  'recovery' | 'signup' | 'invite' | 'magiclink' | 'email' | 'unknown';

export type AuthLinkResult = {
  kind: AuthLinkKind;
  handled: boolean;
};

/**
 * Parse query + hash params from a Supabase auth redirect URL.
 * Hash params are used for implicit tokens; query `code` is used for PKCE.
 */
function parseAuthUrl(urlString: string): {
  code: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  type: string | null;
  errorDescription: string | null;
} {
  const url = new URL(urlString);
  const hash = url.hash.startsWith('#') ? url.hash.slice(1) : url.hash;
  const hashParams = new URLSearchParams(hash);

  return {
    code: url.searchParams.get('code'),
    accessToken: url.searchParams.get('access_token') || hashParams.get('access_token'),
    refreshToken:
      url.searchParams.get('refresh_token') || hashParams.get('refresh_token'),
    type: url.searchParams.get('type') || hashParams.get('type'),
    errorDescription:
      url.searchParams.get('error_description') || hashParams.get('error_description'),
  };
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
    urlString.includes('access_token') ||
    urlString.includes('code=') ||
    urlString.includes('type=recovery')
  );
}

/**
 * Exchange a deep-link auth redirect for a Supabase session.
 * Safe to call with non-auth URLs — returns handled: false.
 */
export async function handleAuthRedirectUrl(urlString: string): Promise<AuthLinkResult> {
  if (!looksLikeAuthRedirect(urlString)) {
    return { kind: 'unknown', handled: false };
  }

  const parsed = parseAuthUrl(urlString);

  if (parsed.errorDescription) {
    throw new Error(decodeURIComponent(parsed.errorDescription.replace(/\+/g, ' ')));
  }

  if (parsed.code) {
    const { error } = await supabase.auth.exchangeCodeForSession(parsed.code);
    if (error) {
      throw new Error(error.message);
    }
    return { kind: resolveKind(parsed.type), handled: true };
  }

  if (parsed.accessToken && parsed.refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: parsed.accessToken,
      refresh_token: parsed.refreshToken,
    });
    if (error) {
      throw new Error(error.message);
    }
    return { kind: resolveKind(parsed.type), handled: true };
  }

  return { kind: resolveKind(parsed.type), handled: false };
}

export async function getInitialAuthUrl(): Promise<string | null> {
  return Linking.getInitialURL();
}

export function subscribeToAuthUrls(onUrl: (url: string) => void): () => void {
  const subscription = Linking.addEventListener('url', ({ url }) => {
    onUrl(url);
  });
  return () => subscription.remove();
}
