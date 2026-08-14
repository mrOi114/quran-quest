import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { AuthScreen, PrimaryButton } from '@/features/auth';

type RoleCardProps = {
  title: string;
  body: string;
  onPress: () => void;
};

function RoleCard({ title, body, onPress }: RoleCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      className="mb-3 min-h-16 rounded-2xl border border-brand-100 bg-brand-50 px-4 py-4 active:opacity-90"
    >
      <Text className="text-lg font-semibold text-brand-800">{title}</Text>
      <Text className="mt-1 text-sm leading-5 text-brand-600">{body}</Text>
    </Pressable>
  );
}

export default function WelcomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ role?: string }>();

  return (
    <AuthScreen
      title="QuranFamily"
      subtitle="Parents manage the family. Children unlock with their own PIN."
    >
      <Text className="mb-4 text-base font-semibold text-brand-800">
        How would you like to continue?
      </Text>

      <RoleCard
        title="Parent / Family Sign In"
        body="Sign in to add children, see progress, and share your family code."
        onPress={() =>
          router.push({ pathname: '/(auth)/login', params: { role: 'parent' } })
        }
      />
      <RoleCard
        title="Child / Learner"
        body="Enter your family code, choose your name, then your PIN. No parent password needed."
        onPress={() => router.push('/(auth)/child-entry')}
      />

      <View className="mb-3 mt-1 rounded-2xl border border-brand-100 bg-white px-4 py-3">
        <Text className="text-sm leading-5 text-brand-700">
          Create the child name and PIN on the parent phone. The child uses their own
          tablet with the family code and PIN.
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Adult learner"
        onPress={() =>
          router.push({ pathname: '/(auth)/login', params: { role: 'adult' } })
        }
        className="mb-3 min-h-12 rounded-2xl border border-brand-100 bg-white px-4 py-3 active:opacity-90"
      >
        <Text className="text-base font-semibold text-brand-800">Adult learner</Text>
        <Text className="mt-1 text-sm text-brand-600">
          Sign in for your own Hifz journey.
        </Text>
      </Pressable>

      <PrimaryButton
        label="Continue as Guest"
        onPress={() => router.push('/(auth)/guest-onboarding')}
        variant="secondary"
      />
      <PrimaryButton
        label="Create a free account"
        onPress={() =>
          router.push({
            pathname: '/(auth)/register',
            params: { role: params.role === 'parent' ? 'parent' : 'adult' },
          })
        }
        variant="secondary"
      />
    </AuthScreen>
  );
}
