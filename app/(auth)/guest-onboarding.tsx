import { Redirect, useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import {
  AGE_GROUPS,
  AuthScreen,
  CountryPicker,
  guestOnboardingSchema,
  isGuestNameCheckError,
  isGuestNameTakenError,
  isReservedFounderNickname,
  LanguagePicker,
  PrimaryButton,
  TextField,
  useAuth,
  type AgeGroupId,
} from '@/features/auth';
import { useI18n, type MessageKey } from '@/i18n';
import { consumePendingChallengeCode } from '@/features/competition/services/pendingChallenge';

export default function GuestOnboardingScreen() {
  const router = useRouter();
  const { startGuest, isGuest, activeLearner } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [ageGroup, setAgeGroup] = useState<AgeGroupId>('child_7_10');
  const [countryCode, setCountryCode] = useState('US');
  const [preferredLanguage, setPreferredLanguage] = useState('en');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { t } = useI18n(preferredLanguage);

  if (isGuest && activeLearner) {
    return <Redirect href="/(app)/home" />;
  }

  async function onSubmit() {
    setFormError(null);
    setFieldErrors({});

    const parsed = guestOnboardingSchema.safeParse({
      displayName,
      ageGroup,
      countryCode,
      preferredLanguage,
      accessCode: isReservedFounderNickname(displayName) ? accessCode : undefined,
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
      const pendingCode = await consumePendingChallengeCode();
      if (pendingCode) {
        router.replace({
          pathname: '/(app)/competition/[code]',
          params: { code: pendingCode },
        } as unknown as Href);
      } else {
        router.replace('/(app)/home');
      }
    } catch (error) {
      if (isGuestNameTakenError(error)) {
        setFieldErrors({
          displayName: isReservedFounderNickname(displayName)
            ? t('guest.nicknameTaken')
            : t('guest.nameTaken'),
        });
      } else if (isGuestNameCheckError(error)) {
        setFormError(t('guest.nameCheckFailed'));
      } else {
        setFormError(error instanceof Error ? error.message : t('guest.startError'));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScreen
      title={t('guest.onboardingTitle')}
      subtitle={t('guest.onboardingSubtitle')}
    >
      <TextField
        label={t('guest.firstName')}
        value={displayName}
        onChangeText={setDisplayName}
        error={fieldErrors.displayName}
      />
      {isReservedFounderNickname(displayName) ? (
        <TextField
          label={t('guest.accessCode')}
          value={accessCode}
          onChangeText={setAccessCode}
          secureTextEntry
          autoComplete="off"
          textContentType="oneTimeCode"
          keyboardType="number-pad"
        />
      ) : null}

      <Text className="mb-2 text-sm font-medium text-brand-700">{t('guest.ageGroup')}</Text>
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
                {t(`age.${group.id}` as MessageKey)}
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
        label={t('guest.startLearning')}
        onPress={() => void onSubmit()}
        loading={loading}
      />
      <PrimaryButton
        label={t('common.back')}
        onPress={() => router.replace('/(auth)/welcome')}
        variant="secondary"
      />
    </AuthScreen>
  );
}
