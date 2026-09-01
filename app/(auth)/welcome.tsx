import { useRouter } from 'expo-router';
import { Pressable, Text } from 'react-native';

import { AuthScreen, PrimaryButton } from '@/features/auth';
import { useI18n } from '@/i18n';

/**
 * Flip to true when email authentication is reliable again.
 * Login, register, and password-reset routes stay in the app; they are only
 * hidden from the new-user entry screen.
 */
const SHOW_EMAIL_AUTH_ENTRY = false;

export default function WelcomeScreen() {
  const router = useRouter();
  const { t } = useI18n();

  return (
    <AuthScreen showBrand={false} title={t('welcome.title')}>
      <PrimaryButton
        label={t('welcome.continueGuest')}
        onPress={() => router.push('/(auth)/guest-onboarding')}
      />
      <Text className="mb-4 text-center text-sm leading-5 text-brand-600">
        {t('welcome.guestHelp')}
      </Text>
      {SHOW_EMAIL_AUTH_ENTRY ? (
        <>
          <PrimaryButton
            label={t('welcome.createAccount')}
            onPress={() =>
              router.push({
                pathname: '/(auth)/register',
                params: { role: 'parent' },
              })
            }
          />
          <PrimaryButton
            label={t('welcome.logIn')}
            onPress={() =>
              router.push({ pathname: '/(auth)/login', params: { role: 'parent' } })
            }
            variant="secondary"
          />
        </>
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('welcome.childEntryA11y')}
        onPress={() => router.push('/(auth)/child-entry')}
        className="mt-2 py-3"
      >
        <Text className="text-center text-sm text-brand-600">{t('welcome.childEntry')}</Text>
      </Pressable>
    </AuthScreen>
  );
}
