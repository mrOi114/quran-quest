import { assertFunctionOk } from '@/features/auth';
import type { FamilyCallSignalPayload } from '@/features/family-comms';
import { supabase } from '@/lib/supabase';

import type { CompetitionState } from '../types';
import { getOrCreateParticipantKey } from './participantKey';
import type { QuranRangeId } from './quranRange';

export type MadarasahMemberView = {
  id: string;
  display_label: string;
  is_you?: boolean;
};

export type MadarasahMessage = {
  id: string;
  sender_member_id: string;
  sender_label: string;
  body: string;
  created_at: string;
  mine: boolean;
};

export type MadarasahCallView = {
  id: string;
  status: string;
  caller_label: string;
  callee_label: string;
  caller_member_id: string;
  callee_member_id: string;
  role: 'caller' | 'callee';
};

export type MadarasahSignal = {
  id: string;
  sender_member_id: string;
  payload: FamilyCallSignalPayload;
  created_at: string;
};

export type MadarasahSync = {
  ok: true;
  room_name: string;
  member: MadarasahMemberView;
  members: MadarasahMemberView[];
  room_messages: MadarasahMessage[];
  direct_messages: MadarasahMessage[];
  incoming_call: MadarasahCallView | null;
  active_call: MadarasahCallView | null;
  signals: MadarasahSignal[];
};

type Identity = {
  displayLabel: string;
  profileId: string | null;
};

async function invoke<T extends object>(body: Record<string, unknown>): Promise<T> {
  const participant_key = await getOrCreateParticipantKey();
  const result = await supabase.functions.invoke('competition', {
    body: { ...body, participant_key },
  });
  return assertFunctionOk<T>(result);
}

export async function madarasahStatus(): Promise<{
  room_name: string | null;
  member: MadarasahMemberView | null;
}> {
  const data = await invoke<{
    ok: true;
    room_name: string | null;
    member: MadarasahMemberView | null;
  }>({ action: 'madarasah_status' });
  return { room_name: data.room_name, member: data.member };
}

export async function enterMadarasahRoom(code: string, identity: Identity) {
  return invoke<{ ok: true; room_name: string; member: MadarasahMemberView }>({
    action: 'madarasah_enter',
    access_code: code.trim(),
    display_label: identity.displayLabel,
    profile_id: identity.profileId,
  });
}

export async function leaveMadarasahRoom(): Promise<void> {
  await invoke<{ ok: true }>({ action: 'madarasah_leave' });
}

export async function joinMadarasahChallenge(
  identity: Identity & { ageBand: 'child' | 'teen' | 'adult' },
  quranRange: QuranRangeId,
): Promise<CompetitionState> {
  return invoke<CompetitionState>({
    action: 'madarasah_join',
    display_label: identity.displayLabel,
    age_band: identity.ageBand,
    profile_id: identity.profileId,
    quran_range: quranRange,
  });
}

export async function syncMadarasah(options: {
  peerMemberId?: string | null;
  signalAfter?: string | null;
}): Promise<MadarasahSync> {
  return invoke<MadarasahSync>({
    action: 'madarasah_sync',
    peer_member_id: options.peerMemberId ?? undefined,
    signal_after: options.signalAfter ?? undefined,
  });
}

export async function sendMadarasahMessage(options: {
  channel: 'room' | 'direct';
  body: string;
  peerMemberId?: string | null;
}): Promise<MadarasahSync> {
  return invoke<MadarasahSync>({
    action: 'madarasah_send',
    channel: options.channel,
    message_body: options.body,
    peer_member_id: options.peerMemberId ?? undefined,
  });
}

export async function startMadarasahCall(peerMemberId: string): Promise<MadarasahCallView> {
  const data = await invoke<{ ok: true; active_call: MadarasahCallView }>({
    action: 'madarasah_call_start',
    peer_member_id: peerMemberId,
  });
  return data.active_call;
}

export async function respondMadarasahCall(callId: string, accept: boolean): Promise<void> {
  await invoke<{ ok: true }>({
    action: 'madarasah_call_respond',
    call_id: callId,
    accept,
  });
}

export async function signalMadarasahCall(
  callId: string,
  signal: FamilyCallSignalPayload,
): Promise<void> {
  await invoke<{ ok: true }>({
    action: 'madarasah_call_signal',
    call_id: callId,
    signal,
  });
}

export async function endMadarasahCall(callId: string): Promise<void> {
  await invoke<{ ok: true }>({
    action: 'madarasah_call_end',
    call_id: callId,
  });
}
