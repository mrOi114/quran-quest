import { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useI18n } from '@/i18n';

import { COUNTRY_OPTIONS, findSelectableCountry } from '../constants';

type CountryPickerProps = {
  value: string;
  onChange: (countryCode: string) => void;
  error?: string;
};

export function CountryPicker({ value, onChange, error }: CountryPickerProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selected = findSelectableCountry(value);
  const selectedLabel = selected
    ? `${selected.flag}  ${selected.label}`
    : value
      ? value.toUpperCase()
      : t('country.choose');

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) {
      return COUNTRY_OPTIONS;
    }
    return COUNTRY_OPTIONS.filter(
      (country) =>
        country.label.toLowerCase().includes(needle) ||
        country.code.toLowerCase().includes(needle),
    );
  }, [query]);

  function closeList() {
    setOpen(false);
    setQuery('');
  }

  function chooseCountry(code: string) {
    onChange(code);
    closeList();
  }

  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-medium text-brand-700">{t('country.choose')}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('country.choose')}
        onPress={() => setOpen(true)}
        className="min-h-12 flex-row items-center rounded-xl border border-brand-100 bg-brand-50 px-4 py-3"
      >
        <Text className="flex-1 text-base text-brand-900">{selectedLabel}</Text>
      </Pressable>
      {error ? <Text className="mt-2 text-sm text-red-600">{error}</Text> : null}

      <Modal visible={open} animationType="slide" onRequestClose={closeList}>
        <SafeAreaView className="flex-1 bg-white">
          <View className="border-b border-brand-100 px-5 pb-3 pt-2">
            <Text className="text-lg font-semibold text-brand-800">{t('country.choose')}</Text>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={t('country.search')}
              placeholderTextColor="#6BC2A2"
              autoCorrect={false}
              autoCapitalize="none"
              className="mt-3 rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-base text-brand-900"
            />
          </View>
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.code}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8 }}
            ListEmptyComponent={
              <Text className="px-4 py-6 text-base text-brand-600">{t('country.noMatch')}</Text>
            }
            renderItem={({ item }) => {
              const isSelected = value.toUpperCase() === item.code;
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${item.label} ${item.flag}`}
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => chooseCountry(item.code)}
                  className={`min-h-12 flex-row items-center rounded-2xl px-3 py-3 ${
                    isSelected ? 'bg-brand-50' : 'bg-white'
                  }`}
                >
                  <Text className="mr-3 text-xl">{item.flag}</Text>
                  <Text
                    className={`flex-1 text-base font-medium ${
                      isSelected ? 'text-brand-700' : 'text-brand-800'
                    }`}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            }}
          />
          <View className="border-t border-brand-100 px-5 py-3">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('common.close')}
              onPress={closeList}
              className="min-h-12 items-center justify-center rounded-xl border border-brand-600 px-4 py-3"
            >
              <Text className="text-base font-semibold text-brand-600">{t('common.close')}</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}
