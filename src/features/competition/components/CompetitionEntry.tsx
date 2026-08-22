import { useRouter, type Href } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { useI18n } from '@/i18n';

export function CompetitionEntry({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const { t } = useI18n();

  return (
    <View className={compact ? '' : 'mb-4 rounded-2xl bg-white px-4 py-4'}>
      <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
        🌙 {t('nav.competition')}
      </Text>
      <Text className="mt-2 text-base text-brand-600">{t('competition.homeHelp')}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('competition.openRoom')}
        onPress={() => router.push('/(app)/competition' as Href)}
        className="mt-3 min-h-12 items-center justify-center rounded-xl bg-brand-600 px-3 py-3"
      >
        <Text className="text-sm font-semibold text-white">{t('competition.openRoom')}</Text>
      </Pressable>
    </View>
  );
}
