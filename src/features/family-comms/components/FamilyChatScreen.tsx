import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { PrimaryButton } from '@/features/auth';

import { FAMILY_CHAT_TEMPLATES } from '../constants';
import { useFamilyChat } from '../hooks/useFamilyChat';
import { useFamilyComms } from './FamilyCommsProvider';

export function FamilyChatScreen() {
  const router = useRouter();
  const { circle, loading, error: circleError, canUseFamilyComms, call } = useFamilyComms();
  const { messages, error, sending, send } = useFamilyChat(circle);
  const [draft, setDraft] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const memberLabel = useMemo(
    () => circle?.members.map((member) => member.display_name).join(', ') ?? '',
    [circle],
  );

  async function onSend(kind: 'text' | 'encouragement' | 'practice_update' | 'dua', body: string) {
    setFormError(null);
    try {
      await send(body, kind);
      setDraft('');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Access denied');
    }
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-brand-600">
        <Text className="text-base text-brand-50">Opening Family Chat…</Text>
      </SafeAreaView>
    );
  }

  if (!canUseFamilyComms || !circle) {
    return (
      <SafeAreaView className="flex-1 bg-brand-600 px-6">
        <View className="mt-10 rounded-3xl bg-white px-5 py-6">
          <Text className="text-2xl font-semibold text-brand-800">Family Chat</Text>
          <Text className="mt-3 text-base text-brand-600">
            {circleError || 'Only members of your Family Circle can use private family chat.'}
          </Text>
          <View className="mt-6">
            <PrimaryButton label="Back" onPress={() => router.back()} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-brand-600">
      <View className="px-5 pb-3 pt-4">
        <Text className="text-sm font-semibold uppercase tracking-wide text-brand-100">
          💬 Family Chat
        </Text>
        <Text className="mt-1 text-2xl font-bold text-white">Private family room</Text>
        <Text className="mt-1 text-sm text-brand-100" numberOfLines={2}>
          {memberLabel}
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 16 }}
      >
        {messages.length === 0 ? (
          <View className="rounded-2xl bg-white px-4 py-5">
            <Text className="text-base text-brand-600">
              No messages yet. Send encouragement, a practice update, or a short dua.
            </Text>
          </View>
        ) : (
          messages.map((message) => (
            <View
              key={message.id}
              className={`mb-3 max-w-[88%] rounded-2xl px-4 py-3 ${
                message.isMine ? 'self-end bg-brand-50' : 'self-start bg-white'
              }`}
            >
              <Text className="text-xs font-semibold uppercase tracking-wide text-brand-500">
                {message.isMine ? 'You' : message.senderName}
                {message.kind !== 'text' ? ` · ${message.kind.replace('_', ' ')}` : ''}
              </Text>
              <Text className="mt-1 text-base text-brand-800">{message.body}</Text>
            </View>
          ))
        )}
      </ScrollView>

      <View className="border-t border-white/10 bg-brand-900/80 px-4 py-3">
        {!circle.chatEnabled ? (
          <Text className="mb-2 text-sm text-brand-100">
            Chat is paused for this child. A parent can turn it back on.
          </Text>
        ) : (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
              {FAMILY_CHAT_TEMPLATES.encouragement.map((item) => (
                <Pressable
                  key={item.label}
                  onPress={() => void onSend('encouragement', item.body)}
                  className="mr-2 rounded-full bg-white/10 px-3 py-2"
                >
                  <Text className="text-xs font-semibold text-white">💛 {item.label}</Text>
                </Pressable>
              ))}
              {FAMILY_CHAT_TEMPLATES.dua.map((item) => (
                <Pressable
                  key={item.label}
                  onPress={() => void onSend('dua', item.body)}
                  className="mr-2 rounded-full bg-white/10 px-3 py-2"
                >
                  <Text className="text-xs font-semibold text-white">🤲 {item.label}</Text>
                </Pressable>
              ))}
              {FAMILY_CHAT_TEMPLATES.practice_update.map((item) => (
                <Pressable
                  key={item.label}
                  onPress={() => void onSend('practice_update', item.body)}
                  className="mr-2 rounded-full bg-white/10 px-3 py-2"
                >
                  <Text className="text-xs font-semibold text-white">📖 {item.label}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <View className="flex-row items-end gap-2">
              <TextInput
                value={draft}
                onChangeText={setDraft}
                placeholder="Write a family message"
                placeholderTextColor="#99D6C4"
                multiline
                className="max-h-28 min-h-12 flex-1 rounded-xl bg-white px-3 py-3 text-base text-brand-900"
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Send family message"
                disabled={sending || !draft.trim()}
                onPress={() => void onSend('text', draft)}
                className="min-h-12 items-center justify-center rounded-xl bg-brand-500 px-4 py-3"
              >
                <Text className="font-semibold text-white">Send</Text>
              </Pressable>
            </View>
          </>
        )}
        {formError || error ? (
          <Text className="mt-2 text-sm text-red-200">{formError || error}</Text>
        ) : null}
        <View className="mt-3 flex-row gap-2">
          <Pressable
            onPress={() => router.push('/(app)/family/call')}
            className="min-h-11 flex-1 items-center justify-center rounded-xl bg-white/10"
          >
            <Text className="text-sm font-semibold text-white">📞 Family Call</Text>
          </Pressable>
          {call.activeCall?.status === 'accepted' ? (
            <Pressable
              onPress={() => router.push('/(app)/family/call')}
              className="min-h-11 flex-1 items-center justify-center rounded-xl bg-brand-500"
            >
              <Text className="text-sm font-semibold text-white">Return to call</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}
