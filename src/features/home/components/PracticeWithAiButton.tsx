import { Pressable, Text } from 'react-native';

import { useI18n } from '@/i18n';

type PracticeWithAiButtonProps = {
  onPress: () => void;
};

export function PracticeWithAiButton({ onPress }: PracticeWithAiButtonProps) {
  const { t } = useI18n();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('home.practiceWithAi')}
      accessibilityHint={t('home.openCompanionHint')}
      onPress={onPress}
      className="mb-4 min-h-14 items-center justify-center rounded-2xl border-2 border-brand-300 bg-white px-4 py-3.5 active:opacity-90"
    >
      <Text className="text-lg font-semibold text-brand-700">{t('home.practiceWithAi')}</Text>
    </Pressable>
  );
}
