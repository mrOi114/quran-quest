import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

type FamilyCommsEntryProps = {
  compact?: boolean;
};

export function FamilyCommsEntry({ compact = false }: FamilyCommsEntryProps) {
  const router = useRouter();

  return (
    <View className={compact ? 'mb-4' : 'mb-4 rounded-2xl bg-white px-4 py-4'}>
      <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
        Family Circle
      </Text>
      <Text className="mt-2 text-base text-brand-600">
        Private chat and voice calls with your family only.
      </Text>
      <View className="mt-3 flex-row gap-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open Family Chat"
          onPress={() => router.push('/(app)/family/chat')}
          className="min-h-12 flex-1 items-center justify-center rounded-xl bg-brand-600 px-3 py-3"
        >
          <Text className="text-sm font-semibold text-white">💬 Family Chat</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Start a Family Call"
          onPress={() => router.push('/(app)/family/call')}
          className="min-h-12 flex-1 items-center justify-center rounded-xl border border-brand-600 px-3 py-3"
        >
          <Text className="text-sm font-semibold text-brand-700">📞 Family Call</Text>
        </Pressable>
      </View>
    </View>
  );
}
