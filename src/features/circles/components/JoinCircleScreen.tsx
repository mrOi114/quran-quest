import { useState } from 'react';
import { Text, View } from 'react-native';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';

import { AuthScreen, PrimaryButton, TextField, useAuth } from '@/features/auth';
import { useI18n } from '@/i18n';

import { joinCircleSchema } from '../schemas';
import { joinCircle, localizeGroupError } from '../services';

export function JoinCircleScreen() {
  const router = useRouter();
  const { language, t } = useI18n();
  const { session, isGuest } = useAuth();
  const params = useLocalSearchParams<{ code?: string }>();
  const [joinCode, setJoinCode] = useState(String(params.code ?? ''));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const signedIn = Boolean(session) && !isGuest;

  async function onJoin() {
    setError(null);
    const parsed = joinCircleSchema.safeParse({ joinCode });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? t('groups.enterCode'));
      return;
    }
    if (!signedIn) {
      setError(t('groups.signInNeeded'));
      return;
    }
    setLoading(true);
    try {
      const circle = await joinCircle(parsed.data.joinCode);
      router.replace(`/(app)/circle/${circle.id}` as Href);
    } catch (err) {
      setError(localizeGroupError(err instanceof Error ? err.message : null, language));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScreen title={t('groups.joinTitle')} subtitle={t('groups.joinHelp')}>
      {!signedIn ? (
        <View className="mb-4 rounded-2xl bg-brand-50 px-4 py-4">
          <Text className="text-sm leading-5 text-brand-700">{t('groups.guestJoin')}</Text>
          <View className="mt-3">
            <PrimaryButton
              label={t('groups.guestExploreHifz')}
              onPress={() => router.replace('/(app)/gates/circle' as Href)}
            />
          </View>
        </View>
      ) : null}
      <TextField
        label={t('groups.joinCode')}
        value={joinCode}
        onChangeText={setJoinCode}
        autoCapitalize="characters"
        autoCorrect={false}
        editable={signedIn}
      />
      {error ? <Text className="mb-3 text-sm text-red-600">{error}</Text> : null}
      {signedIn ? (
        <PrimaryButton label={t('groups.join')} onPress={() => void onJoin()} loading={loading} />
      ) : null}
      <PrimaryButton label={t('common.back')} onPress={() => router.back()} variant="secondary" />
    </AuthScreen>
  );
}
