import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, type Href } from 'expo-router';

import { PrimaryButton } from '@/features/auth';
import { useI18n, type MessageKey } from '@/i18n';

import { useFamilyChat } from '../hooks/useFamilyChat';
import type { FamilyMessageKind } from '../types';
import { localizeFamilyError } from '../services/localizeFamilyError';
import { useFamilyComms } from './FamilyCommsProvider';

export function FamilyChatScreen() {
  const router = useRouter();
  const { language, t } = useI18n();
  const { circle, loading, error: circleError, canUseFamilyComms, call } = useFamilyComms();
  const { messages, error, sending, send } = useFamilyChat(circle);
  const [draft, setDraft] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const memberLabel = useMemo(
    () => circle?.members.map((member) => member.display_name).join(', ') ?? '',
    [circle],
  );

  const templates = useMemo(
    () => ({
      encouragement: [
        { label: t('chat.tpl.mashaAllah'), body: t('chat.tpl.mashaAllah.body') },
        { label: t('chat.tpl.proud'), body: t('chat.tpl.proud.body') },
        { label: t('chat.tpl.keepGoing'), body: t('chat.tpl.keepGoing.body') },
      ],
      dua: [
        { label: t('chat.tpl.ease'), body: t('chat.tpl.ease.body') },
        { label: t('chat.tpl.barakah'), body: t('chat.tpl.barakah.body') },
        { label: t('chat.tpl.steadfast'), body: t('chat.tpl.steadfast.body') },
      ],
      practice_update: [
        { label: t('chat.tpl.practiced'), body: t('chat.tpl.practiced.body') },
        { label: t('chat.tpl.revision'), body: t('chat.tpl.revision.body') },
        { label: t('chat.tpl.needDua'), body: t('chat.tpl.needDua.body') },
      ],
    }),
    [t],
  );

  async function onSend(kind: FamilyMessageKind, body: string) {
    setFormError(null);
    try {
      await send(body, kind);
      setDraft('');
    } catch (err) {
      setFormError(
        localizeFamilyError(err instanceof Error ? err.message : null, language),
      );
    }
  }

  function kindLabel(kind: FamilyMessageKind): string {
    const key: MessageKey | null =
      kind === 'encouragement'
        ? 'chat.kind.encouragement'
        : kind === 'practice_update'
          ? 'chat.kind.practice_update'
          : kind === 'dua'
            ? 'chat.kind.dua'
            : null;
    return key ? t(key) : '';
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-brand-600">
        <Text className="text-base text-brand-50">{t('chat.loading')}</Text>
      </SafeAreaView>
    );
  }

  if (!canUseFamilyComms || !circle) {
    return (
      <SafeAreaView className="flex-1 bg-brand-600 px-6">
        <View className="mt-10 rounded-3xl bg-white px-5 py-6">
          <Text className="text-2xl font-semibold text-brand-800">{t('chat.title')}</Text>
          <Text className="mt-3 text-base text-brand-600">
            {localizeFamilyError(circleError, language, 'chat.membersOnly')}
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
          {t('family.chat')}
        </Text>
        <Text className="mt-1 text-2xl font-bold text-white">{t('chat.privateRoom')}</Text>
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
            <Text className="text-base text-brand-600">{t('chat.empty')}</Text>
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
                {message.isMine ? t('chat.you') : message.senderName}
                {message.kind !== 'text' ? ` · ${kindLabel(message.kind)}` : ''}
              </Text>
              <Text className="mt-1 text-base text-brand-800">{message.body}</Text>
            </View>
          ))
        )}
      </ScrollView>

      <View className="border-t border-white/10 bg-brand-900/80 px-4 py-3">
        {!circle.chatEnabled ? (
          <Text className="mb-2 text-sm text-brand-100">{t('chat.paused')}</Text>
        ) : (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
              {templates.encouragement.map((item) => (
                <Pressable
                  key={item.label}
                  onPress={() => void onSend('encouragement', item.body)}
                  className="mr-2 rounded-full bg-white/10 px-3 py-2"
                >
                  <Text className="text-xs font-semibold text-white">💛 {item.label}</Text>
                </Pressable>
              ))}
              {templates.dua.map((item) => (
                <Pressable
                  key={item.label}
                  onPress={() => void onSend('dua', item.body)}
                  className="mr-2 rounded-full bg-white/10 px-3 py-2"
                >
                  <Text className="text-xs font-semibold text-white">🤲 {item.label}</Text>
                </Pressable>
              ))}
              {templates.practice_update.map((item) => (
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
                placeholder={t('chat.placeholder')}
                placeholderTextColor="#99D6C4"
                multiline
                className="max-h-28 min-h-12 flex-1 rounded-xl bg-white px-3 py-3 text-base text-brand-900"
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('chat.sendA11y')}
                disabled={sending || !draft.trim()}
                onPress={() => void onSend('text', draft)}
                className="min-h-12 items-center justify-center rounded-xl bg-brand-500 px-4 py-3"
              >
                <Text className="font-semibold text-white">{t('chat.send')}</Text>
              </Pressable>
            </View>
          </>
        )}
        {formError || error ? (
          <Text className="mt-2 text-sm text-red-200">
            {formError || localizeFamilyError(error, language)}
          </Text>
        ) : null}
        <View className="mt-3 flex-row gap-2">
          <Pressable
            onPress={() => router.push('/(app)/family/call' as Href)}
            className="min-h-11 flex-1 items-center justify-center rounded-xl bg-white/10"
          >
            <Text className="text-sm font-semibold text-white">{t('family.call')}</Text>
          </Pressable>
          {call.activeCall?.status === 'accepted' ? (
            <Pressable
              onPress={() => router.push('/(app)/family/call' as Href)}
              className="min-h-11 flex-1 items-center justify-center rounded-xl bg-brand-500"
            >
              <Text className="text-sm font-semibold text-white">{t('chat.returnToCall')}</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}
