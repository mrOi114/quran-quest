import { Pressable, Text } from 'react-native';

type PracticeWithAiButtonProps = {
  onPress: () => void;
};

export function PracticeWithAiButton({ onPress }: PracticeWithAiButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Practice with AI"
      accessibilityHint="Opens the AI Hifz Companion"
      onPress={onPress}
      className="mb-4 min-h-14 items-center justify-center rounded-2xl border-2 border-brand-300 bg-white px-4 py-3.5 active:opacity-90"
    >
      <Text className="text-lg font-semibold text-brand-700">Practice with AI</Text>
    </Pressable>
  );
}
