import { Pressable, Text } from 'react-native';

import { useI18n } from '@/i18n';

type ReadJuz30ButtonProps = {
  onPress: () => void;
};

export function ReadJuz30Button({ onPress }: ReadJuz30ButtonProps) {
  const { t } = useI18n();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('home.readJuz30')}
      onPress={onPress}
      className="mb-4 min-h-12 items-center justify-center rounded-2xl border border-white/25 bg-white/5 px-4 py-3"
    >
      <Text className="text-base font-semibold text-brand-50">{t('home.readJuz30')}</Text>
    </Pressable>
  );
}
