import { Pressable, Text, TextInput, View } from 'react-native';
import { useRef } from 'react';

type OtpCodeInputProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  editable?: boolean;
};

export function OtpCodeInput({
  value,
  onChange,
  error,
  editable = true,
}: OtpCodeInputProps) {
  const inputRef = useRef<TextInput>(null);
  const digits = value.replace(/\D/g, '').slice(0, 6);

  return (
    <View className="mb-4">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="6-digit verification code"
        onPress={() => inputRef.current?.focus()}
        disabled={!editable}
        className="relative mb-2"
      >
        <View className="flex-row justify-between" pointerEvents="none">
          {Array.from({ length: 6 }, (_, index) => {
            const digit = digits[index];
            const focused = digits.length === index || (digits.length === 6 && index === 5);
            return (
              <View
                key={index}
                className={`h-14 w-11 items-center justify-center rounded-xl border ${
                  error
                    ? 'border-red-400 bg-red-50'
                    : focused
                      ? 'border-brand-600 bg-brand-50'
                      : 'border-brand-100 bg-brand-50'
                }`}
              >
                <Text className="text-2xl font-semibold text-brand-900">
                  {digit ?? '_'}
                </Text>
              </View>
            );
          })}
        </View>
        <TextInput
          ref={inputRef}
          value={digits}
          onChangeText={(next) => onChange(next.replace(/\D/g, '').slice(0, 6))}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete="one-time-code"
          inputMode="numeric"
          maxLength={6}
          editable={editable}
          autoFocus
          accessibilityLabel="6-digit verification code"
          style={{
            position: 'absolute',
            opacity: 0.02,
            top: 0,
            left: 0,
            right: 0,
            height: 56,
            color: 'transparent',
          }}
        />
      </Pressable>
      {error ? <Text className="mt-1 text-sm text-red-600">{error}</Text> : null}
    </View>
  );
}
