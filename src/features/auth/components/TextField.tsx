import { Text, TextInput, View, type TextInputProps } from 'react-native';

type TextFieldProps = TextInputProps & {
  label: string;
  error?: string;
  hint?: string;
};

export function TextField({ label, error, hint, ...props }: TextFieldProps) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-medium text-brand-800">{label}</Text>
      <TextInput
        className="rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-base text-brand-900"
        placeholderTextColor="#6BC2A2"
        {...props}
      />
      {error ? <Text className="mt-1 text-sm text-red-600">{error}</Text> : null}
      {hint && !error ? <Text className="mt-1 text-sm text-brand-600">{hint}</Text> : null}
    </View>
  );
}
