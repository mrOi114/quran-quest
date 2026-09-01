import { Redirect, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { AuthScreen, PrimaryButton, useAuth } from '@/features/auth';
import { useI18n } from '@/i18n';

export default function FamilyLearnersScreen() {
  const router = useRouter();
  const {
    profile,
    children,
    selectSelfAsLearner,
    ensureDeviceRegistered,
    refreshChildren,
    refreshProfile,
    isGuest,
    canManageFamily,
    session,
    isEmailVerified,
    isAccountHydrating,
  } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const { t } = useI18n();

  const parentSignedIn =
    Boolean(session) && isEmailVerified && profile?.role === 'parent';

  useEffect(() => {
    void ensureDeviceRegistered().catch(() => undefined);
    void refreshChildren().catch(() => undefined);
    if (!profile) {
      void refreshProfile().catch(() => undefined);
    }
  }, [ensureDeviceRegistered, profile, refreshChildren, refreshProfile]);

  if (isGuest || !session || !isEmailVerified) {
    return <Redirect href="/(auth)/child-entry" />;
  }

  if (!profile) {
    return (
      <AuthScreen title={t('familyGroup.whoIsLearning')} subtitle={t('family.whoLoading')}>
        <View className="items-center py-6">
          <ActivityIndicator color="#0F3D2E" size="large" />
        </View>
        {isAccountHydrating ? null : (
          <PrimaryButton
            label={t('common.tryAgain')}
            onPress={() => {
              void refreshProfile().catch(() => undefined);
            }}
            variant="secondary"
          />
        )}
      </AuthScreen>
    );
  }

  async function chooseSelf() {
    if (!profile) {
      return;
    }
    setLoadingId(profile.id);
    setError(null);
    try {
      await selectSelfAsLearner();
      router.replace('/(app)/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('family.couldNotContinue'));
    } finally {
      setLoadingId(null);
    }
  }

  function chooseChild(childId: string) {
    router.push({ pathname: '/(app)/child-pin', params: { childId } });
  }

  return (
    <AuthScreen
      title="Who is learning?"
      subtitle={
        parentSignedIn
          ? 'Tap your name. Children enter a PIN. Parents can continue without a PIN.'
          : 'Continue as yourself to learn.'
      }
    >
      {profile && profile.role !== 'child' ? (
        <Pressable
          onPress={() => void chooseSelf()}
          accessibilityRole="button"
          className="mb-3 min-h-14 rounded-2xl border border-brand-100 bg-brand-50 px-4 py-4"
        >
          <Text className="text-lg font-semibold text-brand-800">
            {profile.display_name}
          </Text>
          <Text className="mt-1 text-sm capitalize text-brand-500">
            {t('family.noPin', { role: profile.role })}
          </Text>
          {loadingId === profile.id ? (
            <Text className="mt-2 text-sm text-brand-600">{t('family.opening')}</Text>
          ) : null}
        </Pressable>
      ) : null}

      {parentSignedIn
        ? children.map((child) => (
            <Pressable
              key={child.id}
              onPress={() => chooseChild(child.id)}
              accessibilityRole="button"
              className="mb-3 min-h-14 rounded-2xl border border-brand-100 bg-white px-4 py-4"
            >
              <Text className="text-lg font-semibold text-brand-800">
                {child.display_name}
              </Text>
              <Text className="mt-1 text-sm text-brand-500">
                {t('family.childAgePin', { age: child.age ?? '—' })}
              </Text>
            </Pressable>
          ))
        : null}

      {parentSignedIn && children.length === 0 ? (
        <Text className="mb-4 text-sm text-brand-600">
          {t('family.addChildFromDashboard')}
        </Text>
      ) : null}

      {error ? <Text className="mb-3 text-sm text-red-600">{error}</Text> : null}

      {canManageFamily ? (
        <PrimaryButton
          label={t('nav.myFamily')}
          onPress={() => router.push('/(app)/parent/dashboard')}
          variant="secondary"
        />
      ) : null}

      <PrimaryButton
        label={t('common.back')}
        onPress={() => router.replace('/(app)/family')}
        variant="secondary"
      />
    </AuthScreen>
  );
}
