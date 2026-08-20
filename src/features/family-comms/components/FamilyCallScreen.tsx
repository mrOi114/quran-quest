import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, type Href } from 'expo-router';

import { PrimaryButton } from '@/features/auth';

import { callableMembers } from '../services/familyMembership';
import { useFamilyComms } from './FamilyCommsProvider';

export function FamilyCallScreen() {
  const router = useRouter();
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
        <Text className="text-base text-brand-50">Opening Family Call…</Text>
      </SafeAreaView>
    );
  }

  if (!canUseFamilyComms || !circle) {
    return (
      <SafeAreaView className="flex-1 bg-brand-600 px-6">
        <View className="mt-10 rounded-3xl bg-white px-5 py-6">
          <Text className="text-2xl font-semibold text-brand-800">Family Call</Text>
          <Text className="mt-3 text-base text-brand-600">
            {circleError || 'Only members of your Family Circle can place private family calls.'}
          </Text>
          <View className="mt-6">
            <PrimaryButton label="Back" onPress={() => router.back()} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const inCall = Boolean(call.activeCall && call.activeCall.status !== 'ended');

  return (
    <SafeAreaView className="flex-1 bg-brand-600">
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View className="rounded-3xl bg-white px-5 py-6">
          <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
            📞 Family Call
          </Text>
          <Text className="mt-2 text-3xl font-bold text-brand-800">
            {inCall ? peer?.display_name ?? 'Family member' : 'Call a family member'}
          </Text>
          <Text className="mt-2 text-base text-brand-600">
            One-to-one voice, only inside your Family Circle. Status: {call.statusLabel}
          </Text>
          {!call.audioSupported ? (
            <Text className="mt-3 text-sm text-brand-500">
              Microphone audio works in the web app when the browser allows it.
            </Text>
          ) : null}

          {inCall ? (
            <View className="mt-6">
              <View className="mb-4 rounded-2xl bg-brand-50 px-4 py-4">
                <Text className="text-lg font-semibold text-brand-800">
                  {call.activeCall?.status === 'accepted' ? 'Connected' : 'Ringing'}
                </Text>
                <Text className="mt-1 text-sm text-brand-600">
                  {call.muted ? 'Microphone muted' : 'Microphone on'}
                </Text>
              </View>
              <PrimaryButton
                label={call.muted ? 'Unmute' : 'Mute'}
                onPress={() => void call.toggleMute()}
                variant="secondary"
              />
              <PrimaryButton label="End call" onPress={() => void call.endCall()} />
            </View>
          ) : (
            <View className="mt-6">
              {!circle.callsEnabled ? (
                <Text className="mb-3 text-sm text-brand-600">
                  Calls are paused for this child. A parent can turn them back on.
                </Text>
              ) : members.length === 0 ? (
                <Text className="mb-3 text-sm text-brand-600">
                  No one else in your Family Circle can take a call right now.
                </Text>
              ) : (
                members.map((member) => (
                  <Pressable
                    key={member.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Call ${member.display_name}`}
                    disabled={call.busy}
                    onPress={() => void call.placeCall(member.id)}
                    className="mb-3 min-h-14 rounded-2xl border border-brand-100 bg-brand-50 px-4 py-4"
                  >
                    <Text className="text-lg font-semibold text-brand-800">
                      {member.display_name}
                    </Text>
                    <Text className="mt-1 text-sm text-brand-600">
                      {member.role === 'parent' ? 'Parent' : 'Family member'} · Tap to call
                    </Text>
                  </Pressable>
                ))
              )}
            </View>
          )}

          {call.error ? <Text className="mt-3 text-sm text-red-600">{call.error}</Text> : null}

          <PrimaryButton
            label="Open Family Chat"
            onPress={() => router.push('/(app)/family/chat' as Href)}
            variant="secondary"
          />
          <PrimaryButton label="Back" onPress={() => router.back()} variant="secondary" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
