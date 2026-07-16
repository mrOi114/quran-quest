import { Redirect, useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { handleAuthRedirectUrl, useAuth } from '@/features/auth';

/**
 * Deep-link landing for email verification and password recovery.
 * Exchanges PKCE code / tokens, then routes by auth state.
 */
export default function AuthCallbackScreen() {
  const router = useRouter();
  const { needsPasswordReset, isEmailVerified, session } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function exchange() {
      try {
        const url = await Linking.getInitialURL();
        if (url) {
          await handleAuthRedirectUrl(url);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error ? err.message : 'Could not complete sign-in link',
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
  }, []);

  if (!ready) {
    return (
      <View className="flex-1 items-center justify-center bg-brand-600">
        <ActivityIndicator color="#FFFFFF" size="large" />
        <Text className="mt-4 text-base text-white">Completing secure sign-in…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-brand-50 px-6">
        <Text className="mb-4 text-center text-base text-red-600">{error}</Text>
        <Text
          className="text-base font-medium text-brand-700"
          onPress={() => router.replace('/(auth)/login')}
        >
          Back to login
        </Text>
      </View>
    );
  }

  if (needsPasswordReset) {
    return <Redirect href="/(auth)/reset-password" />;
  }

  if (session && !isEmailVerified) {
    return <Redirect href="/(auth)/verify-email" />;
  }

  return <Redirect href="/" />;
}
