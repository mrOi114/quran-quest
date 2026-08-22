import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import type { AccountRequiredFeature } from '../constants';
import { useAuth } from '../context/AuthContext';
import { canAccessAccountFeature } from '../utils/access';
import { PrimaryButton } from './PrimaryButton';
import { useI18n } from '@/i18n';

type AccountRequiredGateProps = {
  feature: AccountRequiredFeature;
  title?: string;
  description?: string;
  children: ReactNode;
};

const defaultCopy: Record<
  AccountRequiredFeature,
  { title: string; description: string }
> = {
  ai_hifz_circle: {
    title: '⭐ Keep your Qur\'an journey',
    description:
      "You've already made progress. Create your free account to join Circles, save your streak, and keep learning with QuranFamily.",
  },
  cloud_backup: {
    title: 'Cloud backup needs an account',
    description: 'Save your Hifz progress safely in the cloud with a free account.',
  },
  multi_device_sync: {
    title: 'Sync needs an account',
    description: "Continue on any device by creating a free Qur'an Quest account.",
  },
  online_leaderboards: {
    title: '⭐ Keep your Qur\'an journey',
    description:
      'Create your free account to save your points, keep your achievements, and appear on the Leaderboard with your country flag.',
  },
  parent_dashboard: {
    title: 'Parent Dashboard needs an account',
    description: 'Create a Parent account to manage children and view progress.',
  },
  family_management: {
    title: 'Family tools need an account',
    description: 'Create a Parent account to add children and manage family learning.',
  },
  teacher_features: {
    title: 'Teacher tools need an account',
    description: 'Sign in with an approved teacher account to continue.',
  },
  scholar_features: {
    title: 'Scholar tools need an account',
    description: 'Sign in with an approved scholar account to continue.',
  },
};

export function AccountRequiredGate({
  feature,
  title,
  description,
  children,
}: AccountRequiredGateProps) {
  const router = useRouter();
  const { t } = useI18n();
  const { session, isGuest } = useAuth();
  const hasAccount = Boolean(session) && !isGuest;

  if (canAccessAccountFeature(feature, { hasAccount })) {
    return <>{children}</>;
  }

  const copy =
    feature === 'ai_hifz_circle'
      ? { title: t('circle.gateTitle'), description: t('circle.gateBody') }
      : feature === 'online_leaderboards'
        ? { title: t('guest.keepJourney'), description: t('guest.progressValue') }
        : defaultCopy[feature];

  return (
    <View className="flex-1 items-center justify-center bg-brand-600 px-6">
      <View className="w-full rounded-3xl bg-white px-5 py-6">
        <Text className="text-2xl font-semibold text-brand-800">
          {title ?? copy.title}
        </Text>
        <Text className="mt-3 text-base text-brand-600">
          {description ?? copy.description}
        </Text>
        <View className="mt-6">
          <PrimaryButton
            label={t('common.maybeLater')}
            onPress={() => router.replace('/(app)/home')}
          />
          <PrimaryButton
            label={t('common.createFreeAccount')}
            onPress={() => router.push('/(auth)/register')}
            variant="secondary"
          />
          <PrimaryButton
            label={t('common.logIn')}
            onPress={() => router.push('/(auth)/login')}
            variant="secondary"
          />
        </View>
      </View>
    </View>
  );
}
