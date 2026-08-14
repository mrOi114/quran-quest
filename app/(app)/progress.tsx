import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import { PrimaryButton, useAuth } from '@/features/auth';
import { useHomeDashboard } from '@/features/home/hooks/useHomeDashboard';
import {
  buildParentChildrenOverview,
  type ChildProgressOverview,
} from '@/features/home/services/parentDashboardService';

export default function ProgressRoute() {
  const router = useRouter();
  const { activeLearner, canManageFamily, children, isChildFamilySession } = useAuth();
  const { dashboard, isLoading } = useHomeDashboard();
  const [childRows, setChildRows] = useState<ChildProgressOverview[]>([]);
  const [childLoading, setChildLoading] = useState(false);

  useEffect(() => {
    if (!canManageFamily) {
      setChildRows([]);
      return;
    }

    let cancelled = false;
    setChildLoading(true);
    void buildParentChildrenOverview(
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
    )
      .then((rows) => {
        if (!cancelled) {
          setChildRows(rows);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setChildLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [canManageFamily, children]);

  if (isLoading || !dashboard) {
    return (
      <View className="flex-1 items-center justify-center bg-brand-600">
        <ActivityIndicator color="#FFFFFF" size="large" />
        <Text className="mt-3 text-base text-brand-50">Loading progress…</Text>
      </View>
    );
  }

  const name = activeLearner?.display_name ?? dashboard.nickname;

  return (
    <ScrollView
      className="flex-1 bg-brand-600"
      contentContainerStyle={{ padding: 20, paddingBottom: 36 }}
    >
      <View className="rounded-3xl bg-white px-5 py-6">
        <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
          Progress
        </Text>
        <Text className="mt-2 text-3xl font-bold text-brand-800">{name}</Text>
        <Text className="mt-4 text-2xl font-bold text-brand-700">
          {dashboard.xpPoints} XP
        </Text>
        <Text className="mt-2 text-base text-brand-600">
          {dashboard.achievements.lessonsCompleted} lessons ·{' '}
          {dashboard.achievements.surahsCompleted} surahs ·{' '}
          {dashboard.achievements.streakDays}-day streak
        </Text>
        <Text className="mt-3 text-sm text-brand-600">
          Now: {dashboard.todaysLesson.lessonLabel} ({dashboard.todaysLesson.progressPercent}
          %)
        </Text>

        {isChildFamilySession ? (
          <Text className="mt-4 text-sm leading-5 text-brand-600">
            Progress on this device is saved for {name}. A parent can follow along from My
            Family after they sign in.
          </Text>
        ) : null}

        <View className="mt-6">
          <PrimaryButton
            label="Continue learning"
            onPress={() => router.push('/(app)/lesson')}
          />
          <PrimaryButton
            label="Achievements"
            onPress={() => router.push('/(app)/leaderboard')}
            variant="secondary"
          />
        </View>
      </View>

      {canManageFamily ? (
        <View className="mt-4 rounded-3xl bg-white px-5 py-6">
          <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
            My Children
          </Text>
          {childLoading ? (
            <Text className="mt-3 text-sm text-brand-600">Loading children…</Text>
          ) : childRows.length === 0 ? (
            <Text className="mt-3 text-sm text-brand-600">
              No children yet. Add a child from My Family.
            </Text>
          ) : (
            childRows.map((row) => (
              <View key={row.childId} className="mt-4 border-t border-brand-100 pt-4">
                <Text className="text-lg font-semibold text-brand-800">
                  {row.displayName}
                </Text>
                <Text className="mt-1 text-sm text-brand-600">
                  {row.xpPoints} XP · {row.lessonsCompleted} lessons · {row.surahsCompleted}{' '}
                  surahs
                </Text>
              </View>
            ))
          )}
          <Pressable
            onPress={() => router.push('/(app)/parent/dashboard')}
            className="mt-4 py-2"
          >
            <Text className="text-sm font-medium text-brand-600">Open My Family</Text>
          </Pressable>
        </View>
      ) : null}
    </ScrollView>
  );
}
