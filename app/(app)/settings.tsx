import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import { PrimaryButton, useAuth } from '@/features/auth';

export default function SettingsRoute() {
  const router = useRouter();
  const {
    isGuest,
    isChildFamilySession,
    canManageFamily,
    familyCode,
    signOut,
    endGuestSession,
    endChildFamilySession,
  } = useAuth();

  return (
    <ScrollView className="flex-1 bg-brand-600" contentContainerStyle={{ padding: 20, paddingBottom: 36 }}>
      <View className="rounded-3xl bg-white px-5 py-6">
        <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
          Settings
        </Text>
        <Text className="mt-2 text-3xl font-bold text-brand-800">App preferences</Text>
        <Text className="mt-2 text-base text-brand-600">
          Account, session, and device settings live here.
        </Text>

        <View className="mt-5 rounded-2xl bg-brand-50 px-4 py-4">
          <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
            Session
          </Text>
          <Text className="mt-2 text-sm text-brand-700">
            {isGuest
              ? 'Guest trial active on this device.'
              : isChildFamilySession
                ? 'Child session unlocked with family code and PIN.'
                : 'Signed in with a full account.'}
          </Text>
          {canManageFamily && familyCode ? (
            <Text className="mt-2 text-sm font-semibold text-brand-800">
              Family code: {familyCode}
            </Text>
          ) : null}
        </View>

        <View className="mt-6">
          <PrimaryButton label="Back to home" onPress={() => router.replace('/(app)/home')} />
          {canManageFamily ? (
            <PrimaryButton
              label="My Family"
              onPress={() => router.push('/(app)/parent/dashboard')}
              variant="secondary"
            />
          ) : null}
          <PrimaryButton
            label={
              isChildFamilySession
                ? 'Switch learner'
                : isGuest
                  ? 'End guest trial'
                  : 'Log out'
            }
            onPress={() =>
              void (isChildFamilySession
                ? endChildFamilySession()
                : isGuest
                  ? endGuestSession()
                  : signOut()
              ).then(() =>
                router.replace(
                  isChildFamilySession ? '/(auth)/child-entry' : '/(auth)/welcome',
                ),
              )
            }
            variant="secondary"
          />
        </View>
      </View>
    </ScrollView>
  );
}
