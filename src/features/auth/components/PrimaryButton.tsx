import { ActivityIndicator, Pressable, Text } from 'react-native';

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

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      className={`mb-3 items-center rounded-xl px-4 py-3.5 ${
        disabled || loading
          ? 'bg-brand-200'
          : isPrimary
            ? 'bg-brand-600'
            : 'border border-brand-600 bg-transparent'
      }`}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? '#FFFFFF' : '#0F3D2E'} />
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
