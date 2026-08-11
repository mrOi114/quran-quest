import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, Text } from 'react-native';

import {
  AuthScreen,
  childPinSchema,
  PinInput,
  PrimaryButton,
  useAuth,
} from '@/features/auth';

export default function ChildPinScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ childId?: string }>();
  const { children, unlockChild, profile, isGuest } = useAuth();
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const child = useMemo(
    () => children.find((item) => item.id === params.childId) ?? null,
    [children, params.childId],
  );

  if (isGuest) {
    return (
      <AuthScreen
        title="Account required"
        subtitle="Family PIN unlock needs a Parent account."
      >
        <PrimaryButton
          label="Create Free Account"
          onPress={() => router.push('/(auth)/register')}
        />
        <PrimaryButton
          label="Back home"
          onPress={() => router.replace('/(app)/home')}
          variant="secondary"
        />
      </AuthScreen>
    );
  }

  if (profile?.role !== 'parent') {
    return (
      <AuthScreen title="Unavailable" subtitle="Only parents can unlock child profiles.">
        <PrimaryButton label="Go back" onPress={() => router.replace('/(app)/family')} />
      </AuthScreen>
    );
  }

  if (!child) {
    return (
      <AuthScreen
        title="Child not found"
        subtitle="Choose a child from your family list."
      >
        <PrimaryButton
          label="Back to family"
          onPress={() => router.replace('/(app)/family')}
        />
      </AuthScreen>
    );
  }

  const childId = child.id;
  const childName = child.display_name;

  async function onSubmit() {
    setError(null);
    const parsed = childPinSchema.safeParse({ pin });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid PIN');
      return;
    }

    setLoading(true);
    try {
      await unlockChild(childId, parsed.data.pin);
      router.replace('/(app)/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Incorrect PIN');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScreen
      title={`Unlock ${childName}`}
      subtitle="Enter the 4–6 digit PIN on this parent-approved device."
    >
      <PinInput
        label="Child PIN"
        value={pin}
        onChangeText={setPin}
        error={error ?? undefined}
      />
      <PrimaryButton label="Unlock" onPress={() => void onSubmit()} loading={loading} />
      <Pressable onPress={() => router.replace('/(app)/family')} className="py-2">
        <Text className="text-center text-sm font-medium text-brand-600">Back</Text>
      </Pressable>
    </AuthScreen>
  );
}
