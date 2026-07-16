import { Text, View } from 'react-native';

import type { HomeAchievements } from '../types';

type AchievementsSectionProps = {
  achievements: HomeAchievements;
};

type AchievementCardProps = {
  label: string;
  value: string;
  accessibilityLabel: string;
};

function AchievementCard({ label, value, accessibilityLabel }: AchievementCardProps) {
  return (
    <View
      className="min-w-[30%] flex-1 rounded-2xl bg-white px-3 py-4"
      accessible
      accessibilityLabel={accessibilityLabel}
    >
      <Text className="text-center text-2xl font-bold text-brand-700">{value}</Text>
      <Text className="mt-1 text-center text-xs font-medium text-brand-500">{label}</Text>
    </View>
  );
}

export function AchievementsSection({ achievements }: AchievementsSectionProps) {
  return (
    <View className="mb-4">
      <Text className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-200">
        Achievements
      </Text>
      <View className="flex-row gap-3">
        <AchievementCard
          label="Day streak"
          value={String(achievements.streakDays)}
          accessibilityLabel={`Current streak: ${achievements.streakDays} days`}
        />
        <AchievementCard
          label="Lessons"
          value={String(achievements.lessonsCompleted)}
          accessibilityLabel={`Lessons completed: ${achievements.lessonsCompleted}`}
        />
        <AchievementCard
          label="Surahs"
          value={String(achievements.surahsCompleted)}
          accessibilityLabel={`Surahs completed: ${achievements.surahsCompleted}`}
        />
      </View>
    </View>
  );
}
