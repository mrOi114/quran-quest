import { Text, View } from 'react-native';

import { VerseMeaningBody } from '@/features/reader/components/VerseMeaningBody';
import { resolveVerseMeaning } from '@/features/reader/services/translationResolver';
import { useI18n } from '@/i18n';

import type { LessonSessionVerse } from '../types';

type LessonVerseCardProps = {
  verse: LessonSessionVerse;
  isActive: boolean;
};

export function LessonVerseCard({ verse, isActive }: LessonVerseCardProps) {
  const { language, t } = useI18n();
  const learned =
    verse.progress.status === 'learned' || verse.progress.status === 'mastered';
  const learnedLabel = learned ? t('common.learned') : t('lesson.notLearned');
  const meaning =
    resolveVerseMeaning(verse.id, language) ??
    ({
      text: verse.translationEn,
      footnotes: null,
      languageCode: 'en',
      translationId: 'en-sahih-international',
      sourceLabel: 'Sahih International',
      attribution: null,
      isFallback: language !== 'en',
    } as const);

  return (
    <View
      className={`rounded-2xl px-4 py-5 ${isActive ? 'bg-white' : 'bg-brand-50/80'}`}
      accessibilityRole="text"
      accessibilityLabel={`${t('common.ayah')} ${verse.ayahNumber}. ${learnedLabel}`}
    >
      <Text className="mb-2 text-sm font-medium text-brand-500">
        {t('common.ayah')} {verse.ayahNumber}
        {learned ? ` · ${t('common.learned')}` : ''}
      </Text>
      <Text
        className="text-center text-3xl leading-relaxed text-brand-800"
        style={{ writingDirection: 'rtl' }}
      >
        {verse.textUthmani}
      </Text>
      <View className="mt-4">
        <VerseMeaningBody meaning={meaning} />
      </View>
    </View>
  );
}
