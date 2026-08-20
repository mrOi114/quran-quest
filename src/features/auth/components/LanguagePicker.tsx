import { Pressable, Text, View } from 'react-native';

import { useI18n } from '@/i18n';

import { LANGUAGE_OPTIONS } from '../constants';

type LanguagePickerProps = {
  value: string;
  onChange: (languageCode: string) => void;
  error?: string;
};

export function LanguagePicker({ value, onChange, error }: LanguagePickerProps) {
  const { t } = useI18n(value);

  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-medium text-brand-700">{t('language.preferred')}</Text>
      <View className="flex-row flex-wrap gap-2">
        {LANGUAGE_OPTIONS.map((language) => {
          const selected = value === language.code;
          const label =
            language.code === 'so' ? t('language.somali') : `${language.flag} ${language.label}`;
          return (
            <Pressable
              key={language.code}
              accessibilityRole="button"
              accessibilityLabel={label}
              accessibilityState={{ selected }}
              onPress={() => onChange(language.code)}
              className={`min-h-12 items-center justify-center rounded-2xl border px-3 py-2 ${
                selected ? 'border-brand-600 bg-brand-50' : 'border-brand-100 bg-white'
              }`}
            >
              <Text
                className={`text-sm font-medium ${selected ? 'text-brand-700' : 'text-brand-500'}`}
              >
                {language.code === 'so' ? `🇸🇴 ${t('language.somali')}` : label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {error ? <Text className="mt-2 text-sm text-red-600">{error}</Text> : null}
    </View>
  );
}
