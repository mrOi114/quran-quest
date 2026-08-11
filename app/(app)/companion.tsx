import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { AuthScreen, PrimaryButton } from '@/features/auth';

/**
 * Thin placeholder until Feature 009 (AI Hifz Companion).
 */
export default function CompanionPlaceholderScreen() {
  const router = useRouter();

  return (
    <AuthScreen
      title="Practice with AI"
      subtitle="Your AI Hifz Companion will live here soon."
    >
      <View className="mb-4 rounded-2xl bg-brand-50 px-4 py-4">
        <Text className="text-base text-brand-700">
          {
            "Abu Hafidul Qur'an will listen, correct gently, and encourage you — always patient and respectful."
          }
        </Text>
      </View>
      <PrimaryButton label="Back to Games" variant="secondary" onPress={() => router.replace('/(app)/games')} />
      <PrimaryButton label="Back to Home" onPress={() => router.replace('/(app)/home')} />
    </AuthScreen>
  );
}
