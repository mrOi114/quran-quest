import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { AuthScreen, PrimaryButton } from '@/features/auth';

/**
 * Thin placeholder until Feature 004 (Juz 30 Learning Engine).
 * Continue Learning navigates here so Feature 003 resume flow is wired.
 */
export default function LessonPlaceholderScreen() {
  const router = useRouter();
  const { lessonId } = useLocalSearchParams<{ lessonId?: string }>();

  return (
    <AuthScreen
      title="Your lesson"
      subtitle="The Juz 30 learning engine will open here next."
    >
      <View className="mb-4 rounded-2xl bg-brand-50 px-4 py-4">
        <Text className="text-base text-brand-700">
          Feature 004 will load your Arabic lesson here. Your place is saved so you can
          continue anytime.
        </Text>
        {lessonId ? (
          <Text className="mt-3 text-sm text-brand-500">Lesson: {lessonId}</Text>
        ) : null}
      </View>
      <PrimaryButton label="Back to Home" onPress={() => router.replace('/(app)/home')} />
    </AuthScreen>
  );
}
