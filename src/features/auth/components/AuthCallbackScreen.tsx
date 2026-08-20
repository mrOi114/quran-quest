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

const CALLBACK_WAIT_MS = 8000;
const CALLBACK_POLL_MS = 200;

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
        if (mounted) {
          setError(
            err instanceof Error && err.message.trim()
              ? err.message
              : 'Verification could not be completed. Please try again.',
          );
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
      navigatedRef.current = true;
      router.replace('/');
      return;
    }

    if (session && !isEmailVerified) {
      navigatedRef.current = true;
      router.replace('/(auth)/verify-email');
    }
  }, [error, isAccountHydrating, isEmailVerified, needsPasswordReset, ready, router, session]);

  useEffect(() => {
    if (!ready || error || session || navigatedRef.current) {
      return;
    }

    const timeout = setTimeout(() => {
      if (navigatedRef.current || session) {
        return;
      }
      setError('Verification could not be completed. Please try again.');
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
  }, [error, ready, session]);

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-brand-50 px-6">
        <Text className="mb-2 text-center text-lg font-semibold text-brand-800">
          Verification could not be completed. Please try again.
        </Text>
        <Text className="mb-4 text-center text-sm text-red-600">{error}</Text>
        <Pressable onPress={() => router.replace('/(auth)/login')} className="py-2">
          <Text className="text-base font-medium text-brand-700">Back to login</Text>
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
