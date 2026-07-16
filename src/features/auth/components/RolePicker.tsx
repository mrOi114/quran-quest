import { Pressable, Text, View } from 'react-native';

import type { AdultOrParentRole } from '../types';

type RolePickerProps = {
  value: AdultOrParentRole;
  onChange: (role: AdultOrParentRole) => void;
};

const options: { role: AdultOrParentRole; title: string; description: string }[] = [
  {
    role: 'adult',
    title: 'Adult',
    description: 'Independent learner with full learning features.',
  },
  {
    role: 'parent',
    title: 'Parent',
    description: 'Learn yourself and manage child accounts.',
  },
];

export function RolePicker({ value, onChange }: RolePickerProps) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-medium text-brand-800">Account type</Text>
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
            <Text className="text-base font-semibold text-brand-800">{option.title}</Text>
            <Text className="mt-1 text-sm text-brand-500">{option.description}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
