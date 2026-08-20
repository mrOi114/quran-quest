import { useRouter } from 'expo-router';
import { Modal, Text, View } from 'react-native';

import { useI18n } from '@/i18n';

import { PrimaryButton } from './PrimaryButton';

type MilestonePromptProps = {
  visible: boolean;
  onLater: () => void;
  pointsEarned?: number;
};

export function MilestonePrompt({
  visible,
  onLater,
  pointsEarned,
}: MilestonePromptProps) {
  const router = useRouter();
  const { t } = useI18n();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 items-center justify-center bg-black/40 px-6">
        <View className="w-full rounded-3xl bg-white px-5 py-6">
          <Text className="text-2xl font-semibold text-brand-800">{t('guest.milestoneTitle')}</Text>
          <Text className="mt-3 text-base leading-6 text-brand-700">
            {pointsEarned != null && pointsEarned > 0
              ? t('guest.milestonePoints', { points: pointsEarned.toLocaleString() })
              : t('guest.milestoneProgress')}
          </Text>
          <Text className="mt-3 text-base leading-6 text-brand-700">
            {t('guest.milestoneSave')}
          </Text>

          <View className="mt-4 gap-1">
            {[
              t('guest.saveProgress'),
              t('guest.keepStreakAchievements'),
              t('guest.joinLeaderboard'),
              t('guest.joinCircle'),
            ].map((item) => (
              <Text key={item} className="text-sm text-brand-700">
                ✓ {item}
              </Text>
            ))}
          </View>

          <View className="mt-6">
            <PrimaryButton
              label={t('guest.createAccount')}
              onPress={() => router.push('/(auth)/register')}
            />
            <PrimaryButton
              label={t('guest.continueAsGuest')}
              onPress={onLater}
              variant="secondary"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
