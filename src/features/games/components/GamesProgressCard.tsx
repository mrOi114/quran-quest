import { Text, View } from 'react-native';

import { useI18n } from '@/i18n';

type GamesProgressCardProps = {
  xpPoints: number;
  gamesCompleted: number;
  achievements: number;
  streakDays: number;
};

export function GamesProgressCard({
  xpPoints,
  gamesCompleted,
  achievements,
  streakDays,
}: GamesProgressCardProps) {
  const { t } = useI18n();
  return (
    <View className="rounded-3xl bg-white px-4 py-4">
      <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
        {t('games.yourProgress')}
      </Text>
      <View className="mt-3 flex-row flex-wrap gap-3">
        <Stat label={t('common.xp')} value={String(xpPoints)} />
        <Stat label={t('games.statGames')} value={String(gamesCompleted)} />
        <Stat label={t('games.statAchievements')} value={String(achievements)} />
        <Stat label={t('games.statStreak')} value={`${streakDays}d`} />
      </View>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View className="min-w-[40%] flex-1 rounded-2xl bg-brand-50 px-3 py-3">
      <Text className="text-xs font-semibold uppercase tracking-wide text-brand-500">
        {label}
      </Text>
      <Text className="mt-1 text-xl font-bold text-brand-800">{value}</Text>
    </View>
  );
}
