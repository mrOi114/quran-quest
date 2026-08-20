import { Pressable, Text, View } from 'react-native';

import { useI18n } from '@/i18n';

import type { FeedbackState } from '../hooks/useGameSession';

type FeedbackPanelProps = {
  feedback: FeedbackState;
  onRetry: () => void;
  onContinue: () => void;
};

export function FeedbackPanel({ feedback, onRetry, onContinue }: FeedbackPanelProps) {
  const { t } = useI18n();
  return (
    <View className="mt-4 rounded-3xl bg-brand-50 px-4 py-4">
      <Text className="text-xl font-bold text-brand-800">
        {feedback.isCorrect ? t('games.correct') : t('games.incorrect')}
      </Text>
      <Text className="mt-2 text-base leading-6 text-brand-700">
        {feedback.explanation}
      </Text>
      {!feedback.isCorrect && feedback.hint ? (
        <Text className="mt-2 text-sm text-brand-600">
          {t('games.hint', { hint: feedback.hint })}
        </Text>
      ) : null}

      <View className="mt-4 gap-2">
        {feedback.canRetry ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('games.tryAgain')}
            onPress={onRetry}
            className="min-h-12 items-center justify-center rounded-xl border border-brand-600 px-4 py-3 active:opacity-90"
          >
            <Text className="text-base font-semibold text-brand-700">{t('games.tryAgain')}</Text>
          </Pressable>
        ) : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={feedback.isCorrect ? t('common.continue') : t('games.continueLearning')}
          onPress={onContinue}
          className="min-h-12 items-center justify-center rounded-xl bg-brand-600 px-4 py-3 active:opacity-90"
        >
          <Text className="text-base font-semibold text-white">
            {feedback.isCorrect ? t('common.continue') : t('games.continueLearning')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
