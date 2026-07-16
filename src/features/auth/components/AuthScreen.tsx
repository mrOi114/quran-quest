import type { ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type AuthScreenProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function AuthScreen({ title, subtitle, children }: AuthScreenProps) {
  return (
    <SafeAreaView className="flex-1 bg-brand-600">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 24,
          paddingVertical: 32,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="mb-8">
          <Text className="text-3xl font-bold text-white">Qur&apos;an Quest</Text>
          <Text className="mt-4 text-2xl font-semibold text-brand-50">{title}</Text>
          {subtitle ? (
            <Text className="mt-2 text-base text-brand-100">{subtitle}</Text>
          ) : null}
        </View>
        <View className="rounded-3xl bg-white px-5 py-6">{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}
