import { Pressable, Text } from 'react-native';

type ReadJuz30ButtonProps = {
  onPress: () => void;
};

export function ReadJuz30Button({ onPress }: ReadJuz30ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Read Juz 30"
      onPress={onPress}
      className="mb-4 min-h-12 items-center justify-center rounded-2xl border border-white/25 bg-white/5 px-4 py-3"
    >
      <Text className="text-base font-semibold text-brand-50">Read Juz 30</Text>
    </Pressable>
  );
}
