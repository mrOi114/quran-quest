import { Text, View } from 'react-native';

type WelcomeSectionProps = {
  greetingLine: string;
  encouragement: string;
};

export function WelcomeSection({ greetingLine, encouragement }: WelcomeSectionProps) {
  return (
    <View
      accessibilityRole="header"
      className="mb-6"
      accessible
      accessibilityLabel={`${greetingLine} ${encouragement}`}
    >
      <Text className="text-sm font-medium text-brand-200">{"Abu Hafidul Qur'an"}</Text>
      <Text className="mt-2 text-2xl font-bold leading-8 text-white">{greetingLine}</Text>
      <Text className="mt-2 text-base leading-6 text-brand-50">{encouragement}</Text>
    </View>
  );
}
