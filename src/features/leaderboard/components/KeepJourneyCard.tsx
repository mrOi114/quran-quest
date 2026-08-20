import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { PrimaryButton } from '@/features/auth';
import { useI18n } from '@/i18n';

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
  const { t } = useI18n();
  const containerClass =
    variant === 'banner'
      ? 'mb-4 rounded-2xl bg-white px-4 py-4'
      : 'rounded-3xl bg-white px-5 py-6';

  return (
    <View className={containerClass}>
      <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
        {t('guest.keepJourney')}
      </Text>
      <Text className="mt-2 text-xl font-bold text-brand-800">{t('guest.alreadyProgress')}</Text>
      <Text className="mt-2 text-base leading-6 text-brand-600">
        {t('guest.effortValue', { points: points.toLocaleString() })}
      </Text>

      <View className="mt-4 gap-2">
        {[
          t('guest.saveProgress'),
          t('guest.keepStreak'),
          t('guest.keepAchievements'),
          t('guest.joinLeaderboard'),
          t('guest.joinCircle'),
          t('guest.continueAnyDevice'),
          t('guest.buildJourney'),
        ].map((item) => (
          <Text key={item} className="text-sm text-brand-700">
            ✓ {item}
          </Text>
        ))}
      </View>

      <View className="mt-5">
        <PrimaryButton
          label={t('common.createFreeAccount')}
          onPress={() => router.push('/(auth)/register')}
        />
        {onMaybeLater ? (
          <PrimaryButton
            label={t('common.maybeLater')}
            onPress={onMaybeLater}
            variant="secondary"
          />
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('guest.continueLearningGuest')}
            onPress={() => router.push('/(app)/lesson')}
            className="mt-2 min-h-11 items-center justify-center"
          >
            <Text className="text-sm font-semibold text-brand-600">
              {t('guest.continueAsGuest')}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
