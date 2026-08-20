import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { PrimaryButton } from '@/features/auth';
import { useI18n } from '@/i18n';

import { useCircle } from '../hooks/useCircle';
import {
  approveTeacher,
  fetchPendingTeachers,
  localizeGroupError,
  permanentlyRemoveCircleMember,
  setCircleAudioEnabled,
  setCircleChatEnabled,
  timeoutCircleMember,
} from '../services';
import type { PendingTeacher } from '../types';

export function CircleSettingsScreen({ circleId }: { circleId: string }) {
  const router = useRouter();
  const { language, t } = useI18n();
  const { circle, error, loading, reload, setCircle } = useCircle(circleId);
  const [formError, setFormError] = useState<string | null>(null);
  const [pendingTeachers, setPendingTeachers] = useState<PendingTeacher[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!circle?.canManage) {
      return;
    }
    void fetchPendingTeachers()
      .then(setPendingTeachers)
      .catch(() => setPendingTeachers([]));
  }, [circle?.canManage]);

  async function run(action: () => Promise<typeof circle>) {
    setFormError(null);
    setBusy(true);
    try {
      const next = await action();
      if (next) {
        setCircle(next);
      }
      await reload();
    } catch (err) {
      setFormError(localizeGroupError(err instanceof Error ? err.message : null, language));
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-brand-600">
        <Text className="text-base text-brand-50">{t('common.loading')}</Text>
      </SafeAreaView>
    );
  }

  if (!circle || (!circle.isAdmin && !circle.canManage)) {
    return (
      <SafeAreaView className="flex-1 bg-brand-600 px-6">
        <View className="mt-10 rounded-3xl bg-white px-5 py-6">
          <Text className="text-2xl font-semibold text-brand-800">{t('groups.settings')}</Text>
          <Text className="mt-3 text-base text-brand-600">
            {localizeGroupError(error, language, 'groups.adminOnly')}
          </Text>
          <View className="mt-6">
            <PrimaryButton label={t('common.back')} onPress={() => router.back()} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-brand-600">
      <View className="px-5 pb-6 pt-4">
        <Text className="text-sm font-semibold uppercase tracking-wide text-brand-100">
          {t('groups.settings')}
        </Text>
        <Text className="mt-2 text-3xl font-bold text-white">{circle.name}</Text>

        <View className="mt-5 rounded-3xl bg-white px-5 py-5">
          <Text className="text-base font-semibold text-brand-800">{t('groups.chatControl')}</Text>
          <Text className="mt-1 text-sm text-brand-600">
            {circle.chatEnabled ? t('groups.chatOnHelp') : t('groups.chatOff')}
          </Text>
          <View className="mt-3">
            <PrimaryButton
              label={circle.chatEnabled ? t('groups.turnChatOff') : t('groups.turnChatOn')}
              onPress={() => void run(() => setCircleChatEnabled(circle.id, !circle.chatEnabled))}
              loading={busy}
              variant="secondary"
            />
          </View>

          <Text className="mt-4 text-base font-semibold text-brand-800">{t('groups.audio')}</Text>
          {circle.kind === 'public' ? (
            <Text className="mt-1 text-sm text-brand-600">{t('groups.publicAudioOff')}</Text>
          ) : (
            <>
              <Text className="mt-1 text-sm text-brand-600">{t('groups.madrasahAudioHelp')}</Text>
              <View className="mt-3">
                <PrimaryButton
                  label={circle.audioEnabled ? t('groups.turnAudioOff') : t('groups.turnAudioOn')}
                  onPress={() =>
                    void run(() => setCircleAudioEnabled(circle.id, !circle.audioEnabled))
                  }
                  loading={busy}
                  variant="secondary"
                />
              </View>
            </>
          )}

          <Text className="mb-2 mt-5 text-base font-semibold text-brand-800">
            {t('groups.moderation')}
          </Text>
          {circle.members
            .filter((member) => member.profileId !== circle.creatorId && member.memberRole !== 'admin')
            .map((member) => (
              <View key={member.profileId} className="mb-3 rounded-2xl border border-brand-100 px-4 py-3">
                <Text className="text-base font-semibold text-brand-800">{member.displayName}</Text>
                <Text className="mt-1 text-sm capitalize text-brand-500">{member.memberRole}</Text>
                {circle.isAdmin ? (
                  <View className="mt-3 flex-row gap-2">
                    <Pressable
                      accessibilityRole="button"
                      disabled={busy}
                      onPress={() =>
                        void run(() => timeoutCircleMember(circle.id, member.profileId))
                      }
                      className="min-h-11 flex-1 items-center justify-center rounded-xl bg-brand-50 px-2"
                    >
                      <Text className="text-center text-xs font-semibold text-brand-800">
                        {t('groups.removeHour')}
                      </Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      disabled={busy}
                      onPress={() =>
                        void run(() => permanentlyRemoveCircleMember(circle.id, member.profileId))
                      }
                      className="min-h-11 flex-1 items-center justify-center rounded-xl border border-red-200 px-2"
                    >
                      <Text className="text-center text-xs font-semibold text-red-700">
                        {t('groups.removeForever')}
                      </Text>
                    </Pressable>
                  </View>
                ) : null}
              </View>
            ))}

          {pendingTeachers.length > 0 ? (
            <View className="mt-4">
              <Text className="mb-2 text-base font-semibold text-brand-800">
                {t('groups.pendingTeachers')}
              </Text>
              {pendingTeachers.map((teacher) => (
                <Pressable
                  key={teacher.profileId}
                  accessibilityRole="button"
                  disabled={busy}
                  onPress={() => {
                    setBusy(true);
                    void approveTeacher(teacher.profileId)
                      .then(() => fetchPendingTeachers().then(setPendingTeachers))
                      .catch((err) =>
                        setFormError(
                          localizeGroupError(err instanceof Error ? err.message : null, language),
                        ),
                      )
                      .finally(() => setBusy(false));
                  }}
                  className="mb-2 rounded-2xl border border-brand-100 px-4 py-3"
                >
                  <Text className="text-base font-semibold text-brand-800">
                    {teacher.displayName}
                  </Text>
                  <Text className="mt-1 text-sm text-brand-500">{t('groups.approveTeacher')}</Text>
                </Pressable>
              ))}
            </View>
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
