import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import { PrimaryButton, useAuth } from '@/features/auth';

export default function SettingsRoute() {
  const router = useRouter();
  const { isGuest, signOut, endGuestSession } = useAuth();

  return (
    <ScrollView className="flex-1 bg-brand-600" contentContainerStyle={{ padding: 20, paddingBottom: 36 }}>
      <View className="rounded-3xl bg-white px-5 py-6">
        <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
          Settings
        </Text>
        <Text className="mt-2 text-3xl font-bold text-brand-800">App preferences</Text>
        <Text className="mt-2 text-base text-brand-600">
          Account, session, and device settings will live here.
        </Text>

        <View className="mt-5 rounded-2xl bg-brand-50 px-4 py-4">
          <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
            Session
          </Text>
          <Text className="mt-2 text-sm text-brand-700">
            {isGuest ? 'Guest trial active on this device.' : 'Signed in with a full account.'}
          </Text>
        </View>

        <View className="mt-6">
          <PrimaryButton label="Back to home" onPress={() => router.replace('/(app)/home')} />
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