import { Text, View } from 'react-native';

import { PrimaryButton } from '@/features/auth';
import { useI18n } from '@/i18n';

type LessonPathChooserProps = {
  onGame: () => void;
  onPractice: () => void;
  onTest: () => void;
  onContinue: () => void;
};

export function LessonPathChooser({
  onGame,
  onPractice,
  onTest,
  onContinue,
}: LessonPathChooserProps) {
  const { t } = useI18n();
  return (
    <View className="mt-6 rounded-2xl bg-brand-50 px-4 py-5">
      <Text className="text-center text-lg font-semibold text-brand-800">
        {t('lesson.chooseHow')}
      </Text>
      <Text className="mt-2 text-center text-sm text-brand-600">{t('lesson.chooseHowHelp')}</Text>
      <View className="mt-5">
        <PrimaryButton label={t('lesson.playGame')} onPress={onGame} />
        <PrimaryButton label={t('lesson.practicePath')} variant="secondary" onPress={onPractice} />
        <PrimaryButton label={t('lesson.testPath')} variant="secondary" onPress={onTest} />
        <PrimaryButton label={t('lesson.continuePath')} onPress={onContinue} />
      </View>
    </View>
  );
}
