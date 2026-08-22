import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text } from 'react-native';

import {
  AuthScreen,
  EmailAuthError,
  GENERIC_AUTH_MESSAGE,
  PrimaryButton,
  TextField,
  forgotPasswordSchema,
  logAuthError,
  openEmailApp,
  requestPasswordReset,
  toFriendlyAuthError,
} from '@/features/auth';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(typeof params.email === 'string' ? params.email : '');
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    if (loading) {
      return;
    }
    setFormError(null);
    setFieldError(undefined);

    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      setFieldError(parsed.error.issues[0]?.message);
      return;
    }

    setLoading(true);
    try {
      await requestPasswordReset(parsed.data.email);
      setSuccess(true);
    } catch (error) {
      logAuthError(error);
      const mapped = error instanceof EmailAuthError ? error : toFriendlyAuthError(error);
      setFormError(mapped.message);
    } finally {
      setLoading(false);
    }
  }

  async function onOpenEmail() {
    try {
      await openEmailApp();
    } catch (error) {
      logAuthError(error);
      setFormError(GENERIC_AUTH_MESSAGE);
    }
  }

  if (success) {
    return (
      <AuthScreen
        title="Check your email"
        subtitle="Use the reset link we sent, then create a new password. This is not an email verification step."
      >
        <Text className="mb-4 text-base text-brand-700">
          If an account exists for{' '}
          <Text className="font-semibold text-brand-800">{email.trim().toLowerCase()}</Text>, a
          reset link is on the way.
        </Text>
        <PrimaryButton label="Open Email" onPress={() => void onOpenEmail()} />
        <PrimaryButton
          label="Log In"
          onPress={() => router.replace('/(auth)/login')}
          variant="secondary"
        />
      </AuthScreen>
    );
  }

  return (
    <AuthScreen
      title="Reset your password 🔐"
      subtitle="We'll email you a secure link to choose a new password."
    >
      <TextField
        label="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        value={email}
        onChangeText={setEmail}
        error={fieldError}
      />
      {formError ? <Text className="mb-3 text-sm text-red-600">{formError}</Text> : null}
      <PrimaryButton
        label={loading ? 'Sending code…' : 'Send reset email'}
        onPress={() => void onSubmit()}
        loading={loading}
      />
      <Pressable onPress={() => router.replace('/(auth)/login')} className="py-2">
        <Text className="text-center text-sm font-medium text-brand-600">Back to Log In</Text>
      </Pressable>
    </AuthScreen>
  );
}
