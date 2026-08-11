import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { PrimaryButton } from '@/features/auth';

type KeepJourneyCardProps = {
  points: number;
  variant?: 'card' | 'banner';
  onMaybeLater?: () => void;
};

export function KeepJourneyCard({
  points,
  variant = 'card',
  onMaybeLater,
}: KeepJourneyCardProps) {
  const router = useRouter();
  const containerClass =
    variant === 'banner'
      ? 'mb-4 rounded-2xl bg-white px-4 py-4'
      : 'rounded-3xl bg-white px-5 py-6';

  return (
    <View className={containerClass}>
      <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
        ⭐ Keep your Qur&apos;an journey
      </Text>
      <Text className="mt-2 text-xl font-bold text-brand-800">
        You&apos;ve already made progress!
      </Text>
      <Text className="mt-2 text-base leading-6 text-brand-600">
        Your effort has value — {points.toLocaleString()} points so far. Create your free
        account to keep it.
      </Text>

      <View className="mt-4 gap-2">
        {[
          'Save your learning progress',
          'Keep your streak',
          'Keep your achievements',
          'Join the Leaderboard',
          'Join a learning Circle',
          'Continue from any device',
          'Build your Qur\'an journey',
        ].map((item) => (
          <Text key={item} className="text-sm text-brand-700">
            ✓ {item}
          </Text>
        ))}
      </View>

      <View className="mt-5">
        <PrimaryButton
          label="Create Free Account"
          onPress={() => router.push('/(auth)/register')}
        />
        {onMaybeLater ? (
          <PrimaryButton label="Maybe Later" onPress={onMaybeLater} variant="secondary" />
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Continue learning as guest"
            onPress={() => router.push('/(app)/lesson')}
            className="mt-2 min-h-11 items-center justify-center"
          >
            <Text className="text-sm font-semibold text-brand-600">Continue as Guest</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
