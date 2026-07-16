import { Pressable, Text, View } from 'react-native';

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
  return (
    <View className="mt-4">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={visible ? 'Hide meaning' : 'Show meaning'}
        onPress={onToggleVisible}
        className="min-h-11 items-center justify-center self-center px-3"
      >
        <Text className="text-sm font-medium text-brand-500">
          {visible ? 'Hide meaning' : 'Show meaning'}
        </Text>
      </Pressable>

      {visible && meaning ? (
        <View className="mt-2 rounded-xl bg-brand-50/80 px-3 py-3">
          <Text className="mb-1 text-center text-xs font-semibold uppercase tracking-wide text-brand-400">
            Meaning
          </Text>
          <Text className="text-center text-base leading-6 text-brand-600">
            {meaning.text}
          </Text>
          {meaning.isFallback ? (
            <Text className="mt-2 text-center text-xs text-brand-400">
              Shown in English until your language is available.
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
