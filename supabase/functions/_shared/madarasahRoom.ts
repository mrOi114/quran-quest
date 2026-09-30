import { createServiceClient } from './supabase.ts';
import {
  MADARASAH_ROOM_NAME,
  MADARASAH_ROOM_SLUG,
  madarasahAccessGranted,
} from './madarasahAccess.ts';

type Service = ReturnType<typeof createServiceClient>;

export type MadarasahMember = {
  id: string;
  room_id: string;
  participant_key_hash: string;
  display_label: string;
  left_at: string | null;
};

type RoomRow = { id: string; slug: string; display_name: string };

const MESSAGE_LIMIT = 80;
const MESSAGE_MAX = 2000;
const CODE_FAIL_LIMIT = 12;
const CODE_WINDOW_MS = 15 * 60 * 1000;
const RING_MS = 45 * 1000;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type CommsAction =
  | 'madarasah_enter'
  | 'madarasah_status'
  | 'madarasah_sync'
  | 'madarasah_send'
  | 'madarasah_call_start'
  | 'madarasah_call_respond'
  | 'madarasah_call_signal'
  | 'madarasah_call_end';

type CommsBody = {
  access_code?: string;
  display_label?: string;
  profile_id?: string | null;
  peer_member_id?: string;
  message_body?: string;
  channel?: string;
  call_id?: string;
  accept?: boolean;
  signal?: unknown;
  signal_after?: string;
};

function denied() {
  return { status: 403, body: { error: 'code_denied' } };
}

function notMember() {
  return { status: 403, body: { error: 'not_member' } };
}

function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

function labelOf(raw: string): string {
  const cleaned = raw.trim().replace(/\s+/g, ' ').slice(0, 24);
  return cleaned.length >= 2 ? cleaned : 'Player';
}

async function loadRoom(service: Service): Promise<RoomRow | null> {
  const { data } = await service
    .from('competition_private_rooms')
    .select('id, slug, display_name')
    .eq('slug', MADARASAH_ROOM_SLUG)
    .maybeSingle();
  return (data as RoomRow | null) ?? null;
}

export async function findActiveMadarasahMember(
  service: Service,
  keyHash: string,
): Promise<MadarasahMember | null> {
  const room = await loadRoom(service);
  if (!room) {
    return null;
  }
  const { data } = await service
    .from('competition_private_members')
    .select('id, room_id, participant_key_hash, display_label, left_at')
    .eq('room_id', room.id)
    .eq('participant_key_hash', keyHash)
    .is('left_at', null)
    .maybeSingle();
  return (data as MadarasahMember | null) ?? null;
}

export async function revokeMadarasahMember(
  service: Service,
  keyHash: string,
  roomId: string,
): Promise<void> {
  await service
    .from('competition_private_members')
    .update({ left_at: new Date().toISOString() })
    .eq('room_id', roomId)
    .eq('participant_key_hash', keyHash)
    .is('left_at', null);
}

async function codeAttemptBlocked(service: Service, keyHash: string): Promise<boolean> {
  const { data } = await service
    .from('competition_private_code_attempts')
    .select('failed_count, window_started_at')
    .eq('participant_key_hash', keyHash)
    .maybeSingle();
  if (!data) {
    return false;
  }
  const started = Date.parse(String(data.window_started_at));
  if (!Number.isFinite(started) || Date.now() - started > CODE_WINDOW_MS) {
    return false;
  }
  return Number(data.failed_count) >= CODE_FAIL_LIMIT;
}

async function recordCodeFailure(service: Service, keyHash: string): Promise<void> {
  const now = new Date().toISOString();
  const { data } = await service
    .from('competition_private_code_attempts')
    .select('failed_count, window_started_at')
    .eq('participant_key_hash', keyHash)
    .maybeSingle();
  const started = data ? Date.parse(String(data.window_started_at)) : 0;
  const fresh = !data || !Number.isFinite(started) || Date.now() - started > CODE_WINDOW_MS;
  await service.from('competition_private_code_attempts').upsert({
    participant_key_hash: keyHash,
    failed_count: fresh ? 1 : Number(data?.failed_count ?? 0) + 1,
    window_started_at: fresh ? now : data?.window_started_at,
  });
}

async function clearCodeFailures(service: Service, keyHash: string): Promise<void> {
  await service.from('competition_private_code_attempts').delete().eq('participant_key_hash', keyHash);
}

async function memberById(
  service: Service,
  roomId: string,
  memberId: string,
  activeOnly: boolean,
): Promise<MadarasahMember | null> {
  if (!isUuid(memberId)) {
    return null;
  }
  let query = service
    .from('competition_private_members')
    .select('id, room_id, participant_key_hash, display_label, left_at')
    .eq('room_id', roomId)
    .eq('id', memberId);
  if (activeOnly) {
    query = query.is('left_at', null);
  }
  const { data } = await query.maybeSingle();
  return (data as MadarasahMember | null) ?? null;
}

function messageView(
  row: {
    id: string;
    sender_member_id: string;
    sender_label: string;
    body: string;
    created_at: string;
  },
  mineId: string,
) {
  return {
    id: row.id,
    sender_member_id: row.sender_member_id,
    sender_label: row.sender_label,
    body: row.body,
    created_at: row.created_at,
    mine: row.sender_member_id === mineId,
  };
}

async function listRoomMessages(service: Service, roomId: string, mineId: string) {
  const { data } = await service
    .from('competition_room_messages')
    .select('id, sender_member_id, sender_label, body, created_at')
    .eq('room_id', roomId)
    .eq('channel', 'room')
    .order('created_at', { ascending: false })
    .limit(MESSAGE_LIMIT);
  return ((data ?? []) as Array<{
    id: string;
    sender_member_id: string;
    sender_label: string;
    body: string;
    created_at: string;
  }>)
    .reverse()
    .map((row) => messageView(row, mineId));
}

async function listDirectMessages(
  service: Service,
  roomId: string,
  mineId: string,
  peerId: string,
) {
  const { data } = await service
    .from('competition_room_messages')
    .select('id, sender_member_id, sender_label, peer_member_id, body, created_at')
    .eq('room_id', roomId)
    .eq('channel', 'direct')
    .or(
      `and(sender_member_id.eq.${mineId},peer_member_id.eq.${peerId}),and(sender_member_id.eq.${peerId},peer_member_id.eq.${mineId})`,
    )
    .order('created_at', { ascending: false })
    .limit(MESSAGE_LIMIT);
  return ((data ?? []) as Array<{
    id: string;
    sender_member_id: string;
    sender_label: string;
    body: string;
    created_at: string;
  }>)
    .filter(
      (row) =>
        (row.sender_member_id === mineId || row.sender_member_id === peerId),
    )
    .reverse()
    .map((row) => messageView(row, mineId));
}

type CallRow = {
  id: string;
  room_id: string;
  caller_member_id: string;
  caller_label: string;
  callee_member_id: string;
  callee_label: string;
  status: string;
  created_at: string;
  updated_at: string;
};

function callView(call: CallRow, memberId: string) {
  return {
    id: call.id,
    status: call.status,
    caller_label: call.caller_label,
    callee_label: call.callee_label,
    caller_member_id: call.caller_member_id,
    callee_member_id: call.callee_member_id,
    role: call.caller_member_id === memberId ? 'caller' : 'callee',
  };
}

async function liveCalls(service: Service, roomId: string, memberId: string): Promise<CallRow[]> {
  const { data } = await service
    .from('competition_room_calls')
    .select(
      'id, room_id, caller_member_id, caller_label, callee_member_id, callee_label, status, created_at, updated_at',
    )
    .eq('room_id', roomId)
    .or(`caller_member_id.eq.${memberId},callee_member_id.eq.${memberId}`)
    .in('status', ['ringing', 'accepted'])
    .order('created_at', { ascending: false })
    .limit(8);
  const rows = (data ?? []) as CallRow[];
  const now = Date.now();
  const live: CallRow[] = [];
  for (const call of rows) {
    if (call.caller_member_id !== memberId && call.callee_member_id !== memberId) {
      continue;
    }
    if (call.status === 'ringing' && now - Date.parse(call.created_at) > RING_MS) {
      await service
        .from('competition_room_calls')
        .update({ status: 'ended', updated_at: new Date().toISOString() })
        .eq('id', call.id)
        .eq('status', 'ringing');
      continue;
    }
    live.push(call);
  }
  return live;
}

function asSignal(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const signal = value as Record<string, unknown>;
  if (signal.type === 'offer' || signal.type === 'answer') {
    if (typeof signal.sdp !== 'string' || signal.sdp.length < 8 || signal.sdp.length > 12000) {
      return null;
    }
    return { type: signal.type, sdp: signal.sdp };
  }
  if (signal.type === 'ice' && signal.candidate && typeof signal.candidate === 'object') {
    return { type: 'ice', candidate: signal.candidate };
  }
  return null;
}

async function enterRoom(
  service: Service,
  keyHash: string,
  body: CommsBody,
): Promise<{ status: number; body: unknown }> {
  if (await codeAttemptBlocked(service, keyHash)) {
    return denied();
  }
  const granted = await madarasahAccessGranted(typeof body.access_code === 'string' ? body.access_code : '');
  if (!granted) {
    await recordCodeFailure(service, keyHash);
    return denied();
  }
  const room = await loadRoom(service);
  if (!room) {
    return { status: 404, body: { error: 'not_found' } };
  }
  await clearCodeFailures(service, keyHash);
  const display = labelOf(typeof body.display_label === 'string' ? body.display_label : '');
  const profileId =
    typeof body.profile_id === 'string' && isUuid(body.profile_id) ? body.profile_id : null;
  const now = new Date().toISOString();
  const { data: existing } = await service
    .from('competition_private_members')
    .select('id')
    .eq('room_id', room.id)
    .eq('participant_key_hash', keyHash)
    .maybeSingle();
  let memberId = existing?.id as string | undefined;
  if (memberId) {
    await service
      .from('competition_private_members')
      .update({
        left_at: null,
        display_label: display,
        profile_id: profileId,
        last_seen_at: now,
      })
      .eq('id', memberId);
  } else {
    const { data: created, error } = await service
      .from('competition_private_members')
      .insert({
        room_id: room.id,
        participant_key_hash: keyHash,
        profile_id: profileId,
        display_label: display,
        left_at: null,
        last_seen_at: now,
      })
      .select('id')
      .single();
    if (error || !created) {
      return { status: 500, body: { error: 'error' } };
    }
    memberId = created.id as string;
  }
  return {
    status: 200,
    body: {
      ok: true,
      room_name: room.display_name || MADARASAH_ROOM_NAME,
      member: { id: memberId, display_label: display },
    },
  };
}

async function syncRoom(
  service: Service,
  member: MadarasahMember,
  body: CommsBody,
): Promise<{ status: number; body: unknown }> {
  await service
    .from('competition_private_members')
    .update({ last_seen_at: new Date().toISOString() })
    .eq('id', member.id);
  const { data: people } = await service
    .from('competition_private_members')
    .select('id, display_label')
    .eq('room_id', member.room_id)
    .is('left_at', null)
    .order('display_label', { ascending: true })
    .limit(40);
  const members = ((people ?? []) as Array<{ id: string; display_label: string }>).map((person) => ({
    id: person.id,
    display_label: person.display_label,
    is_you: person.id === member.id,
  }));
  const roomMessages = await listRoomMessages(service, member.room_id, member.id);
  let directMessages: ReturnType<typeof messageView>[] = [];
  const peerId = typeof body.peer_member_id === 'string' ? body.peer_member_id : '';
  if (peerId) {
    const peer = await memberById(service, member.room_id, peerId, false);
    if (peer && peer.id !== member.id) {
      directMessages = await listDirectMessages(service, member.room_id, member.id, peer.id);
    }
  }
  const calls = await liveCalls(service, member.room_id, member.id);
  const incoming = calls.find((call) => call.status === 'ringing' && call.callee_member_id === member.id) ?? null;
  const active =
    calls.find((call) => call.status === 'accepted') ??
    calls.find((call) => call.status === 'ringing' && call.caller_member_id === member.id) ??
    null;
  const signalCall = active ?? incoming;
  let signals: Array<{ id: string; sender_member_id: string; payload: unknown; created_at: string }> = [];
  if (signalCall) {
    let query = service
      .from('competition_room_call_signals')
      .select('id, sender_member_id, payload, created_at')
      .eq('call_id', signalCall.id)
      .order('created_at', { ascending: true })
      .limit(40);
    if (typeof body.signal_after === 'string' && body.signal_after.length > 0) {
      query = query.gt('created_at', body.signal_after);
    }
    const { data } = await query;
    signals = (data ?? []) as typeof signals;
  }
  return {
    status: 200,
    body: {
      ok: true,
      room_name: MADARASAH_ROOM_NAME,
      member: { id: member.id, display_label: member.display_label },
      members,
      room_messages: roomMessages,
      direct_messages: directMessages,
      incoming_call: incoming ? callView(incoming, member.id) : null,
      active_call: active ? callView(active, member.id) : null,
      signals,
    },
  };
}

async function sendMessage(
  service: Service,
  member: MadarasahMember,
  body: CommsBody,
): Promise<{ status: number; body: unknown }> {
  const text = typeof body.message_body === 'string' ? body.message_body.trim() : '';
  if (text.length < 1 || text.length > MESSAGE_MAX) {
    return { status: 400, body: { error: 'error' } };
  }
  const channel = body.channel === 'direct' ? 'direct' : 'room';
  let peerId: string | null = null;
  if (channel === 'direct') {
    const peer = await memberById(
      service,
      member.room_id,
      typeof body.peer_member_id === 'string' ? body.peer_member_id : '',
      true,
    );
    if (!peer || peer.id === member.id) {
      return notMember();
    }
    peerId = peer.id;
  }
  const { error } = await service.from('competition_room_messages').insert({
    room_id: member.room_id,
    channel,
    sender_member_id: member.id,
    sender_label: member.display_label,
    peer_member_id: peerId,
    body: text,
  });
  if (error) {
    return { status: 403, body: { error: 'not_member' } };
  }
  return syncRoom(service, member, body);
}

async function startCall(
  service: Service,
  member: MadarasahMember,
  body: CommsBody,
): Promise<{ status: number; body: unknown }> {
  const peer = await memberById(
    service,
    member.room_id,
    typeof body.peer_member_id === 'string' ? body.peer_member_id : '',
    true,
  );
  if (!peer || peer.id === member.id) {
    return notMember();
  }
  const calls = await liveCalls(service, member.room_id, member.id);
  if (calls.length > 0) {
    return { status: 409, body: { error: 'busy' } };
  }
  const { data, error } = await service
    .from('competition_room_calls')
    .insert({
      room_id: member.room_id,
      caller_member_id: member.id,
      caller_label: member.display_label,
      callee_member_id: peer.id,
      callee_label: peer.display_label,
      status: 'ringing',
    })
    .select(
      'id, room_id, caller_member_id, caller_label, callee_member_id, callee_label, status, created_at, updated_at',
    )
    .single();
  if (error || !data) {
    return { status: 403, body: { error: 'not_member' } };
  }
  return { status: 200, body: { ok: true, active_call: callView(data as CallRow, member.id) } };
}

async function loadOwnCall(
  service: Service,
  member: MadarasahMember,
  callId: string,
): Promise<CallRow | null> {
  if (!isUuid(callId)) {
    return null;
  }
  const { data } = await service
    .from('competition_room_calls')
    .select(
      'id, room_id, caller_member_id, caller_label, callee_member_id, callee_label, status, created_at, updated_at',
    )
    .eq('id', callId)
    .eq('room_id', member.room_id)
    .maybeSingle();
  const call = (data as CallRow | null) ?? null;
  if (!call) {
    return null;
  }
  if (call.caller_member_id !== member.id && call.callee_member_id !== member.id) {
    return null;
  }
  return call;
}

export async function dispatchMadarasah(
  service: Service,
  action: CommsAction,
  keyHash: string,
  body: CommsBody,
): Promise<{ status: number; body: unknown }> {
  if (action === 'madarasah_enter') {
    return enterRoom(service, keyHash, body);
  }
  const member = await findActiveMadarasahMember(service, keyHash);
  if (action === 'madarasah_status') {
    return {
      status: 200,
      body: {
        ok: true,
        room_name: member ? MADARASAH_ROOM_NAME : null,
        member: member ? { id: member.id, display_label: member.display_label } : null,
      },
    };
  }
  if (!member) {
    return notMember();
  }
  if (action === 'madarasah_sync') {
    return syncRoom(service, member, body);
  }
  if (action === 'madarasah_send') {
    return sendMessage(service, member, body);
  }
  if (action === 'madarasah_call_start') {
    return startCall(service, member, body);
  }
  const call = await loadOwnCall(service, member, typeof body.call_id === 'string' ? body.call_id : '');
  if (!call) {
    return notMember();
  }
  if (action === 'madarasah_call_respond') {
    if (call.callee_member_id !== member.id || call.status !== 'ringing') {
      return notMember();
    }
    const status = body.accept === true ? 'accepted' : 'declined';
    await service
      .from('competition_room_calls')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', call.id)
      .eq('status', 'ringing');
    return syncRoom(service, member, body);
  }
  if (action === 'madarasah_call_end') {
    if (call.status !== 'ringing' && call.status !== 'accepted') {
      return syncRoom(service, member, body);
    }
    await service
      .from('competition_room_calls')
      .update({ status: 'ended', updated_at: new Date().toISOString() })
      .eq('id', call.id);
    return syncRoom(service, member, body);
  }
  const signal = asSignal(body.signal);
  if (!signal || (call.status !== 'ringing' && call.status !== 'accepted')) {
    return { status: 400, body: { error: 'error' } };
  }
  const { error } = await service.from('competition_room_call_signals').insert({
    call_id: call.id,
    sender_member_id: member.id,
    payload: signal,
  });
  if (error) {
    return { status: 403, body: { error: 'not_member' } };
  }
  return { status: 200, body: { ok: true } };
}
