import { Text, View } from 'react-native';

import type { HomeLessonSummary } from '../types';

type TodaysLessonCardProps = {
  lesson: HomeLessonSummary;
};

export function TodaysLessonCard({ lesson }: TodaysLessonCardProps) {
  return (
    <View
      className="mb-4 rounded-2xl bg-white/10 px-4 py-4"
      accessible
      accessibilityLabel={`Today's lesson. ${lesson.surahArabic}, ${lesson.surahName}. ${lesson.lessonLabel}. Progress ${lesson.progressPercent} percent.`}
    >
      <Text className="text-sm font-semibold uppercase tracking-wide text-brand-200">
        Today&apos;s Lesson
      </Text>
      <Text
        className="mt-3 text-center text-3xl font-bold text-white"
        style={{ writingDirection: 'rtl' }}
      >
        {lesson.surahArabic}
      </Text>
      <Text className="mt-1 text-center text-base text-brand-50">{lesson.surahName}</Text>
      <Text className="mt-3 text-base font-medium text-white">{lesson.lessonLabel}</Text>
      <View className="mt-3 h-3 overflow-hidden rounded-full bg-brand-800">
        <View
          className="h-full rounded-full bg-brand-300"
          style={{ width: `${lesson.progressPercent}%` }}
        />
      </View>
      <Text className="mt-2 text-sm text-brand-100">
        {lesson.progressPercent}% complete
      </Text>
    </View>
  );
}
