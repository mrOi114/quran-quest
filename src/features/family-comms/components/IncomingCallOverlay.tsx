import { Modal, Pressable, Text, View } from 'react-native';

type IncomingCallOverlayProps = {
  callerName: string;
  busy: boolean;
  onAccept: () => void;
  onDecline: () => void;
};

export function IncomingCallOverlay({
  callerName,
  busy,
  onAccept,
  onDecline,
}: IncomingCallOverlayProps) {
  return (
    <Modal visible animationType="fade" transparent>
      <View className="flex-1 items-center justify-center bg-black/55 px-6">
        <View className="w-full max-w-md rounded-3xl bg-white px-6 py-8">
          <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
            Incoming Family Call
          </Text>
          <Text className="mt-3 text-2xl font-bold text-brand-800">{callerName}</Text>
          <Text className="mt-2 text-base text-brand-600">
            Private family voice call. Accept only if you know this family member.
          </Text>
          <View className="mt-6 flex-row gap-3">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Decline family call"
              disabled={busy}
              onPress={onDecline}
              className="min-h-12 flex-1 items-center justify-center rounded-xl bg-red-600 px-4 py-3"
            >
              <Text className="text-base font-semibold text-white">Decline</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Accept family call"
              disabled={busy}
              onPress={onAccept}
              className="min-h-12 flex-1 items-center justify-center rounded-xl bg-brand-600 px-4 py-3"
            >
              <Text className="text-base font-semibold text-white">Accept</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
