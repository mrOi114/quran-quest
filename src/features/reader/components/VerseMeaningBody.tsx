import { Text, View } from 'react-native';

import { useI18n } from '@/i18n';

import type { ResolvedVerseMeaning } from '../types';

type VerseMeaningBodyProps = {
  meaning: ResolvedVerseMeaning;
};

export function VerseMeaningBody({ meaning }: VerseMeaningBodyProps) {
  const { t } = useI18n();
  const attribution = meaning.attribution;

  return (
    <View>
      <Text className="text-center text-base leading-6 text-brand-600">{meaning.text}</Text>
      {meaning.footnotes ? (
        <Text className="mt-3 text-center text-sm leading-5 text-brand-500">
          {meaning.footnotes}
        </Text>
      ) : null}
      {attribution && !meaning.isFallback ? (
        <View className="mt-3">
          <Text className="text-center text-xs font-semibold uppercase tracking-wide text-brand-400">
            {t('reader.somaliMeaning')}
          </Text>
          <Text className="mt-1 text-center text-xs text-brand-500">{attribution.translator}</Text>
          <Text className="text-center text-xs text-brand-500">
            {t('reader.attributionSource', { source: attribution.source })}
          </Text>
          <Text className="text-center text-xs text-brand-500">
            {t('reader.attributionKey', { key: attribution.translationKey })}
          </Text>
          <Text className="text-center text-xs text-brand-500">
            {t('reader.attributionVersion', { version: attribution.version })}
          </Text>
        </View>
      ) : null}
      {meaning.isFallback ? (
        <Text className="mt-2 text-center text-xs text-brand-400">
          {t('language.englishUntilAvailable')}
        </Text>
      ) : null}
    </View>
  );
}
