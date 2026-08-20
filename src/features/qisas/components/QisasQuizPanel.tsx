import { Pressable, Text, View } from 'react-native';

import { AnswerChoices } from '@/features/games/components/AnswerChoices';
import { OrderingChallenge } from '@/features/games/components/OrderingChallenge';
import { useI18n } from '@/i18n';

import type { QisasQuizFeedback } from '../hooks/useQisasQuiz';

type LocalizedQuestion = {
  id: string;
  type: 'multiple_choice' | 'ordering' | 'true_false' | 'match';
  prompt: string;
  explanation: string;
  hint?: string;
  correctChoiceId?: string;
  choices?: { id: string; label: string }[];
  orderItems?: { id: string; label: string }[];
};

type QisasQuizPanelProps = {
  current: LocalizedQuestion | null;
  index: number;
  total: number;
  phase: 'playing' | 'feedback' | 'complete';
  feedback: QisasQuizFeedback | null;
  orderDraft: { id: string; label: string }[];
  correctCount: number;
  completeTitle: string;
  onSelect: (choiceId: string) => void;
  onMoveOrder: (fromIndex: number, direction: -1 | 1) => void;
  onSubmitOrder: () => void;
  onRetry: () => void;
  onContinue: () => void;
  onRestart: () => void;
  onDone?: () => void;
};

export function QisasQuizPanel({
  current,
  index,
  total,
  phase,
  feedback,
  orderDraft,
  correctCount,
  completeTitle,
  onSelect,
  onMoveOrder,
  onSubmitOrder,
  onRetry,
  onContinue,
  onRestart,
  onDone,
}: QisasQuizPanelProps) {
  const { t } = useI18n();

  if (phase === 'complete') {
    return (
      <View className="mt-4 rounded-3xl bg-white px-4 py-5">
        <Text className="text-xl font-bold text-brand-800">{completeTitle}</Text>
        <Text className="mt-2 text-base leading-6 text-brand-700">
          {t('qisas.gotRight', { correct: correctCount, total })}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('games.playAgain')}
          onPress={onRestart}
          className="mt-4 min-h-12 items-center justify-center rounded-xl bg-brand-600 px-4"
        >
          <Text className="text-base font-semibold text-white">{t('games.playAgain')}</Text>
        </Pressable>
        {onDone ? (
          <Pressable
            accessibilityRole="button"
            onPress={onDone}
            className="mt-2 min-h-12 items-center justify-center"
          >
            <Text className="text-sm font-semibold text-brand-700">{t('qisas.playStoryGame')}</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  if (!current) {
    return null;
  }

  return (
    <View className="mt-4 rounded-3xl bg-white px-4 py-5">
      <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
        {t('games.questionOf', { n: index + 1, total })}
      </Text>
      <Text className="mt-3 text-xl font-bold text-brand-800">{current.prompt}</Text>

      {phase === 'playing' && current.type === 'ordering' ? (
        <OrderingChallenge
          items={orderDraft}
          onMove={onMoveOrder}
          onSubmit={onSubmitOrder}
        />
      ) : null}

      {phase === 'playing' && current.type !== 'ordering' && current.choices ? (
        <AnswerChoices choices={current.choices} onSelect={onSelect} />
      ) : null}

      {phase === 'feedback' && feedback ? (
        <View className="mt-4 rounded-2xl bg-brand-50 px-4 py-4">
          <Text className="text-lg font-bold text-brand-800">
            {feedback.isCorrect ? t('qisas.correct') : t('qisas.incorrect')}
          </Text>
          <Text className="mt-2 text-base leading-6 text-brand-700">{feedback.explanation}</Text>
          {!feedback.isCorrect && feedback.hint ? (
            <Text className="mt-2 text-sm text-brand-600">
              {t('games.hint', { hint: feedback.hint })}
            </Text>
          ) : null}
          <View className="mt-4 gap-2">
            {!feedback.isCorrect ? (
              <Pressable
                accessibilityRole="button"
                onPress={onRetry}
                className="min-h-12 items-center justify-center rounded-xl border border-brand-600 px-4"
              >
                <Text className="text-base font-semibold text-brand-700">{t('games.tryAgain')}</Text>
              </Pressable>
            ) : null}
            <Pressable
              accessibilityRole="button"
              onPress={onContinue}
              className="min-h-12 items-center justify-center rounded-xl bg-brand-600 px-4"
            >
              <Text className="text-base font-semibold text-white">
                {feedback.isCorrect ? t('common.continue') : t('games.continueLearning')}
              </Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );
}
