import { Text, TextInput, View, type TextInputProps } from 'react-native';

type PinInputProps = Omit<TextInputProps, 'secureTextEntry' | 'keyboardType'> & {
  label: string;
  error?: string;
};

export function PinInput({ label, error, ...props }: PinInputProps) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-medium text-brand-800">{label}</Text>
      <TextInput
        className="rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-center text-2xl tracking-widest text-brand-900"
        keyboardType="number-pad"
        maxLength={6}
        secureTextEntry
        placeholder="••••"
        placeholderTextColor="#6BC2A2"
        {...props}
      />
      {error ? <Text className="mt-1 text-sm text-red-600">{error}</Text> : null}
    </View>
  );
}
