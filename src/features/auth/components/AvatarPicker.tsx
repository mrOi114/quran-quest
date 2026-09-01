import { Pressable, Text, View } from 'react-native';

import { useI18n, type MessageKey } from '@/i18n';

import { AVATAR_OPTIONS } from '../constants';

type AvatarPickerProps = {
  value: string;
  onChange: (avatarKey: string) => void;
  error?: string;
};

export function AvatarPicker({ value, onChange, error }: AvatarPickerProps) {
  const { t } = useI18n();

  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-medium text-brand-700">{t('avatar.title')}</Text>
      <View className="flex-row flex-wrap gap-2">
        {AVATAR_OPTIONS.map((avatar) => {
          const selected = value === avatar.key;
          const label = t(`avatar.${avatar.key}` as MessageKey);
          return (
            <Pressable
              key={avatar.key}
              accessibilityRole="button"
              accessibilityLabel={t('avatar.a11y', { label })}
              accessibilityState={{ selected }}
              onPress={() => onChange(avatar.key)}
              className={`min-h-12 min-w-16 items-center justify-center rounded-2xl border px-3 py-2 ${
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
