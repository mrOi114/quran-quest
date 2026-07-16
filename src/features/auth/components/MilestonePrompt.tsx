import { useRouter } from 'expo-router';
import { Modal, Text, View } from 'react-native';

import { PrimaryButton } from './PrimaryButton';

type MilestonePromptProps = {
  visible: boolean;
  onLater: () => void;
};

export function MilestonePrompt({ visible, onLater }: MilestonePromptProps) {
  const router = useRouter();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 items-center justify-center bg-black/40 px-6">
        <View className="w-full rounded-3xl bg-white px-5 py-6">
          <Text className="text-2xl font-semibold text-brand-800">Masha&apos;Allah!</Text>
          <Text className="mt-3 text-base leading-6 text-brand-700">
            You&apos;re making wonderful progress. Create your free Qur&apos;an Quest
            account to safely save your progress, continue your Hifz on any device, join
            AI Hifz Circles, and unlock future lessons.
          </Text>
          <View className="mt-6">
            <PrimaryButton
              label="Create Free Account"
              onPress={() => router.push('/(auth)/register')}
            />
            <PrimaryButton label="Later" onPress={onLater} variant="secondary" />
          </View>
        </View>
      </View>
    </Modal>
  );
}
