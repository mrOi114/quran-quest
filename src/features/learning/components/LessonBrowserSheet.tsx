import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { useI18n } from '@/i18n';

import type { LessonSummary, SurahMeta } from '../types';

type LessonBrowserSheetProps = {
  visible: boolean;
  surahs: SurahMeta[];
  selectedSurahNumber: number | null;
  selectedSurahName: string;
  lessons: LessonSummary[];
  searchQuery: string;
  surahMenuOpen: boolean;
  onChangeSearch: (value: string) => void;
  onToggleSurahMenu: () => void;
  onSelectSurah: (surahNumber: number) => void;
  onSelectLesson: (lessonKey: string) => void;
};

export function LessonBrowserSheet({
  visible,
  surahs,
  selectedSurahNumber,
  selectedSurahName,
  lessons,
  searchQuery,
  surahMenuOpen,
  onChangeSearch,
  onToggleSurahMenu,
  onSelectSurah,
  onSelectLesson,
}: LessonBrowserSheetProps) {
  const { t, lessonLabel, ayahRange } = useI18n();
  if (!visible) {
    return null;
  }

  return (
    <View className="mt-4 rounded-2xl bg-white px-4 py-4">
      <Text className="text-base font-semibold text-brand-800">{t('lesson.chooseSurah')}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('lesson.chooseSurah')}
        accessibilityState={{ expanded: surahMenuOpen }}
        onPress={onToggleSurahMenu}
        className="mt-2 min-h-12 flex-row items-center justify-between rounded-xl bg-brand-50 px-4"
      >
        <Text className="flex-1 text-base font-semibold text-brand-800">
          {selectedSurahName || t('lesson.selectSurah')}
        </Text>
        <Text className="ml-2 text-base text-brand-500">{surahMenuOpen ? '▴' : '▾'}</Text>
      </Pressable>

      {surahMenuOpen ? (
        <View className="mt-2 rounded-xl border border-brand-100 bg-brand-50 px-2 py-2">
          <TextInput
            value={searchQuery}
            onChangeText={onChangeSearch}
            placeholder={t('lesson.findSurah')}
            placeholderTextColor="#6BA58F"
            accessibilityLabel={t('lesson.findSurah')}
            className="mb-2 min-h-11 rounded-xl border border-brand-100 bg-white px-3 text-base text-brand-800"
          />
          <ScrollView
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
            style={{ maxHeight: 220 }}
          >
            {surahs.length === 0 ? (
              <Text className="px-3 py-4 text-sm text-brand-500">{t('lesson.noSurahs')}</Text>
            ) : (
              surahs.map((item) => {
                const selected = item.number === selectedSurahNumber;
                return (
                  <Pressable
                    key={item.number}
                    accessibilityRole="button"
                    accessibilityLabel={`${item.number}. ${item.nameLatin}`}
                    onPress={() => onSelectSurah(item.number)}
                    className={`min-h-12 flex-row items-center rounded-xl px-3 py-2 ${
                      selected ? 'bg-brand-100' : ''
                    }`}
                  >
                    <Text className="mr-3 w-8 text-sm font-semibold text-brand-500">
                      {item.number}
                    </Text>
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-brand-800">
                        {item.nameLatin}
                      </Text>
                      <Text
                        className="text-sm text-brand-500"
                        style={{ writingDirection: 'rtl' }}
                      >
                        {item.nameArabic}
                      </Text>
                    </View>
                  </Pressable>
                );
              })
            )}
          </ScrollView>
        </View>
      ) : null}

      <Text className="mt-4 text-base font-semibold text-brand-800">
        {t('lesson.chooseYourLesson')}
      </Text>
      {selectedSurahNumber ? (
        <ScrollView
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
          style={{ maxHeight: 220 }}
          className="mt-2"
        >
          {lessons.length === 0 ? (
            <Text className="px-1 py-3 text-sm text-brand-500">{t('lesson.noLessons')}</Text>
          ) : (
            lessons.map((lesson) => {
              const locked = lesson.isLocked;
              return (
                <Pressable
                  key={lesson.lessonKey}
                  accessibilityRole="button"
                  accessibilityLabel={`${lessonLabel(lesson.lessonIndex)}, ${ayahRange(lesson.startAyah, lesson.endAyah)}${locked ? `, ${t('common.locked')}` : ''}`}
                  onPress={() => onSelectLesson(lesson.lessonKey)}
                  className={`mb-1 min-h-12 flex-row items-center justify-between rounded-xl px-3 py-2 ${
                    lesson.isCurrent ? 'bg-brand-100' : 'bg-brand-50'
                  }`}
                >
                  <Text className="flex-1 pr-2 text-sm font-semibold text-brand-800">
                    {lessonLabel(lesson.lessonIndex)} — {ayahRange(lesson.startAyah, lesson.endAyah)}
                    {locked ? '' : ' 🔓'}
                  </Text>
                  {locked ? (
                    <Text className="text-sm font-semibold text-brand-600">
                      {t('lesson.lockedBadge')}
                    </Text>
                  ) : null}
                </Pressable>
              );
            })
          )}
        </ScrollView>
      ) : (
        <Text className="mt-2 text-sm text-brand-500">{t('lesson.selectSurah')}</Text>
      )}
    </View>
  );
}
