import { Redirect, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { AuthScreen, PrimaryButton, useAuth } from '@/features/auth';
import {
  buildParentChildrenOverview,
  type ChildProgressOverview,
} from '@/features/home/services/parentDashboardService';

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
            err instanceof Error
              ? err.message
              : 'Family code is not available yet. Apply the family-code migration, then try again.',
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
          setError(err instanceof Error ? err.message : 'Could not load progress');
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
    <AuthScreen
      title="My Family"
      subtitle="Add children, share your family code, and follow their Hifz journey."
    >
      <View className="mb-4 rounded-2xl border border-brand-100 bg-brand-50 px-4 py-4">
        <Text className="text-base font-semibold text-brand-800">
          Create on your phone. Learn on theirs.
        </Text>
        <Text className="mt-2 text-sm leading-5 text-brand-700">
          Create your child&apos;s name and PIN on your phone. Your child can use
          QuranFamily on their own phone or tablet. You stay connected to their learning
          journey.
        </Text>
        <Text className="mt-3 text-sm font-medium text-brand-600">
          Your Phone → Child&apos;s Tablet → Aisha&apos;s QuranFamily → Family Dashboard
        </Text>
      </View>

      <View className="mb-4 rounded-2xl border border-brand-200 bg-white px-4 py-4">
        <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
          Family code
        </Text>
        {codeLoading && !familyCode ? (
          <View className="mt-3 items-start">
            <ActivityIndicator color="#0F766E" />
          </View>
        ) : familyCode ? (
          <Text
            accessibilityLabel={`Family code ${familyCode.split('').join(' ')}`}
            className="mt-2 text-3xl font-bold tracking-widest text-brand-800"
          >
            {familyCode}
          </Text>
        ) : (
          <Text className="mt-2 text-sm text-brand-600">
            Your family code will appear here after it is generated.
          </Text>
        )}
        <Text className="mt-2 text-sm leading-5 text-brand-600">
          Share this code with your child&apos;s tablet. They choose their name and enter
          their PIN — no parent email or password.
        </Text>
        {codeError ? <Text className="mt-2 text-sm text-red-600">{codeError}</Text> : null}
      </View>

      <PrimaryButton
        label="＋ Add Child"
        onPress={() => router.push('/(app)/parent/add-child' as never)}
      />

      <Text className="mb-3 mt-4 text-base font-semibold text-brand-800">My Children</Text>

      {loading ? (
        <View className="mb-4 items-center py-6">
          <ActivityIndicator color="#0F766E" />
          <Text className="mt-2 text-sm text-brand-600">Loading progress…</Text>
        </View>
      ) : children.length === 0 ? (
        <Text className="mb-4 text-sm text-brand-600">
          No children yet. Add a child to start their Quran journey.
        </Text>
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
              Age {row.age ?? '—'}
              {row.genderLabel ? ` · ${row.genderLabel}` : ''}
            </Text>
            <Text className="mt-3 text-base font-semibold text-brand-700">
              {row.xpPoints} XP · {row.streakDays}-day streak
            </Text>
            <Text className="mt-2 text-sm text-brand-600">
              Quran: {row.surahsCompleted} surahs · {row.versesLearned} verses learned
            </Text>
            <Text className="mt-1 text-sm text-brand-600">
              Lessons: {row.lessonsCompleted} completed · Now: {row.currentLessonLabel}
            </Text>
            <Text className="mt-1 text-sm text-brand-600">
              Games: {row.gameCompletions} completed · Achievements: {row.achievements}
            </Text>
            <Pressable
              onPress={() => router.push('/(app)/parent/children')}
              className="mt-3 py-1"
            >
              <Text className="text-sm font-medium text-brand-600">Edit / reset PIN</Text>
            </Pressable>
          </View>
        ))
      )}

      {error ? <Text className="mb-3 text-sm text-red-600">{error}</Text> : null}

      <PrimaryButton
        label="Who is learning?"
        onPress={() => router.push('/(app)/family/learners')}
        variant="secondary"
      />
      <PrimaryButton
        label="Continue as parent"
        onPress={() => void continueAsParent()}
        variant="secondary"
      />
    </AuthScreen>
  );
}
