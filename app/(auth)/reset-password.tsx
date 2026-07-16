import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';

import {
  AuthScreen,
  PrimaryButton,
  resetPasswordSchema,
  TextField,
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

  if (!session) {
    return <Redirect href="/(auth)/forgot-password" />;
  }

  if (!needsPasswordReset) {
    return <Redirect href="/" />;
  }

  async function onSubmit() {
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
      router.replace('/');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Could not update password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScreen
      title="Choose a new password"
      subtitle="Enter a strong password for your Qur'an Quest account."
    >
      <TextField
        label="New password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        error={fieldErrors.password}
      />
      <TextField
        label="Confirm password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        error={fieldErrors.confirmPassword}
      />
      {formError ? <Text className="mb-3 text-sm text-red-600">{formError}</Text> : null}
      <PrimaryButton
        label="Save password"
        onPress={() => void onSubmit()}
        loading={loading}
      />
      <PrimaryButton
        label="Cancel and log out"
        onPress={() => {
          void signOut().then(() => router.replace('/(auth)/welcome'));
        }}
        variant="secondary"
      />
    </AuthScreen>
  );
}
