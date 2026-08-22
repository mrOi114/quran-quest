import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { useAuth } from '../hooks/useAuth';
import {
  getInitialAuthUrl,
  handleAuthRedirectUrl,
  isAuthCallbackLocation,
  parseAuthUrl,
  type AuthLinkKind,
} from '../services';
import {
  RESET_EXPIRED_MESSAGE,
  logAuthError,
  toFriendlyAuthError,
} from '../utils/authErrors';

const CALLBACK_WAIT_MS = 10000;
const CALLBACK_POLL_MS = 200;
const AUTO_CONTINUE_MS = 700;
const CALLBACK_ERROR_MESSAGE = 'Verification could not be completed. Please try again.';

const finishedSecrets = new Set<string>();

function hasAuthSecret(url: string | null): boolean {
  if (!url) {
    return false;
  }
  const parsed = parseAuthUrl(url);
  return Boolean(parsed.code || parsed.tokenHash || parsed.accessToken || parsed.errorDescription);
}

function pickAuthUrl(currentUrl: string | null, paramUrl: string | null): string | null {
  if (hasAuthSecret(currentUrl)) {
    return currentUrl;
  }
  if (hasAuthSecret(paramUrl)) {
    return paramUrl;
  }
  if (currentUrl && isAuthCallbackLocation(currentUrl)) {
    return currentUrl;
  }
  return paramUrl ?? currentUrl;
}

function urlFromRouteParams(params: Record<string, string | string[] | undefined>): string | null {
  const read = (key: string): string | null => {
    const value = params[key];
    if (Array.isArray(value)) {
      return value[0] ?? null;
    }
    return value ?? null;
  };

  const search = new URLSearchParams();
  const code = read('code');
  const tokenHash = read('token_hash');
  const type = read('type');
  const accessToken = read('access_token');
  const refreshToken = read('refresh_token');
  const errorDescription = read('error_description');
  const error = read('error');

  if (code) search.set('code', code);
  if (tokenHash) search.set('token_hash', tokenHash);
  if (type) search.set('type', type);
  if (accessToken) search.set('access_token', accessToken);
  if (refreshToken) search.set('refresh_token', refreshToken);
  if (error) search.set('error', error);
  if (errorDescription) search.set('error_description', errorDescription);

  const query = search.toString();
  if (!query) {
    return null;
  }
  return `https://quran-quest-5640.vercel.app/callback?${query}`;
}

function secretFromUrl(url: string | null): string | null {
  if (!url) {
    return null;
  }
  const parsed = parseAuthUrl(url);
  return parsed.tokenHash || parsed.code || parsed.accessToken;
}

function isRecoveryKind(kind: AuthLinkKind | null, url: string | null): boolean {
  if (kind === 'recovery') {
    return true;
  }
  if (!url) {
    return false;
  }
  return parseAuthUrl(url).type === 'recovery';
}

/**
 * Deep-link landing for email verification and password recovery.
 * Exchanges PKCE code / implicit tokens / token_hash, then routes by auth state.
 */
export function AuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const {
    needsPasswordReset,
    isEmailVerified,
    session,
    isProcessingAuthCallback,
  } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [verified, setVerified] = useState(false);
  const [recoveryExpired, setRecoveryExpired] = useState(false);
  const [linkKind, setLinkKind] = useState<AuthLinkKind | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const navigatedRef = useRef(false);
  const sourceUrlRef = useRef<string | null>(null);

  function goOnce(href: '/(auth)/reset-password' | '/' | '/(auth)/login'): void {
    const secret = secretFromUrl(sourceUrlRef.current);
    if (secret && finishedSecrets.has(secret) && navigatedRef.current) {
      return;
    }
    if (navigatedRef.current) {
      return;
    }
    navigatedRef.current = true;
    if (secret) {
      finishedSecrets.add(secret);
    }
    router.replace(href);
  }

  useEffect(() => {
    let mounted = true;

    async function exchange() {
      try {
        const currentUrl = await getInitialAuthUrl();
        const paramUrl = urlFromRouteParams(
          params as Record<string, string | string[] | undefined>,
        );
        const url = pickAuthUrl(currentUrl, paramUrl);
        sourceUrlRef.current = url;
        if (mounted) {
          setSourceUrl(url);
        }

        if (url) {
          const result = await handleAuthRedirectUrl(url);
          if (!mounted) {
            return;
          }
          setLinkKind(result.kind);
          if (result.kind === 'recovery' && result.handled && !result.session) {
            setRecoveryExpired(true);
            setError(RESET_EXPIRED_MESSAGE);
            return;
          }
        }
      } catch (err) {
        logAuthError(err);
        if (!mounted) {
          return;
        }
        const mapped = toFriendlyAuthError(
          err,
          isRecoveryKind(null, sourceUrlRef.current) ? 'recovery' : 'verify',
        );
        if (mapped.kind === 'recovery_expired' || isRecoveryKind(null, sourceUrlRef.current)) {
          setRecoveryExpired(true);
          setError(RESET_EXPIRED_MESSAGE);
          return;
        }
        setError(mapped.message || CALLBACK_ERROR_MESSAGE);
      } finally {
        if (mounted) {
          setReady(true);
        }
      }
    }

    void exchange();
    return () => {
      mounted = false;
    };
    // Route params are captured once when the callback opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ready || error || navigatedRef.current) {
      return;
    }

    if ((needsPasswordReset || linkKind === 'recovery') && session) {
      if (!needsPasswordReset) {
        return;
      }
      goOnce('/(auth)/reset-password');
      return;
    }

    if (isProcessingAuthCallback) {
      return;
    }

    if (session && isEmailVerified) {
      setVerified(true);
    }
  }, [
    error,
    isEmailVerified,
    isProcessingAuthCallback,
    linkKind,
    needsPasswordReset,
    ready,
    session,
    sourceUrl,
  ]);

  useEffect(() => {
    if (!verified || navigatedRef.current) {
      return;
    }
    const timer = setTimeout(() => {
      goOnce('/');
    }, AUTO_CONTINUE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verified]);

  useEffect(() => {
    if (!ready || error || session || navigatedRef.current || verified || recoveryExpired) {
      return;
    }
    if (isProcessingAuthCallback) {
      return;
    }

    const timeout = setTimeout(() => {
      if (navigatedRef.current || session) {
        return;
      }
      if (isRecoveryKind(linkKind, sourceUrl)) {
        setRecoveryExpired(true);
        setError(RESET_EXPIRED_MESSAGE);
        return;
      }
      setError(CALLBACK_ERROR_MESSAGE);
    }, CALLBACK_WAIT_MS);

    const poll = setInterval(() => {
      if (session) {
        clearTimeout(timeout);
        clearInterval(poll);
      }
    }, CALLBACK_POLL_MS);

    return () => {
      clearTimeout(timeout);
      clearInterval(poll);
    };
  }, [error, isProcessingAuthCallback, linkKind, ready, recoveryExpired, session, sourceUrl, verified]);

  if (recoveryExpired || (error && isRecoveryKind(linkKind, sourceUrl))) {
    return (
      <View className="flex-1 items-center justify-center bg-brand-50 px-6">
        <Text className="mb-2 text-center text-lg font-semibold text-brand-800">
          {error || RESET_EXPIRED_MESSAGE}
        </Text>
        <Text className="mb-6 text-center text-base text-brand-700">
          You can request a new reset email and try again.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace('/(auth)/forgot-password')}
          className="min-h-12 items-center rounded-xl bg-brand-600 px-6 py-3"
        >
          <Text className="text-base font-semibold text-white">Request a new reset email</Text>
        </Pressable>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-brand-50 px-6">
        <Text className="mb-2 text-center text-lg font-semibold text-brand-800">
          {error}
        </Text>
        <Pressable
          onPress={() => router.replace('/(auth)/verify-email')}
          className="py-2"
        >
          <Text className="text-base font-medium text-brand-700">Enter verification code</Text>
        </Pressable>
        <Pressable onPress={() => router.replace('/(auth)/welcome')} className="py-2">
          <Text className="text-base font-medium text-brand-700">Back</Text>
        </Pressable>
      </View>
    );
  }

  if (verified) {
    return (
      <View className="flex-1 items-center justify-center bg-brand-50 px-6">
        <Text className="mb-2 text-center text-2xl font-semibold text-brand-800">
          Email verified! ✅
        </Text>
        <Text className="mb-6 text-center text-base text-brand-700">
          Taking you into QuranFamily…
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center bg-brand-600">
      <ActivityIndicator color="#FFFFFF" size="large" />
      <Text className="mt-4 text-base text-white">Completing secure sign-in…</Text>
    </View>
  );
}
