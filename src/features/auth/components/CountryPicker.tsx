import { Pressable, Text, View } from 'react-native';

import { COUNTRY_OPTIONS } from '../constants';

type CountryPickerProps = {
  value: string;
  onChange: (countryCode: string) => void;
  error?: string;
};

export function CountryPicker({ value, onChange, error }: CountryPickerProps) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-medium text-brand-700">Country</Text>
      <View className="flex-row flex-wrap gap-2">
        {COUNTRY_OPTIONS.map((country) => {
          const selected = value === country.code;
          return (
            <Pressable
              key={country.code}
              accessibilityRole="button"
              accessibilityLabel={`${country.label} ${country.flag}`}
              accessibilityState={{ selected }}
              onPress={() => onChange(country.code)}
              className={`min-h-12 flex-row items-center rounded-2xl border px-3 py-2 ${
                selected ? 'border-brand-600 bg-brand-50' : 'border-brand-100 bg-white'
              }`}
            >
              <Text className="mr-2 text-base">{country.flag}</Text>
              <Text
                className={`text-sm font-medium ${selected ? 'text-brand-700' : 'text-brand-500'}`}
              >
                {country.code}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {error ? <Text className="mt-2 text-sm text-red-600">{error}</Text> : null}
    </View>
  );
}
