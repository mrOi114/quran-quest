import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import {
  AuthScreen,
  createChildSchema,
  PinInput,
  PrimaryButton,
  TextField,
  useAuth,
} from '@/features/auth';

export default function ManageChildrenScreen() {
  const router = useRouter();
  const { profile, children, createChild, resetChildPin, isGuest } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [age, setAge] = useState('8');
  const [countryCode, setCountryCode] = useState('US');
  const [preferredLanguage, setPreferredLanguage] = useState('en');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetChildId, setResetChildId] = useState<string | null>(null);
  const [resetPin, setResetPin] = useState('');
  const [resetConfirmPin, setResetConfirmPin] = useState('');

  if (isGuest || profile?.role !== 'parent') {
    return <Redirect href="/(app)/home" />;
  }

  async function onCreateChild() {
    setFormError(null);
    setSuccess(null);
    setFieldErrors({});

    const parsed = createChildSchema.safeParse({
      displayName,
      age,
      avatarKey: 'default-1',
      countryCode,
      preferredLanguage,
      pin,
      confirmPin,
    });

    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? 'form');
        nextErrors[key] = issue.message;
      }
      setFieldErrors(nextErrors);
      return;
    }

    setLoading(true);
    try {
      const created = await createChild({
        displayName: parsed.data.displayName,
        age: parsed.data.age,
        avatarKey: parsed.data.avatarKey,
        countryCode: parsed.data.countryCode,
        preferredLanguage: parsed.data.preferredLanguage,
        pin: parsed.data.pin,
      });
      setSuccess(`Created ${created.display_name}`);
      setDisplayName('');
      setAge('8');
      setPin('');
      setConfirmPin('');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Could not create child');
    } finally {
      setLoading(false);
    }
  }

  async function onResetPin(childId: string) {
    setFormError(null);
    setSuccess(null);

    if (!/^\d{4,6}$/.test(resetPin) || resetPin !== resetConfirmPin) {
      setFormError('Enter a matching 4–6 digit PIN');
      return;
    }

    setLoading(true);
    try {
      await resetChildPin(childId, resetPin);
      setSuccess('PIN updated');
      setResetChildId(null);
      setResetPin('');
      setResetConfirmPin('');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Could not reset PIN');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScreen
      title="Manage children"
      subtitle="Create child profiles with a nickname, age, and secure PIN."
    >
      <Text className="mb-3 text-base font-semibold text-brand-800">Your children</Text>
      {children.length === 0 ? (
        <Text className="mb-4 text-sm text-brand-600">No children yet.</Text>
      ) : (
        children.map((child) => (
          <View
            key={child.id}
            className="mb-3 rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3"
          >
            <Text className="text-base font-semibold text-brand-800">
              {child.display_name}
            </Text>
            <Text className="mt-1 text-sm text-brand-500">
              Age {child.age} · {child.country_code} · {child.preferred_language}
            </Text>
            {resetChildId === child.id ? (
              <View className="mt-3">
                <PinInput label="New PIN" value={resetPin} onChangeText={setResetPin} />
                <PinInput
                  label="Confirm new PIN"
                  value={resetConfirmPin}
                  onChangeText={setResetConfirmPin}
                />
                <PrimaryButton
                  label="Save PIN"
                  onPress={() => void onResetPin(child.id)}
                  loading={loading}
                />
                <Pressable onPress={() => setResetChildId(null)} className="py-2">
                  <Text className="text-center text-sm text-brand-600">Cancel</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable onPress={() => setResetChildId(child.id)} className="mt-2 py-1">
                <Text className="text-sm font-medium text-brand-600">Reset PIN</Text>
              </Pressable>
            )}
          </View>
        ))
      )}

      <Text className="mb-3 mt-4 text-base font-semibold text-brand-800">
        Add a child
      </Text>
      <TextField
        label="Nickname"
        value={displayName}
        onChangeText={setDisplayName}
        error={fieldErrors.displayName}
      />
      <TextField
        label="Age"
        keyboardType="number-pad"
        value={age}
        onChangeText={setAge}
        error={fieldErrors.age}
      />
      <TextField
        label="Country code (e.g. US)"
        autoCapitalize="characters"
        value={countryCode}
        onChangeText={setCountryCode}
        error={fieldErrors.countryCode}
      />
      <TextField
        label="Preferred language (e.g. en)"
        autoCapitalize="none"
        value={preferredLanguage}
        onChangeText={setPreferredLanguage}
        error={fieldErrors.preferredLanguage}
      />
      <PinInput label="PIN" value={pin} onChangeText={setPin} error={fieldErrors.pin} />
      <PinInput
        label="Confirm PIN"
        value={confirmPin}
        onChangeText={setConfirmPin}
        error={fieldErrors.confirmPin}
      />

      {formError ? <Text className="mb-3 text-sm text-red-600">{formError}</Text> : null}
      {success ? <Text className="mb-3 text-sm text-brand-600">{success}</Text> : null}

      <PrimaryButton
        label="Create child"
        onPress={() => void onCreateChild()}
        loading={loading}
      />
      <PrimaryButton label="Back" onPress={() => router.back()} variant="secondary" />
    </AuthScreen>
  );
}
