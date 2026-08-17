import { supabase } from '@/lib/supabase';
import type { FamilyMessage } from '@/types';

import { sendFamilyMessageSchema } from '../schemas';
import type { FamilyMessageKind } from '../types';

export async function fetchFamilyMessages(familyId: string, limit = 80): Promise<FamilyMessage[]> {
  const { data, error } = await supabase
    .from('family_messages')
    .select('id, family_id, sender_id, kind, body, created_at')
    .eq('family_id', familyId)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(error.message || 'Access denied');
  }

  return (data ?? []) as FamilyMessage[];
}

export async function sendFamilyMessage(options: {
  familyId: string;
  senderId: string;
  body: string;
  kind?: FamilyMessageKind;
}): Promise<FamilyMessage> {
  const parsed = sendFamilyMessageSchema.parse({
    body: options.body,
    kind: options.kind ?? 'text',
  });

  const { data, error } = await supabase
    .from('family_messages')
    .insert({
      family_id: options.familyId,
      sender_id: options.senderId,
      kind: parsed.kind,
      body: parsed.body,
    })
    .select('id, family_id, sender_id, kind, body, created_at')
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'Access denied');
  }

  return data as FamilyMessage;
}

export function subscribeToFamilyMessages(
  familyId: string,
  onMessage: (message: FamilyMessage) => void,
): () => void {
  const channel = supabase
    .channel(`family-chat:${familyId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'family_messages',
        filter: `family_id=eq.${familyId}`,
      },
      (payload) => {
        const row = payload.new as FamilyMessage;
        if (row?.id && row.family_id === familyId) {
          onMessage(row);
        }
      },
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
