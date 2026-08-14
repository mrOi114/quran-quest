import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text } from 'react-native';

import {
  AuthScreen,
  PrimaryButton,
  RolePicker,
  TextField,
  registerAccount,
  registerSchema,
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
    params.role === 'parent' ? 'parent' : 'adult',
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setFormError(null);
    setFieldErrors({});

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
      await registerAccount(parsed.data);
      router.replace({
        pathname: '/(auth)/verify-email',
        params: { email: parsed.data.email },
      });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to create account');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScreen
      title={role === 'parent' ? 'Create a parent account' : 'Create your account'}
      subtitle={
        role === 'parent'
          ? 'You create and control child profiles. Children never need their own email.'
          : 'Choose Adult or Parent. Children are created later by a parent — they cannot sign up here.'
      }
    >
      <RolePicker value={role} onChange={setRole} />
      <TextField
        label="Display name"
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
        label="Create account"
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
          <Text className="font-semibold text-brand-600">Log in</Text>
        </Text>
      </Pressable>
    </AuthScreen>
  );
}
