import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import {
  AuthScreen,
  AvatarPicker,
  CountryPicker,
  createChildSchema,
  LanguagePicker,
  PinInput,
  PrimaryButton,
  TextField,
  updateChildSchema,
  useAuth,
} from '@/features/auth';

export default function ManageChildrenScreen() {
  const router = useRouter();
  const {
    profile,
    children,
    createChild,
    updateChild,
    deleteChild,
    resetChildPin,
    canManageFamily,
    isGuest,
  } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [age, setAge] = useState('8');
  const [avatarKey, setAvatarKey] = useState('default-1');
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
  const [editChildId, setEditChildId] = useState<string | null>(null);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editAge, setEditAge] = useState('');
  const [editAvatarKey, setEditAvatarKey] = useState('default-1');
  const [editCountryCode, setEditCountryCode] = useState('US');
  const [editPreferredLanguage, setEditPreferredLanguage] = useState('en');

  if (isGuest || profile?.role !== 'parent' || !canManageFamily) {
    return <Redirect href="/(app)/home" />;
  }

  function beginEdit(childId: string) {
    const child = children.find((item) => item.id === childId);
    if (!child) {
      return;
    }
    setEditChildId(childId);
    setResetChildId(null);
    setEditDisplayName(child.display_name);
    setEditAge(String(child.age ?? 8));
    setEditAvatarKey(child.avatar_key);
    setEditCountryCode(child.country_code);
    setEditPreferredLanguage(child.preferred_language);
    setFormError(null);
    setSuccess(null);
  }

  async function onCreateChild() {
    setFormError(null);
    setSuccess(null);
    setFieldErrors({});

    const parsed = createChildSchema.safeParse({
      displayName,
      age,
      avatarKey,
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
      setAvatarKey('default-1');
      setPin('');
      setConfirmPin('');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Could not create child');
    } finally {
      setLoading(false);
    }
  }

  async function onSaveEdit(childId: string) {
    setFormError(null);
    setSuccess(null);

    const parsed = updateChildSchema.safeParse({
      displayName: editDisplayName,
      age: editAge,
      avatarKey: editAvatarKey,
      countryCode: editCountryCode,
      preferredLanguage: editPreferredLanguage,
    });

    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? 'Check the child details');
      return;
    }

    setLoading(true);
    try {
      await updateChild(childId, parsed.data);
      setSuccess('Child updated');
      setEditChildId(null);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Could not update child');
    } finally {
      setLoading(false);
    }
  }

  async function onDeleteChild(childId: string, name: string) {
    setFormError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await deleteChild(childId);
      setSuccess(`Removed ${name}`);
      setEditChildId(null);
      setResetChildId(null);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Could not delete child');
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
      subtitle="Create child profiles with a nickname, age, avatar, country flag, language, and secure PIN."
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
              Age {child.age} · {child.country_code} · {child.preferred_language} ·{' '}
              {child.avatar_key}
            </Text>

            {editChildId === child.id ? (
              <View className="mt-3">
                <TextField
                  label="Nickname"
                  value={editDisplayName}
                  onChangeText={setEditDisplayName}
                />
                <TextField
                  label="Age"
                  keyboardType="number-pad"
                  value={editAge}
                  onChangeText={setEditAge}
                />
                <AvatarPicker value={editAvatarKey} onChange={setEditAvatarKey} />
                <CountryPicker value={editCountryCode} onChange={setEditCountryCode} />
                <LanguagePicker
                  value={editPreferredLanguage}
                  onChange={setEditPreferredLanguage}
                />
                <PrimaryButton
                  label="Save changes"
                  onPress={() => void onSaveEdit(child.id)}
                  loading={loading}
                />
                <PrimaryButton
                  label="Delete child"
                  onPress={() => void onDeleteChild(child.id, child.display_name)}
                  loading={loading}
                  variant="secondary"
                />
                <Pressable onPress={() => setEditChildId(null)} className="py-2">
                  <Text className="text-center text-sm text-brand-600">Cancel</Text>
                </Pressable>
              </View>
            ) : resetChildId === child.id ? (
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
              <View className="mt-2 flex-row gap-4">
                <Pressable onPress={() => beginEdit(child.id)} className="py-1">
                  <Text className="text-sm font-medium text-brand-600">Edit</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setResetChildId(child.id);
                    setEditChildId(null);
                  }}
                  className="py-1"
                >
                  <Text className="text-sm font-medium text-brand-600">Reset PIN</Text>
                </Pressable>
              </View>
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
      <AvatarPicker
        value={avatarKey}
        onChange={setAvatarKey}
        error={fieldErrors.avatarKey}
      />
      <CountryPicker
        value={countryCode}
        onChange={setCountryCode}
        error={fieldErrors.countryCode}
      />
      <LanguagePicker
        value={preferredLanguage}
        onChange={setPreferredLanguage}
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
