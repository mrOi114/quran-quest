import { Pressable, Text } from 'react-native';

import { useI18n } from '@/i18n';

type Gender = 'girl' | 'boy';

type GenderPickerProps = {
  value: Gender;
  onChange: (value: Gender) => void;
  error?: string;
};

export function GenderPicker({ value, onChange, error }: GenderPickerProps) {
  const { t } = useI18n();

  return (
    <>
      <Text className="mb-2 text-sm font-medium text-brand-700">{t('gender.girlOrBoy')}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: value === 'girl' }}
        onPress={() => onChange('girl')}
        className={`mb-2 min-h-12 items-center justify-center rounded-xl border px-4 py-3 ${
          value === 'girl' ? 'border-brand-600 bg-brand-50' : 'border-brand-100 bg-white'
        }`}
      >
        <Text
          className={`text-base font-semibold ${
            value === 'girl' ? 'text-brand-800' : 'text-brand-600'
          }`}
        >
          {t('gender.girl')}
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: value === 'boy' }}
        onPress={() => onChange('boy')}
        className={`mb-3 min-h-12 items-center justify-center rounded-xl border px-4 py-3 ${
          value === 'boy' ? 'border-brand-600 bg-brand-50' : 'border-brand-100 bg-white'
        }`}
      >
        <Text
          className={`text-base font-semibold ${
            value === 'boy' ? 'text-brand-800' : 'text-brand-600'
          }`}
        >
          {t('gender.boy')}
        </Text>
      </Pressable>
      {error ? <Text className="mb-3 text-sm text-red-600">{error}</Text> : null}
    </>
  );
}
