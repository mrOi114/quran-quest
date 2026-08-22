import { useRouter } from 'expo-router';
import { Pressable, Text } from 'react-native';

import { AuthScreen, PrimaryButton } from '@/features/auth';

/**
 * Flip to true when email authentication is reliable again.
 * Login, register, and password-reset routes stay in the app; they are only
 * hidden from the new-user entry screen.
 */
const SHOW_EMAIL_AUTH_ENTRY = false;

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <AuthScreen showBrand={false} title="Welcome to QuranFamily 🌙">
      <PrimaryButton
        label="Start with Guest Mode"
        onPress={() => router.push('/(auth)/guest-onboarding')}
      />
      <Text className="mb-4 text-center text-sm leading-5 text-brand-600">
        No account needed — explore Qur’an learning, reading and listening instantly.
      </Text>
      {SHOW_EMAIL_AUTH_ENTRY ? (
        <>
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
        </>
      ) : null}
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
