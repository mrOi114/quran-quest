import { Pressable, Text } from 'react-native';

import { useI18n } from '@/i18n';

type ParentAccessLinkProps = {
  onPress: () => void;
};

export function ParentAccessLink({ onPress }: ParentAccessLinkProps) {
  const { t } = useI18n();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('nav.myFamily')}
      onPress={onPress}
      className="mb-4 min-h-14 items-center justify-center rounded-2xl bg-white/15 px-4 py-3.5 active:opacity-90"
    >
      <Text className="text-lg font-semibold text-white">👨‍👩‍👧 {t('nav.myFamily')}</Text>
    </Pressable>
  );
}
