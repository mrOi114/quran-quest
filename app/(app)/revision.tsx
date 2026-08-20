import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { AuthScreen, PrimaryButton } from '@/features/auth';
import { useI18n } from '@/i18n';

/**
 * Thin placeholder until Feature 007 (Smart Revision).
 */
export default function RevisionPlaceholderScreen() {
  const router = useRouter();
  const { t } = useI18n();

  return (
    <AuthScreen title={t('revision.title')} subtitle={t('revision.subtitle')}>
      <View className="mb-4 rounded-2xl bg-brand-50 px-4 py-4">
        <Text className="text-base text-brand-700">{t('revision.body')}</Text>
      </View>
      <PrimaryButton label={t('common.backToHome')} onPress={() => router.replace('/(app)/home')} />
    </AuthScreen>
  );
}
