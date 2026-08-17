import { supabase } from '@/lib/supabase';
import type { FamilyCall, Json } from '@/types';

import type { FamilyCallSignalPayload } from '../types';

export async function startFamilyCall(options: {
  familyId: string;
  callerId: string;
  calleeId: string;
}): Promise<FamilyCall> {
  if (options.callerId === options.calleeId) {
    throw new Error('Access denied');
  }

  const { data, error } = await supabase
    .from('family_calls')
    .insert({
      family_id: options.familyId,
      kind: 'p2p',
      created_by: options.callerId,
      callee_id: options.calleeId,
      status: 'ringing',
    })
    .select(
      'id, family_id, kind, created_by, callee_id, status, created_at, answered_at, ended_at',
    )
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'Access denied');
  }

  return data as FamilyCall;
}

export async function fetchFamilyCall(callId: string): Promise<FamilyCall | null> {
  const { data, error } = await supabase
    .from('family_calls')
    .select(
      'id, family_id, kind, created_by, callee_id, status, created_at, answered_at, ended_at',
    )
    .eq('id', callId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message || 'Access denied');
  }

  return (data as FamilyCall | null) ?? null;
}

export async function updateFamilyCallStatus(
  callId: string,
  status: FamilyCall['status'],
): Promise<FamilyCall> {
  const { data, error } = await supabase
    .from('family_calls')
    .update({ status })
    .eq('id', callId)
    .select(
      'id, family_id, kind, created_by, callee_id, status, created_at, answered_at, ended_at',
    )
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'Access denied');
  }

  return data as FamilyCall;
}

export async function setParticipantMuted(options: {
  callId: string;
  profileId: string;
  muted: boolean;
}): Promise<void> {
  const { error } = await supabase
    .from('family_call_participants')
    .update({ muted: options.muted })
    .eq('call_id', options.callId)
    .eq('profile_id', options.profileId);

  if (error) {
    throw new Error(error.message || 'Access denied');
  }
}

export async function sendCallSignal(options: {
  callId: string;
  senderId: string;
  payload: FamilyCallSignalPayload;
}): Promise<void> {
  const { error } = await supabase.from('family_call_signals').insert({
    call_id: options.callId,
    sender_id: options.senderId,
    payload: options.payload as unknown as Json,
  });

  if (error) {
    throw new Error(error.message || 'Access denied');
  }
}

export function subscribeToFamilyCalls(
  familyId: string,
  onChange: (call: FamilyCall) => void,
): () => void {
  const channel = supabase
    .channel(`family-calls:${familyId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'family_calls',
        filter: `family_id=eq.${familyId}`,
      },
      (payload) => {
        const row = (payload.new ?? payload.old) as FamilyCall;
        if (row?.id) {
          onChange(row);
        }
      },
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

export function subscribeToCallSignals(
  callId: string,
  onSignal: (row: { id: string; sender_id: string; payload: FamilyCallSignalPayload }) => void,
): () => void {
  const channel = supabase
    .channel(`family-call-signals:${callId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'family_call_signals',
        filter: `call_id=eq.${callId}`,
      },
      (payload) => {
        const row = payload.new as {
          id: string;
          sender_id: string;
          payload: FamilyCallSignalPayload;
        };
        if (row?.id) {
          onSignal(row);
        }
      },
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
