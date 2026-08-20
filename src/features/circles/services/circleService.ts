import { supabase } from '@/lib/supabase';
import type { CircleKind, CircleMemberRole, Json, TeacherApprovalStatus } from '@/types';

import { createCircleSchema, joinCircleSchema } from '../schemas';
import type { CircleDirectoryMember, CircleSummary, PendingTeacher, TeacherRequestState } from '../types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asBoolean(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function asNullableString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function rpcError(error: { message?: string } | null, fallback: string): Error {
  return new Error(error?.message || fallback);
}

function parseMember(value: unknown): CircleDirectoryMember | null {
  if (!isRecord(value)) {
    return null;
  }
  const profileId = asString(value.profile_id);
  const memberRole = asString(value.member_role);
  const profileRole = asString(value.profile_role);
  if (!profileId) {
    return null;
  }
  if (
    memberRole !== 'admin' &&
    memberRole !== 'teacher' &&
    memberRole !== 'member' &&
    memberRole !== 'child'
  ) {
    return null;
  }
  if (profileRole !== 'adult' && profileRole !== 'parent' && profileRole !== 'child') {
    return null;
  }
  return {
    profileId,
    displayName: asString(value.display_name, 'Member'),
    avatarKey: asString(value.avatar_key, 'default-1'),
    memberRole: memberRole as CircleMemberRole,
    profileRole,
    age: typeof value.age === 'number' ? value.age : null,
    joinedAt: asString(value.joined_at),
    timeoutUntil: asNullableString(value.timeout_until),
    timedOut: asBoolean(value.timed_out),
  };
}

function parseCircle(value: unknown): CircleSummary {
  if (!isRecord(value)) {
    throw new Error('Access denied');
  }
  const kind = asString(value.kind);
  if (kind !== 'public' && kind !== 'madrasah') {
    throw new Error('Access denied');
  }
  const myRoleRaw = value.my_role;
  const myRole =
    myRoleRaw === 'admin' ||
    myRoleRaw === 'teacher' ||
    myRoleRaw === 'member' ||
    myRoleRaw === 'child'
      ? myRoleRaw
      : null;
  const members = Array.isArray(value.members)
    ? value.members.map(parseMember).filter((row): row is CircleDirectoryMember => Boolean(row))
    : [];

  return {
    id: asString(value.id),
    kind,
    name: asString(value.name, 'Circle'),
    creatorId: asString(value.creator_id),
    joinCode: asString(value.join_code),
    chatEnabled: asBoolean(value.chat_enabled, true),
    audioEnabled: asBoolean(value.audio_enabled),
    isActive: asBoolean(value.is_active, true),
    createdAt: asString(value.created_at),
    memberCount: asNumber(value.member_count),
    memberLimit: asNumber(value.member_limit, 7),
    myRole,
    timeoutUntil: asNullableString(value.timeout_until),
    timedOut: asBoolean(value.timed_out),
    canManage: asBoolean(value.can_manage),
    isAdmin: asBoolean(value.is_admin),
    members,
  };
}

async function rpcJson(name: string, args?: Record<string, unknown>): Promise<unknown> {
  const { data, error } = await supabase.rpc(name as never, args as never);
  if (error) {
    throw rpcError(error, 'Access denied');
  }
  return data as Json;
}

export async function fetchMyCircles(): Promise<CircleSummary[]> {
  const data = await rpcJson('list_my_circles');
  if (!Array.isArray(data)) {
    return [];
  }
  return data.map(parseCircle).filter((circle) => Boolean(circle.id));
}

export async function fetchCircle(circleId: string): Promise<CircleSummary> {
  return parseCircle(await rpcJson('get_circle', { p_circle_id: circleId }));
}

export async function createCircle(input: { kind: CircleKind; name: string }): Promise<CircleSummary> {
  const parsed = createCircleSchema.parse(input);
  return parseCircle(
    await rpcJson('create_circle', { p_kind: parsed.kind, p_name: parsed.name }),
  );
}

export async function joinCircle(joinCode: string): Promise<CircleSummary> {
  const parsed = joinCircleSchema.parse({ joinCode });
  return parseCircle(await rpcJson('join_circle', { p_join_code: parsed.joinCode }));
}

export async function connectChildToCircle(
  circleId: string,
  childId: string,
): Promise<CircleSummary> {
  return parseCircle(
    await rpcJson('connect_child_to_circle', {
      p_circle_id: circleId,
      p_child_id: childId,
    }),
  );
}

export async function timeoutCircleMember(
  circleId: string,
  profileId: string,
): Promise<CircleSummary> {
  return parseCircle(
    await rpcJson('timeout_circle_member', {
      p_circle_id: circleId,
      p_profile_id: profileId,
    }),
  );
}

export async function permanentlyRemoveCircleMember(
  circleId: string,
  profileId: string,
): Promise<CircleSummary> {
  return parseCircle(
    await rpcJson('permanently_remove_circle_member', {
      p_circle_id: circleId,
      p_profile_id: profileId,
    }),
  );
}

export async function setCircleChatEnabled(
  circleId: string,
  enabled: boolean,
): Promise<CircleSummary> {
  return parseCircle(
    await rpcJson('set_circle_chat_enabled', {
      p_circle_id: circleId,
      p_enabled: enabled,
    }),
  );
}

export async function setCircleAudioEnabled(
  circleId: string,
  enabled: boolean,
): Promise<CircleSummary> {
  return parseCircle(
    await rpcJson('set_circle_audio_enabled', {
      p_circle_id: circleId,
      p_enabled: enabled,
    }),
  );
}

export async function requestTeacherRole(): Promise<TeacherRequestState> {
  const data = await rpcJson('request_teacher_role');
  if (!isRecord(data)) {
    throw new Error('Access denied');
  }
  const status = asString(data.status);
  if (status !== 'pending' && status !== 'approved' && status !== 'revoked') {
    throw new Error('Access denied');
  }
  return {
    profileId: asString(data.profile_id),
    status: status as TeacherApprovalStatus,
    bootstrap: asBoolean(data.bootstrap),
  };
}

export async function approveTeacher(profileId: string): Promise<void> {
  await rpcJson('approve_teacher', { p_profile_id: profileId });
}

export async function fetchPendingTeachers(): Promise<PendingTeacher[]> {
  const data = await rpcJson('list_pending_teachers');
  if (!Array.isArray(data)) {
    return [];
  }
  return data
    .map((row) => {
      if (!isRecord(row)) {
        return null;
      }
      const status = asString(row.status);
      if (status !== 'pending' && status !== 'approved' && status !== 'revoked') {
        return null;
      }
      return {
        profileId: asString(row.profile_id),
        displayName: asString(row.display_name, 'Teacher'),
        status: status as TeacherApprovalStatus,
        requestedAt: asString(row.requested_at),
      };
    })
    .filter((row): row is PendingTeacher => Boolean(row?.profileId));
}

export async function fetchMyTeacherStatus(
  profileId: string,
): Promise<TeacherApprovalStatus | null> {
  const { data, error } = await supabase
    .from('teacher_approvals')
    .select('status')
    .eq('profile_id', profileId)
    .maybeSingle();
  if (error) {
    throw rpcError(error, 'Could not load teacher permission');
  }
  const status = data?.status;
  if (status === 'pending' || status === 'approved' || status === 'revoked') {
    return status;
  }
  return null;
}

export function isPublicCircle(circle: CircleSummary): boolean {
  return circle.kind === 'public';
}

export function isMadrasahCircle(circle: CircleSummary): boolean {
  return circle.kind === 'madrasah';
}
