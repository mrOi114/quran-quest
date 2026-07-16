import { Pressable, Text } from 'react-native';

type ParentAccessLinkProps = {
  onPress: () => void;
};

export function ParentAccessLink({ onPress }: ParentAccessLinkProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="My Children"
      accessibilityHint="Opens family child management"
      onPress={onPress}
      className="mb-4 min-h-14 items-center justify-center rounded-2xl bg-white/15 px-4 py-3.5 active:opacity-90"
    >
      <Text className="text-lg font-semibold text-white">My Children</Text>
    </Pressable>
  );
}
