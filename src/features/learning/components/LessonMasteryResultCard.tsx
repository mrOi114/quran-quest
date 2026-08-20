import { Text, View } from 'react-native';

import { PrimaryButton } from '@/features/auth';
import { useI18n } from '@/i18n';

type LessonMasteryResultCardProps = {
  passed: boolean;
  percent: number;
  correctCount: number;
  totalCount: number;
  message: string;
  hasNextLesson: boolean;
  onContinue: () => void;
  onRetry: () => void;
  onPractice: () => void;
};

export function LessonMasteryResultCard({
  passed,
  percent,
  correctCount,
  totalCount,
  message,
  hasNextLesson,
  onContinue,
  onRetry,
  onPractice,
}: LessonMasteryResultCardProps) {
  const { t } = useI18n();
  return (
    <View className="mt-5 rounded-2xl bg-brand-50 px-4 py-6">
      <Text className="text-center text-base leading-6 text-brand-700">{message}</Text>
      <Text className="mt-4 text-center text-3xl font-bold text-brand-800">{percent}%</Text>
      <Text className="mt-1 text-center text-sm text-brand-500">
        {t('test.scoreOf', { correct: correctCount, total: totalCount })}
      </Text>
      <View className="mt-6">
        {passed ? (
          <PrimaryButton
            label={hasNextLesson ? t('test.startNext') : t('test.seeProgress')}
            onPress={onContinue}
          />
        ) : (
          <>
            <PrimaryButton label={t('test.tryAgain')} onPress={onRetry} />
            <PrimaryButton label={t('test.practise')} variant="secondary" onPress={onPractice} />
          </>
        )}
      </View>
    </View>
  );
}
