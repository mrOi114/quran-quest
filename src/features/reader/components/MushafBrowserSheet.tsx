import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import type { JuzMeta } from '../content';
import type { BrowsableSurah } from '../types';

type MushafBrowserSheetProps = {
  visible: boolean;
  juzNumber: number;
  juzOptions: JuzMeta[];
  surahs: BrowsableSurah[];
  selectedSurahNumber: number | null;
  searchQuery: string;
  onChangeSearch: (value: string) => void;
  onSelectJuz: (juzNumber: number) => void;
  onSelectSurah: (surahNumber: number) => void;
  onClose: () => void;
};

export function MushafBrowserSheet({
  visible,
  juzNumber,
  juzOptions,
  surahs,
  selectedSurahNumber,
  searchQuery,
  onChangeSearch,
  onSelectJuz,
  onSelectSurah,
  onClose,
}: MushafBrowserSheetProps) {
  if (!visible) {
    return null;
  }

  return (
    <View className="mt-3 max-h-96 rounded-2xl bg-white/95 px-2 py-3">
      <View className="mb-2 flex-row items-center justify-between px-2">
        <Text className="text-base font-semibold text-brand-800">Choose a Surah</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close browse panel"
          onPress={onClose}
          className="min-h-11 justify-center px-2"
        >
          <Text className="text-sm font-medium text-brand-500">Close</Text>
        </Pressable>
      </View>

      <TextInput
        value={searchQuery}
        onChangeText={onChangeSearch}
        placeholder="Search surah name, number, or juz…"
        placeholderTextColor="#6BA58F"
        accessibilityLabel="Search surahs"
        className="mx-2 mb-3 min-h-11 rounded-xl border border-brand-100 bg-brand-50 px-3 text-base text-brand-800"
      />

      <Text className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-brand-500">
        Juz (1–30)
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-3 px-1"
        contentContainerStyle={{ gap: 8, paddingHorizontal: 4 }}
      >
        {juzOptions.map((juz) => {
          const selected = juz.number === juzNumber && !searchQuery.trim();
          return (
            <Pressable
              key={juz.number}
              accessibilityRole="button"
              accessibilityLabel={`Juz ${juz.number}`}
              onPress={() => onSelectJuz(juz.number)}
              className={`min-h-10 min-w-12 items-center justify-center rounded-xl px-3 ${
                selected ? 'bg-brand-600' : 'bg-brand-100'
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  selected ? 'text-white' : 'text-brand-700'
                }`}
              >
                {juz.number}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Text className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-brand-500">
        Surahs
      </Text>
      <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
        {surahs.length === 0 ? (
          <Text className="px-3 py-4 text-sm text-brand-500">No surahs match that search.</Text>
        ) : (
          surahs.map((item) => {
            const selected = item.number === selectedSurahNumber;
            return (
              <Pressable
                key={item.number}
                accessibilityRole="button"
                accessibilityLabel={`${item.number}. ${item.nameLatin}. ${item.ayahCount} ayahs.`}
                onPress={() => {
                  onSelectSurah(item.number);
                  onClose();
                }}
                className={`min-h-12 flex-row items-center justify-between rounded-xl px-3 py-2 ${
                  selected ? 'bg-brand-100' : ''
                }`}
              >
                <View className="flex-1 flex-row items-center pr-2">
                  <Text className="mr-3 w-8 text-sm font-semibold text-brand-500">
                    {item.number}
                  </Text>
                  <View className="flex-1">
                    <Text
                      className="text-lg text-brand-800"
                      style={{ writingDirection: 'rtl' }}
                    >
                      {item.nameArabic}
                    </Text>
                    <Text className="text-sm text-brand-500">{item.nameLatin}</Text>
                  </View>
                </View>
                <Text className="text-xs text-brand-400">{item.ayahCount} ayahs</Text>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
