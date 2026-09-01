import { Pressable, Text, View } from 'react-native';

import { useI18n } from '@/i18n';

import type { AdultOrParentRole } from '../types';

type RolePickerProps = {
  value: AdultOrParentRole;
  onChange: (role: AdultOrParentRole) => void;
};

export function RolePicker({ value, onChange }: RolePickerProps) {
  const { t } = useI18n();
  const options: { role: AdultOrParentRole; titleKey: 'role.adult' | 'role.parent'; helpKey: 'role.adultHelp' | 'role.parentHelp' }[] =
    [
      { role: 'adult', titleKey: 'role.adult', helpKey: 'role.adultHelp' },
      { role: 'parent', titleKey: 'role.parent', helpKey: 'role.parentHelp' },
    ];

  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-medium text-brand-800">{t('role.accountType')}</Text>
      {options.map((option) => {
        const selected = value === option.role;
        return (
          <Pressable
            key={option.role}
            onPress={() => onChange(option.role)}
            className={`mb-2 rounded-xl border px-4 py-3 ${
              selected ? 'border-brand-600 bg-brand-50' : 'border-brand-100 bg-white'
            }`}
          >
            <Text className="text-base font-semibold text-brand-800">{t(option.titleKey)}</Text>
            <Text className="mt-1 text-sm text-brand-500">{t(option.helpKey)}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
