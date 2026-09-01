import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import type { AccountRequiredFeature } from '../constants';
import { useAuth } from '../context/AuthContext';
import { canAccessAccountFeature } from '../utils/access';
import { PrimaryButton } from './PrimaryButton';
import { useI18n, type MessageKey } from '@/i18n';

const GATE_KEYS: Record<
  AccountRequiredFeature,
  { title: MessageKey; body: MessageKey }
> = {
  ai_hifz_circle: { title: 'circle.gateTitle', body: 'circle.gateBody' },
  cloud_backup: { title: 'gate.cloudBackup.title', body: 'gate.cloudBackup.body' },
  multi_device_sync: { title: 'gate.sync.title', body: 'gate.sync.body' },
  online_leaderboards: { title: 'guest.keepJourney', body: 'guest.progressValue' },
  parent_dashboard: { title: 'gate.parent.title', body: 'gate.parent.body' },
  family_management: { title: 'gate.family.title', body: 'gate.family.body' },
  teacher_features: { title: 'gate.teacher.title', body: 'gate.teacher.body' },
  scholar_features: { title: 'gate.scholar.title', body: 'gate.scholar.body' },
};

type AccountRequiredGateProps = {
  feature: AccountRequiredFeature;
  title?: string;
  description?: string;
  children: ReactNode;
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

  const copyKeys = GATE_KEYS[feature];
  const copy = {
    title: t(copyKeys.title),
    description: t(copyKeys.body),
  };

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
