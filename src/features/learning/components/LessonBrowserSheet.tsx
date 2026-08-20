import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { useI18n } from '@/i18n';

import type { JuzMeta } from '../content';
import type { LessonSummary, SurahMeta } from '../types';

type LessonBrowserSheetProps = {
  visible: boolean;
  juzNumber: number;
  juzOptions: JuzMeta[];
  surahs: SurahMeta[];
  selectedSurahNumber: number | null;
  lessons: LessonSummary[];
  searchQuery: string;
  onChangeSearch: (value: string) => void;
  onSelectJuz: (juzNumber: number) => void;
  onSelectSurah: (surahNumber: number) => void;
  onSelectLesson: (lessonKey: string) => void;
  onClose: () => void;
};

export function LessonBrowserSheet({
  visible,
  juzNumber,
  juzOptions,
  surahs,
  selectedSurahNumber,
  lessons,
  searchQuery,
  onChangeSearch,
  onSelectJuz,
  onSelectSurah,
  onSelectLesson,
  onClose,
}: LessonBrowserSheetProps) {
  const { t, lessonLabel, ayahRange } = useI18n();
  if (!visible) {
    return null;
  }

  return (
    <View className="mt-3 max-h-[28rem] rounded-2xl bg-white/95 px-2 py-3">
      <View className="mb-2 flex-row items-center justify-between px-2">
        <Text className="text-base font-semibold text-brand-800">{t('lesson.chooseLesson')}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('lesson.closeBrowser')}
          onPress={onClose}
          className="min-h-11 justify-center px-2"
        >
          <Text className="text-sm font-medium text-brand-500">{t('common.close')}</Text>
        </Pressable>
      </View>

      <Text className="mb-2 px-2 text-xs text-brand-500">
        {t('lesson.pickerHelp')}
      </Text>

      <TextInput
        value={searchQuery}
        onChangeText={onChangeSearch}
        placeholder={t('lesson.searchPlaceholder')}
        placeholderTextColor="#6BA58F"
        accessibilityLabel={t('reader.searchSurahs')}
        className="mx-2 mb-3 min-h-11 rounded-xl border border-brand-100 bg-brand-50 px-3 text-base text-brand-800"
      />

      <Text className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-brand-500">
        {t('lesson.juzRange')}
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
              accessibilityLabel={`${t('common.juz')} ${juz.number}`}
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
        {t('lesson.surahs')}
      </Text>
      <ScrollView
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        style={{ maxHeight: 120 }}
        className="mb-3"
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
                accessibilityLabel={`${item.number}. ${item.nameLatin}. ${t('lesson.ayahsCount', { count: item.ayahCount })}`}
                onPress={() => onSelectSurah(item.number)}
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
                <Text className="text-xs text-brand-400">{t('lesson.ayahsCount', { count: item.ayahCount })}</Text>
              </Pressable>
            );
          })
        )}
      </ScrollView>

      {selectedSurahNumber ? (
        <>
          <Text className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-brand-500">
            {t('lesson.lessonsInSurah')}
          </Text>
          <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false} style={{ maxHeight: 140 }}>
            {lessons.length === 0 ? (
              <Text className="px-3 py-3 text-sm text-brand-500">{t('lesson.noLessons')}</Text>
            ) : (
              lessons.map((lesson) => {
                const locked = lesson.isLocked;
                const statusLabel = lesson.isComplete
                  ? `✅ ${t('common.completed')}`
                  : lesson.isCurrent
                    ? `▶️ ${t('common.continue')}`
                    : locked
                      ? `🔒 ${t('common.locked')}`
                      : t('common.start');
                return (
                  <Pressable
                    key={lesson.lessonKey}
                    accessibilityRole="button"
                    accessibilityLabel={`${lessonLabel(lesson.lessonIndex)}, ${ayahRange(lesson.startAyah, lesson.endAyah)}${locked ? `, ${t('common.locked')}` : ''}`}
                    onPress={() => {
                      onSelectLesson(lesson.lessonKey);
                      onClose();
                    }}
                    className={`mb-1 min-h-12 flex-row items-center justify-between rounded-xl px-3 py-2 ${
                      locked ? 'bg-brand-50/70' : 'bg-brand-50'
                    }`}
                  >
                    <View className="flex-1 pr-2">
                      <Text className="text-sm font-semibold text-brand-800">
                        {lessonLabel(lesson.lessonIndex)}
                        {lesson.isComplete ? ` · ${t('common.done')}` : ''}
                      </Text>
                      <Text className="text-xs text-brand-500">
                        {ayahRange(lesson.startAyah, lesson.endAyah)}
                        {lesson.progressPercent > 0 && !lesson.isComplete
                          ? ` · ${lesson.progressPercent}%`
                          : ''}
                      </Text>
                    </View>
                    <Text className="text-xs font-semibold text-brand-600">{statusLabel}</Text>
                  </Pressable>
                );
              })
            )}
          </ScrollView>
        </>
      ) : (
        <Text className="px-3 py-2 text-sm text-brand-500">{t('lesson.selectSurah')}</Text>
      )}
    </View>
  );
}
