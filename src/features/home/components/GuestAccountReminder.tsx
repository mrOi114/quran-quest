import { Pressable, Text, View } from 'react-native';

type GuestAccountReminderProps = {
  onCreateAccount: () => void;
};

export function GuestAccountReminder({ onCreateAccount }: GuestAccountReminderProps) {
  return (
    <View
      className="mb-4 rounded-2xl bg-brand-50 px-4 py-4"
      accessible
      accessibilityLabel="Friendly reminder to create a free account when you are ready. Learning stays open."
    >
      <Text className="text-base font-semibold text-brand-800">
        Keep your progress safe
      </Text>
      <Text className="mt-1 text-sm leading-5 text-brand-600">
        You&apos;re doing beautifully. Create a free account when you&apos;re ready — you
        can keep learning anytime.
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Create free account"
        onPress={onCreateAccount}
        className="mt-3 min-h-12 items-center justify-center rounded-xl border border-brand-600 px-4 py-2.5"
      >
        <Text className="text-base font-semibold text-brand-700">
          Create Free Account
        </Text>
      </Pressable>
    </View>
  );
}
