import { Text, View } from 'react-native';

import { useI18n } from '@/i18n';

import { getSomaliYacobAudioAttribution } from '../content/somaliYacobAudio';

export function MeaningAudioAttribution() {
  const { t } = useI18n();
  const attribution = getSomaliYacobAudioAttribution();

  return (
    <View className="mt-3 rounded-xl bg-brand-50 px-3 py-3">
      <Text className="text-center text-xs font-semibold uppercase tracking-wide text-brand-500">
        {t('reader.meaningAudioTitle')}
      </Text>
      <Text className="mt-1 text-center text-xs text-brand-600">
        {t('reader.attributionTranslator', { translator: attribution.translator })}
      </Text>
      <Text className="text-center text-xs text-brand-600">
        {t('reader.attributionSource', { source: attribution.source })}
      </Text>
      <Text className="text-center text-xs text-brand-600">
        {t('reader.attributionTranslation', { key: attribution.translationKey })}
      </Text>
      <Text className="text-center text-xs text-brand-600">
        {t('reader.attributionVersion', { version: attribution.version })}
      </Text>
    </View>
  );
}
