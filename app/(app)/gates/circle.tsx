import { Text, View } from 'react-native';

import { AccountRequiredGate } from '@/features/auth';

export default function CircleGateScreen() {
  return (
    <AccountRequiredGate feature="ai_hifz_circle">
      <View className="flex-1 items-center justify-center bg-brand-600 px-6">
        <Text className="text-center text-xl font-semibold text-white">
          AI Hifz Circle will live here in a later feature.
        </Text>
      </View>
    </AccountRequiredGate>
  );
}
