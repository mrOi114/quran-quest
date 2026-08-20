import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { useI18n } from '@/i18n';

type ReaderChromeProps = {
  titleArabic: string;
  titleLatin: string;
  subtitle: string;
  onBack: () => void;
  onOpenSurahPicker?: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

export function ReaderChrome({
  titleArabic,
  titleLatin,
  subtitle,
  onBack,
  onOpenSurahPicker,
  children,
  footer,
}: ReaderChromeProps) {
  const { t } = useI18n();
  return (
    <View className="flex-1">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('common.backToHome')}
        onPress={onBack}
        className="mb-4 min-h-11 justify-center self-start"
      >
        <Text className="text-base text-brand-100">← {t('nav.home')}</Text>
      </Pressable>

      <Text
        className="text-center text-3xl text-white"
        style={{ writingDirection: 'rtl' }}
      >
        {titleArabic}
      </Text>
      <Text className="mt-1 text-center text-lg text-brand-50">{titleLatin}</Text>
      <Text className="mt-2 text-center text-base font-medium text-white">
        {subtitle}
      </Text>

      {onOpenSurahPicker ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('reader.chooseSurahJuz')}
          onPress={onOpenSurahPicker}
          className="mt-4 min-h-12 items-center justify-center self-center rounded-2xl bg-white px-5 py-3"
        >
          <Text className="text-base font-semibold text-brand-700">
            {t('reader.chooseSurahJuz')}
          </Text>
        </Pressable>
      ) : null}

      <View className="mt-5">{children}</View>
      {footer}
    </View>
  );
}
