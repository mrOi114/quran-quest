import { Text, View } from 'react-native';

import { PrimaryButton } from '@/features/auth';

type LessonLockedGateProps = {
  lessonLabel: string;
  onStartCheck: () => void;
  onGoBack: () => void;
};

export function LessonLockedGate({
  lessonLabel,
  onStartCheck,
  onGoBack,
}: LessonLockedGateProps) {
  return (
    <View className="mt-5 rounded-2xl bg-brand-50 px-4 py-6">
      <Text className="text-center text-3xl">🔒</Text>
      <Text className="mt-3 text-center text-2xl font-semibold text-brand-800">
        Lesson Locked
      </Text>
      <Text className="mt-2 text-center text-lg text-brand-600">{lessonLabel}</Text>
      <Text className="mt-4 text-center text-base leading-6 text-brand-700">
        Let’s check what you already know first.
      </Text>
      <View className="mt-6">
        <PrimaryButton label="Quick knowledge check" onPress={onStartCheck} />
        <PrimaryButton label="Go back to my lesson" variant="secondary" onPress={onGoBack} />
      </View>
    </View>
  );
}
