import { useRouter } from 'expo-router';
import { Text } from 'react-native';

import { AuthScreen, PrimaryButton } from '@/features/auth';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <AuthScreen
      title="Learn. Memorize. Grow."
      subtitle="A calm Hifz journey for adults, parents, and children."
    >
      <Text className="mb-6 text-base text-brand-700">
        Start as a guest with just a nickname, or create a free account to sync across
        devices.
      </Text>
      <PrimaryButton
        label="Continue as Guest"
        onPress={() => router.push('/(auth)/guest-onboarding')}
      />
      <PrimaryButton
        label="Log in"
        onPress={() => router.push('/(auth)/login')}
        variant="secondary"
      />
      <PrimaryButton
        label="Create account"
        onPress={() => router.push('/(auth)/register')}
        variant="secondary"
      />
    </AuthScreen>
  );
}
