import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import { LanguagePicker, PrimaryButton, useAuth } from '@/features/auth';
import { useI18n } from '@/i18n';

export default function ProfileRoute() {
  const router = useRouter();
  const {
    activeLearner,
    profile,
    isGuest,
    isChildFamilySession,
    canManageFamily,
    signOut,
    endGuestSession,
    endChildFamilySession,
    clearActiveLearner,
    setPreferredLanguage,
  } = useAuth();
  const { t } = useI18n();

  const isChildSession = activeLearner?.role === 'child';
  const name =
    activeLearner?.display_name ?? profile?.display_name ?? t('nav.guestLearner');
  const role = activeLearner?.role ?? profile?.role ?? (isGuest ? 'guest' : 'unknown');
  const languageValue = activeLearner?.preferred_language ?? 'en';

  return (
    <ScrollView
      className="flex-1 bg-brand-600"
      contentContainerStyle={{ padding: 20, paddingBottom: 36 }}
    >
      <View className="rounded-3xl bg-white px-5 py-6">
        <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
          {t('profile.title')}
        </Text>
        <Text className="mt-2 text-3xl font-bold text-brand-800">{name}</Text>
        {isGuest ? (
          <Text className="mt-2 text-xs font-semibold uppercase tracking-wide text-brand-500">
            {t('common.guestMode')}
          </Text>
        ) : null}
        <Text className="mt-2 text-base text-brand-600">
          {isChildSession ? t('profile.learner') : t('profile.role', { role })}
        </Text>
        <Text className="mt-1 text-base text-brand-600">
          {isGuest
            ? t('profile.guestSession')
            : isChildFamilySession
              ? t('profile.familyUnlock')
              : isChildSession
                ? t('profile.keepLearning')
                : t('profile.connected')}
        </Text>

        <View className="mt-5 rounded-2xl bg-brand-50 px-4 py-4">
          <Text className="mb-2 text-sm font-semibold uppercase tracking-wide text-brand-500">
            {t('settings.language')}
          </Text>
          <Text className="mb-3 text-sm text-brand-600">{t('profile.languageHelp')}</Text>
          <LanguagePicker
            value={languageValue}
            onChange={(code) => {
              void setPreferredLanguage(code);
            }}
          />
        </View>

        <View className="mt-6">
          {canManageFamily ? (
            <PrimaryButton
              label={t('nav.myFamily')}
              onPress={() => router.push('/(app)/parent/dashboard')}
            />
          ) : null}
          <PrimaryButton
            label={t('nav.settings')}
            onPress={() => router.push('/(app)/settings' as never)}
            variant="secondary"
          />
          {isGuest ? (
            <PrimaryButton
              label={t('common.endGuestTrial')}
              onPress={() =>
                void endGuestSession().then(() => router.replace('/(auth)/welcome'))
              }
              variant="secondary"
            />
          ) : isChildFamilySession ? (
            <PrimaryButton
              label={t('common.switchLearner')}
              onPress={() =>
                void endChildFamilySession().then(() =>
                  router.replace('/(auth)/child-entry'),
                )
              }
              variant="secondary"
            />
          ) : isChildSession ? (
            <PrimaryButton
              label={t('common.switchLearner')}
              onPress={() =>
                void clearActiveLearner().then(() =>
                  router.replace('/(app)/family/learners'),
                )
              }
              variant="secondary"
            />
          ) : (
            <PrimaryButton
              label={t('common.logOut')}
              onPress={() =>
                void signOut().then(() => router.replace('/(auth)/welcome'))
              }
              variant="secondary"
            />
          )}
        </View>
      </View>
    </ScrollView>
  );
}
