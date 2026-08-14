import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import { PrimaryButton, useAuth } from '@/features/auth';

export default function ProfileRoute() {
  const router = useRouter();
  const {
    activeLearner,
    profile,
    isGuest,
    isChildFamilySession,
    canManageFamily,
    signOut,
    endGuestSession,
    endChildFamilySession,
    clearActiveLearner,
  } = useAuth();

  const isChildSession = activeLearner?.role === 'child';
  const name = activeLearner?.display_name ?? profile?.display_name ?? 'QuranFamily learner';
  const role = activeLearner?.role ?? profile?.role ?? (isGuest ? 'guest' : 'unknown');

  return (
    <ScrollView
      className="flex-1 bg-brand-600"
      contentContainerStyle={{ padding: 20, paddingBottom: 36 }}
    >
      <View className="rounded-3xl bg-white px-5 py-6">
        <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
          Profile
        </Text>
        <Text className="mt-2 text-3xl font-bold text-brand-800">{name}</Text>
        <Text className="mt-2 text-base text-brand-600">
          {isChildSession ? 'Learner' : `Current role: ${role}`}
        </Text>
        <Text className="mt-1 text-base text-brand-600">
          {isGuest
            ? 'You are using a local guest session.'
            : isChildFamilySession
              ? 'You unlocked with your family code and PIN. No email needed.'
              : isChildSession
                ? 'Keep learning. Ask a parent if you need to switch.'
                : 'Your account is connected.'}
        </Text>

        <View className="mt-6">
          {canManageFamily ? (
            <PrimaryButton
              label="My Family"
              onPress={() => router.push('/(app)/parent/dashboard')}
            />
          ) : null}
          {!isChildSession ? (
            <PrimaryButton
              label="Settings"
              onPress={() => router.push('/(app)/settings' as never)}
              variant="secondary"
            />
          ) : null}
          {isGuest ? (
            <PrimaryButton
              label="End guest trial"
              onPress={() =>
                void endGuestSession().then(() => router.replace('/(auth)/welcome'))
              }
              variant="secondary"
            />
          ) : isChildFamilySession ? (
            <PrimaryButton
              label="Switch learner"
              onPress={() =>
                void endChildFamilySession().then(() =>
                  router.replace('/(auth)/child-entry'),
                )
              }
              variant="secondary"
            />
          ) : isChildSession ? (
            <PrimaryButton
              label="Switch learner"
              onPress={() =>
                void clearActiveLearner().then(() =>
                  router.replace('/(app)/family/learners'),
                )
              }
              variant="secondary"
            />
          ) : (
            <PrimaryButton
              label="Log out"
              onPress={() =>
                void signOut().then(() => router.replace('/(auth)/welcome'))
              }
              variant="secondary"
            />
          )}
        </View>
      </View>
    </ScrollView>
  );
}
