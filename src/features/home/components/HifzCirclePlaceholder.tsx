import { Pressable, Text, View } from 'react-native';

import { useI18n } from '@/i18n';

type HifzCirclePlaceholderProps = {
  title: string;
  subtitle: string;
  trackLabel: string;
  roomCountLabel: string;
  onPress: () => void;
};

export function HifzCirclePlaceholder({
  title,
  subtitle,
  trackLabel,
  roomCountLabel,
  onPress,
}: HifzCirclePlaceholderProps) {
  const { t } = useI18n();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${subtitle}. ${trackLabel}. ${t('circle.openLiveRoom')}`}
      onPress={onPress}
      className="mb-4 rounded-2xl bg-brand-50 px-4 py-4 active:opacity-90"
    >
      <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
        {t('circle.section')}
      </Text>
      <Text className="mt-2 text-lg font-semibold text-brand-800">{title}</Text>
      <Text className="mt-1 text-sm leading-5 text-brand-600">{subtitle}</Text>

      <View className="mt-4 flex-row flex-wrap gap-2">
        <View className="rounded-full bg-white px-3 py-2">
          <Text className="text-xs font-semibold text-brand-700">{trackLabel}</Text>
        </View>
        <View className="rounded-full bg-brand-600 px-3 py-2">
          <Text className="text-xs font-semibold text-white">{roomCountLabel}</Text>
        </View>
      </View>

      <Text className="mt-4 text-sm font-semibold text-brand-600">
        {t('circle.openLiveRoom')}
      </Text>
    </Pressable>
  );
}
