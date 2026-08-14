import { Redirect, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';

import { AuthScreen, PrimaryButton, useAuth } from '@/features/auth';

export default function FamilyEntryScreen() {
  const router = useRouter();
  const {
    profile,
    session,
    isGuest,
    isEmailVerified,
    canManageFamily,
    isChildFamilySession,
    ensureDeviceRegistered,
    clearActiveLearner,
    activeLearner,
  } = useAuth();

  useEffect(() => {
    if (activeLearner?.role === 'child' && !isChildFamilySession) {
      void clearActiveLearner();
    }
  }, [activeLearner?.role, clearActiveLearner, isChildFamilySession]);

  useEffect(() => {
    void ensureDeviceRegistered().catch(() => undefined);
  }, [ensureDeviceRegistered]);

  if (isChildFamilySession) {
    return <Redirect href="/(app)/home" />;
  }

  const parentSignedIn =
    Boolean(session) && isEmailVerified && profile?.role === 'parent';

  function goParent() {
    if (parentSignedIn && canManageFamily) {
      router.push('/(app)/parent/dashboard');
      return;
    }
    if (session && isEmailVerified && profile?.role === 'adult') {
      router.push('/(app)/family/learners');
      return;
    }
    router.push({ pathname: '/(auth)/login', params: { role: 'parent' } });
  }

  function goChild() {
    if (parentSignedIn) {
      router.push('/(app)/family/learners');
      return;
    }
    router.push('/(auth)/child-entry');
  }

  return (
    <AuthScreen
      title="Family"
      subtitle="Parents manage the family. Children unlock with their own PIN."
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Parent or Family Sign In"
        onPress={goParent}
        className="mb-3 min-h-16 rounded-2xl border border-brand-100 bg-brand-50 px-4 py-4 active:opacity-90"
      >
        <Text className="text-lg font-semibold text-brand-800">
          Parent / Family Sign In
        </Text>
        <Text className="mt-1 text-sm text-brand-600">
          Sign in to add children, see progress, and manage PINs.
        </Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Child or Learner"
        onPress={goChild}
        className="mb-4 min-h-16 rounded-2xl border border-brand-100 bg-white px-4 py-4 active:opacity-90"
      >
        <Text className="text-lg font-semibold text-brand-800">Child / Learner</Text>
        <Text className="mt-1 text-sm text-brand-600">
          Choose your name and enter your PIN. No parent password needed.
        </Text>
      </Pressable>

      {parentSignedIn ? (
        <Text className="mb-4 text-sm text-brand-600">
          This device is ready for your family. Children can unlock with their PIN.
        </Text>
      ) : (
        <View className="mb-4 rounded-2xl bg-brand-50 px-4 py-3">
          <Text className="text-sm leading-5 text-brand-700">
            On a child tablet: use Family code → choose name → PIN. Create the child on
            the parent phone first.
          </Text>
        </View>
      )}

      {isGuest ? (
        <PrimaryButton
          label="Back to guest home"
          onPress={() => router.replace('/(app)/home')}
          variant="secondary"
        />
      ) : null}
    </AuthScreen>
  );
}
