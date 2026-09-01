import { Redirect, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import {
  AuthScreen,
  CountryPicker,
  GenderPicker,
  LanguagePicker,
  PinInput,
  PrimaryButton,
  TextField,
  createChildSchema,
  useAuth,
  type ChildGender,
} from '@/features/auth';
import { avatarKeyFromGender } from '@/features/auth/utils/childGender';
import { useI18n } from '@/i18n';

type ConfirmState = {
  displayName: string;
  pin: string;
  familyCode: string;
};

export default function AddChildScreen() {
  const router = useRouter();
  const {
    profile,
    createChild,
    canManageFamily,
    isGuest,
    familyCode,
    ensureFamilyCode,
  } = useAuth();
  const { t } = useI18n();
  const [displayName, setDisplayName] = useState('');
  const [age, setAge] = useState('8');
  const [gender, setGender] = useState<ChildGender>('girl');
  const [countryCode, setCountryCode] = useState(profile?.country_code ?? 'US');
  const [preferredLanguage, setPreferredLanguage] = useState(
    profile?.preferred_language ?? 'en',
  );
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmation, setConfirmation] = useState<ConfirmState | null>(null);

  useEffect(() => {
    void ensureFamilyCode().catch(() => undefined);
  }, [ensureFamilyCode]);

  if (isGuest || profile?.role !== 'parent' || !canManageFamily) {
    return <Redirect href="/(app)/home" />;
  }

  async function onCreateChild() {
    setFormError(null);
    setFieldErrors({});

    const parsed = createChildSchema.safeParse({
      displayName,
      age,
      gender,
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
      const code = familyCode || (await ensureFamilyCode());
      const created = await createChild({
        displayName: parsed.data.displayName,
        age: parsed.data.age,
        avatarKey: avatarKeyFromGender(parsed.data.gender),
        countryCode: parsed.data.countryCode,
        preferredLanguage: parsed.data.preferredLanguage,
        pin: parsed.data.pin,
      });
      setConfirmation({
        displayName: created.display_name,
        pin: parsed.data.pin,
        familyCode: code,
      });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : t('family.createChildError'));
    } finally {
      setLoading(false);
    }
  }

  if (confirmation) {
    return (
      <AuthScreen
        title={t('family.childReady', { name: confirmation.displayName })}
        subtitle={t('family.shareLoginHelp')}
      >
        <View className="mb-4 rounded-2xl border border-brand-100 bg-brand-50 px-4 py-4">
          <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
            {t('family.howTheyLogIn')}
          </Text>
          <Text className="mt-3 text-sm leading-6 text-brand-700">
            {t('family.loginStep1')}
            {'\n'}
            {t('family.loginStep2')}
            {'\n'}
            {t('family.loginStep3')}
            {'\n'}
            {t('family.loginStep4', { name: confirmation.displayName })}
            {'\n'}
            {t('family.loginStep5')}
          </Text>
        </View>

        <View className="mb-4 rounded-2xl border border-brand-100 bg-white px-4 py-4">
          <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
            {t('family.loginInfo')}
          </Text>
          <Text className="mt-3 text-base text-brand-800">
            {t('family.loginName', { name: confirmation.displayName })}
          </Text>
          <Text className="mt-2 text-base text-brand-800">
            {t('family.loginFamilyCode', {
              code: confirmation.familyCode || t('family.askFamilyCode'),
            })}
          </Text>
          <Text className="mt-2 text-base text-brand-800">
            {t('family.loginPin', { pin: confirmation.pin })}
          </Text>
          <Text className="mt-3 text-sm leading-5 text-brand-600">{t('family.pinOnce')}</Text>
        </View>

        <PrimaryButton
          label={t('family.backToMyFamily')}
          onPress={() => router.replace('/(app)/parent/dashboard')}
        />
        <PrimaryButton
          label={t('family.addAnother')}
          onPress={() => {
            setConfirmation(null);
            setDisplayName('');
            setAge('8');
            setGender('girl');
            setPin('');
            setConfirmPin('');
            setFieldErrors({});
            setFormError(null);
          }}
          variant="secondary"
        />
      </AuthScreen>
    );
  }

  return (
    <AuthScreen title={t('family.addChildTitle')} subtitle={t('family.addChildSubtitle')}>
      <TextField
        label={t('family.nickname')}
        value={displayName}
        onChangeText={setDisplayName}
        error={fieldErrors.displayName}
      />
      <TextField
        label={t('family.age')}
        keyboardType="number-pad"
        value={age}
        onChangeText={setAge}
        error={fieldErrors.age}
      />
      <GenderPicker value={gender} onChange={setGender} error={fieldErrors.gender} />
      <PinInput
        label={t('family.childPin')}
        value={pin}
        onChangeText={setPin}
        error={fieldErrors.pin}
      />
      <PinInput
        label={t('family.confirmPin')}
        value={confirmPin}
        onChangeText={setConfirmPin}
        error={fieldErrors.confirmPin}
      />

      <Pressable onPress={() => setShowAdvanced((value) => !value)} className="mb-3 py-1">
        <Text className="text-sm font-medium text-brand-600">
          {showAdvanced ? t('family.hideCountryLanguage') : t('family.showCountryLanguage')}
        </Text>
      </Pressable>

      {showAdvanced ? (
        <>
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
        </>
      ) : null}

      {formError ? <Text className="mb-3 text-sm text-red-600">{formError}</Text> : null}

      <PrimaryButton
        label={t('family.createChild')}
        onPress={() => void onCreateChild()}
        loading={loading}
      />
      <PrimaryButton
        label={t('family.backToMyFamily')}
        onPress={() => router.replace('/(app)/parent/dashboard')}
        variant="secondary"
      />
    </AuthScreen>
  );
}
