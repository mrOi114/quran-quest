import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, Text } from 'react-native';

import {
  AuthScreen,
  EMAIL_NOT_CONFIRMED_MESSAGE,
  isEmailNotConfirmedError,
  isEmailVerified,
  loginAccount,
  loginSchema,
  PrimaryButton,
  RESEND_FAILURE_MESSAGE,
  RESEND_SUCCESS_MESSAGE,
  resendVerificationEmail,
  TextField,
} from '@/features/auth';

const RESEND_COOLDOWN_MS = 20_000;

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ role?: string }>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [now, setNow] = useState(Date.now());

  const role = params.role === 'parent' ? 'parent' : params.role === 'adult' ? 'adult' : undefined;
  const isParent = role === 'parent';
  const cooldownRemaining = Math.max(0, Math.ceil((cooldownUntil - now) / 1000));

  useEffect(() => {
    if (cooldownUntil <= Date.now()) {
      return;
    }
    const timer = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(timer);
  }, [cooldownUntil]);

  async function onSubmit() {
    setFormError(null);
    setMessage(null);
    setFieldErrors({});
    setNeedsVerification(false);

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? 'form');
        nextErrors[key] = issue.message;
      }
      setFieldErrors(nextErrors);
      return;
    }

    setLoading(true);
    try {
      const result = await loginAccount(parsed.data);
      if (!isEmailVerified(result.user)) {
        setNeedsVerification(true);
        setFormError(EMAIL_NOT_CONFIRMED_MESSAGE);
        return;
      }

      router.replace('/');
    } catch (error) {
      if (isEmailNotConfirmedError(error)) {
        setNeedsVerification(true);
        setFormError(EMAIL_NOT_CONFIRMED_MESSAGE);
        return;
      }
      setFormError(error instanceof Error ? error.message : 'Unable to log in');
    } finally {
      setLoading(false);
    }
  }

  async function onResend() {
    const parsedEmail = email.trim().toLowerCase();
    if (!parsedEmail) {
      setFormError('Enter your email to resend the verification link.');
      return;
    }
    if (Date.now() < cooldownUntil) {
      return;
    }

    setResendLoading(true);
    setFormError(null);
    setMessage(null);
    try {
      await resendVerificationEmail(parsedEmail);
      setMessage(RESEND_SUCCESS_MESSAGE);
      setCooldownUntil(Date.now() + RESEND_COOLDOWN_MS);
      setNow(Date.now());
    } catch (error) {
      setFormError(error instanceof Error ? error.message : RESEND_FAILURE_MESSAGE);
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <AuthScreen
      title={isParent ? 'Parent sign in' : role === 'adult' ? 'Adult learner sign in' : 'Log in'}
      subtitle={
        isParent
          ? 'Parents sign in with email and password. Children use a family code and PIN — never this password.'
          : 'Log in to continue your Hifz journey.'
      }
    >
      <TextField
        label="Email"
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        error={fieldErrors.email}
      />
      <TextField
        label="Password"
        secureTextEntry
        autoComplete="password"
        value={password}
        onChangeText={setPassword}
        error={fieldErrors.password}
      />
      {message ? <Text className="mb-3 text-sm text-brand-600">{message}</Text> : null}
      {formError ? <Text className="mb-3 text-sm text-red-600">{formError}</Text> : null}
      <PrimaryButton label="Log in" onPress={() => void onSubmit()} loading={loading} />
      {needsVerification ? (
        <PrimaryButton
          label={
            cooldownRemaining > 0
              ? `Resend verification email (${cooldownRemaining}s)`
              : 'Resend verification email'
          }
          onPress={() => void onResend()}
          loading={resendLoading}
          disabled={cooldownRemaining > 0}
          variant="secondary"
        />
      ) : null}
      <Pressable
        onPress={() => router.push('/(auth)/forgot-password')}
        className="mb-4 py-2"
      >
        <Text className="text-center text-sm font-medium text-brand-600">
          Forgot password?
        </Text>
      </Pressable>
      <Pressable
        onPress={() =>
          router.push({
            pathname: '/(auth)/register',
            params: role ? { role } : undefined,
          })
        }
        className="py-2"
      >
        <Text className="text-center text-sm text-brand-700">
          Need an account?{' '}
          <Text className="font-semibold text-brand-600">Create one</Text>
        </Text>
      </Pressable>
      <Pressable onPress={() => router.replace('/(auth)/welcome')} className="py-2">
        <Text className="text-center text-sm text-brand-600">Back</Text>
      </Pressable>
    </AuthScreen>
  );
}
