import { Pressable, Text, View } from 'react-native';

import type { GameChoice } from '../types';

type AnswerChoicesProps = {
  choices: GameChoice[];
  disabled?: boolean;
  onSelect: (choiceId: string) => void;
};

export function AnswerChoices({ choices, disabled, onSelect }: AnswerChoicesProps) {
  return (
    <View className="mt-4 gap-3">
      {choices.map((choice) => (
        <Pressable
          key={choice.id}
          accessibilityRole="button"
          accessibilityLabel={choice.label}
          disabled={disabled}
          onPress={() => onSelect(choice.id)}
          className="min-h-14 items-center justify-center rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3 active:opacity-90"
        >
          <Text className="text-center text-base font-semibold text-brand-800">
            {choice.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
