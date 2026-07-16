import { Text, View } from 'react-native';

export function HifzCirclePlaceholder() {
  return (
    <View
      className="mb-4 rounded-2xl border border-dashed border-brand-200 bg-brand-50 px-4 py-4"
      accessible
      accessibilityLabel="AI Hifz Circle. Available in a later feature."
    >
      <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
        AI Hifz Circle
      </Text>
      <Text className="mt-2 text-base text-brand-700">Available in a later feature.</Text>
    </View>
  );
}
