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

export default function ChildEntryScreen() {
  const router = useRouter();
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
        setError('No children in this family yet. Ask a parent to add your profile.');
      }
    } catch (err) {
      setChildren([]);
      setFamilyName(null);
      setResolvedCode(null);
      setError(err instanceof Error ? err.message : 'Family code not found');
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
    <AuthScreen
      title="Child / Learner"
      subtitle="Enter your family code, choose your name, then your PIN. No parent password needed."
    >
      <View className="mb-4 rounded-2xl border border-brand-100 bg-brand-50 px-4 py-4">
        <Text className="text-base font-semibold text-brand-800">How it works</Text>
        <Text className="mt-3 text-sm leading-5 text-brand-700">
          1. Ask a parent for the family code from their Family dashboard{'\n'}
          2. Enter the code and choose your name{'\n'}
          3. Enter your PIN → open your QuranFamily home
        </Text>
      </View>

      <TextField
        label="Family code"
        autoCapitalize="characters"
        autoCorrect={false}
        value={familyCode}
        onChangeText={setFamilyCode}
        error={error && children.length === 0 ? error : undefined}
      />
      <PrimaryButton
        label="Find my family"
        onPress={() => void onResolveCode()}
        loading={loading}
      />

      {resolvedCode && familyName ? (
        <Text className="mb-3 text-sm text-brand-600">
          Family of {familyName} · code {resolvedCode}
        </Text>
      ) : null}

      {children.map((child) => (
        <Pressable
          key={child.id}
          accessibilityRole="button"
          onPress={() => chooseChild(child)}
          className="mb-3 min-h-14 rounded-2xl border border-brand-100 bg-white px-4 py-4"
        >
          <Text className="text-lg font-semibold text-brand-800">
            {child.display_name}
          </Text>
          <Text className="mt-1 text-sm text-brand-500">
            Age {child.age ?? '—'} · enter PIN
          </Text>
        </Pressable>
      ))}

      {error && children.length > 0 ? (
        <Text className="mb-3 text-sm text-red-600">{error}</Text>
      ) : null}

      <PrimaryButton
        label="Parent connecting this device instead?"
        onPress={() => router.push('/(auth)/login')}
        variant="secondary"
      />
      <PrimaryButton
        label="Back"
        onPress={() => router.replace('/(auth)/welcome')}
        variant="secondary"
      />
    </AuthScreen>
  );
}
