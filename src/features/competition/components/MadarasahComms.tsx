import { useState } from 'react';
import { Modal, Pressable, Text, TextInput, View } from 'react-native';

import { useI18n } from '@/i18n';

import { useMadarasahComms } from '../hooks/useMadarasahComms';

export function MadarasahComms() {
  const { t } = useI18n();
  const comms = useMadarasahComms();
  const [roomDraft, setRoomDraft] = useState('');
  const [directDraft, setDirectDraft] = useState('');
  const peer = comms.members.find((member) => member.id === comms.peerId) ?? null;
  const others = comms.members.filter((member) => !member.is_you);

  if (comms.error === 'not_member') {
    return (
      <View className="mt-5 rounded-3xl bg-white px-5 py-5">
        <Text className="text-base text-red-700">{t('chat.accessDenied')}</Text>
      </View>
    );
  }

  async function sendRoom() {
    const body = roomDraft.trim();
    if (!body) return;
    setRoomDraft('');
    await comms.sendRoom(body);
  }

  async function sendDirect() {
    const body = directDraft.trim();
    if (!body || !comms.peerId) return;
    setDirectDraft('');
    await comms.sendDirect(body);
  }

  return (
    <View>
      {comms.incoming ? (
        <Modal visible animationType="fade" transparent>
          <View className="flex-1 items-center justify-center bg-black/55 px-6">
            <View className="w-full max-w-md rounded-3xl bg-white px-6 py-8">
              <Text className="text-2xl font-bold text-brand-800">
                {t('competition.madarasahCalling', { name: comms.incoming.caller_label })}
              </Text>
              <View className="mt-6 flex-row gap-3">
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('call.decline')}
                  disabled={comms.busy}
                  onPress={() => {
                    void comms.declineCall();
                  }}
                  className="min-h-12 flex-1 items-center justify-center rounded-xl bg-red-600 px-4 py-3"
                >
                  <Text className="text-base font-semibold text-white">{t('call.decline')}</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('call.accept')}
                  disabled={comms.busy}
                  onPress={() => {
                    void comms.acceptCall();
                  }}
                  className="min-h-12 flex-1 items-center justify-center rounded-xl bg-brand-600 px-4 py-3"
                >
                  <Text className="text-base font-semibold text-white">{t('call.accept')}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      ) : null}

      <View className="mt-5 rounded-3xl bg-white px-5 py-5">
        <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
          {t('competition.madarasahMembers')}
        </Text>
        {others.length === 0 ? (
          <Text className="mt-3 text-sm text-brand-600">{t('competition.madarasahNoMembers')}</Text>
        ) : (
          others.map((member) => (
            <View key={member.id} className="mt-3 flex-row items-center justify-between">
              <Text className="flex-1 text-base font-semibold text-brand-800">{member.display_label}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('competition.madarasahPrivate')}
                onPress={() => comms.setPeerId(member.id === comms.peerId ? null : member.id)}
                className="mr-2 min-h-11 items-center justify-center rounded-xl border border-brand-600 px-3 py-2"
              >
                <Text className="text-sm font-semibold text-brand-700">{t('competition.madarasahPrivate')}</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('call.callA11y', { name: member.display_label })}
                disabled={comms.busy}
                onPress={() => {
                  void comms.placeCall(member.id);
                }}
                className="min-h-11 items-center justify-center rounded-xl bg-brand-600 px-3 py-2"
              >
                <Text className="text-sm font-semibold text-white">{t('competition.madarasahCall')}</Text>
              </Pressable>
            </View>
          ))
        )}
        {comms.activeCall ? (
          <View className="mt-4">
            <Text className="text-base text-brand-800">
              {comms.activeCall.status === 'accepted'
                ? t('call.connected')
                : t('call.callingName', {
                    name:
                      comms.activeCall.role === 'caller'
                        ? comms.activeCall.callee_label
                        : comms.activeCall.caller_label,
                  })}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('call.end')}
              onPress={() => {
                void comms.hangUp();
              }}
              className="mt-3 min-h-12 items-center justify-center rounded-xl bg-red-600 px-4 py-3"
            >
              <Text className="text-base font-semibold text-white">{t('call.end')}</Text>
            </Pressable>
          </View>
        ) : null}
        {comms.error === 'audio' ? (
          <Text className="mt-3 text-sm text-brand-600">{t('call.webOnly')}</Text>
        ) : null}
      </View>

      {peer ? (
        <View className="mt-5 rounded-3xl bg-white px-5 py-5">
          <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
            {t('competition.madarasahDirectChat', { name: peer.display_label })}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => comms.setPeerId(null)}
            className="mt-2"
          >
            <Text className="text-sm font-semibold text-brand-700">{t('competition.madarasahCloseChat')}</Text>
          </Pressable>
          <MessageList
            messages={comms.directMessages}
            empty={t('competition.madarasahChatEmpty')}
            you={t('chat.you')}
          />
          <ChatComposer
            value={directDraft}
            placeholder={t('competition.madarasahMessage')}
            sendLabel={t('competition.madarasahSend')}
            onChange={setDirectDraft}
            onSend={() => {
              void sendDirect();
            }}
          />
        </View>
      ) : null}

      <View className="mt-5 rounded-3xl bg-white px-5 py-5">
        <Text className="text-sm font-semibold uppercase tracking-wide text-brand-500">
          {t('competition.madarasahRoomChat')}
        </Text>
        <MessageList
          messages={comms.roomMessages}
          empty={t('competition.madarasahChatEmpty')}
          you={t('chat.you')}
        />
        <ChatComposer
          value={roomDraft}
          placeholder={t('competition.madarasahMessage')}
          sendLabel={t('competition.madarasahSend')}
          onChange={setRoomDraft}
          onSend={() => {
            void sendRoom();
          }}
        />
      </View>
    </View>
  );
}

function MessageList({
  messages,
  empty,
  you,
}: {
  messages: Array<{ id: string; sender_label: string; body: string; mine: boolean }>;
  empty: string;
  you: string;
}) {
  if (messages.length === 0) {
    return <Text className="mt-3 text-sm text-brand-600">{empty}</Text>;
  }
  return (
    <View className="mt-3">
      {messages.map((message) => (
        <Text key={message.id} className="mt-2 text-base text-brand-800">
          <Text className="font-semibold">{message.mine ? you : message.sender_label}</Text>
          {': '}
          {message.body}
        </Text>
      ))}
    </View>
  );
}

function ChatComposer({
  value,
  placeholder,
  sendLabel,
  onChange,
  onSend,
}: {
  value: string;
  placeholder: string;
  sendLabel: string;
  onChange: (value: string) => void;
  onSend: () => void;
}) {
  return (
    <View className="mt-4 flex-row items-center">
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#6BC2A2"
        accessibilityLabel={placeholder}
        className="mr-2 min-h-12 flex-1 rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-base text-brand-900"
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={sendLabel}
        onPress={onSend}
        className="min-h-12 items-center justify-center rounded-xl bg-brand-600 px-4 py-3"
      >
        <Text className="text-sm font-semibold text-white">{sendLabel}</Text>
      </Pressable>
    </View>
  );
}
