import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import {
  AGE_GROUPS,
  AuthScreen,
  CountryPicker,
  guestOnboardingSchema,
  LanguagePicker,
  PrimaryButton,
  TextField,
  useAuth,
  type AgeGroupId,
} from '@/features/auth';

export default function GuestOnboardingScreen() {
  const router = useRouter();
  const { startGuest } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [ageGroup, setAgeGroup] = useState<AgeGroupId>('child_7_10');
  const [countryCode, setCountryCode] = useState('US');
  const [preferredLanguage, setPreferredLanguage] = useState('en');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setFormError(null);
    setFieldErrors({});

    const parsed = guestOnboardingSchema.safeParse({
      displayName,
      ageGroup,
      countryCode,
      preferredLanguage,
    });

    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? 'form');
        nextErrors[key] = issue.message;
      }
      setFieldErrors(nextErrors);
      return;
    }

    setLoading(true);
    try {
      await startGuest(parsed.data);
      router.replace('/(app)/home');
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Could not start guest trial',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScreen
      title="Continue as guest"
      subtitle="No email or password needed. Your progress stays on this device until you create an account."
    >
      <TextField
        label="First name or nickname"
        value={displayName}
        onChangeText={setDisplayName}
        error={fieldErrors.displayName}
      />

      <Text className="mb-2 text-sm font-medium text-brand-700">Age group</Text>
      <View className="mb-4 flex-row flex-wrap gap-2">
        {AGE_GROUPS.map((group) => {
          const selected = ageGroup === group.id;
          return (
            <Pressable
              key={group.id}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => setAgeGroup(group.id)}
              className={`min-h-12 rounded-2xl border px-3 py-2 ${
                selected ? 'border-brand-600 bg-brand-50' : 'border-brand-100 bg-white'
              }`}
            >
              <Text
                className={`text-sm font-medium ${selected ? 'text-brand-700' : 'text-brand-500'}`}
              >
                {group.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {fieldErrors.ageGroup ? (
        <Text className="mb-3 text-sm text-red-600">{fieldErrors.ageGroup}</Text>
      ) : null}

      <CountryPicker
        value={countryCode}
        onChange={setCountryCode}
        error={fieldErrors.countryCode}
      />
      <LanguagePicker
        value={preferredLanguage}
        onChange={setPreferredLanguage}
        error={fieldErrors.preferredLanguage}
      />

      {formError ? <Text className="mb-3 text-sm text-red-600">{formError}</Text> : null}

      <PrimaryButton
        label="Start learning"
        onPress={() => void onSubmit()}
        loading={loading}
      />
      <PrimaryButton
        label="Back"
        onPress={() => router.replace('/(auth)/welcome')}
        variant="secondary"
      />
    </AuthScreen>
  );
}
