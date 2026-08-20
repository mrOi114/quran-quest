import { Pressable, Text, View } from 'react-native';

import { useI18n } from '@/i18n';

import type { ResolvedVerseMeaning } from '../types';

type TranslationPanelProps = {
  meaning: ResolvedVerseMeaning | null;
  explanation: string | null;
  visible: boolean;
  onToggleVisible: () => void;
};

export function TranslationPanel({
  meaning,
  explanation,
  visible,
  onToggleVisible,
}: TranslationPanelProps) {
  const { t } = useI18n();
  return (
    <View className="mt-4">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={visible ? t('reader.hideMeaning') : t('reader.showMeaning')}
        onPress={onToggleVisible}
        className="min-h-11 items-center justify-center self-center px-3"
      >
        <Text className="text-sm font-medium text-brand-500">
          {visible ? t('reader.hideMeaning') : t('reader.showMeaning')}
        </Text>
      </Pressable>

      {visible && meaning ? (
        <View className="mt-2 rounded-xl bg-brand-50/80 px-3 py-3">
          <Text className="mb-1 text-center text-xs font-semibold uppercase tracking-wide text-brand-400">
            {t('reader.meaning')}
          </Text>
          <Text className="text-center text-base leading-6 text-brand-600">
            {meaning.text}
          </Text>
          {meaning.isFallback ? (
            <Text className="mt-2 text-center text-xs text-brand-400">
              {t('language.englishUntilAvailable')}
            </Text>
          ) : null}
          {explanation ? (
            <Text className="mt-3 text-center text-sm leading-5 text-brand-500">
              {explanation}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
