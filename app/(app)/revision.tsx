import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { AuthScreen, PrimaryButton } from '@/features/auth';

/**
 * Thin placeholder until Feature 007 (Smart Revision).
 */
export default function RevisionPlaceholderScreen() {
  const router = useRouter();

  return (
    <AuthScreen
      title="Daily Revision"
      subtitle="Smart Revision will guide you here in a later feature."
    >
      <View className="mb-4 rounded-2xl bg-brand-50 px-4 py-4">
        <Text className="text-base text-brand-700">
          {
            "Abu Hafidul Qur'an will help you revise weak verses with calm, encouraging practice."
          }
        </Text>
      </View>
      <PrimaryButton label="Back to Home" onPress={() => router.replace('/(app)/home')} />
    </AuthScreen>
  );
}
