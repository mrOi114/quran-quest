import { Pressable, Text, View } from 'react-native';

import { PrimaryButton } from '@/features/auth';
import { useI18n } from '@/i18n';
import { useVerseAudio } from '@/features/reader';

import { LESSON_PASS_PERCENT } from '../constants';
import type { LessonTestQuestion } from '../types';

type LessonMasteryTestProps = {
  title: string;
  subtitle: string;
  question: LessonTestQuestion;
  questionNumber: number;
  questionCount: number;
  selectedChoiceId: string | null;
  onSelectChoice: (choiceId: string) => void;
  onConfirm: () => void;
  disabled?: boolean;
};

export function LessonMasteryTest({
  title,
  subtitle,
  question,
  questionNumber,
  questionCount,
  selectedChoiceId,
  onSelectChoice,
  onConfirm,
  disabled,
}: LessonMasteryTestProps) {
  const { t } = useI18n();
  const audio = useVerseAudio({
    audioUrl: question.audioUrl ?? null,
    repeatCount: '1',
  });

  return (
    <View className="mt-5 rounded-2xl bg-brand-50 px-4 py-5">
      <Text className="text-center text-sm font-semibold uppercase tracking-wide text-brand-500">
        {title}
      </Text>
      <Text className="mt-1 text-center text-base text-brand-600">{subtitle}</Text>
      <Text className="mt-3 text-center text-sm font-medium text-brand-500">
        {t('test.questionOf', {
          n: questionNumber,
          total: questionCount,
          pass: LESSON_PASS_PERCENT,
        })}
      </Text>

      <Text className="mt-4 text-lg font-semibold text-brand-800">{question.prompt}</Text>
      {question.promptArabic ? (
        <Text
          className="mt-3 text-center text-2xl leading-10 text-brand-900"
          style={{ writingDirection: 'rtl' }}
        >
          {question.promptArabic}
        </Text>
      ) : null}

      {question.audioUrl ? (
        <View className="mt-3">
          <PrimaryButton
            label={audio.isPlaying ? t('test.playingAudio') : t('test.playAudio')}
            variant="secondary"
            onPress={() => {
              void audio.play();
            }}
          />
        </View>
      ) : null}

      <View className="mt-4 gap-3">
        {question.choices.map((choice) => {
          const selected = selectedChoiceId === choice.id;
          return (
            <Pressable
              key={choice.id}
              accessibilityRole="button"
              accessibilityLabel={choice.label}
              disabled={disabled}
              onPress={() => onSelectChoice(choice.id)}
              className={`min-h-14 items-center justify-center rounded-2xl border px-4 py-3 ${
                selected ? 'border-brand-600 bg-brand-100' : 'border-brand-200 bg-white'
              }`}
            >
              <Text
                className={`text-center text-base font-semibold text-brand-800 ${
                  choice.isArabic ? 'text-xl' : ''
                }`}
                style={choice.isArabic ? { writingDirection: 'rtl' } : undefined}
              >
                {choice.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View className="mt-5">
        <PrimaryButton
          label={t('test.checkAnswer')}
          disabled={disabled || !selectedChoiceId}
          loading={disabled}
          onPress={onConfirm}
        />
      </View>
    </View>
  );
}
