import { Pressable, Text, View } from 'react-native';

import { useI18n } from '@/i18n';

type LearningModeChooserProps = {
  tafsirEnabled: boolean;
  onReadQuran: () => void;
  onQuranAudio: () => void;
  onSomaliMeaningAudio: () => void;
  onSomaliTafsir: () => void;
  onIslamicStories: () => void;
  onToggleTafsir: (enabled: boolean) => void;
};

export function LearningModeChooser({
  tafsirEnabled,
  onReadQuran,
  onQuranAudio,
  onSomaliMeaningAudio,
  onSomaliTafsir,
  onIslamicStories,
  onToggleTafsir,
}: LearningModeChooserProps) {
  const { t, isSomali } = useI18n();
  return (
    <View className="mb-4 rounded-3xl bg-white px-4 py-4">
      <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
        {t('learn.modesTitle')}
      </Text>
      <Text className="mt-1 text-sm text-brand-600">{t('learn.modesHelp')}</Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('learn.readQuran')}
        onPress={onReadQuran}
        className="mt-4 min-h-12 items-center justify-center rounded-2xl bg-brand-50 px-4 py-3"
      >
        <Text className="text-base font-semibold text-brand-800">{t('learn.readQuran')}</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('learn.quranAudio')}
        onPress={onQuranAudio}
        className="mt-2 min-h-12 items-center justify-center rounded-2xl bg-brand-50 px-4 py-3"
      >
        <Text className="text-base font-semibold text-brand-800">{t('learn.quranAudio')}</Text>
      </Pressable>
      {isSomali ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('learn.somaliMeaningAudio')}
          onPress={onSomaliMeaningAudio}
          className="mt-2 min-h-12 items-center justify-center rounded-2xl bg-brand-50 px-4 py-3"
        >
          <Text className="text-base font-semibold text-brand-800">
            {t('learn.somaliMeaningAudio')}
          </Text>
        </Pressable>
      ) : null}
      {isSomali ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('learn.somaliTafsir')}
          onPress={onSomaliTafsir}
          className="mt-2 min-h-12 items-center justify-center rounded-2xl bg-teal-50 px-4 py-3"
        >
          <Text className="text-base font-semibold text-teal-900">{t('learn.somaliTafsir')}</Text>
        </Pressable>
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('learn.islamicStories')}
        onPress={onIslamicStories}
        className="mt-2 min-h-12 items-center justify-center rounded-2xl bg-amber-50 px-4 py-3"
      >
        <Text className="text-base font-semibold text-amber-900">{t('learn.islamicStories')}</Text>
      </Pressable>

      {isSomali ? (
        <View className="mt-4 flex-row items-center justify-between rounded-2xl bg-brand-50 px-4 py-3">
          <View className="flex-1 pr-3">
            <Text className="text-sm font-semibold text-brand-800">{t('tafsir.toggleLabel')}</Text>
            <Text className="mt-1 text-xs text-brand-600">{t('tafsir.toggleHelp')}</Text>
          </View>
          <Pressable
            accessibilityRole="switch"
            accessibilityState={{ checked: tafsirEnabled }}
            onPress={() => onToggleTafsir(!tafsirEnabled)}
            className={`min-h-11 min-w-[84px] items-center justify-center rounded-xl px-3 ${
              tafsirEnabled ? 'bg-teal-700' : 'bg-brand-200'
            }`}
          >
            <Text className="text-sm font-semibold text-white">
              {tafsirEnabled ? t('tafsir.on') : t('tafsir.off')}
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
