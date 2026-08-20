import { Pressable, Text, View } from 'react-native';

import { useI18n } from '@/i18n';

type ContinueLearningButtonProps = {
  hasStarted: boolean;
  onPress: () => void;
};

export function ContinueLearningButton({
  hasStarted,
  onPress,
}: ContinueLearningButtonProps) {
  const { t } = useI18n();
  const label = hasStarted ? t('home.continueLearning') : t('home.startLearning');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hasStarted ? t('home.continueHint') : t('home.startHint')}
      onPress={onPress}
      className="mb-5 min-h-16 items-center justify-center rounded-2xl bg-brand-400 px-5 py-4 active:opacity-90"
    >
      <View className="flex-row items-center">
        <Text className="mr-2 text-2xl text-white" accessibilityElementsHidden>
          ▶
        </Text>
        <Text className="text-xl font-bold text-white">{label}</Text>
      </View>
    </Pressable>
  );
}
