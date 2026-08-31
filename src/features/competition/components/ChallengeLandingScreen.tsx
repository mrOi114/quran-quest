import { Redirect, useRouter, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton, useAuth } from '@/features/auth';
import { useI18n } from '@/i18n';

import {
  normalizeChallengeCode,
  previewChallenge,
  savePendingChallengeCode,
} from '../services';
import type { CompetitionPreview } from '../types';

export function ChallengeLandingScreen({ codeParam }: { codeParam: string }) {
  const router = useRouter();
  const { t } = useI18n();
  const { isBootstrapping, session, isGuest, isChildFamilySession } = useAuth();
  const code = normalizeChallengeCode(codeParam);
  const inApp = Boolean(session || isGuest || isChildFamilySession);
  const [preview, setPreview] = useState<CompetitionPreview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (code.length >= 4) {
      void savePendingChallengeCode(code);
    }
  }, [code]);

  useEffect(() => {
    if (inApp || code.length < 4) {
      return;
    }
    let cancelled = false;
    void previewChallenge(code)
      .then((next) => {
        if (!cancelled) setPreview(next);
      })
      .catch(() => {
        if (!cancelled) setError(t('competition.notFound'));
      });
    return () => {
      cancelled = true;
    };
  }, [code, inApp, t]);

  if (isBootstrapping) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-brand-600">
        <ActivityIndicator color="#FFFFFF" size="large" />
      </SafeAreaView>
    );
  }

  if (inApp && code.length >= 4) {
    return (
      <Redirect
        href={{
          pathname: '/(app)/competition/[code]',
          params: { code },
        } as unknown as Href}
      />
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-brand-600 px-6 pt-10">
      <Text className="text-3xl font-bold text-white">{t('competition.title')}</Text>
      <Text className="mt-3 text-base text-brand-100">{t('competition.landingHelp')}</Text>
      <View className="mt-6 rounded-3xl bg-white px-5 py-5">
        <Text className="text-base font-semibold text-brand-800">
          {t('competition.codeLabel', { code: code || '------' })}
        </Text>
        {preview?.is_full ? (
          <Text className="mt-2 text-sm font-semibold text-amber-700">{t('competition.full')}</Text>
        ) : null}
        {error ? <Text className="mt-3 text-sm text-red-700">{error}</Text> : null}
        <View className="mt-4">
          <PrimaryButton
            label={t('competition.openAsGuest')}
            onPress={() => router.push('/(auth)/guest-onboarding')}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
