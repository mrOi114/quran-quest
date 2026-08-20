import { Text, View } from 'react-native';

import { useI18n } from '@/i18n';

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
  const { t } = useI18n();
  return (
    <View className="mb-4">
      <Text className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-200">
        {t('home.achievements')}
      </Text>
      <View className="flex-row gap-3">
        <AchievementCard
          label={t('home.dayStreak')}
          value={String(achievements.streakDays)}
          accessibilityLabel={t('home.streakA11y', { count: achievements.streakDays })}
        />
        <AchievementCard
          label={t('home.lessons')}
          value={String(achievements.lessonsCompleted)}
          accessibilityLabel={t('home.lessonsA11y', { count: achievements.lessonsCompleted })}
        />
        <AchievementCard
          label={t('home.surahs')}
          value={String(achievements.surahsCompleted)}
          accessibilityLabel={t('home.surahsA11y', { count: achievements.surahsCompleted })}
        />
      </View>
    </View>
  );
}
