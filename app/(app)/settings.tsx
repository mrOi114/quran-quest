import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import { LanguagePicker, PrimaryButton, useAuth } from '@/features/auth';
import { useTafsirMode } from '@/features/tafsir';
import { useI18n } from '@/i18n';

export default function SettingsRoute() {
  const router = useRouter();
  const {
    isGuest,
    isChildFamilySession,
    canManageFamily,
    familyCode,
    activeLearner,
    signOut,
    endGuestSession,
    endChildFamilySession,
    setPreferredLanguage,
  } = useAuth();
  const { t } = useI18n();
  const tafsir = useTafsirMode();
  const languageValue = activeLearner?.preferred_language ?? 'en';

  return (
    <ScrollView className="flex-1 bg-brand-600" contentContainerStyle={{ padding: 20, paddingBottom: 36 }}>
      <View className="rounded-3xl bg-white px-5 py-6">
        <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
          {t('settings.title')}
        </Text>
        <Text className="mt-2 text-3xl font-bold text-brand-800">{t('settings.headline')}</Text>
        <Text className="mt-2 text-base text-brand-600">{t('settings.body')}</Text>

        <View className="mt-5 rounded-2xl bg-brand-50 px-4 py-4">
          <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
            {t('settings.language')}
          </Text>
          <Text className="mt-2 mb-3 text-sm text-brand-600">{t('profile.languageHelp')}</Text>
          <LanguagePicker
            value={languageValue}
            onChange={(code) => {
              void setPreferredLanguage(code);
            }}
          />
        </View>

        <View className="mt-5 rounded-2xl bg-brand-50 px-4 py-4">
          <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
            {t('tafsir.toggleLabel')}
          </Text>
          <Text className="mt-2 mb-3 text-sm text-brand-600">{t('tafsir.toggleHelp')}</Text>
          <PrimaryButton
            label={tafsir.enabled ? t('tafsir.on') : t('tafsir.off')}
            onPress={() => {
              void tafsir.setEnabled(!tafsir.enabled);
            }}
            variant="secondary"
          />
        </View>

        <View className="mt-5 rounded-2xl bg-brand-50 px-4 py-4">
          <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
            {t('settings.session')}
          </Text>
          <Text className="mt-2 text-sm text-brand-700">
            {isGuest
              ? t('settings.guestActive')
              : isChildFamilySession
                ? t('settings.childSession')
                : t('settings.signedIn')}
          </Text>
          {canManageFamily && familyCode ? (
            <Text className="mt-2 text-sm font-semibold text-brand-800">
              {t('settings.familyCode', { code: familyCode })}
            </Text>
          ) : null}
        </View>

        <View className="mt-6">
          <PrimaryButton label={t('common.backToHome')} onPress={() => router.replace('/(app)/home')} />
          {canManageFamily ? (
            <PrimaryButton
              label={t('nav.myFamily')}
              onPress={() => router.push('/(app)/parent/dashboard')}
              variant="secondary"
            />
          ) : null}
          <PrimaryButton
            label={
              isChildFamilySession
                ? t('common.switchLearner')
                : isGuest
                  ? t('common.endGuestTrial')
                  : t('common.logOut')
            }
            onPress={() =>
              void (isChildFamilySession
                ? endChildFamilySession()
                : isGuest
                  ? endGuestSession()
                  : signOut()
              ).then(() =>
                router.replace(
                  isChildFamilySession ? '/(auth)/child-entry' : '/(auth)/welcome',
                ),
              )
            }
            variant="secondary"
          />
        </View>
      </View>
    </ScrollView>
  );
}
