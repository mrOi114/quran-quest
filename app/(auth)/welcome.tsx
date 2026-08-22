import { useRouter } from 'expo-router';
import { Pressable, Text } from 'react-native';

import { AuthScreen, PrimaryButton } from '@/features/auth';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <AuthScreen showBrand={false} title="Welcome to QuranFamily 🌙">
      <PrimaryButton
        label="Continue as Guest"
        onPress={() => router.push('/(auth)/guest-onboarding')}
      />
      <PrimaryButton
        label="Create Account"
        onPress={() =>
          router.push({
            pathname: '/(auth)/register',
            params: { role: 'parent' },
          })
        }
      />
      <PrimaryButton
        label="Log In"
        onPress={() =>
          router.push({ pathname: '/(auth)/login', params: { role: 'parent' } })
        }
        variant="secondary"
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Child or learner family code entry"
        onPress={() => router.push('/(auth)/child-entry')}
        className="mt-2 py-3"
      >
        <Text className="text-center text-sm text-brand-600">
          Child / Learner? Enter family code
        </Text>
      </Pressable>
    </AuthScreen>
  );
}
