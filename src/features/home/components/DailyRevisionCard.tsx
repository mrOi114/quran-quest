import { Pressable, Text, View } from 'react-native';

import { useI18n } from '@/i18n';

type DailyRevisionCardProps = {
  verseCount: number;
  onBegin: () => void;
};

export function DailyRevisionCard({ verseCount, onBegin }: DailyRevisionCardProps) {
  const { t } = useI18n();
  const countLabel =
    verseCount === 0
      ? t('home.noVersesWaiting')
      : verseCount === 1
        ? t('home.oneVerseWaiting')
        : t('home.versesWaiting', { count: verseCount });

  return (
    <View className="mb-4 rounded-2xl bg-white px-4 py-4">
      <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
        {t('home.dailyRevision')}
      </Text>
      <Text className="mt-2 text-lg font-semibold text-brand-800">{countLabel}</Text>
      <Text className="mt-1 text-sm text-brand-600">{t('home.revisionHelp')}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('home.beginRevision')}
        accessibilityState={{ disabled: verseCount === 0 }}
        disabled={verseCount === 0}
        onPress={onBegin}
        className={`mt-4 min-h-14 items-center justify-center rounded-xl px-4 py-3 ${
          verseCount === 0 ? 'bg-brand-100' : 'bg-brand-600 active:opacity-90'
        }`}
      >
        <Text
          className={`text-base font-semibold ${
            verseCount === 0 ? 'text-brand-400' : 'text-white'
          }`}
        >
          {t('home.beginRevision')}
        </Text>
      </Pressable>
    </View>
  );
}
