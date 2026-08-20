import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';

import { AuthScreen, PrimaryButton, useAuth } from '@/features/auth';
import { FamilyCommsEntry, useFamilyCircle } from '@/features/family-comms';
import { MAX_GROUP_MEMBERS } from '@/constants/groupLimits';
import { useI18n } from '@/i18n';

import { ensureFamilyGroup } from '../services';
import { localizeGroupError } from '@/features/circles/services';

export function FamilyHubScreen() {
  const router = useRouter();
  const { language, t } = useI18n();
  const {
    profile,
    session,
    isGuest,
    isEmailVerified,
    familyCode,
    children,
    ensureFamilyCode,
    refreshProfile,
    refreshChildren,
  } = useAuth();
  const { circle, loading } = useFamilyCircle();
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const parentSignedIn =
    Boolean(session) && isEmailVerified && profile?.role === 'parent';
  const adultSignedIn =
    Boolean(session) && isEmailVerified && profile?.role === 'adult';

  useEffect(() => {
    if (parentSignedIn) {
      void ensureFamilyCode().catch(() => undefined);
      void refreshChildren().catch(() => undefined);
    }
  }, [ensureFamilyCode, parentSignedIn, refreshChildren]);

  async function onCreateFamilyGroup() {
    setError(null);
    setCreating(true);
    try {
      await ensureFamilyGroup();
      await refreshProfile();
      await ensureFamilyCode();
    } catch (err) {
      setError(localizeGroupError(err instanceof Error ? err.message : null, language));
    } finally {
      setCreating(false);
    }
  }

  const memberCount = 1 + children.length;

  return (
    <AuthScreen title={t('familyGroup.title')} subtitle={t('familyGroup.subtitle')}>
      {isGuest ? (
        <View className="mb-4 rounded-2xl bg-brand-50 px-4 py-4">
          <Text className="text-sm leading-5 text-brand-700">{t('familyGroup.guestHelp')}</Text>
        </View>
      ) : null}

      {adultSignedIn ? (
        <View className="mb-4">
          <Text className="mb-3 text-sm leading-5 text-brand-600">
            {t('familyGroup.createHelp')}
          </Text>
          <PrimaryButton
            label={t('familyGroup.create')}
            onPress={() => void onCreateFamilyGroup()}
            loading={creating}
          />
        </View>
      ) : null}

      {parentSignedIn ? (
        <>
          <View className="mb-4 rounded-2xl border border-brand-200 bg-brand-50 px-4 py-4">
            <Text className="text-lg font-semibold text-brand-800">
              👨‍👩‍👧 {t('familyGroup.cardTitle')}
            </Text>
            <Text className="mt-1 text-sm text-brand-600">
              {t('groups.memberCount', {
                count: circle?.members.length ?? memberCount,
                max: MAX_GROUP_MEMBERS,
              })}
            </Text>
            <Text className="mt-1 text-xs text-brand-500">{t('familyGroup.adminYou')}</Text>
          </View>

          <View className="mb-4 rounded-2xl border border-brand-200 bg-white px-4 py-4">
            <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
              {t('familyGroup.code')}
            </Text>
            {loading && !familyCode ? (
              <Text className="mt-2 text-sm text-brand-600">{t('common.loading')}</Text>
            ) : familyCode ? (
              <Text
                accessibilityLabel={t('familyGroup.codeA11y', {
                  code: familyCode.split('').join(' '),
                })}
                className="mt-2 text-3xl font-bold tracking-widest text-brand-800"
              >
                {familyCode}
              </Text>
            ) : (
              <Text className="mt-2 text-sm text-brand-600">{t('familyGroup.codeSoon')}</Text>
            )}
            <Text className="mt-2 text-sm leading-5 text-brand-600">
              {t('familyGroup.codeHelp')}
            </Text>
          </View>

          <FamilyCommsEntry compact />

          <Text className="mb-2 text-base font-semibold text-brand-800">
            {t('familyGroup.members')}
          </Text>
          {circle?.members.map((member) => (
            <View
              key={member.id}
              className="mb-2 rounded-2xl border border-brand-100 bg-white px-4 py-3"
            >
              <Text className="text-base font-semibold text-brand-800">{member.display_name}</Text>
              <Text className="mt-1 text-sm capitalize text-brand-500">
                {member.role === 'parent' ? t('familyGroup.admin') : t('familyGroup.child')}
              </Text>
            </View>
          ))}

          <PrimaryButton
            label={t('familyGroup.manageMembers')}
            onPress={() => router.push('/(app)/parent/dashboard' as Href)}
          />
          <PrimaryButton
            label={t('familyGroup.settings')}
            onPress={() => router.push('/(app)/family/settings' as Href)}
            variant="secondary"
          />
          <PrimaryButton
            label={t('familyGroup.whoIsLearning')}
            onPress={() => router.push('/(app)/family/learners' as Href)}
            variant="secondary"
          />
        </>
      ) : null}

      {!parentSignedIn && !adultSignedIn ? (
        <>
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              router.push({ pathname: '/(auth)/login', params: { role: 'parent' } })
            }
            className="mb-3 min-h-16 rounded-2xl border border-brand-100 bg-brand-50 px-4 py-4"
          >
            <Text className="text-lg font-semibold text-brand-800">
              {t('familyGroup.parentSignIn')}
            </Text>
            <Text className="mt-1 text-sm text-brand-600">{t('familyGroup.parentSignInHelp')}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/(auth)/child-entry')}
            className="mb-4 min-h-16 rounded-2xl border border-brand-100 bg-white px-4 py-4"
          >
            <Text className="text-lg font-semibold text-brand-800">
              {t('familyGroup.childSignIn')}
            </Text>
            <Text className="mt-1 text-sm text-brand-600">{t('familyGroup.childSignInHelp')}</Text>
          </Pressable>
        </>
      ) : null}

      {error ? <Text className="mb-3 text-sm text-red-600">{error}</Text> : null}

      {isGuest ? (
        <PrimaryButton
          label={t('common.backToHome')}
          onPress={() => router.replace('/(app)/home')}
          variant="secondary"
        />
      ) : null}
    </AuthScreen>
  );
}
