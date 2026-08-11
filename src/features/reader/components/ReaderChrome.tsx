import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

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
  return (
    <View className="flex-1">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back to Home"
        onPress={onBack}
        className="mb-4 min-h-11 justify-center self-start"
      >
        <Text className="text-base text-brand-100">← Home</Text>
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
          accessibilityLabel="Choose Surah or Juz"
          onPress={onOpenSurahPicker}
          className="mt-4 min-h-12 items-center justify-center self-center rounded-2xl bg-white px-5 py-3"
        >
          <Text className="text-base font-semibold text-brand-700">
            Choose Surah / Juz
          </Text>
        </Pressable>
      ) : null}

      <View className="mt-5">{children}</View>
      {footer}
    </View>
  );
}
