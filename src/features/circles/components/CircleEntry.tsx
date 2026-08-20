import { useRouter, type Href } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { useI18n } from '@/i18n';

export function CircleEntry({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const { t } = useI18n();

  return (
    <View className={compact ? 'mb-4' : 'mb-4 rounded-2xl bg-white px-4 py-4'}>
      <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
        🔵 {t('nav.circle')}
      </Text>
      <Text className="mt-2 text-base text-brand-600">{t('groups.homeHelp')}</Text>
      <View className="mt-3 flex-row gap-3">
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/(app)/circle' as Href)}
          className="min-h-12 flex-1 items-center justify-center rounded-xl bg-brand-600 px-3 py-3"
        >
          <Text className="text-sm font-semibold text-white">{t('groups.openCircle')}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/(app)/circle/join' as Href)}
          className="min-h-12 flex-1 items-center justify-center rounded-xl border border-brand-600 px-3 py-3"
        >
          <Text className="text-sm font-semibold text-brand-700">{t('groups.join')}</Text>
        </Pressable>
      </View>
    </View>
  );
}
