import type { CircleMessage, CircleMessageReaction } from '@/types';
import { supabase } from '@/lib/supabase';

import { CIRCLE_MESSAGE_MAX_LENGTH } from '../constants';
import { sendCircleMessageSchema, safeCircleEmojiSchema } from '../schemas';
import type { SafeCircleEmoji } from '../constants';
import { assertNoContactInfo } from './contactInfo';

export async function fetchCircleMessages(
  circleId: string,
  limit = 80,
): Promise<CircleMessage[]> {
  const { data, error } = await supabase
    .from('circle_messages')
    .select('id, circle_id, sender_id, body, created_at')
    .eq('circle_id', circleId)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(error.message || 'Access denied');
  }
  return (data ?? []) as CircleMessage[];
}

export async function fetchCircleReactions(
  messageIds: string[],
): Promise<CircleMessageReaction[]> {
  if (messageIds.length === 0) {
    return [];
  }
  const { data, error } = await supabase
    .from('circle_message_reactions')
    .select('message_id, profile_id, emoji, created_at')
    .in('message_id', messageIds);

  if (error) {
    throw new Error(error.message || 'Access denied');
  }
  return (data ?? []) as CircleMessageReaction[];
}

export async function sendCircleMessage(options: {
  circleId: string;
  senderId: string;
  body: string;
}): Promise<CircleMessage> {
  const parsed = sendCircleMessageSchema.parse({ body: options.body });
  assertNoContactInfo(parsed.body);

  const { data, error } = await supabase
    .from('circle_messages')
    .insert({
      circle_id: options.circleId,
      sender_id: options.senderId,
      body: parsed.body.slice(0, CIRCLE_MESSAGE_MAX_LENGTH),
    })
    .select('id, circle_id, sender_id, body, created_at')
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'Access denied');
  }
  return data as CircleMessage;
}

export async function reactToCircleMessage(options: {
  messageId: string;
  profileId: string;
  emoji: string;
}): Promise<void> {
  const emoji = safeCircleEmojiSchema.parse(options.emoji);
  const { error } = await supabase.from('circle_message_reactions').upsert(
    {
      message_id: options.messageId,
      profile_id: options.profileId,
      emoji,
    },
    { onConflict: 'message_id,profile_id' },
  );
  if (error) {
    throw new Error(error.message || 'Access denied');
  }
}

export function subscribeToCircleMessages(
  circleId: string,
  onMessage: (message: CircleMessage) => void,
): () => void {
  const channel = supabase
    .channel(`circle-chat:${circleId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'circle_messages',
        filter: `circle_id=eq.${circleId}`,
      },
      (payload) => {
        const row = payload.new as CircleMessage;
        if (row?.id && row.circle_id === circleId) {
          onMessage(row);
        }
      },
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

export function subscribeToCircleReactions(
  circleId: string,
  onChange: () => void,
): () => void {
  const channel = supabase
    .channel(`circle-reactions:${circleId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'circle_message_reactions',
      },
      () => {
        onChange();
      },
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

export type { SafeCircleEmoji };
