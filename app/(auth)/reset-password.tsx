import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import {
  AuthScreen,
  EmailAuthError,
  PrimaryButton,
  RESET_EXPIRED_MESSAGE,
  TextField,
  logAuthError,
  resetPasswordSchema,
  toFriendlyAuthError,
  updatePassword,
  useAuth,
} from '@/features/auth';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const {
    session,
    needsPasswordReset,
    isProcessingAuthCallback,
    clearPasswordResetFlag,
    signOut,
  } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [updated, setUpdated] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSettled(true), 800);
    return () => clearTimeout(timer);
  }, []);

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
      const mapped = error instanceof EmailAuthError ? error : toFriendlyAuthError(error, 'recovery');
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

  if (isProcessingAuthCallback || (!settled && (!session || !needsPasswordReset))) {
    return (
      <AuthScreen title="Create a new password" subtitle="Finishing the secure reset link…">
        <View className="items-center py-6">
          <ActivityIndicator color="#0F3D2E" size="large" />
        </View>
      </AuthScreen>
    );
  }

  if (!session || !needsPasswordReset) {
    return (
      <AuthScreen
        title="This reset link has expired. Request a new one."
        subtitle="The link was already used or is no longer valid."
      >
        <Text className="mb-4 text-base text-brand-700">{RESET_EXPIRED_MESSAGE}</Text>
        <PrimaryButton
          label="Request a new reset email"
          onPress={() => router.replace('/(auth)/forgot-password')}
        />
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
      title="Create a new password"
      subtitle="Choose a new password for your QuranFamily account."
    >
      <TextField
        label="New Password"
        secureTextEntry
        autoComplete="new-password"
        value={password}
        onChangeText={setPassword}
        error={fieldErrors.password}
        hint="At least 8 characters"
        editable={!loading}
      />
      <TextField
        label="Confirm Password"
        secureTextEntry
        autoComplete="new-password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        error={fieldErrors.confirmPassword}
        editable={!loading}
      />
      {formError ? <Text className="mb-3 text-sm text-red-600">{formError}</Text> : null}
      <PrimaryButton
        label={loading ? 'Updating password…' : 'Save New Password'}
        onPress={() => void onSubmit()}
        loading={loading}
      />
    </AuthScreen>
  );
}
