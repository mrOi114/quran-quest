import { Pressable, Text, View } from 'react-native';

import { useI18n } from '@/i18n';

type GuestAccountReminderProps = {
  onCreateAccount: () => void;
};

export function GuestAccountReminder({ onCreateAccount }: GuestAccountReminderProps) {
  const { t } = useI18n();
  return (
    <View
      className="mb-4 rounded-2xl bg-brand-50 px-4 py-4"
      accessible
      accessibilityLabel={t('guest.progressValue')}
    >
      <Text className="text-base font-semibold text-brand-800">{t('guest.keepJourney')}</Text>
      <Text className="mt-1 text-sm leading-5 text-brand-600">{t('guest.progressValue')}</Text>
      <View className="mt-3 gap-1">
        {[
          t('guest.saveProgress'),
          t('guest.keepStreak'),
          t('guest.joinLeaderboard'),
          t('guest.continueAnyDevice'),
        ].map((item) => (
          <Text key={item} className="text-xs text-brand-700">
            ✓ {item}
          </Text>
        ))}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('common.createFreeAccount')}
        onPress={onCreateAccount}
        className="mt-3 min-h-12 items-center justify-center rounded-xl border border-brand-600 px-4 py-2.5"
      >
        <Text className="text-base font-semibold text-brand-700">
          {t('common.createFreeAccount')}
        </Text>
      </Pressable>
      <Text className="mt-2 text-center text-xs text-brand-500">{t('guest.maybeLaterOpen')}</Text>
    </View>
  );
}
