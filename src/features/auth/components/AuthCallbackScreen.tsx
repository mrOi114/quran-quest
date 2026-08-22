import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { useAuth } from '../hooks/useAuth';
import {
  getInitialAuthUrl,
  handleAuthRedirectUrl,
  isAuthCallbackLocation,
  parseAuthUrl,
} from '../services';
import { logAuthError, toFriendlyAuthError } from '../utils/authErrors';

const CALLBACK_WAIT_MS = 8000;
const CALLBACK_POLL_MS = 200;
const CALLBACK_ERROR_MESSAGE = 'Verification could not be completed. Please try again.';

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

/**
 * Deep-link landing for email verification and password recovery.
 * Exchanges PKCE code / implicit tokens / token_hash, then routes by auth state.
 */
export function AuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { needsPasswordReset, isEmailVerified, session, isAccountHydrating } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [verified, setVerified] = useState(false);
  const navigatedRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    async function exchange() {
      try {
        const currentUrl = await getInitialAuthUrl();
        const paramUrl = urlFromRouteParams(
          params as Record<string, string | string[] | undefined>,
        );
        const url = pickAuthUrl(currentUrl, paramUrl);

        if (url) {
          await handleAuthRedirectUrl(url);
        }
      } catch (err) {
        logAuthError(err);
        if (mounted) {
          setError(toFriendlyAuthError(err).message || CALLBACK_ERROR_MESSAGE);
        }
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

    if (needsPasswordReset && session) {
      navigatedRef.current = true;
      router.replace('/(auth)/reset-password');
      return;
    }

    if (isAccountHydrating) {
      return;
    }

    if (session && isEmailVerified) {
      setVerified(true);
    }
  }, [error, isAccountHydrating, isEmailVerified, needsPasswordReset, ready, router, session]);

  useEffect(() => {
    if (!ready || error || session || navigatedRef.current || verified) {
      return;
    }

    const timeout = setTimeout(() => {
      if (navigatedRef.current || session) {
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
  }, [error, ready, session, verified]);

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
          You can continue into QuranFamily now.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace('/')}
          className="min-h-12 items-center rounded-xl bg-brand-600 px-6 py-3"
        >
          <Text className="text-base font-semibold text-white">Continue</Text>
        </Pressable>
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
