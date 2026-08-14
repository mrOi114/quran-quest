import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text } from 'react-native';

import {
  AuthScreen,
  childPinSchema,
  PinInput,
  PrimaryButton,
  useAuth,
} from '@/features/auth';

/** Family-code child PIN unlock (no parent email session required). */
export default function ChildUnlockScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    childId?: string;
    familyCode?: string;
    childName?: string;
  }>();
  const { unlockChildByFamilyCode } = useAuth();
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const childId = typeof params.childId === 'string' ? params.childId : '';
  const familyCode =
    typeof params.familyCode === 'string' ? params.familyCode.trim().toUpperCase() : '';
  const childName =
    typeof params.childName === 'string' && params.childName.trim()
      ? params.childName.trim()
      : 'friend';

  if (!childId || !familyCode) {
    return (
      <AuthScreen
        title="Start again"
        subtitle="Enter your family code and choose your name first."
      >
        <PrimaryButton
          label="Enter family code"
          onPress={() => router.replace('/(auth)/child-entry')}
        />
      </AuthScreen>
    );
  }

  async function onSubmit() {
    setError(null);
    const parsed = childPinSchema.safeParse({ pin });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid PIN');
      return;
    }

    setLoading(true);
    try {
      await unlockChildByFamilyCode(familyCode, childId, parsed.data.pin);
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
      <Pressable onPress={() => router.replace('/(auth)/child-entry')} className="py-2">
        <Text className="text-center text-sm font-medium text-brand-600">Back</Text>
      </Pressable>
    </AuthScreen>
  );
}
