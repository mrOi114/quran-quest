import { Text, View } from 'react-native';

import { useI18n } from '@/i18n';

type WelcomeSectionProps = {
  greetingLine: string;
  encouragement: string;
  isGuest?: boolean;
};

export function WelcomeSection({
  greetingLine,
  encouragement,
  isGuest = false,
}: WelcomeSectionProps) {
  const { t } = useI18n();
  return (
    <View
      accessibilityRole="header"
      className="mb-6"
      accessible
      accessibilityLabel={`${greetingLine} ${encouragement}`}
    >
      <Text className="text-sm font-medium text-brand-200">{t('home.brandCompanion')}</Text>
      {isGuest ? (
        <Text className="mt-2 text-xs font-semibold uppercase tracking-wide text-brand-100">
          {t('common.guestMode')}
        </Text>
      ) : null}
      <Text className="mt-2 text-2xl font-bold leading-8 text-white">{greetingLine}</Text>
      <Text className="mt-2 text-base leading-6 text-brand-50">{encouragement}</Text>
    </View>
  );
}
