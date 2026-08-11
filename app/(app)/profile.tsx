import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import { PrimaryButton, useAuth } from '@/features/auth';

export default function ProfileRoute() {
  const router = useRouter();
  const { activeLearner, profile, isGuest, signOut, endGuestSession } = useAuth();

  const name = activeLearner?.display_name ?? profile?.display_name ?? 'QuranFamily learner';
  const role = activeLearner?.role ?? profile?.role ?? (isGuest ? 'guest' : 'unknown');

  return (
    <ScrollView className="flex-1 bg-brand-600" contentContainerStyle={{ padding: 20, paddingBottom: 36 }}>
      <View className="rounded-3xl bg-white px-5 py-6">
        <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
          Profile
        </Text>
        <Text className="mt-2 text-3xl font-bold text-brand-800">{name}</Text>
        <Text className="mt-2 text-base text-brand-600">Current role: {role}</Text>
        <Text className="mt-1 text-base text-brand-600">
          {isGuest ? 'You are using a local guest session.' : 'Your account is connected.'}
        </Text>

        <View className="mt-5 rounded-2xl bg-brand-50 px-4 py-4">
          <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
            Actions
          </Text>
          <Text className="mt-2 text-sm text-brand-700">
            Use Family to switch learners, or Settings to manage the session.
          </Text>
        </View>

        <View className="mt-6">
          <PrimaryButton label="Family" onPress={() => router.push('/(app)/family')} />
          <PrimaryButton
            label="Settings"
            onPress={() => router.push('/(app)/settings' as never)}
            variant="secondary"
          />
          <PrimaryButton
            label={isGuest ? 'End guest trial' : 'Sign out'}
            onPress={() => void (isGuest ? endGuestSession() : signOut()).then(() => router.replace('/(auth)/welcome'))}
            variant="secondary"
          />
        </View>
      </View>
    </ScrollView>
  );
}