import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text } from 'react-native';

import {
  ALREADY_REGISTERED_MESSAGE,
  AuthScreen,
  EmailAuthError,
  PrimaryButton,
  TextField,
  isEmailVerified,
  logAuthError,
  registerAccount,
  registerSchema,
  toFriendlyAuthError,
  type AdultOrParentRole,
} from '@/features/auth';

export default function RegisterScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ role?: string }>();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<AdultOrParentRole>(
    params.role === 'adult' ? 'adult' : 'parent',
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    if (loading) {
      return;
    }
    setFormError(null);
    setFieldErrors({});
    setAlreadyRegistered(false);

    const parsed = registerSchema.safeParse({
      displayName,
      email,
      password,
      confirmPassword,
      role,
    });

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
      const result = await registerAccount(parsed.data);
      if (result.session && isEmailVerified(result.user)) {
        router.replace({
          pathname: '/(auth)/verify-email',
          params: { email: parsed.data.email, status: 'all-set' },
        });
        return;
      }

      router.replace({
        pathname: '/(auth)/verify-email',
        params: { email: parsed.data.email },
      });
    } catch (error) {
      logAuthError(error);
      const mapped = error instanceof EmailAuthError ? error : toFriendlyAuthError(error);
      if (mapped.kind === 'already_registered') {
        setAlreadyRegistered(true);
        setFormError(ALREADY_REGISTERED_MESSAGE);
        return;
      }
      setFormError(mapped.message);
    } finally {
      setLoading(false);
    }
  }

  if (alreadyRegistered) {
    return (
      <AuthScreen title="This email already has an account.">
        <Text className="mb-4 text-base text-brand-700">{email.trim().toLowerCase()}</Text>
        <PrimaryButton
          label="Log In"
          onPress={() =>
            router.replace({
              pathname: '/(auth)/login',
              params: { role, email: email.trim().toLowerCase() },
            })
          }
        />
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
        <PrimaryButton
          label="Verify Email"
          onPress={() =>
            router.replace({
              pathname: '/(auth)/verify-email',
              params: { email: email.trim().toLowerCase() },
            })
          }
          variant="secondary"
        />
      </AuthScreen>
    );
  }

  return (
    <AuthScreen title="Create Account" subtitle="Parents can add children after signing up.">
      <TextField
        label="Name"
        autoComplete="name"
        value={displayName}
        onChangeText={setDisplayName}
        error={fieldErrors.displayName}
      />
      <TextField
        label="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        value={email}
        onChangeText={setEmail}
        error={fieldErrors.email}
      />
      <TextField
        label="Password"
        secureTextEntry
        autoComplete="new-password"
        value={password}
        onChangeText={setPassword}
        error={fieldErrors.password}
        hint="At least 8 characters"
      />
      <TextField
        label="Confirm password"
        secureTextEntry
        autoComplete="new-password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        error={fieldErrors.confirmPassword}
      />
      {formError ? <Text className="mb-3 text-sm text-red-600">{formError}</Text> : null}
      <PrimaryButton
        label={loading ? 'Creating account…' : 'Create Account'}
        onPress={() => void onSubmit()}
        loading={loading}
      />
      <Pressable
        onPress={() =>
          router.push({
            pathname: '/(auth)/login',
            params: { role },
          })
        }
        className="py-2"
      >
        <Text className="text-center text-sm text-brand-700">
          Already have an account?{' '}
          <Text className="font-semibold text-brand-600">Log In</Text>
        </Text>
      </Pressable>
      <Pressable
        onPress={() => setRole(role === 'parent' ? 'adult' : 'parent')}
        className="py-2"
      >
        <Text className="text-center text-sm text-brand-600">
          {role === 'parent'
            ? 'Signing up as an adult learner instead?'
            : 'Signing up as a parent instead?'}
        </Text>
      </Pressable>
      <Pressable onPress={() => router.replace('/(auth)/welcome')} className="py-2">
        <Text className="text-center text-sm text-brand-600">Back</Text>
      </Pressable>
    </AuthScreen>
  );
}
