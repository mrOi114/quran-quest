import { Text, View } from 'react-native';

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
  return (
    <View className="rounded-3xl bg-white px-4 py-4">
      <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
        Your Progress
      </Text>
      <View className="mt-3 flex-row flex-wrap gap-3">
        <Stat label="XP" value={String(xpPoints)} />
        <Stat label="Games" value={String(gamesCompleted)} />
        <Stat label="Achievements" value={String(achievements)} />
        <Stat label="Streak" value={`${streakDays}d`} />
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
