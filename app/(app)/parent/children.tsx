import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import {
  AuthScreen,
  CountryPicker,
  GenderPicker,
  LanguagePicker,
  PinInput,
  PrimaryButton,
  TextField,
  updateChildSchema,
  useAuth,
  type ChildGender,
} from '@/features/auth';
import {
  avatarKeyFromGender,
  genderFromAvatarKey,
  genderLabel,
} from '@/features/auth/utils/childGender';
import { useI18n } from '@/i18n';

export default function ManageChildrenScreen() {
  const router = useRouter();
  const {
    profile,
    children,
    updateChild,
    deleteChild,
    resetChildPin,
    updateChildComms,
    canManageFamily,
    isGuest,
  } = useAuth();
  const { t } = useI18n();
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetChildId, setResetChildId] = useState<string | null>(null);
  const [resetPin, setResetPin] = useState('');
  const [resetConfirmPin, setResetConfirmPin] = useState('');
  const [editChildId, setEditChildId] = useState<string | null>(null);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editAge, setEditAge] = useState('');
  const [editGender, setEditGender] = useState<ChildGender>('girl');
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
    setEditGender(genderFromAvatarKey(child.avatar_key) ?? 'girl');
    setEditCountryCode(child.country_code);
    setEditPreferredLanguage(child.preferred_language);
    setFormError(null);
    setSuccess(null);
  }

  async function onSaveEdit(childId: string) {
    setFormError(null);
    setSuccess(null);

    const parsed = updateChildSchema.safeParse({
      displayName: editDisplayName,
      age: editAge,
      gender: editGender,
      avatarKey: avatarKeyFromGender(editGender),
      countryCode: editCountryCode,
      preferredLanguage: editPreferredLanguage,
    });

    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? t('family.checkDetails'));
      return;
    }

    setLoading(true);
    try {
      await updateChild(childId, {
        displayName: parsed.data.displayName,
        age: parsed.data.age,
        avatarKey: parsed.data.avatarKey,
        countryCode: parsed.data.countryCode,
        preferredLanguage: parsed.data.preferredLanguage,
      });
      setSuccess(t('family.childUpdated'));
      setEditChildId(null);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : t('family.updateChildError'));
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
      setSuccess(t('family.childRemoved', { name }));
      setEditChildId(null);
      setResetChildId(null);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : t('family.deleteChildError'));
    } finally {
      setLoading(false);
    }
  }

  async function onResetPin(childId: string) {
    setFormError(null);
    setSuccess(null);

    if (!/^\d{4,6}$/.test(resetPin) || resetPin !== resetConfirmPin) {
      setFormError(t('family.pinMismatch'));
      return;
    }

    setLoading(true);
    try {
      await resetChildPin(childId, resetPin);
      setSuccess(t('family.pinUpdated'));
      setResetChildId(null);
      setResetPin('');
      setResetConfirmPin('');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : t('family.resetPinError'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScreen title={t('family.manageChildren')} subtitle={t('family.manageChildrenHelp')}>
      <PrimaryButton
        label={t('family.addChild')}
        onPress={() => router.push('/(app)/parent/add-child' as never)}
      />

      <Text className="mb-3 mt-2 text-base font-semibold text-brand-800">
        {t('family.yourChildren')}
      </Text>
      {children.length === 0 ? (
        <Text className="mb-4 text-sm text-brand-600">{t('family.noChildrenShort')}</Text>
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
              {t('family.ageLine', { age: child.age ?? '—' })}
              {genderLabel(child.avatar_key) === 'Girl'
                ? ` · ${t('gender.girl')}`
                : genderLabel(child.avatar_key) === 'Boy'
                  ? ` · ${t('gender.boy')}`
                  : ''}
              {' · '}
              {child.country_code} · {child.preferred_language}
            </Text>
            <Text className="mt-2 text-sm text-brand-600">
              {t('family.chatStatus', {
                chat: child.chat_enabled === false ? t('family.off') : t('family.on'),
                calls: child.calls_enabled === false ? t('family.off') : t('family.on'),
              })}
            </Text>

            {editChildId === child.id ? (
              <View className="mt-3">
                <TextField
                  label={t('family.nickname')}
                  value={editDisplayName}
                  onChangeText={setEditDisplayName}
                />
                <TextField
                  label={t('family.age')}
                  keyboardType="number-pad"
                  value={editAge}
                  onChangeText={setEditAge}
                />
                <GenderPicker value={editGender} onChange={setEditGender} />
                <CountryPicker value={editCountryCode} onChange={setEditCountryCode} />
                <LanguagePicker
                  value={editPreferredLanguage}
                  onChange={setEditPreferredLanguage}
                />
                <PrimaryButton
                  label={t('family.saveChanges')}
                  onPress={() => void onSaveEdit(child.id)}
                  loading={loading}
                />
                <PrimaryButton
                  label={t('family.deleteChild')}
                  onPress={() => void onDeleteChild(child.id, child.display_name)}
                  loading={loading}
                  variant="secondary"
                />
                <Pressable onPress={() => setEditChildId(null)} className="py-2">
                  <Text className="text-center text-sm text-brand-600">{t('family.cancel')}</Text>
                </Pressable>
              </View>
            ) : resetChildId === child.id ? (
              <View className="mt-3">
                <PinInput label={t('family.newPin')} value={resetPin} onChangeText={setResetPin} />
                <PinInput
                  label={t('family.confirmNewPin')}
                  value={resetConfirmPin}
                  onChangeText={setResetConfirmPin}
                />
                <PrimaryButton
                  label={t('family.savePin')}
                  onPress={() => void onResetPin(child.id)}
                  loading={loading}
                />
                <Pressable onPress={() => setResetChildId(null)} className="py-2">
                  <Text className="text-center text-sm text-brand-600">{t('family.cancel')}</Text>
                </Pressable>
              </View>
            ) : (
              <View className="mt-2 flex-row flex-wrap gap-4">
                <Pressable onPress={() => beginEdit(child.id)} className="py-1">
                  <Text className="text-sm font-medium text-brand-600">{t('family.edit')}</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setResetChildId(child.id);
                    setEditChildId(null);
                  }}
                  className="py-1"
                >
                  <Text className="text-sm font-medium text-brand-600">{t('family.resetPinAction')}</Text>
                </Pressable>
                <Pressable
                  onPress={() =>
                    void updateChildComms(child.id, {
                      chatEnabled: child.chat_enabled === false,
                      callsEnabled: child.calls_enabled !== false,
                    })
                  }
                  className="py-1"
                >
                  <Text className="text-sm font-medium text-brand-600">
                    {child.chat_enabled === false ? t('family.enableChat') : t('family.pauseChat')}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() =>
                    void updateChildComms(child.id, {
                      chatEnabled: child.chat_enabled !== false,
                      callsEnabled: child.calls_enabled === false,
                    })
                  }
                  className="py-1"
                >
                  <Text className="text-sm font-medium text-brand-600">
                    {child.calls_enabled === false ? t('family.enableCalls') : t('family.pauseCalls')}
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        ))
      )}

      {formError ? <Text className="mb-3 text-sm text-red-600">{formError}</Text> : null}
      {success ? <Text className="mb-3 text-sm text-brand-600">{success}</Text> : null}

      <PrimaryButton
        label={t('family.backToMyFamily')}
        onPress={() => router.replace('/(app)/parent/dashboard')}
        variant="secondary"
      />
    </AuthScreen>
  );
}
