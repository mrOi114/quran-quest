import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Text } from 'react-native';

import {
  AuthScreen,
  EmailAuthError,
  PrimaryButton,
  TextField,
  isEmailNotConfirmedError,
  isEmailVerified,
  logAuthError,
  loginAccount,
  loginSchema,
  toFriendlyAuthError,
  useAuth,
} from '@/features/auth';

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ role?: string; email?: string }>();
  const { session, isEmailVerified: sessionVerified, needsPasswordReset } = useAuth();
  const [email, setEmail] = useState(
    typeof params.email === 'string' ? params.email : '',
  );
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [wrongPassword, setWrongPassword] = useState(false);
  const [welcomeBack, setWelcomeBack] = useState(false);
  const [loading, setLoading] = useState(false);

  const role = params.role === 'parent' ? 'parent' : params.role === 'adult' ? 'adult' : undefined;

  useEffect(() => {
    if (welcomeBack || loading) {
      return;
    }
    if (needsPasswordReset && session) {
      router.replace('/(auth)/reset-password');
      return;
    }
    if (session && sessionVerified) {
      router.replace('/');
    }
  }, [loading, needsPasswordReset, router, session, sessionVerified, welcomeBack]);

  useEffect(() => {
    if (!welcomeBack) {
      return;
    }
    const timer = setTimeout(() => {
      router.replace('/');
    }, 900);
    return () => clearTimeout(timer);
  }, [router, welcomeBack]);

  async function onSubmit() {
    if (loading) {
      return;
    }
    setFormError(null);
    setFieldErrors({});
    setWrongPassword(false);

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
        router.replace({
          pathname: '/(auth)/verify-email',
          params: { email: parsed.data.email, reason: 'unverified' },
        });
        return;
      }

      setWelcomeBack(true);
    } catch (error) {
      logAuthError(error);
      if (isEmailNotConfirmedError(error)) {
        router.replace({
          pathname: '/(auth)/verify-email',
          params: { email: parsed.data.email, reason: 'unverified' },
        });
        return;
      }
      const mapped = error instanceof EmailAuthError ? error : toFriendlyAuthError(error, 'login');
      if (mapped.kind === 'invalid_credentials') {
        setWrongPassword(true);
        setFormError(mapped.message);
        return;
      }
      setFormError(mapped.message);
    } finally {
      setLoading(false);
    }
  }

  if (welcomeBack) {
    return (
      <AuthScreen title="Welcome back! 🌙">
        <Text className="mb-4 text-base text-brand-700">Taking you into QuranFamily…</Text>
      </AuthScreen>
    );
  }

  if (wrongPassword) {
    return (
      <AuthScreen title="Email or password is incorrect.">
        <PrimaryButton label="Try Again" onPress={() => setWrongPassword(false)} />
        <PrimaryButton
          label="Forgot Password"
          onPress={() =>
            router.push({
              pathname: '/(auth)/forgot-password',
              params: { email: email.trim().toLowerCase() },
            })
          }
          variant="secondary"
        />
      </AuthScreen>
    );
  }

  return (
    <AuthScreen title="Welcome back 👋">
      <TextField
        label="Email"
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        error={fieldErrors.email}
        editable={!loading}
      />
      <TextField
        label="Password"
        secureTextEntry
        autoComplete="password"
        value={password}
        onChangeText={setPassword}
        error={fieldErrors.password}
        editable={!loading}
      />
      {formError ? <Text className="mb-3 text-sm text-red-600">{formError}</Text> : null}
      <PrimaryButton
        label={loading ? 'Logging in…' : 'Log In'}
        onPress={() => void onSubmit()}
        loading={loading}
      />
      <Pressable
        onPress={() =>
          router.push({
            pathname: '/(auth)/forgot-password',
            params: { email: email.trim().toLowerCase() },
          })
        }
        className="mb-4 py-2"
      >
        <Text className="text-center text-sm font-medium text-brand-600">Forgot password?</Text>
      </Pressable>
      <Pressable
        onPress={() =>
          router.push({
            pathname: '/(auth)/register',
            params: role ? { role } : { role: 'parent' },
          })
        }
        className="py-2"
      >
        <Text className="text-center text-sm text-brand-700">
          Don&apos;t have an account?{' '}
          <Text className="font-semibold text-brand-600">Create Account</Text>
        </Text>
      </Pressable>
      <Pressable onPress={() => router.replace('/(auth)/welcome')} className="py-2">
        <Text className="text-center text-sm text-brand-600">Back</Text>
      </Pressable>
    </AuthScreen>
  );
}
