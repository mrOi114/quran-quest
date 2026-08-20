import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Text } from 'react-native';

import {
  AuthScreen,
  PrimaryButton,
  RESEND_FAILURE_MESSAGE,
  RESEND_SUCCESS_MESSAGE,
  resendVerificationEmail,
  useAuth,
} from '@/features/auth';

const RESEND_COOLDOWN_MS = 20_000;

export default function VerifyEmailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const { user } = useAuth();
  const email = (typeof params.email === 'string' ? params.email : '') || user?.email || '';
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [now, setNow] = useState(Date.now());
  const cooldownRemaining = Math.max(0, Math.ceil((cooldownUntil - now) / 1000));

  useEffect(() => {
    if (cooldownUntil <= Date.now()) {
      return;
    }
    const timer = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(timer);
  }, [cooldownUntil]);

  async function onResend() {
    if (!email) {
      setError('Enter your email address to resend the verification link.');
      return;
    }
    if (Date.now() < cooldownUntil) {
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await resendVerificationEmail(email);
      setMessage(RESEND_SUCCESS_MESSAGE);
      setCooldownUntil(Date.now() + RESEND_COOLDOWN_MS);
      setNow(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : RESEND_FAILURE_MESSAGE);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScreen
      title="Check your email"
      subtitle="We've sent a verification link to your email address. Verify your email, then return here to continue."
    >
      <Text className="mb-4 text-base text-brand-700">
        We sent a verification link to{' '}
        <Text className="font-semibold text-brand-800">{email || 'your email'}</Text>.
      </Text>
      {message ? <Text className="mb-3 text-sm text-brand-600">{message}</Text> : null}
      {error ? <Text className="mb-3 text-sm text-red-600">{error}</Text> : null}
      <PrimaryButton
        label={
          cooldownRemaining > 0
            ? `Resend verification (${cooldownRemaining}s)`
            : 'Resend verification'
        }
        onPress={() => void onResend()}
        loading={loading}
        disabled={cooldownRemaining > 0}
      />
      <PrimaryButton
        label="Sign in"
        onPress={() => router.replace('/(auth)/login')}
        variant="secondary"
      />
      <Pressable onPress={() => router.replace('/(auth)/welcome')} className="py-2">
        <Text className="text-center text-sm font-medium text-brand-600">Back</Text>
      </Pressable>
    </AuthScreen>
  );
}
