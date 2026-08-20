import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, type Href } from 'expo-router';

import { PrimaryButton, useAuth } from '@/features/auth';
import { useI18n } from '@/i18n';

import { useCircle } from '../hooks/useCircle';
import {
  connectChildToCircle,
  localizeGroupError,
} from '../services';

export function CircleDetailScreen({ circleId }: { circleId: string }) {
  const router = useRouter();
  const { language, t } = useI18n();
  const { children, canManageFamily, profile } = useAuth();
  const { circle, error, loading, reload } = useCircle(circleId);
  const [formError, setFormError] = useState<string | null>(null);
  const [connectingId, setConnectingId] = useState<string | null>(null);

  async function onConnectChild(childId: string) {
    setFormError(null);
    setConnectingId(childId);
    try {
      await connectChildToCircle(circleId, childId);
      await reload();
    } catch (err) {
      setFormError(localizeGroupError(err instanceof Error ? err.message : null, language));
    } finally {
      setConnectingId(null);
    }
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-brand-600">
        <Text className="text-base text-brand-50">{t('common.loading')}</Text>
      </SafeAreaView>
    );
  }

  if (!circle) {
    return (
      <SafeAreaView className="flex-1 bg-brand-600 px-6">
        <View className="mt-10 rounded-3xl bg-white px-5 py-6">
          <Text className="text-2xl font-semibold text-brand-800">{t('groups.title')}</Text>
          <Text className="mt-3 text-base text-brand-600">
            {localizeGroupError(error, language)}
          </Text>
          <View className="mt-6">
            <PrimaryButton label={t('common.back')} onPress={() => router.back()} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const icon = circle.kind === 'madrasah' ? '🕌' : '🌍';
  const kindLabel = circle.kind === 'madrasah' ? t('groups.madrasah') : t('groups.public');
  const connectedChildIds = new Set(circle.members.map((member) => member.profileId));

  return (
    <SafeAreaView className="flex-1 bg-brand-600">
      <View className="px-5 pb-6 pt-4">
        <Text className="text-sm font-semibold uppercase tracking-wide text-brand-100">
          {kindLabel}
        </Text>
        <Text className="mt-2 text-3xl font-bold text-white">
          {icon} {circle.name}
        </Text>
        <Text className="mt-2 text-base text-brand-100">
          {t('groups.memberCount', { count: circle.memberCount, max: circle.memberLimit })}
        </Text>

        <View className="mt-5 rounded-3xl bg-white px-5 py-5">
          {circle.timedOut ? (
            <View className="mb-4 rounded-2xl bg-amber-50 px-4 py-4">
              <Text className="text-sm leading-5 text-amber-800">{t('groups.timeout')}</Text>
            </View>
          ) : null}

          <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
            {t('groups.joinCode')}
          </Text>
          <Text
            accessibilityLabel={t('groups.joinCodeA11y', { code: circle.joinCode.split('').join(' ') })}
            className="mt-2 text-3xl font-bold tracking-widest text-brand-800"
          >
            {circle.joinCode}
          </Text>
          <Text className="mt-2 text-sm text-brand-600">{t('groups.shareCodeHelp')}</Text>
          <Text className="mt-2 text-xs text-brand-500">{t('groups.privacyNote')}</Text>

          <View className="mt-5 flex-row gap-3">
            <Pressable
              accessibilityRole="button"
              disabled={circle.timedOut || !circle.chatEnabled}
              onPress={() => router.push(`/(app)/circle/${circle.id}/chat` as Href)}
              className="min-h-12 flex-1 items-center justify-center rounded-xl bg-brand-600 px-3 py-3"
            >
              <Text className="text-sm font-semibold text-white">{t('groups.chat')}</Text>
            </Pressable>
            {circle.isAdmin || circle.canManage ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push(`/(app)/circle/${circle.id}/settings` as Href)}
                className="min-h-12 flex-1 items-center justify-center rounded-xl border border-brand-600 px-3 py-3"
              >
                <Text className="text-sm font-semibold text-brand-700">{t('groups.settings')}</Text>
              </Pressable>
            ) : null}
          </View>

          {circle.kind === 'public' || !circle.audioEnabled ? (
            <Text className="mt-3 text-sm text-brand-600">{t('groups.audioOff')}</Text>
          ) : (
            <Text className="mt-3 text-sm text-brand-600">{t('groups.audioProtected')}</Text>
          )}

          <Text className="mb-2 mt-5 text-base font-semibold text-brand-800">
            {t('groups.members')}
          </Text>
          {circle.members.map((member) => (
            <View key={member.profileId} className="mb-2 rounded-2xl border border-brand-100 px-4 py-3">
              <Text className="text-base font-semibold text-brand-800">{member.displayName}</Text>
              <Text className="mt-1 text-sm capitalize text-brand-500">
                {member.memberRole}
                {member.timedOut ? ` · ${t('groups.timedOutMember')}` : ''}
              </Text>
            </View>
          ))}

          {canManageFamily && children.length > 0 && !circle.timedOut ? (
            <View className="mt-4">
              <Text className="mb-2 text-base font-semibold text-brand-800">
                {t('groups.connectChild')}
              </Text>
              {children.map((child) => (
                <Pressable
                  key={child.id}
                  accessibilityRole="button"
                  disabled={connectedChildIds.has(child.id) || connectingId === child.id}
                  onPress={() => void onConnectChild(child.id)}
                  className="mb-2 rounded-2xl border border-brand-100 px-4 py-3"
                >
                  <Text className="text-base font-semibold text-brand-800">
                    {child.display_name}
                  </Text>
                  <Text className="mt-1 text-sm text-brand-500">
                    {connectedChildIds.has(child.id)
                      ? t('groups.childConnected')
                      : t('groups.tapToConnect')}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : null}

          {profile?.role === 'child' ? (
            <Text className="mt-3 text-sm text-brand-600">{t('groups.childSafetyNote')}</Text>
          ) : null}

          {formError ? <Text className="mt-3 text-sm text-red-600">{formError}</Text> : null}

          <View className="mt-4">
            <PrimaryButton label={t('common.back')} onPress={() => router.back()} variant="secondary" />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
