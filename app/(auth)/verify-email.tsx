import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text } from 'react-native';

import {
  AuthScreen,
  PrimaryButton,
  resendVerificationEmail,
  useAuth,
} from '@/features/auth';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const { user, signOut, refreshProfile, ensureDeviceRegistered } = useAuth();
  const email = params.email ?? user?.email ?? '';
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onResend() {
    if (!email) {
      setError('Missing email address');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await resendVerificationEmail(email);
      setMessage('Verification email sent. Check your inbox.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not resend email');
    } finally {
      setLoading(false);
    }
  }

  async function onContinue() {
    setLoading(true);
    setError(null);
    try {
      // Force session refresh so email_confirmed_at is up to date.
      const { supabase } = await import('@/lib/supabase');
      const { data, error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        throw refreshError;
      }

      const confirmed = Boolean(data.user?.email_confirmed_at ?? data.user?.confirmed_at);

      if (!confirmed) {
        setError(
          'Email is not verified yet. Open the link in your inbox, then try again.',
        );
        return;
      }

      await refreshProfile();
      try {
        await ensureDeviceRegistered();
      } catch {
        // Non-blocking
      }
      router.replace('/(app)/family');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not continue');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScreen
      title="Verify your email"
      subtitle="Confirm your email to protect your account before entering the app."
    >
      <Text className="mb-4 text-base text-brand-700">
        We sent a verification link to{' '}
        <Text className="font-semibold text-brand-800">{email || 'your email'}</Text>.
      </Text>
      {message ? <Text className="mb-3 text-sm text-brand-600">{message}</Text> : null}
      {error ? <Text className="mb-3 text-sm text-red-600">{error}</Text> : null}
      <PrimaryButton
        label="I verified my email"
        onPress={() => void onContinue()}
        loading={loading}
      />
      <PrimaryButton
        label="Resend verification email"
        onPress={() => void onResend()}
        loading={loading}
        variant="secondary"
      />
      <Pressable
        onPress={() => {
          void signOut().then(() => router.replace('/(auth)/login'));
        }}
        className="py-2"
      >
        <Text className="text-center text-sm font-medium text-brand-600">
          Use a different account
        </Text>
      </Pressable>
    </AuthScreen>
  );
}
