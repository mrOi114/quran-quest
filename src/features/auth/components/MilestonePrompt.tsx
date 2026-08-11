import { useRouter } from 'expo-router';
import { Modal, Text, View } from 'react-native';

import { PrimaryButton } from './PrimaryButton';

type MilestonePromptProps = {
  visible: boolean;
  onLater: () => void;
  pointsEarned?: number;
};

export function MilestonePrompt({
  visible,
  onLater,
  pointsEarned,
}: MilestonePromptProps) {
  const router = useRouter();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 items-center justify-center bg-black/40 px-6">
        <View className="w-full rounded-3xl bg-white px-5 py-6">
          <Text className="text-2xl font-semibold text-brand-800">🎉 Great job!</Text>
          <Text className="mt-3 text-base leading-6 text-brand-700">
            {pointsEarned != null && pointsEarned > 0
              ? `You just reached a meaningful milestone — about ${pointsEarned.toLocaleString()} points of real learning effort.`
              : "You're making wonderful progress on your Qur'an journey."}
          </Text>
          <Text className="mt-3 text-base leading-6 text-brand-700">
            Your effort has value. Create your free account to save these points, keep your
            streak, join the Leaderboard, and continue from any device.
          </Text>

          <View className="mt-4 gap-1">
            {[
              'Save your learning progress',
              'Keep your streak and achievements',
              'Join the Leaderboard',
              'Join a learning Circle',
            ].map((item) => (
              <Text key={item} className="text-sm text-brand-700">
                ✓ {item}
              </Text>
            ))}
          </View>

          <View className="mt-6">
            <PrimaryButton
              label="Create Account"
              onPress={() => router.push('/(auth)/register')}
            />
            <PrimaryButton label="Continue as Guest" onPress={onLater} variant="secondary" />
          </View>
        </View>
      </View>
    </Modal>
  );
}
