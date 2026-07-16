import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import type { AccountRequiredFeature } from '../constants';
import { useAuth } from '../context/AuthContext';
import { canAccessAccountFeature } from '../utils/access';
import { PrimaryButton } from './PrimaryButton';

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
    title: 'AI Hifz Circles need an account',
    description:
      "Create a free account to join Circles with Abu Hafidul Qur'an and other learners.",
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
    title: 'Leaderboards need an account',
    description: 'Join encouraging weekly and monthly boards with a free account.',
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
  const { session, isGuest } = useAuth();
  const hasAccount = Boolean(session) && !isGuest;

  if (canAccessAccountFeature(feature, { hasAccount })) {
    return <>{children}</>;
  }

  const copy = defaultCopy[feature];

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
            label="Create Free Account"
            onPress={() => router.push('/(auth)/register')}
          />
          <PrimaryButton
            label="Log in"
            onPress={() => router.push('/(auth)/login')}
            variant="secondary"
          />
          <PrimaryButton
            label="Not now"
            onPress={() => router.back()}
            variant="secondary"
          />
        </View>
      </View>
    </View>
  );
}
