import { Redirect, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Text } from 'react-native';

import { AuthScreen, PrimaryButton, useAuth } from '@/features/auth';

export default function FamilyLearnersScreen() {
  const router = useRouter();
  const {
    profile,
    children,
    selectSelfAsLearner,
    ensureDeviceRegistered,
    refreshChildren,
    refreshProfile,
    isGuest,
    canManageFamily,
    session,
    isEmailVerified,
  } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const parentSignedIn =
    Boolean(session) && isEmailVerified && profile?.role === 'parent';

  useEffect(() => {
    void ensureDeviceRegistered().catch(() => undefined);
    void refreshChildren().catch(() => undefined);
  }, [ensureDeviceRegistered, refreshChildren]);

  if (isGuest || !session || !isEmailVerified) {
    return <Redirect href="/(auth)/child-entry" />;
  }

  if (!profile) {
    return (
      <AuthScreen
        title="Who is learning?"
        subtitle="We couldn't load your profile yet."
      >
        <Text className="mb-3 text-sm text-red-600">
          Verification could not be completed. Please try again.
        </Text>
        <PrimaryButton
          label="Try again"
          onPress={() => {
            void refreshProfile().catch(() => undefined);
          }}
        />
        <PrimaryButton
          label="Back to login"
          onPress={() => router.replace('/(auth)/login')}
          variant="secondary"
        />
      </AuthScreen>
    );
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
      subtitle={
        parentSignedIn
          ? 'Tap your name. Children enter a PIN. Parents can continue without a PIN.'
          : 'Continue as yourself to learn.'
      }
    >
      {profile && profile.role !== 'child' ? (
        <Pressable
          onPress={() => void chooseSelf()}
          accessibilityRole="button"
          className="mb-3 min-h-14 rounded-2xl border border-brand-100 bg-brand-50 px-4 py-4"
        >
          <Text className="text-lg font-semibold text-brand-800">
            {profile.display_name}
          </Text>
          <Text className="mt-1 text-sm capitalize text-brand-500">
            {profile.role} · no PIN
          </Text>
          {loadingId === profile.id ? (
            <Text className="mt-2 text-sm text-brand-600">Opening…</Text>
          ) : null}
        </Pressable>
      ) : null}

      {parentSignedIn
        ? children.map((child) => (
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
                Child · Age {child.age ?? '—'} · enter PIN
              </Text>
            </Pressable>
          ))
        : null}

      {parentSignedIn && children.length === 0 ? (
        <Text className="mb-4 text-sm text-brand-600">
          No children yet. Add a child from the family dashboard.
        </Text>
      ) : null}

      {error ? <Text className="mb-3 text-sm text-red-600">{error}</Text> : null}

      {canManageFamily ? (
        <PrimaryButton
          label="My Family"
          onPress={() => router.push('/(app)/parent/dashboard')}
          variant="secondary"
        />
      ) : null}

      <PrimaryButton
        label="Back"
        onPress={() => router.replace('/(app)/family')}
        variant="secondary"
      />
    </AuthScreen>
  );
}
