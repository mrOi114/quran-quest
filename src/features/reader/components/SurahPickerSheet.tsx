import { Pressable, ScrollView, Text, View } from 'react-native';

import { useI18n } from '@/i18n';

import type { BrowsableSurah } from '../types';

type SurahPickerSheetProps = {
  surahs: BrowsableSurah[];
  selectedSurahNumber: number | null;
  onSelect: (surahNumber: number) => void;
  visible: boolean;
  onClose: () => void;
};

export function SurahPickerSheet({
  surahs,
  selectedSurahNumber,
  onSelect,
  visible,
  onClose,
}: SurahPickerSheetProps) {
  const { t } = useI18n();
  if (!visible) {
    return null;
  }

  return (
    <View className="mt-3 max-h-72 rounded-2xl bg-white/95 px-2 py-3">
      <View className="mb-2 flex-row items-center justify-between px-2">
        <Text className="text-base font-semibold text-brand-800">{t('reader.chooseSurah')}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('reader.closeList')}
          onPress={onClose}
          className="min-h-11 justify-center px-2"
        >
          <Text className="text-sm font-medium text-brand-500">{t('common.close')}</Text>
        </Pressable>
      </View>
      <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
        {surahs.map((item) => {
          const selected = item.number === selectedSurahNumber;
          return (
            <Pressable
              key={item.number}
              accessibilityRole="button"
              accessibilityLabel={`${item.nameLatin}. ${t('common.ayah')} 1 ${item.maxBrowsableAyah}.`}
              onPress={() => {
                onSelect(item.number);
                onClose();
              }}
              className={`min-h-12 flex-row items-center justify-between rounded-xl px-3 py-2 ${
                selected ? 'bg-brand-100' : ''
              }`}
            >
              <View className="flex-1 pr-2">
                <Text
                  className="text-lg text-brand-800"
                  style={{ writingDirection: 'rtl' }}
                >
                  {item.nameArabic}
                </Text>
                <Text className="text-sm text-brand-500">{item.nameLatin}</Text>
              </View>
              <Text className="text-xs text-brand-400">1–{item.maxBrowsableAyah}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
