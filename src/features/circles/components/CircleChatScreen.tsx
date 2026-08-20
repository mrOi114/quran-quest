import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { PrimaryButton, useAuth } from '@/features/auth';
import { useI18n } from '@/i18n';

import { SAFE_CIRCLE_EMOJIS } from '../constants';
import { useCircle } from '../hooks/useCircle';
import { useCircleChat } from '../hooks/useCircleChat';
import { localizeGroupError } from '../services';

export function CircleChatScreen({ circleId }: { circleId: string }) {
  const router = useRouter();
  const { language, t } = useI18n();
  const { profile, activeLearner } = useAuth();
  const { circle, error: circleError, loading } = useCircle(circleId);
  const actorId = activeLearner?.role === 'child' ? activeLearner.id : profile?.id ?? null;
  const { messages, reactionsByMessage, error, sending, send, react } = useCircleChat(
    circle,
    actorId,
  );
  const [draft, setDraft] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const nameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const member of circle?.members ?? []) {
      map.set(member.profileId, member.displayName);
    }
    return map;
  }, [circle?.members]);

  async function onSend() {
    setFormError(null);
    try {
      await send(draft);
      setDraft('');
    } catch (err) {
      setFormError(localizeGroupError(err instanceof Error ? err.message : null, language));
    }
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-brand-600">
        <Text className="text-base text-brand-50">{t('common.loading')}</Text>
      </SafeAreaView>
    );
  }

  if (!circle || circle.timedOut) {
    return (
      <SafeAreaView className="flex-1 bg-brand-600 px-6">
        <View className="mt-10 rounded-3xl bg-white px-5 py-6">
          <Text className="text-2xl font-semibold text-brand-800">{t('groups.chat')}</Text>
          <Text className="mt-3 text-base text-brand-600">
            {localizeGroupError(circleError ?? (circle?.timedOut ? t('groups.timeout') : null), language)}
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
      <View className="px-5 pb-3 pt-4">
        <Text className="text-sm font-semibold uppercase tracking-wide text-brand-100">
          {t('groups.chat')}
        </Text>
        <Text className="mt-1 text-2xl font-bold text-white">{circle.name}</Text>
        <Text className="mt-1 text-sm text-brand-100">{t('groups.groupChatOnly')}</Text>
      </View>

      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 16 }}>
        {!circle.chatEnabled ? (
          <View className="mb-3 rounded-2xl bg-white px-4 py-4">
            <Text className="text-sm text-brand-600">{t('groups.chatOff')}</Text>
          </View>
        ) : null}
        {messages.map((message) => {
          const mine = message.sender_id === actorId;
          const reactions = reactionsByMessage.get(message.id) ?? [];
          return (
            <View
              key={message.id}
              className={`mb-3 max-w-[88%] rounded-2xl px-4 py-3 ${
                mine ? 'self-end bg-brand-50' : 'self-start bg-white'
              }`}
            >
              <Text className="text-xs font-semibold text-brand-500">
                {nameById.get(message.sender_id) ?? t('groups.member')}
              </Text>
              <Text className="mt-1 text-base text-brand-800">{message.body}</Text>
              <View className="mt-2 flex-row flex-wrap gap-1">
                {reactions.map((row) => (
                  <Text key={`${row.profile_id}-${row.emoji}`} className="text-base">
                    {row.emoji}
                  </Text>
                ))}
              </View>
              <View className="mt-2 flex-row flex-wrap gap-1">
                {SAFE_CIRCLE_EMOJIS.slice(0, 8).map((emoji) => (
                  <Pressable
                    key={emoji}
                    accessibilityRole="button"
                    accessibilityLabel={t('groups.reactA11y', { emoji })}
                    onPress={() => void react(message.id, emoji).catch((err) => {
                      setFormError(
                        localizeGroupError(err instanceof Error ? err.message : null, language),
                      );
                    })}
                    className="min-h-9 min-w-9 items-center justify-center rounded-lg bg-brand-100/70 px-1"
                  >
                    <Text className="text-base">{emoji}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View className="border-t border-white/10 bg-brand-900/80 px-5 py-3">
        {formError || error ? (
          <Text className="mb-2 text-sm text-amber-100">
            {localizeGroupError(formError ?? error, language)}
          </Text>
        ) : null}
        <View className="flex-row items-end gap-2">
          <TextInput
            value={draft}
            onChangeText={setDraft}
            editable={circle.chatEnabled && !circle.timedOut}
            placeholder={t('groups.chatPlaceholder')}
            placeholderTextColor="#99B8AE"
            multiline
            className="min-h-12 flex-1 rounded-2xl bg-white px-4 py-3 text-base text-brand-800"
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('groups.sendA11y')}
            disabled={sending || !circle.chatEnabled}
            onPress={() => void onSend()}
            className="min-h-12 items-center justify-center rounded-2xl bg-brand-50 px-4"
          >
            <Text className="text-sm font-semibold text-brand-800">{t('groups.send')}</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
