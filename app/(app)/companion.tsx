import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { AuthScreen, PrimaryButton } from '@/features/auth';
import { useI18n } from '@/i18n';

/**
 * Thin placeholder until Feature 009 (AI Hifz Companion).
 */
export default function CompanionPlaceholderScreen() {
  const router = useRouter();
  const { t } = useI18n();

  return (
    <AuthScreen title={t('companion.title')} subtitle={t('companion.subtitle')}>
      <View className="mb-4 rounded-2xl bg-brand-50 px-4 py-4">
        <Text className="text-base text-brand-700">{t('companion.body')}</Text>
      </View>
      <PrimaryButton
        label={t('games.backToGames')}
        variant="secondary"
        onPress={() => router.replace('/(app)/games')}
      />
      <PrimaryButton label={t('common.backToHome')} onPress={() => router.replace('/(app)/home')} />
    </AuthScreen>
  );
}
