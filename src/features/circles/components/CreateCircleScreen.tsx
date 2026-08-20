import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';

import { AuthScreen, PrimaryButton, TextField, useAuth } from '@/features/auth';
import { useI18n } from '@/i18n';

import { createCircleSchema } from '../schemas';
import {
  createCircle,
  localizeGroupError,
  requestTeacherRole,
} from '../services';
import { useMyCircles } from '../hooks/useMyCircles';
import type { CircleKind } from '@/types';

export function CreateCircleScreen() {
  const router = useRouter();
  const { language, t } = useI18n();
  const { profile, session, isGuest, isChildFamilySession } = useAuth();
  const { teacherStatus, reload } = useMyCircles();
  const [kind, setKind] = useState<CircleKind>('public');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const signedIn = Boolean(session) && !isGuest && profile?.role !== 'child' && !isChildFamilySession;
  const canCreateMadrasah = teacherStatus === 'approved';

  async function onCreate() {
    setError(null);
    const parsed = createCircleSchema.safeParse({ kind, name });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? t('groups.enterName'));
      return;
    }
    if (!signedIn) {
      setError(t('groups.signInNeeded'));
      return;
    }
    setLoading(true);
    try {
      const circle = await createCircle(parsed.data);
      router.replace(`/(app)/circle/${circle.id}` as Href);
    } catch (err) {
      setError(localizeGroupError(err instanceof Error ? err.message : null, language));
    } finally {
      setLoading(false);
    }
  }

  async function onRequestTeacher() {
    setError(null);
    setLoading(true);
    try {
      await requestTeacherRole();
      await reload();
    } catch (err) {
      setError(localizeGroupError(err instanceof Error ? err.message : null, language));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScreen title={t('groups.createTitle')} subtitle={t('groups.createHelp')}>
      <Text className="mb-2 text-sm font-semibold text-brand-700">{t('groups.chooseType')}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => setKind('public')}
        className={`mb-3 rounded-2xl border px-4 py-4 ${
          kind === 'public' ? 'border-brand-600 bg-brand-50' : 'border-brand-100 bg-white'
        }`}
      >
        <Text className="text-lg font-semibold text-brand-800">🌍 {t('groups.public')}</Text>
        <Text className="mt-1 text-sm text-brand-600">{t('groups.publicHelp')}</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        onPress={() => setKind('madrasah')}
        className={`mb-4 rounded-2xl border px-4 py-4 ${
          kind === 'madrasah' ? 'border-brand-600 bg-brand-50' : 'border-brand-100 bg-white'
        }`}
      >
        <Text className="text-lg font-semibold text-brand-800">🕌 {t('groups.madrasah')}</Text>
        <Text className="mt-1 text-sm text-brand-600">{t('groups.madrasahHelp')}</Text>
      </Pressable>

      {kind === 'madrasah' && !canCreateMadrasah ? (
        <View className="mb-4 rounded-2xl bg-brand-50 px-4 py-4">
          <Text className="text-sm leading-5 text-brand-700">{t('groups.teacherRequired')}</Text>
          {teacherStatus === 'pending' ? (
            <Text className="mt-2 text-sm font-medium text-brand-600">
              {t('groups.teacherPending')}
            </Text>
          ) : (
            <View className="mt-3">
              <PrimaryButton
                label={t('groups.requestTeacher')}
                onPress={() => void onRequestTeacher()}
                loading={loading}
              />
            </View>
          )}
        </View>
      ) : null}

      <TextField label={t('groups.name')} value={name} onChangeText={setName} />
      {error ? <Text className="mb-3 text-sm text-red-600">{error}</Text> : null}
      <PrimaryButton
        label={t('groups.create')}
        onPress={() => void onCreate()}
        loading={loading}
        disabled={kind === 'madrasah' && !canCreateMadrasah}
      />
      <PrimaryButton label={t('common.back')} onPress={() => router.back()} variant="secondary" />
    </AuthScreen>
  );
}
