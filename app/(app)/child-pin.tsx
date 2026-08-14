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

/** Parent-session child PIN unlock on an approved device. */
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
        title="Ask a parent"
        subtitle="Use Child / Learner with your family code, or ask a parent to connect this device."
      >
        <PrimaryButton
          label="Enter family code"
          onPress={() => router.push('/(auth)/child-entry')}
        />
        <PrimaryButton
          label="Back"
          onPress={() => router.replace('/(app)/family')}
          variant="secondary"
        />
      </AuthScreen>
    );
  }

  if (profile?.role !== 'parent') {
    return (
      <AuthScreen
        title="Ask a parent"
        subtitle="Use your family code from Child / Learner, or ask a parent to connect this device."
      >
        <PrimaryButton
          label="Enter family code"
          onPress={() => router.push('/(auth)/child-entry')}
        />
        <PrimaryButton label="Back" onPress={() => router.replace('/(app)/family')} />
      </AuthScreen>
    );
  }

  if (!child) {
    return (
      <AuthScreen title="Name not found" subtitle="Choose your name from the family list.">
        <PrimaryButton
          label="Back"
          onPress={() => router.replace('/(app)/family/learners')}
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
      title={`Hi ${childName}`}
      subtitle="Enter your PIN to open your QuranFamily home."
    >
      <PinInput
        label="Your PIN"
        value={pin}
        onChangeText={setPin}
        error={error ?? undefined}
      />
      <PrimaryButton
        label="Start learning"
        onPress={() => void onSubmit()}
        loading={loading}
      />
      <Pressable onPress={() => router.replace('/(app)/family/learners')} className="py-2">
        <Text className="text-center text-sm font-medium text-brand-600">Back</Text>
      </Pressable>
    </AuthScreen>
  );
}
