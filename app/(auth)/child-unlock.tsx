import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text } from 'react-native';

import {
  AuthScreen,
  childPinSchema,
  PinInput,
  PrimaryButton,
  useAuth,
} from '@/features/auth';
import { useI18n } from '@/i18n';

/** Family-code child PIN unlock (no parent email session required). */
export default function ChildUnlockScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const params = useLocalSearchParams<{
    childId?: string;
    familyCode?: string;
    childName?: string;
  }>();
  const { unlockChildByFamilyCode } = useAuth();
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const childId = typeof params.childId === 'string' ? params.childId : '';
  const familyCode =
    typeof params.familyCode === 'string' ? params.familyCode.trim().toUpperCase() : '';
  const childName =
    typeof params.childName === 'string' && params.childName.trim()
      ? params.childName.trim()
      : t('common.friend');

  if (!childId || !familyCode) {
    return (
      <AuthScreen title={t('childUnlock.startAgain')} subtitle={t('childUnlock.startAgainHelp')}>
        <PrimaryButton
          label={t('childUnlock.enterCode')}
          onPress={() => router.replace('/(auth)/child-entry')}
        />
      </AuthScreen>
    );
  }

  async function onSubmit() {
    setError(null);
    const parsed = childPinSchema.safeParse({ pin });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? t('childUnlock.invalidPin'));
      return;
    }

    setLoading(true);
    try {
      await unlockChildByFamilyCode(familyCode, childId, parsed.data.pin);
      router.replace('/(app)/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('childUnlock.incorrectPin'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScreen title={t('childUnlock.hi', { name: childName })} subtitle={t('childUnlock.pinHelp')}>
      <PinInput
        label={t('childUnlock.yourPin')}
        value={pin}
        onChangeText={setPin}
        error={error ?? undefined}
      />
      <PrimaryButton
        label={t('guest.startLearning')}
        onPress={() => void onSubmit()}
        loading={loading}
      />
      <Pressable onPress={() => router.replace('/(auth)/child-entry')} className="py-2">
        <Text className="text-center text-sm font-medium text-brand-600">{t('common.back')}</Text>
      </Pressable>
    </AuthScreen>
  );
}
