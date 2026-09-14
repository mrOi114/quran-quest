import { Pressable, Text, View } from 'react-native';

import { useI18n } from '@/i18n';

import {
  QURAN_RANGE_OPTIONS,
  juzNumberFromRange,
  rangeLabelKey,
  type QuranRangeId,
} from '../services/quranRange';

export function QuranRangePicker({
  value,
  onChange,
  locked = false,
}: {
  value: QuranRangeId;
  onChange?: (next: QuranRangeId) => void;
  locked?: boolean;
}) {
  const { t } = useI18n();
  const bundles = QURAN_RANGE_OPTIONS.filter((option) => option.bundle);
  const juzOptions = QURAN_RANGE_OPTIONS.filter((option) => !option.bundle);

  return (
    <View>
      <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
        {t('competition.chooseJuz')}
      </Text>
      {locked ? (
        <Text className="mt-1 text-xs text-brand-600">{t('competition.rangeLocked')}</Text>
      ) : (
        <Text className="mt-1 text-xs text-brand-600">{t('competition.juzPickerHelp')}</Text>
      )}
      <View className="mt-3 flex-row flex-wrap gap-2">
        {bundles.map((option) => {
          const selected = value === option.id;
          const disabled = locked || !option.playable;
          return (
            <Pressable
              key={option.id}
              accessibilityRole="button"
              accessibilityLabel={t(rangeLabelKey(option.id))}
              accessibilityState={{ selected, disabled }}
              disabled={disabled}
              onPress={() => {
                if (!disabled) onChange?.(option.id);
              }}
              className={`min-h-11 min-w-[30%] flex-1 items-center justify-center rounded-2xl border px-3 ${
                selected ? 'border-brand-600 bg-brand-50' : 'border-brand-100 bg-white'
              } ${disabled && !selected ? 'opacity-50' : ''}`}
            >
              <Text className="text-sm font-semibold text-brand-800">
                {t(rangeLabelKey(option.id))}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text className="mt-4 text-xs font-semibold uppercase tracking-wide text-brand-500">
        {t('competition.orPickJuz')}
      </Text>
      <View className="mt-2 flex-row flex-wrap gap-2">
        {juzOptions.map((option) => {
          const selected = value === option.id;
          const disabled = locked || !option.playable;
          const juz = juzNumberFromRange(option.id);
          return (
            <Pressable
              key={option.id}
              accessibilityRole="button"
              accessibilityLabel={t('competition.juzLabel', { n: juz })}
              accessibilityState={{ selected, disabled }}
              disabled={disabled}
              onPress={() => {
                if (!disabled) onChange?.(option.id);
              }}
              className={`h-11 w-[18%] min-w-[52px] items-center justify-center rounded-2xl border ${
                selected ? 'border-brand-600 bg-brand-50' : 'border-brand-100 bg-white'
              } ${disabled && !selected ? 'opacity-50' : ''}`}
            >
              <Text className="text-base font-semibold text-brand-800">{juz}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
