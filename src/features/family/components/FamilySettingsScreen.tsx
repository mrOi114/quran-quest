import { Text, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';

import { AuthScreen, PrimaryButton, useAuth } from '@/features/auth';
import { FamilyCommsEntry } from '@/features/family-comms';
import { MAX_GROUP_MEMBERS } from '@/constants/groupLimits';
import { useI18n } from '@/i18n';

export function FamilySettingsScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { canManageFamily, familyCode, children } = useAuth();

  return (
    <AuthScreen title={t('familyGroup.settings')} subtitle={t('familyGroup.settingsHelp')}>
      <View className="mb-4 rounded-2xl border border-brand-100 bg-brand-50 px-4 py-4">
        <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
          {t('familyGroup.code')}
        </Text>
        <Text className="mt-2 text-2xl font-bold tracking-widest text-brand-800">
          {familyCode ?? '—'}
        </Text>
        <Text className="mt-2 text-sm text-brand-600">
          {t('groups.memberCount', { count: 1 + children.length, max: MAX_GROUP_MEMBERS })}
        </Text>
      </View>

      <FamilyCommsEntry compact />

      <Text className="mb-3 text-sm leading-5 text-brand-600">{t('familyGroup.privateOnly')}</Text>

      {canManageFamily ? (
        <PrimaryButton
          label={t('familyGroup.manageMembers')}
          onPress={() => router.push('/(app)/parent/children' as Href)}
        />
      ) : null}
      <PrimaryButton label={t('common.back')} onPress={() => router.back()} variant="secondary" />
    </AuthScreen>
  );
}
