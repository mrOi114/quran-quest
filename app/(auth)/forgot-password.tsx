import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text } from 'react-native';

import {
  AuthScreen,
  forgotPasswordSchema,
  PrimaryButton,
  requestPasswordReset,
  TextField,
} from '@/features/auth';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setFormError(null);
    setFieldError(undefined);
    setSuccess(false);

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
      setFormError(error instanceof Error ? error.message : 'Unable to send reset email');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScreen
      title="Reset password"
      subtitle="We will email you a secure link to choose a new password."
    >
      <TextField
        label="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        error={fieldError}
      />
      {formError ? <Text className="mb-3 text-sm text-red-600">{formError}</Text> : null}
      {success ? (
        <Text className="mb-3 text-sm text-brand-600">
          If an account exists for that email, a reset link is on the way.
        </Text>
      ) : null}
      <PrimaryButton
        label="Send reset link"
        onPress={() => void onSubmit()}
        loading={loading}
      />
      <Pressable onPress={() => router.replace('/(auth)/login')} className="py-2">
        <Text className="text-center text-sm font-medium text-brand-600">
          Back to login
        </Text>
      </Pressable>
    </AuthScreen>
  );
}
