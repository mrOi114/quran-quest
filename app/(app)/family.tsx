import { Redirect, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Text } from 'react-native';

import { AuthScreen, PrimaryButton, useAuth } from '@/features/auth';

export default function FamilyPickerScreen() {
  const router = useRouter();
  const {
    profile,
    children,
    selectSelfAsLearner,
    ensureDeviceRegistered,
    signOut,
    refreshChildren,
    isGuest,
    canManageFamily,
    activeLearner,
    clearActiveLearner,
  } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    // Leaving a child session via family picker clears the child learner first.
    if (activeLearner?.role === 'child') {
      void clearActiveLearner();
    }
  }, [activeLearner?.role, clearActiveLearner]);

  useEffect(() => {
    void ensureDeviceRegistered().catch(() => undefined);
    void refreshChildren().catch(() => undefined);
  }, [ensureDeviceRegistered, refreshChildren]);

  if (isGuest) {
    return <Redirect href="/(app)/home" />;
  }

  async function chooseSelf() {
    if (!profile) {
      return;
    }
    setLoadingId(profile.id);
    setError(null);
    try {
      await selectSelfAsLearner();
      router.replace('/(app)/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not continue');
    } finally {
      setLoadingId(null);
    }
  }

  function chooseChild(childId: string) {
    router.push({ pathname: '/(app)/child-pin', params: { childId } });
  }

  return (
    <AuthScreen
      title="Who is learning?"
      subtitle="Parents can unlock a child with a PIN on this approved device."
    >
      {profile ? (
        <Pressable
          onPress={() => void chooseSelf()}
          accessibilityRole="button"
          className="mb-3 min-h-14 rounded-2xl border border-brand-100 bg-brand-50 px-4 py-4"
        >
          <Text className="text-lg font-semibold text-brand-800">
            {profile.display_name}
          </Text>
          <Text className="mt-1 text-sm capitalize text-brand-500">{profile.role}</Text>
          {loadingId === profile.id ? (
            <Text className="mt-2 text-sm text-brand-600">Opening…</Text>
          ) : null}
        </Pressable>
      ) : null}

      {children.map((child) => (
        <Pressable
          key={child.id}
          onPress={() => chooseChild(child.id)}
          accessibilityRole="button"
          className="mb-3 min-h-14 rounded-2xl border border-brand-100 bg-white px-4 py-4"
        >
          <Text className="text-lg font-semibold text-brand-800">
            {child.display_name}
          </Text>
          <Text className="mt-1 text-sm text-brand-500">
            Child · Age {child.age ?? '—'} · {child.country_code} · PIN required
          </Text>
        </Pressable>
      ))}

      {profile?.role === 'parent' && children.length === 0 ? (
        <Text className="mb-4 text-sm text-brand-600">
          No children yet. Create a child profile to let them learn with a PIN.
        </Text>
      ) : null}

      {error ? <Text className="mb-3 text-sm text-red-600">{error}</Text> : null}

      {canManageFamily ? (
        <PrimaryButton
          label="Manage children"
          onPress={() => router.push('/(app)/parent/children')}
          variant="secondary"
        />
      ) : null}

      <PrimaryButton
        label="Log out"
        onPress={() => {
          void signOut().then(() => router.replace('/(auth)/welcome'));
        }}
        variant="secondary"
      />
    </AuthScreen>
  );
}
