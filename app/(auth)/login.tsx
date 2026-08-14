import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text } from 'react-native';

import {
  AuthScreen,
  loginAccount,
  loginSchema,
  PrimaryButton,
  registerCurrentDevice,
  TextField,
  isEmailVerified,
} from '@/features/auth';

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ role?: string }>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const role = params.role === 'parent' ? 'parent' : params.role === 'adult' ? 'adult' : undefined;
  const isParent = role === 'parent';

  async function onSubmit() {
    setFormError(null);
    setFieldErrors({});

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
          params: { email: parsed.data.email },
        });
        return;
      }

      try {
        await registerCurrentDevice();
      } catch {
        // Family gate can retry device registration.
      }

      router.replace('/');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to log in');
    } finally {
      setLoading(false);
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
      {formError ? <Text className="mb-3 text-sm text-red-600">{formError}</Text> : null}
      <PrimaryButton label="Log in" onPress={() => void onSubmit()} loading={loading} />
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
