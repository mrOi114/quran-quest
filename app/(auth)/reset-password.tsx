import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';

import {
  AuthScreen,
  EmailAuthError,
  PrimaryButton,
  TextField,
  logAuthError,
  resetPasswordSchema,
  toFriendlyAuthError,
  updatePassword,
  useAuth,
} from '@/features/auth';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { session, needsPasswordReset, clearPasswordResetFlag, signOut } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [updated, setUpdated] = useState(false);
  const [leaving, setLeaving] = useState(false);

  if (!session && !updated) {
    return <Redirect href="/(auth)/forgot-password" />;
  }

  if (!needsPasswordReset && !updated) {
    return <Redirect href="/" />;
  }

  async function onSubmit() {
    if (loading) {
      return;
    }
    setFormError(null);
    setFieldErrors({});

    const parsed = resetPasswordSchema.safeParse({ password, confirmPassword });
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
      await updatePassword(parsed.data.password);
      clearPasswordResetFlag();
      setUpdated(true);
    } catch (error) {
      logAuthError(error);
      const mapped = error instanceof EmailAuthError ? error : toFriendlyAuthError(error);
      setFormError(mapped.message);
    } finally {
      setLoading(false);
    }
  }

  async function onLogIn() {
    if (leaving) {
      return;
    }
    setLeaving(true);
    try {
      await signOut();
    } catch (error) {
      logAuthError(error);
    } finally {
      router.replace('/(auth)/login');
    }
  }

  if (updated) {
    return (
      <AuthScreen title="Password updated! 🎉">
        <Text className="mb-4 text-base text-brand-700">
          Your new password is ready. Log in to continue.
        </Text>
        <PrimaryButton label="Log In" onPress={() => void onLogIn()} loading={leaving} />
      </AuthScreen>
    );
  }

  return (
    <AuthScreen
      title="Create a new password"
      subtitle="Choose a new password for your QuranFamily account."
    >
      <TextField
        label="New password"
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
        label={loading ? 'Updating password…' : 'Save password'}
        onPress={() => void onSubmit()}
        loading={loading}
      />
    </AuthScreen>
  );
}
