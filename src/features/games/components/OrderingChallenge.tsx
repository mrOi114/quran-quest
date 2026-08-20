import { Pressable, Text, View } from 'react-native';

import { useI18n } from '@/i18n';

import type { GameChoice } from '../types';

type OrderingChallengeProps = {
  items: GameChoice[];
  disabled?: boolean;
  onMove: (fromIndex: number, direction: -1 | 1) => void;
  onSubmit: () => void;
};

export function OrderingChallenge({
  items,
  disabled,
  onMove,
  onSubmit,
}: OrderingChallengeProps) {
  const { t } = useI18n();
  return (
    <View className="mt-4">
      <Text className="text-sm text-brand-600">{t('games.arrangeOrder')}</Text>
      <View className="mt-3 gap-2">
        {items.map((item, index) => (
          <View
            key={`${item.id}-${index}`}
            className="min-h-14 flex-row items-center rounded-2xl border border-brand-200 bg-brand-50 px-3"
          >
            <Text className="mr-3 text-base font-bold text-brand-500">{index + 1}</Text>
            <Text className="flex-1 text-base font-semibold text-brand-800">
              {item.label}
            </Text>
            <View className="flex-row gap-2">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('games.moveUp', { label: item.label })}
                disabled={disabled || index === 0}
                onPress={() => onMove(index, -1)}
                className="min-h-11 min-w-11 items-center justify-center rounded-xl bg-white active:opacity-90"
              >
                <Text className="text-lg font-bold text-brand-700">↑</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('games.moveDown', { label: item.label })}
                disabled={disabled || index === items.length - 1}
                onPress={() => onMove(index, 1)}
                className="min-h-11 min-w-11 items-center justify-center rounded-xl bg-white active:opacity-90"
              >
                <Text className="text-lg font-bold text-brand-700">↓</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('games.checkOrder')}
        disabled={disabled}
        onPress={onSubmit}
        className="mt-4 min-h-14 items-center justify-center rounded-2xl bg-brand-600 px-4 py-3 active:opacity-90"
      >
        <Text className="text-base font-semibold text-white">{t('games.checkOrder')}</Text>
      </Pressable>
    </View>
  );
}
