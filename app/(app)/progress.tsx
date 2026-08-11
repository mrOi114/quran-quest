import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import { PrimaryButton, useAuth } from '@/features/auth';
import { useHomeDashboard } from '@/features/home';

export default function ProgressRoute() {
  const router = useRouter();
  const { activeLearner } = useAuth();
  const { dashboard, isLoading } = useHomeDashboard();

  if (isLoading || !dashboard) {
    return (
      <View className="flex-1 items-center justify-center bg-brand-600 px-6">
        <Text className="text-base text-brand-50">Loading progress…</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-brand-600" contentContainerStyle={{ padding: 20, paddingBottom: 36 }}>
      <View className="rounded-3xl bg-white px-5 py-6">
        <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
          Progress
        </Text>
        <Text className="mt-2 text-3xl font-bold text-brand-800">
          {activeLearner?.display_name ?? dashboard.nickname}
        </Text>
        <Text className="mt-2 text-base text-brand-600">
          {dashboard.greetingLine} Here is your current learning progress.
        </Text>

        <View className="mt-5 rounded-2xl bg-brand-50 px-4 py-4">
          <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
            Today
          </Text>
          <Text className="mt-2 text-xl font-semibold text-brand-800">
            {dashboard.todaysLesson.surahArabic} · {dashboard.todaysLesson.surahName}
          </Text>
          <Text className="mt-1 text-sm text-brand-600">
            Lesson {dashboard.todaysLesson.lessonLabel} · {dashboard.todaysLesson.progressPercent}% complete
          </Text>
        </View>

        <View className="mt-4 rounded-2xl bg-brand-50 px-4 py-4">
          <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
            Achievements
          </Text>
          <Text className="mt-2 text-base text-brand-700">
            Streak: {dashboard.achievements.streakDays} days
          </Text>
          <Text className="mt-1 text-base text-brand-700">
            Lessons completed: {dashboard.achievements.lessonsCompleted}
          </Text>
          <Text className="mt-1 text-base text-brand-700">
            Surahs completed: {dashboard.achievements.surahsCompleted}
          </Text>
        </View>

        <View className="mt-4 rounded-2xl bg-brand-50 px-4 py-4">
          <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
            Circle
          </Text>
          <Text className="mt-2 text-base text-brand-700">{dashboard.circlePreview.title}</Text>
          <Text className="mt-1 text-sm text-brand-600">{dashboard.circlePreview.subtitle}</Text>
        </View>

        <View className="mt-6">
          <PrimaryButton label="Continue learning" onPress={() => router.push('/(app)/lesson')} />
          <PrimaryButton
            label="Open home dashboard"
            onPress={() => router.replace('/(app)/home')}
            variant="secondary"
          />
        </View>
      </View>
    </ScrollView>
  );
}