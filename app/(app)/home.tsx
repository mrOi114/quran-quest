import { Redirect, useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import {
  AuthScreen,
  GUEST_LIMIT_SURAHS,
  GUEST_MILESTONE_SURAHS,
  MilestonePrompt,
  PrimaryButton,
  useAuth,
} from '@/features/auth';

export default function HomeStubScreen() {
  const router = useRouter();
  const {
    profile,
    activeLearner,
    isGuest,
    guestProfile,
    guestProgress,
    showMilestonePrompt,
    isGuestAtLimit,
    clearActiveLearner,
    dismissGuestMilestone,
    endGuestSession,
    simulateGuestProgress,
    signOut,
  } = useAuth();

  if (!activeLearner) {
    return <Redirect href={isGuest ? '/(auth)/welcome' : '/(app)/family'} />;
  }

  return (
    <AuthScreen
      title={isGuest ? 'Guest trial' : "You're in"}
      subtitle={
        isGuest
          ? 'Progress is saved on this device. Create a free account anytime to keep it safe.'
          : 'Feature 001 authentication is active. Learning screens come next.'
      }
    >
      {isGuest ? (
        <View className="mb-4 rounded-2xl bg-brand-50 px-4 py-4">
          <Text className="text-sm text-brand-500">Guest learner</Text>
          <Text className="mt-1 text-lg font-semibold text-brand-800">
            {guestProfile?.displayName ?? activeLearner.display_name}
          </Text>
          <Text className="mt-1 text-brand-600">
            {guestProfile?.ageGroup.replaceAll('_', ' ')} · {guestProfile?.countryCode} ·{' '}
            {guestProfile?.preferredLanguage}
          </Text>
          <Text className="mt-3 text-sm text-brand-600">
            Juz 30 progress: {guestProgress?.juz30SurahsCompleted ?? 0} /{' '}
            {GUEST_LIMIT_SURAHS} surahs
          </Text>
          <Text className="mt-1 text-xs text-brand-500">
            Soft prompt at {GUEST_MILESTONE_SURAHS} · guest limit at {GUEST_LIMIT_SURAHS}
          </Text>
          {isGuestAtLimit ? (
            <Text className="mt-3 text-sm font-medium text-brand-700">
              You&apos;ve reached the guest trial limit. Create a free account to continue
              further learning features.
            </Text>
          ) : null}
        </View>
      ) : (
        <>
          <View className="mb-4 rounded-2xl bg-brand-50 px-4 py-4">
            <Text className="text-sm text-brand-500">Signed-in account</Text>
            <Text className="mt-1 text-lg font-semibold text-brand-800">
              {profile?.display_name ?? '—'}
            </Text>
            <Text className="mt-1 capitalize text-brand-600">{profile?.role}</Text>
          </View>

          <View className="mb-6 rounded-2xl bg-brand-50 px-4 py-4">
            <Text className="text-sm text-brand-500">Active learner</Text>
            <Text className="mt-1 text-lg font-semibold text-brand-800">
              {activeLearner.display_name}
            </Text>
            <Text className="mt-1 capitalize text-brand-600">{activeLearner.role}</Text>
          </View>
        </>
      )}

      {isGuest ? (
        <>
          <PrimaryButton
            label="Simulate +1 Juz 30 surah (test)"
            onPress={() => void simulateGuestProgress(1)}
          />
          <PrimaryButton
            label="Create Free Account"
            onPress={() => router.push('/(auth)/register')}
            variant="secondary"
          />
          <PrimaryButton
            label="End guest trial"
            onPress={() => {
              void endGuestSession().then(() => router.replace('/(auth)/welcome'));
            }}
            variant="secondary"
          />
        </>
      ) : (
        <>
          <PrimaryButton
            label="Switch learner"
            onPress={() => {
              void clearActiveLearner().then(() => router.replace('/(app)/family'));
            }}
          />

          {profile?.role === 'parent' ? (
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
        </>
      )}

      <MilestonePrompt
        visible={showMilestonePrompt}
        onLater={() => {
          void dismissGuestMilestone();
        }}
      />
    </AuthScreen>
  );
}
