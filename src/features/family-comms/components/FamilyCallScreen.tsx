import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, type Href } from 'expo-router';

import { PrimaryButton } from '@/features/auth';
import { useI18n } from '@/i18n';

import { callableMembers } from '../services/familyMembership';
import { localizeFamilyError } from '../services/localizeFamilyError';
import { useFamilyComms } from './FamilyCommsProvider';

export function FamilyCallScreen() {
  const router = useRouter();
  const { language, t } = useI18n();
  const { circle, loading, error: circleError, canUseFamilyComms, call } = useFamilyComms();
  const members = circle ? callableMembers(circle) : [];
  const peer =
    call.activeCall && circle
      ? circle.members.find(
          (member) =>
            member.id ===
            (call.activeCall?.created_by === circle.actorId
              ? call.activeCall.callee_id
              : call.activeCall?.created_by),
        )
      : null;

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-brand-600">
        <Text className="text-base text-brand-50">{t('call.loading')}</Text>
      </SafeAreaView>
    );
  }

  if (!canUseFamilyComms || !circle) {
    return (
      <SafeAreaView className="flex-1 bg-brand-600 px-6">
        <View className="mt-10 rounded-3xl bg-white px-5 py-6">
          <Text className="text-2xl font-semibold text-brand-800">{t('call.title')}</Text>
          <Text className="mt-3 text-base text-brand-600">
            {localizeFamilyError(circleError, language, 'call.membersOnly')}
          </Text>
          <View className="mt-6">
            <PrimaryButton label={t('common.back')} onPress={() => router.back()} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const inCall = Boolean(call.activeCall && call.activeCall.status !== 'ended');
  const statusLabel =
    call.activeCall?.status === 'accepted'
      ? t('call.connected')
      : call.activeCall?.status === 'ringing'
        ? t('call.ringing')
        : call.statusLabel;

  return (
    <SafeAreaView className="flex-1 bg-brand-600">
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View className="rounded-3xl bg-white px-5 py-6">
          <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
            {t('family.call')}
          </Text>
          <Text className="mt-2 text-3xl font-bold text-brand-800">
            {inCall ? peer?.display_name ?? t('call.familyMember') : t('call.callMember')}
          </Text>
          <Text className="mt-2 text-base text-brand-600">
            {t('call.status', { status: statusLabel })}
          </Text>
          {!call.audioSupported ? (
            <Text className="mt-3 text-sm text-brand-500">{t('call.micWeb')}</Text>
          ) : null}

          {inCall ? (
            <View className="mt-6">
              <View className="mb-4 rounded-2xl bg-brand-50 px-4 py-4">
                <Text className="text-lg font-semibold text-brand-800">
                  {call.activeCall?.status === 'accepted' ? t('call.connected') : t('call.ringing')}
                </Text>
                <Text className="mt-1 text-sm text-brand-600">
                  {call.muted ? t('call.micMuted') : t('call.micOn')}
                </Text>
              </View>
              <PrimaryButton
                label={call.muted ? t('call.unmute') : t('call.mute')}
                onPress={() => void call.toggleMute()}
                variant="secondary"
              />
              <PrimaryButton label={t('call.end')} onPress={() => void call.endCall()} />
            </View>
          ) : (
            <View className="mt-6">
              {!circle.callsEnabled ? (
                <Text className="mb-3 text-sm text-brand-600">{t('call.paused')}</Text>
              ) : members.length === 0 ? (
                <Text className="mb-3 text-sm text-brand-600">{t('call.nobody')}</Text>
              ) : (
                members.map((member) => (
                  <Pressable
                    key={member.id}
                    accessibilityRole="button"
                    accessibilityLabel={t('call.callA11y', { name: member.display_name })}
                    disabled={call.busy}
                    onPress={() => void call.placeCall(member.id)}
                    className="mb-3 min-h-14 rounded-2xl border border-brand-100 bg-brand-50 px-4 py-4"
                  >
                    <Text className="text-lg font-semibold text-brand-800">
                      {member.display_name}
                    </Text>
                    <Text className="mt-1 text-sm text-brand-600">
                      {member.role === 'parent' ? t('call.parent') : t('call.familyMember')} ·{' '}
                      {t('call.tapToCall')}
                    </Text>
                  </Pressable>
                ))
              )}
            </View>
          )}

          {call.error ? (
            <Text className="mt-3 text-sm text-red-600">
              {localizeFamilyError(call.error, language)}
            </Text>
          ) : null}

          <PrimaryButton
            label={t('call.openChat')}
            onPress={() => router.push('/(app)/family/chat' as Href)}
            variant="secondary"
          />
          <PrimaryButton
            label={t('common.back')}
            onPress={() => router.back()}
            variant="secondary"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
