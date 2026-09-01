import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import {
  AuthScreen,
  PrimaryButton,
  TextField,
  resolveFamilyCode,
  type FamilyCodeChild,
} from '@/features/auth';
import { useI18n } from '@/i18n';

export default function ChildEntryScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const [familyCode, setFamilyCode] = useState('');
  const [children, setChildren] = useState<FamilyCodeChild[]>([]);
  const [familyName, setFamilyName] = useState<string | null>(null);
  const [resolvedCode, setResolvedCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onResolveCode() {
    setError(null);
    setLoading(true);
    try {
      const resolved = await resolveFamilyCode(familyCode);
      setChildren(resolved.children);
      setFamilyName(resolved.familyName);
      setResolvedCode(resolved.familyCode);
      if (resolved.children.length === 0) {
        setError(t('childEntry.noChildren'));
      }
    } catch (err) {
      setChildren([]);
      setFamilyName(null);
      setResolvedCode(null);
      setError(err instanceof Error ? err.message : t('childEntry.codeNotFound'));
    } finally {
      setLoading(false);
    }
  }

  function chooseChild(child: FamilyCodeChild) {
    if (!resolvedCode) {
      return;
    }
    router.push({
      pathname: '/(auth)/child-unlock',
      params: {
        childId: child.id,
        familyCode: resolvedCode,
        childName: child.display_name,
      },
    });
  }

  return (
    <AuthScreen title={t('childEntry.title')} subtitle={t('childEntry.subtitle')}>
      <View className="mb-4 rounded-2xl border border-brand-100 bg-brand-50 px-4 py-4">
        <Text className="text-base font-semibold text-brand-800">{t('childEntry.howItWorks')}</Text>
        <Text className="mt-3 text-sm leading-5 text-brand-700">
          {t('childEntry.step1')}
          {'\n'}
          {t('childEntry.step2')}
          {'\n'}
          {t('childEntry.step3')}
        </Text>
      </View>

      <TextField
        label={t('childEntry.familyCode')}
        autoCapitalize="characters"
        autoCorrect={false}
        value={familyCode}
        onChangeText={setFamilyCode}
        error={error && children.length === 0 ? error : undefined}
      />
      <PrimaryButton
        label={t('childEntry.findFamily')}
        onPress={() => void onResolveCode()}
        loading={loading}
      />

      {resolvedCode && familyName ? (
        <Text className="mb-3 text-sm text-brand-600">
          {t('childEntry.familyOf', { name: familyName, code: resolvedCode })}
        </Text>
      ) : null}

      {children.map((child) => (
        <Pressable
          key={child.id}
          accessibilityRole="button"
          onPress={() => chooseChild(child)}
          className="mb-3 min-h-14 rounded-2xl border border-brand-100 bg-white px-4 py-4"
        >
          <Text className="text-lg font-semibold text-brand-800">{child.display_name}</Text>
          <Text className="mt-1 text-sm text-brand-500">
            {t('childEntry.agePin', { age: child.age ?? '—' })}
          </Text>
        </Pressable>
      ))}

      {error && children.length > 0 ? (
        <Text className="mb-3 text-sm text-red-600">{error}</Text>
      ) : null}

      <PrimaryButton
        label={t('childEntry.parentInstead')}
        onPress={() => router.push('/(auth)/login')}
        variant="secondary"
      />
      <PrimaryButton
        label={t('common.back')}
        onPress={() => router.replace('/(auth)/welcome')}
        variant="secondary"
      />
    </AuthScreen>
  );
}
