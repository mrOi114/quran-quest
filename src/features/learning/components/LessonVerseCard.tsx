import { Text, View } from 'react-native';

import type { LessonSessionVerse } from '../types';

type LessonVerseCardProps = {
  verse: LessonSessionVerse;
  isActive: boolean;
};

export function LessonVerseCard({ verse, isActive }: LessonVerseCardProps) {
  const learned =
    verse.progress.status === 'learned' || verse.progress.status === 'mastered';

  return (
    <View
      className={`rounded-2xl px-4 py-5 ${isActive ? 'bg-white' : 'bg-brand-50/80'}`}
      accessibilityRole="text"
      accessibilityLabel={`Ayah ${verse.ayahNumber}. ${learned ? 'Learned.' : 'Not learned yet.'}`}
    >
      <Text className="mb-2 text-sm font-medium text-brand-500">
        Ayah {verse.ayahNumber}
        {learned ? ' · Learned' : ''}
      </Text>
      <Text
        className="text-center text-3xl leading-relaxed text-brand-800"
        style={{ writingDirection: 'rtl' }}
      >
        {verse.textUthmani}
      </Text>
      <Text className="mt-4 text-center text-base leading-6 text-brand-600">
        {verse.translationEn}
      </Text>
    </View>
  );
}
