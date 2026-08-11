import { Pressable, Text, View } from 'react-native';

import type { FeedbackState } from '../hooks/useGameSession';

type FeedbackPanelProps = {
  feedback: FeedbackState;
  onRetry: () => void;
  onContinue: () => void;
};

export function FeedbackPanel({ feedback, onRetry, onContinue }: FeedbackPanelProps) {
  return (
    <View className="mt-4 rounded-3xl bg-brand-50 px-4 py-4">
      <Text className="text-xl font-bold text-brand-800">
        {feedback.isCorrect
          ? '✅ Correct! Great job!'
          : 'Not quite. Let’s learn it together.'}
      </Text>
      <Text className="mt-2 text-base leading-6 text-brand-700">
        {feedback.explanation}
      </Text>
      {!feedback.isCorrect && feedback.hint ? (
        <Text className="mt-2 text-sm text-brand-600">Hint: {feedback.hint}</Text>
      ) : null}

      <View className="mt-4 gap-2">
        {feedback.canRetry ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Try again"
            onPress={onRetry}
            className="min-h-12 items-center justify-center rounded-xl border border-brand-600 px-4 py-3 active:opacity-90"
          >
            <Text className="text-base font-semibold text-brand-700">Try Again</Text>
          </Pressable>
        ) : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={feedback.isCorrect ? 'Continue' : 'Continue learning'}
          onPress={onContinue}
          className="min-h-12 items-center justify-center rounded-xl bg-brand-600 px-4 py-3 active:opacity-90"
        >
          <Text className="text-base font-semibold text-white">
            {feedback.isCorrect ? 'Continue' : 'Continue Learning'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
