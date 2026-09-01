import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';

import { applyUiDirection, normalizeUiLanguage, useI18n } from '@/i18n';

import { LANGUAGE_OPTIONS } from '../constants';

type LanguagePickerProps = {
  value: string;
  onChange: (languageCode: string) => void;
  error?: string;
};

function languageLabel(
  language: (typeof LANGUAGE_OPTIONS)[number],
  t: ReturnType<typeof useI18n>['t'],
): string {
  if (language.code === 'ar') {
    return `${language.flag} ${t('language.arabic')}`;
  }
  if (language.code === 'so') {
    return `${language.flag} ${t('language.somali')}`;
  }
  if (language.code === 'en') {
    return `${language.flag} ${t('language.english')}`;
  }
  return `${language.flag} ${language.label}`;
}

export function LanguagePicker({ value, onChange, error }: LanguagePickerProps) {
  const { t } = useI18n(value);

  useEffect(() => {
    applyUiDirection(normalizeUiLanguage(value));
  }, [value]);

  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-medium text-brand-700">{t('language.preferred')}</Text>
      <View className="flex-row flex-wrap gap-2">
        {LANGUAGE_OPTIONS.map((language) => {
          const selected = value === language.code;
          const label = languageLabel(language, t);
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
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {error ? <Text className="mt-2 text-sm text-red-600">{error}</Text> : null}
    </View>
  );
}
