import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function GamesRoute() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-brand-600">
      <View className="flex-1 px-5 pt-5 pb-8">
        <Text className="text-sm font-semibold uppercase tracking-wide text-brand-100">
          Games
        </Text>
        <Text className="mt-2 text-3xl font-bold text-white">Practice Games</Text>
        <Text className="mt-2 text-base text-brand-100">
          Choose a focused activity to strengthen memorization and recitation.
        </Text>

        <View className="mt-6 rounded-3xl bg-white px-4 py-4">
          <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
            Featured
          </Text>
          <Text className="mt-2 text-xl font-bold text-brand-800">AI Companion Drill</Text>
          <Text className="mt-2 text-base text-brand-600">
            Recite with guided prompts and calm feedback from Abu Hafidul Qur'an.
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open AI companion drill"
            onPress={() => router.push('/(app)/companion')}
            className="mt-4 min-h-12 items-center justify-center rounded-xl bg-brand-600 px-4 py-3 active:opacity-90"
          >
            <Text className="text-base font-semibold text-white">Open Game</Text>
          </Pressable>
        </View>

        <View className="mt-4 rounded-3xl bg-white px-4 py-4">
          <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
            Group Practice
          </Text>
          <Text className="mt-2 text-xl font-bold text-brand-800">Circle Challenge</Text>
          <Text className="mt-2 text-base text-brand-600">
            Join a Hifz circle activity with account-based progress and milestones.
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open circle challenge"
            onPress={() => router.push('/(app)/gates/circle')}
            className="mt-4 min-h-12 items-center justify-center rounded-xl border border-brand-600 px-4 py-3 active:opacity-90"
          >
            <Text className="text-base font-semibold text-brand-700">Open Circle</Text>
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to home"
          onPress={() => router.replace('/(app)/home')}
          className="mt-6 min-h-12 items-center justify-center"
        >
          <Text className="text-sm text-brand-100">Back to home</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}