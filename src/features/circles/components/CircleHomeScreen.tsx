import { useRouter, type Href } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton, useAuth } from '@/features/auth';
import { useI18n } from '@/i18n';

import { useMyCircles } from '../hooks/useMyCircles';
import { localizeGroupError } from '../services';
import type { CircleSummary } from '../types';

function CircleCard({
  circle,
  onPress,
}: {
  circle: CircleSummary;
  onPress: () => void;
}) {
  const { t } = useI18n();
  const icon = circle.kind === 'madrasah' ? '🕌' : '🌍';
  const kindLabel =
    circle.kind === 'madrasah' ? t('groups.madrasah') : t('groups.public');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={circle.name}
      onPress={onPress}
      className="mb-3 rounded-2xl border border-brand-100 bg-white px-4 py-4 active:opacity-90"
    >
      <Text className="text-lg font-semibold text-brand-800">
        {icon} {circle.name}
      </Text>
      <Text className="mt-1 text-sm text-brand-600">
        {kindLabel} · {t('groups.memberCount', { count: circle.memberCount, max: circle.memberLimit })}
      </Text>
      {circle.timedOut ? (
        <Text className="mt-2 text-sm text-amber-700">{t('groups.timeout')}</Text>
      ) : null}
    </Pressable>
  );
}

export function CircleHomeScreen() {
  const router = useRouter();
  const { language, t } = useI18n();
  const { isGuest, session, profile, isChildFamilySession } = useAuth();
  const { publicCircles, madrasahCircles, teacherStatus, loading, error, reload } =
    useMyCircles();

  const signedIn = Boolean(session) && !isGuest;
  const canCreate = signedIn && profile?.role !== 'child' && !isChildFamilySession;

  return (
    <SafeAreaView className="flex-1 bg-brand-600">
      <View className="flex-1 px-5 pt-4">
        <Text className="text-sm font-semibold uppercase tracking-wide text-brand-100">
          {t('nav.circle')}
        </Text>
        <Text className="mt-2 text-3xl font-bold text-white">{t('groups.title')}</Text>
        <Text className="mt-2 text-base text-brand-100">{t('groups.subtitle')}</Text>

        <View className="mt-5 rounded-3xl bg-white px-5 py-5">
          {isGuest ? (
            <View className="mb-4 rounded-2xl bg-brand-50 px-4 py-4">
              <Text className="text-base font-semibold text-brand-800">
                {t('groups.guestTitle')}
              </Text>
              <Text className="mt-2 text-sm leading-5 text-brand-600">
                {t('groups.guestHelp')}
              </Text>
            </View>
          ) : null}

          <View className="mb-4 flex-row gap-3">
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/(app)/circle/join' as Href)}
              className="min-h-12 flex-1 items-center justify-center rounded-xl bg-brand-600 px-3 py-3"
            >
              <Text className="text-sm font-semibold text-white">{t('groups.join')}</Text>
            </Pressable>
            {canCreate ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push('/(app)/circle/create' as Href)}
                className="min-h-12 flex-1 items-center justify-center rounded-xl border border-brand-600 px-3 py-3"
              >
                <Text className="text-sm font-semibold text-brand-700">
                  {t('groups.create')}
                </Text>
              </Pressable>
            ) : null}
          </View>

          <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
            🌍 {t('groups.public')}
          </Text>
          {loading ? (
            <Text className="mt-2 text-sm text-brand-600">{t('common.loading')}</Text>
          ) : publicCircles.length === 0 ? (
            <Text className="mb-4 mt-2 text-sm text-brand-600">{t('groups.noPublic')}</Text>
          ) : (
            publicCircles.map((circle) => (
              <CircleCard
                key={circle.id}
                circle={circle}
                onPress={() => router.push(`/(app)/circle/${circle.id}` as Href)}
              />
            ))
          )}

          <Text className="mt-2 text-sm font-semibold uppercase tracking-wide text-brand-500">
            🕌 {t('groups.madrasah')}
          </Text>
          {teacherStatus === 'pending' ? (
            <Text className="mt-2 text-sm text-brand-600">{t('groups.teacherPending')}</Text>
          ) : null}
          {loading ? null : madrasahCircles.length === 0 ? (
            <Text className="mb-2 mt-2 text-sm text-brand-600">{t('groups.noMadrasah')}</Text>
          ) : (
            madrasahCircles.map((circle) => (
              <CircleCard
                key={circle.id}
                circle={circle}
                onPress={() => router.push(`/(app)/circle/${circle.id}` as Href)}
              />
            ))
          )}

          {error ? (
            <Text className="mt-3 text-sm text-red-600">
              {localizeGroupError(error, language)}
            </Text>
          ) : null}

          <View className="mt-4">
            <PrimaryButton
              label={t('common.backToHome')}
              onPress={() => router.replace('/(app)/home')}
              variant="secondary"
            />
            {signedIn ? (
              <PrimaryButton
                label={t('common.tryAgain')}
                onPress={() => void reload()}
                variant="secondary"
              />
            ) : null}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
