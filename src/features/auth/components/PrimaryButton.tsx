import { ActivityIndicator, Pressable, Text, View } from 'react-native';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
};

export function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
  variant = 'primary',
}: PrimaryButtonProps) {
  const isPrimary = variant === 'primary';
  const isDisabled = Boolean(disabled || loading);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: Boolean(loading) }}
      disabled={isDisabled}
      onPress={onPress}
      className={`mb-3 items-center rounded-xl px-4 py-3.5 ${
        isDisabled
          ? 'bg-brand-200'
          : isPrimary
            ? 'bg-brand-600'
            : 'border border-brand-600 bg-transparent'
      }`}
    >
      {loading ? (
        <View className="flex-row items-center">
          <ActivityIndicator color={isPrimary ? '#FFFFFF' : '#0F3D2E'} />
          <Text
            className={`ml-2 text-base font-semibold ${isPrimary ? 'text-white' : 'text-brand-600'}`}
          >
            {label}
          </Text>
        </View>
      ) : (
        <Text
          className={`text-base font-semibold ${isPrimary ? 'text-white' : 'text-brand-600'}`}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}
