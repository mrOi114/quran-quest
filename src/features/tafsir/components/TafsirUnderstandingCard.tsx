import { Pressable, Text, View } from 'react-native';

import { useI18n } from '@/i18n';

import type { UnderstandingQuestion } from '../services/understandingQuestions';

type TafsirUnderstandingCardProps = {
  question: UnderstandingQuestion;
  selectedId: string | null;
  answered: boolean;
  onSelect: (choiceId: string) => void;
};

export function TafsirUnderstandingCard({
  question,
  selectedId,
  answered,
  onSelect,
}: TafsirUnderstandingCardProps) {
  const { t } = useI18n();
  return (
    <View className="mt-4 rounded-xl bg-white px-3 py-3">
      <Text className="text-center text-base font-semibold text-teal-900">
        {t('tafsir.whatDidWeLearn')}
      </Text>
      <Text className="mt-1 text-center text-xs text-teal-700">{t('tafsir.questionFromMeaning')}</Text>
      {question.choices.map((choice) => {
        const selected = selectedId === choice.id;
        const isCorrect = choice.id === question.correctChoiceId;
        const showResult = answered && selected;
        return (
          <Pressable
            key={choice.id}
            accessibilityRole="button"
            disabled={answered}
            onPress={() => onSelect(choice.id)}
            className={`mt-2 min-h-12 rounded-xl px-3 py-3 ${
              selected ? 'bg-teal-700' : 'bg-teal-50'
            }`}
          >
            <Text className={`text-sm leading-5 ${selected ? 'text-white' : 'text-teal-900'}`}>
              {choice.label}
            </Text>
            {showResult ? (
              <Text className="mt-1 text-xs text-white">
                {isCorrect ? t('tafsir.understood') : t('tafsir.tryMeaningAgain')}
              </Text>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}
