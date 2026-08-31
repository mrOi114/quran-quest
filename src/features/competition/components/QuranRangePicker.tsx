import { Pressable, Text, View } from 'react-native';

import { useI18n } from '@/i18n';

import {
  QURAN_RANGE_OPTIONS,
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

  return (
    <View>
      <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
        {t('competition.chooseRange')}
      </Text>
      {locked ? (
        <Text className="mt-1 text-xs text-brand-600">{t('competition.rangeLocked')}</Text>
      ) : null}
      <View className="mt-3 gap-2">
        {QURAN_RANGE_OPTIONS.map((option) => {
          const selected = value === option.id;
          const disabled = locked || !option.playable;
          return (
            <Pressable
              key={option.id}
              accessibilityRole="button"
              accessibilityState={{ selected, disabled }}
              disabled={disabled}
              onPress={() => {
                if (!disabled) onChange?.(option.id);
              }}
              className={`min-h-12 justify-center rounded-2xl border px-4 py-3 ${
                selected
                  ? 'border-brand-600 bg-brand-50'
                  : 'border-brand-100 bg-white'
              } ${disabled && !selected ? 'opacity-50' : ''}`}
            >
              <Text className="text-base font-semibold text-brand-800">{t(option.labelKey)}</Text>
              {!option.playable ? (
                <Text className="mt-1 text-sm text-brand-500">{t('competition.comingSoon')}</Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
