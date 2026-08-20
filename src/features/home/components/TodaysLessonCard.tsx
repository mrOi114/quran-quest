import { Pressable, Text, View } from 'react-native';

import { useI18n } from '@/i18n';

import type { HomeLessonSummary } from '../types';

type TodaysLessonCardProps = {
  lesson: HomeLessonSummary;
  onPress: () => void;
};

export function TodaysLessonCard({ lesson, onPress }: TodaysLessonCardProps) {
  const { t, lessonLabel } = useI18n();
  const label = lessonLabel(lesson.lessonIndex);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('home.openLessonA11y', {
        arabic: lesson.surahArabic,
        name: lesson.surahName,
        lesson: label,
        percent: lesson.progressPercent,
      })}
      onPress={onPress}
      className="mb-4 rounded-2xl bg-white/10 px-4 py-4"
    >
      <Text className="text-sm font-semibold uppercase tracking-wide text-brand-200">
        {t('home.todaysLesson')}
      </Text>
      <Text
        className="mt-3 text-center text-3xl font-bold text-white"
        style={{ writingDirection: 'rtl' }}
      >
        {lesson.surahArabic}
      </Text>
      <Text className="mt-1 text-center text-base text-brand-50">{lesson.surahName}</Text>
      <Text className="mt-3 text-base font-medium text-white">{label}</Text>
      <View className="mt-3 h-3 overflow-hidden rounded-full bg-brand-800">
        <View
          className="h-full rounded-full bg-brand-300"
          style={{ width: `${lesson.progressPercent}%` }}
        />
      </View>
      <Text className="mt-2 text-sm text-brand-100">
        {t('home.percentComplete', { percent: lesson.progressPercent })}
      </Text>
    </Pressable>
  );
}
