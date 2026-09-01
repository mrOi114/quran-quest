import { Redirect, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { AuthScreen, PrimaryButton, useAuth } from '@/features/auth';
import { FamilyCommsEntry } from '@/features/family-comms';
import {
  buildParentChildrenOverview,
  type ChildProgressOverview,
} from '@/features/home/services/parentDashboardService';
import { useI18n } from '@/i18n';

export default function ParentDashboardScreen() {
  const router = useRouter();
  const {
    profile,
    children,
    canManageFamily,
    isGuest,
    familyCode,
    refreshChildren,
    ensureDeviceRegistered,
    ensureFamilyCode,
    selectSelfAsLearner,
  } = useAuth();
  const [rows, setRows] = useState<ChildProgressOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [codeLoading, setCodeLoading] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    void ensureDeviceRegistered().catch(() => undefined);
    void refreshChildren().catch(() => undefined);
  }, [ensureDeviceRegistered, refreshChildren]);

  useEffect(() => {
    let cancelled = false;

    async function loadCode() {
      if (!canManageFamily) {
        return;
      }
      setCodeLoading(true);
      setCodeError(null);
      try {
        await ensureFamilyCode();
      } catch (err) {
        if (!cancelled) {
          setCodeError(
            err instanceof Error ? err.message : t('family.codeUnavailable'),
          );
        }
      } finally {
        if (!cancelled) {
          setCodeLoading(false);
        }
      }
    }

    void loadCode();
    return () => {
      cancelled = true;
    };
  }, [canManageFamily, ensureFamilyCode]);

  useEffect(() => {
    let cancelled = false;

    async function loadOverview() {
      setLoading(true);
      setError(null);
      try {
        const overview = await buildParentChildrenOverview(
          children.map((child) => ({
            id: child.id,
            role: child.role,
            display_name: child.display_name,
            age: child.age,
            avatar_key: child.avatar_key,
            country_code: child.country_code,
            preferred_language: child.preferred_language,
            parent_id: child.parent_id,
          })),
        );
        if (!cancelled) {
          setRows(overview);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : t('family.loadProgressError'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadOverview();
    return () => {
      cancelled = true;
    };
  }, [children]);

  if (isGuest || profile?.role !== 'parent' || !canManageFamily) {
    return <Redirect href="/(app)/home" />;
  }

  async function continueAsParent() {
    await selectSelfAsLearner();
    router.replace('/(app)/home');
  }

  return (
    <AuthScreen title={t('nav.myFamily')} subtitle={t('familyGroup.subtitle')}>
      <View className="mb-4 rounded-2xl border border-brand-100 bg-brand-50 px-4 py-4">
        <Text className="text-base font-semibold text-brand-800">
          {t('family.phoneHelpTitle')}
        </Text>
        <Text className="mt-2 text-sm leading-5 text-brand-700">
          {t('family.phoneHelpBody')}
        </Text>
        <Text className="mt-3 text-sm font-medium text-brand-600">
          {t('family.phoneFlow')}
        </Text>
      </View>

      <View className="mb-4 rounded-2xl border border-brand-200 bg-white px-4 py-4">
        <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
          {t('familyGroup.code')}
        </Text>
        {codeLoading && !familyCode ? (
          <View className="mt-3 items-start">
            <ActivityIndicator color="#0F766E" />
          </View>
        ) : familyCode ? (
          <Text
            accessibilityLabel={t('familyGroup.codeA11y', { code: familyCode.split('').join(' ') })}
            className="mt-2 text-3xl font-bold tracking-widest text-brand-800"
          >
            {familyCode}
          </Text>
        ) : (
          <Text className="mt-2 text-sm text-brand-600">{t('familyGroup.codeSoon')}</Text>
        )}
        <Text className="mt-2 text-sm leading-5 text-brand-600">
          {t('family.shareTabletHelp')}
        </Text>
        {codeError ? <Text className="mt-2 text-sm text-red-600">{codeError}</Text> : null}
      </View>

      <FamilyCommsEntry compact />

      <PrimaryButton
        label={t('family.addChild')}
        onPress={() => router.push('/(app)/parent/add-child' as never)}
      />

      <Text className="mb-3 mt-4 text-base font-semibold text-brand-800">
        {t('progress.myChildren')}
      </Text>

      {loading ? (
        <View className="mb-4 items-center py-6">
          <ActivityIndicator color="#0F766E" />
          <Text className="mt-2 text-sm text-brand-600">{t('progress.loading')}</Text>
        </View>
      ) : children.length === 0 ? (
        <Text className="mb-4 text-sm text-brand-600">{t('family.noChildrenYet')}</Text>
      ) : (
        rows.map((row) => (
          <View
            key={row.childId}
            className="mb-3 rounded-2xl border border-brand-100 bg-white px-4 py-4"
          >
            <Text className="text-lg font-semibold text-brand-800">
              {row.displayName}
            </Text>
            <Text className="mt-1 text-sm text-brand-500">
              {t('family.ageLine', { age: row.age ?? '—' })}
              {row.genderLabel === 'Girl'
                ? ` · ${t('gender.girl')}`
                : row.genderLabel === 'Boy'
                  ? ` · ${t('gender.boy')}`
                  : row.genderLabel
                    ? ` · ${row.genderLabel}`
                    : ''}
            </Text>
            <Text className="mt-3 text-base font-semibold text-brand-700">
              {row.xpPoints} {t('common.xp')} · {t('circle.dayStreak', { count: row.streakDays })}
            </Text>
            <Text className="mt-2 text-sm text-brand-600">
              {t('family.quranLine', {
                surahs: row.surahsCompleted,
                verses: row.versesLearned,
              })}
            </Text>
            <Text className="mt-1 text-sm text-brand-600">
              {t('family.lessonsLine', {
                completed: row.lessonsCompleted,
                lesson:
                  row.currentLessonLabel === 'Not started'
                    ? t('family.notStarted')
                    : row.currentLessonLabel,
              })}
            </Text>
            <Text className="mt-1 text-sm text-brand-600">
              {t('family.gamesLine', {
                games: row.gameCompletions,
                achievements: row.achievements,
              })}
            </Text>
            <Pressable
              onPress={() => router.push('/(app)/parent/children')}
              className="mt-3 py-1"
            >
              <Text className="text-sm font-medium text-brand-600">{t('family.editPin')}</Text>
            </Pressable>
          </View>
        ))
      )}

      {error ? <Text className="mb-3 text-sm text-red-600">{error}</Text> : null}

      <PrimaryButton
        label={t('familyGroup.whoIsLearning')}
        onPress={() => router.push('/(app)/family/learners')}
        variant="secondary"
      />
      <PrimaryButton
        label={t('family.continueAsParent')}
        onPress={() => void continueAsParent()}
        variant="secondary"
      />
    </AuthScreen>
  );
}
