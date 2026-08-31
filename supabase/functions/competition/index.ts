import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { createServiceClient } from '../_shared/supabase.ts';
import {
  CODE_ALPHABET,
  MAX_PARTICIPANTS_V1,
  QUESTION_COUNT_BY_TIER,
  QUESTION_SECONDS,
  REVEAL_SECONDS,
  pickChallengeQuestions,
  type CompetitionAgeBand,
  type PublicQuestion,
} from '../_shared/competitionQuestions.ts';

type Action =
  | 'preview'
  | 'join_public'
  | 'create_invite'
  | 'join_code'
  | 'get_state'
  | 'set_ready'
  | 'submit_answer'
  | 'close_round'
  | 'advance'
  | 'request_rematch'
  | 'list_public'
  | 'challenge_player'
  | 'respond_challenge'
  | 'weekly_leaders';

type Body = {
  action?: Action;
  participant_key?: string;
  display_label?: string;
  age_band?: CompetitionAgeBand;
  profile_id?: string | null;
  code?: string;
  challenge_id?: string;
  choice_id?: string;
  target_code?: string;
  accept?: boolean;
};

type ChallengeRow = {
  id: string;
  code: string;
  visibility: 'public' | 'invite';
  age_band: CompetitionAgeBand;
  status: string;
  max_participants: number;
  tier: 1 | 2 | 3;
  question_count: number;
  current_index: number;
  questions_public: PublicQuestion[];
  question_started_at: string | null;
  question_ends_at: string | null;
  reveal_until: string | null;
  last_round_result: Record<string, unknown> | null;
  rematch_code: string | null;
  parent_challenge_id: string | null;
  created_at: string;
  expires_at: string;
  completed_at: string | null;
};

type ParticipantRow = {
  id: string;
  challenge_id: string;
  participant_key_hash: string;
  profile_id: string | null;
  display_label: string;
  age_band: CompetitionAgeBand;
  is_ready: boolean;
  score: number;
  seat_index: number;
  last_seen_at: string;
};

function isAgeBand(value: unknown): value is CompetitionAgeBand {
  return value === 'child' || value === 'teen' || value === 'adult';
}

function normalizeCode(value: string): string {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
}

type PendingChallenge = {
  from_key_hash: string;
  from_label: string;
  from_profile_id: string | null;
  from_age_band: CompetitionAgeBand;
  from_challenge_id: string;
};

function asPending(value: Record<string, unknown> | null | undefined): PendingChallenge | null {
  const raw = value?.pending_challenge;
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const pending = raw as Record<string, unknown>;
  if (typeof pending.from_key_hash !== 'string' || typeof pending.from_label !== 'string') {
    return null;
  }
  if (pending.from_age_band !== 'child' && pending.from_age_band !== 'teen' && pending.from_age_band !== 'adult') {
    return null;
  }
  if (typeof pending.from_challenge_id !== 'string') {
    return null;
  }
  return {
    from_key_hash: pending.from_key_hash,
    from_label: pending.from_label,
    from_profile_id: typeof pending.from_profile_id === 'string' ? pending.from_profile_id : null,
    from_age_band: pending.from_age_band,
    from_challenge_id: pending.from_challenge_id,
  };
}

function isFakeLabel(label: string): boolean {
  const value = label.trim().toLowerCase();
  return value.includes('ai opponent') || value.includes('🤖');
}

function randomCode(): string {
  let code = '';
  for (let i = 0; i < 6; i += 1) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return code;
}

async function sha256Hex(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function sanitizeDisplayLabel(raw: string, seatIndex: number): string {
  const first = raw.trim().split(/\s+/)[0] ?? '';
  const cleaned = first.replace(/[0-9@._/\\]+/g, '').replace(/[^\p{L}\p{M}'’-]/gu, '').slice(0, 16);
  if (cleaned.length < 2 || isFakeLabel(cleaned)) {
    return `Player ${seatIndex + 1}`;
  }
  return cleaned;
}

function roomCap(): number {
  return MAX_PARTICIPANTS_V1;
}

function awardPower(score: number, rank: number, playerCount: number, tier: number): number {
  const participation = 8;
  const answers = Math.max(0, score) * 4;
  const place = rank === 1 ? 12 : rank === 2 && playerCount > 2 ? 6 : 0;
  const harder = Math.max(0, tier - 1) * 6;
  return participation + answers + place + harder;
}

function resolveRewards(power: number, earned: number) {
  const avatar =
    power >= 250
      ? { key: 'sparkle', emoji: '✨' }
      : power >= 180
        ? { key: 'pattern', emoji: '🌿' }
        : power >= 120
          ? { key: 'kaaba', emoji: '🕋' }
          : power >= 80
            ? { key: 'star', emoji: '⭐' }
            : power >= 50
              ? { key: 'quran', emoji: '📖' }
              : power >= 20
                ? { key: 'mosque', emoji: '🕌' }
                : { key: 'crescent', emoji: '🌙' };
  const level_key =
    power >= 280
      ? 'champion'
      : power >= 180
        ? 'diamond'
        : power >= 100
          ? 'gold'
          : power >= 40
            ? 'star'
            : 'beginner';
  return {
    power,
    earned,
    level_key,
    avatar_key: avatar.key,
    avatar_emoji: avatar.emoji,
  };
}

function hoursFromNow(hours: number): string {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}

function secondsFromNow(seconds: number): string {
  return new Date(Date.now() + seconds * 1000).toISOString();
}

function isExpired(row: Pick<ChallengeRow, 'expires_at' | 'status'>): boolean {
  if (row.status === 'expired' || row.status === 'cancelled') {
    return true;
  }
  return Date.parse(row.expires_at) <= Date.now();
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = (await request.json()) as Body;
    const action = body.action;
    if (!action) {
      return jsonResponse({ error: 'Missing action' }, 400);
    }

    const service = createServiceClient();
    const result = await handleAction(service, body);
    return jsonResponse(result.body, result.status);
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : 'Unexpected error' },
      500,
    );
  }
});

async function handleAction(
  service: ReturnType<typeof createServiceClient>,
  body: Body,
): Promise<{ body: unknown; status: number }> {
  const action = body.action!;

  if (action === 'preview') {
    const code = normalizeCode(body.code ?? '');
    if (code.length < 4) {
      return { status: 400, body: { error: 'Enter a valid challenge code' } };
    }
    const challenge = await fetchChallengeByCode(service, code);
    if (!challenge || isExpired(challenge)) {
      return { status: 404, body: { error: 'not_found' } };
    }
    const participants = await fetchParticipants(service, challenge.id);
    return {
      status: 200,
      body: {
        ok: true,
        preview: toPreview(challenge, participants.length),
      },
    };
  }

  const participantKey = (body.participant_key ?? '').trim();
  if (participantKey.length < 16) {
    return { status: 400, body: { error: 'Missing participant key' } };
  }
  const keyHash = await sha256Hex(participantKey);
  const ageBand = isAgeBand(body.age_band) ? body.age_band : null;
  const displayName = typeof body.display_label === 'string' ? body.display_label : '';
  const profileId =
    typeof body.profile_id === 'string' && body.profile_id.length > 0 ? body.profile_id : null;

  if (action === 'join_public') {
    if (!ageBand) {
      return { status: 400, body: { error: 'Missing age group' } };
    }
    const joined = await joinPublic(service, {
      keyHash,
      ageBand,
      displayName,
      profileId,
    });
    return { status: 200, body: await buildState(service, joined.challenge, joined.me) };
  }

  if (action === 'list_public' || action === 'weekly_leaders') {
    if (action === 'weekly_leaders') {
      return {
        status: 200,
        body: {
          ok: true,
          leaders: await weeklyLeaders(service),
          progress: await computeProgress(service, keyHash),
        },
      };
    }
    if (!ageBand) {
      return { status: 400, body: { error: 'Missing age group' } };
    }
    return {
      status: 200,
      body: { ok: true, players: await listAvailablePublic(service, ageBand, null, keyHash) },
    };
  }

  if (action === 'create_invite') {
    if (!ageBand) {
      return { status: 400, body: { error: 'Missing age group' } };
    }
    const created = await createChallenge(service, {
      visibility: 'invite',
      ageBand,
      tier: 1,
      keyHash,
      displayName,
      profileId,
      ttlHours: 24,
    });
    return { status: 200, body: await buildState(service, created.challenge, created.me) };
  }

  if (action === 'join_code') {
    const code = normalizeCode(body.code ?? '');
    if (code.length < 4) {
      return { status: 400, body: { error: 'Enter a valid challenge code' } };
    }
    if (!ageBand) {
      return { status: 400, body: { error: 'Missing age group' } };
    }
    const joined = await joinByCode(service, {
      code,
      keyHash,
      ageBand,
      displayName,
      profileId,
    });
    return { status: joined.errorStatus ?? 200, body: joined.body };
  }

  const challenge = await loadChallengeForParticipant(service, body, keyHash);
  if ('error' in challenge) {
    return { status: challenge.status, body: { error: challenge.error } };
  }

  if (action === 'get_state') {
    await touchParticipant(service, challenge.me.id);
    if (challenge.row.status === 'cancelled' && challenge.row.rematch_code) {
      const dest = await fetchChallengeByCode(service, challenge.row.rematch_code);
      if (dest && !isExpired(dest)) {
        const joined = await joinExisting(service, dest, {
          keyHash,
          ageBand: challenge.me.age_band,
          displayName: challenge.me.display_label,
          profileId,
        });
        return { status: joined.errorStatus ?? 200, body: joined.body };
      }
    }
    return { status: 200, body: await buildState(service, challenge.row, challenge.me) };
  }

  if (action === 'challenge_player') {
    const targetCode = normalizeCode(body.target_code ?? '');
    if (targetCode.length < 4) {
      return { status: 400, body: { error: 'Enter a valid challenge code' } };
    }
    const target = await fetchChallengeByCode(service, targetCode);
    if (!target || isExpired(target) || target.status !== 'waiting') {
      return { status: 404, body: { error: 'not_found' } };
    }
    if (target.id === challenge.row.id) {
      return { status: 400, body: { error: 'error' } };
    }
    const targetPeople = await fetchParticipants(service, target.id);
    if (targetPeople.length >= roomCap()) {
      return { status: 409, body: { error: 'full' } };
    }
    if (asPending(target.last_round_result)) {
      return { status: 409, body: { error: 'busy' } };
    }
    await service
      .from('competition_challenges')
      .update({
        last_round_result: {
          pending_challenge: {
            from_key_hash: keyHash,
            from_label: sanitizeDisplayLabel(challenge.me.display_label, 0),
            from_profile_id: profileId,
            from_age_band: challenge.me.age_band,
            from_challenge_id: challenge.row.id,
          },
        },
      })
      .eq('id', target.id)
      .eq('status', 'waiting');
    return { status: 200, body: await buildState(service, challenge.row, challenge.me) };
  }

  if (action === 'respond_challenge') {
    const fresh = await refetchChallenge(service, challenge.row.id);
    if (!fresh || fresh.status !== 'waiting') {
      return { status: 200, body: await buildState(service, challenge.row, challenge.me) };
    }
    const pending = asPending(fresh.last_round_result);
    if (!pending) {
      return { status: 200, body: await buildState(service, fresh, challenge.me) };
    }
    if (body.accept !== true) {
      await service
        .from('competition_challenges')
        .update({ last_round_result: null })
        .eq('id', fresh.id);
      const next = await refetchChallenge(service, fresh.id);
      return { status: 200, body: await buildState(service, next ?? fresh, challenge.me) };
    }
    const joined = await joinExisting(service, fresh, {
      keyHash: pending.from_key_hash,
      ageBand: pending.from_age_band,
      displayName: pending.from_label,
      profileId: pending.from_profile_id,
    });
    if (joined.errorStatus) {
      return { status: joined.errorStatus, body: joined.body };
    }
    await service
      .from('competition_challenges')
      .update({ last_round_result: null })
      .eq('id', fresh.id);
    await service
      .from('competition_challenges')
      .update({ status: 'cancelled', rematch_code: fresh.code })
      .eq('id', pending.from_challenge_id)
      .eq('status', 'waiting');
    const next = await refetchChallenge(service, fresh.id);
    const me = await refetchParticipant(service, challenge.me.id);
    return { status: 200, body: await buildState(service, next ?? fresh, me ?? challenge.me) };
  }

  if (action === 'set_ready') {
    await maybeExpire(service, challenge.row);
    const fresh = await refetchChallenge(service, challenge.row.id);
    if (!fresh || isExpired(fresh)) {
      return { status: 410, body: { error: 'expired' } };
    }
    if (fresh.status !== 'ready_check' && fresh.status !== 'waiting') {
      return { status: 200, body: await buildState(service, fresh, challenge.me) };
    }
    await service
      .from('competition_participants')
      .update({ is_ready: true, last_seen_at: new Date().toISOString() })
      .eq('id', challenge.me.id);
    const participants = await fetchParticipants(service, fresh.id);
    const humans = participants.filter((person) => !isFakeLabel(person.display_label));
    if (humans.length >= 2 && humans.every((person) => person.is_ready)) {
      await startQuestion(service, fresh, 0, fresh.status === 'ready_check' ? 'ready_check' : 'waiting');
    }
    const next = await refetchChallenge(service, fresh.id);
    const me = await refetchParticipant(service, challenge.me.id);
    return { status: 200, body: await buildState(service, next ?? fresh, me ?? challenge.me) };
  }

  if (action === 'submit_answer') {
    const fresh = await refetchChallenge(service, challenge.row.id);
    if (!fresh || fresh.status !== 'question') {
      return { status: 409, body: { error: 'question_closed' } };
    }
    if (fresh.question_ends_at && Date.parse(fresh.question_ends_at) <= Date.now()) {
      await closeRound(service, fresh);
      const next = await refetchChallenge(service, fresh.id);
      const me = await refetchParticipant(service, challenge.me.id);
      return { status: 200, body: await buildState(service, next ?? fresh, me ?? challenge.me) };
    }
    const question = fresh.questions_public[fresh.current_index];
    if (!question) {
      return { status: 409, body: { error: 'question_closed' } };
    }
    const choiceId = typeof body.choice_id === 'string' ? body.choice_id : '';
    const allowed = question.choices.some((choice) => choice.id === choiceId);
    if (!allowed) {
      return { status: 400, body: { error: 'Invalid answer' } };
    }
    await service.from('competition_answers').upsert(
      {
        challenge_id: fresh.id,
        participant_id: challenge.me.id,
        question_index: fresh.current_index,
        choice_id: choiceId,
        submitted_at: new Date().toISOString(),
      },
      { onConflict: 'challenge_id,participant_id,question_index' },
    );
    await touchParticipant(service, challenge.me.id);
    const me = await refetchParticipant(service, challenge.me.id);
    return { status: 200, body: await buildState(service, fresh, me ?? challenge.me) };
  }

  if (action === 'close_round') {
    const fresh = await refetchChallenge(service, challenge.row.id);
    if (!fresh) {
      return { status: 404, body: { error: 'not_found' } };
    }
    if (fresh.status === 'question') {
      if (!fresh.question_ends_at || Date.parse(fresh.question_ends_at) > Date.now() + 250) {
        return { status: 200, body: await buildState(service, fresh, challenge.me) };
      }
      await closeRound(service, fresh);
    }
    const next = await refetchChallenge(service, fresh.id);
    const me = await refetchParticipant(service, challenge.me.id);
    return { status: 200, body: await buildState(service, next ?? fresh, me ?? challenge.me) };
  }

  if (action === 'advance') {
    const fresh = await refetchChallenge(service, challenge.row.id);
    if (!fresh) {
      return { status: 404, body: { error: 'not_found' } };
    }
    if (fresh.status === 'reveal') {
      if (!fresh.reveal_until || Date.parse(fresh.reveal_until) > Date.now() + 250) {
        return { status: 200, body: await buildState(service, fresh, challenge.me) };
      }
      const nextIndex = fresh.current_index + 1;
      if (nextIndex >= fresh.question_count) {
        await service
          .from('competition_challenges')
          .update({
            status: 'complete',
            completed_at: new Date().toISOString(),
            reveal_until: null,
            question_ends_at: null,
          })
          .eq('id', fresh.id)
          .eq('status', 'reveal');
      } else {
        await startQuestion(service, fresh, nextIndex, 'reveal');
      }
    }
    const next = await refetchChallenge(service, fresh.id);
    const me = await refetchParticipant(service, challenge.me.id);
    return { status: 200, body: await buildState(service, next ?? fresh, me ?? challenge.me) };
  }

  if (action === 'request_rematch') {
    const fresh = await refetchChallenge(service, challenge.row.id);
    if (!fresh || fresh.status !== 'complete') {
      return { status: 409, body: { error: 'not_complete' } };
    }
    if (fresh.tier >= 3) {
      return { status: 200, body: await buildState(service, fresh, challenge.me) };
    }
    if (fresh.rematch_code) {
      const rematch = await fetchChallengeByCode(service, fresh.rematch_code);
      if (rematch && !isExpired(rematch)) {
        const joined = await joinExisting(service, rematch, {
          keyHash,
          ageBand: challenge.me.age_band,
          displayName: challenge.me.display_label,
          profileId,
        });
        return {
          status: joined.errorStatus ?? 200,
          body: joined.body,
        };
      }
    }
    const usedIds = (fresh.questions_public ?? []).map((question) => question.id);
    const created = await createChallenge(service, {
      visibility: 'invite',
      ageBand: fresh.age_band,
      tier: (fresh.tier + 1) as 2 | 3,
      keyHash,
      displayName: challenge.me.display_label,
      profileId,
      ttlHours: 4,
      parentId: fresh.id,
      excludeIds: usedIds,
    });
    await service
      .from('competition_challenges')
      .update({ rematch_code: created.challenge.code })
      .eq('id', fresh.id);
    return { status: 200, body: await buildState(service, created.challenge, created.me) };
  }

  return { status: 400, body: { error: 'Unknown action' } };
}

async function loadChallengeForParticipant(
  service: ReturnType<typeof createServiceClient>,
  body: Body,
  keyHash: string,
): Promise<{ row: ChallengeRow; me: ParticipantRow } | { error: string; status: number }> {
  let row: ChallengeRow | null = null;
  if (body.challenge_id) {
    row = await refetchChallenge(service, body.challenge_id);
  } else if (body.code) {
    row = await fetchChallengeByCode(service, normalizeCode(body.code));
  }
  if (!row) {
    return { error: 'not_found', status: 404 };
  }
  await maybeExpire(service, row);
  const fresh = (await refetchChallenge(service, row.id)) ?? row;
  const { data: me } = await service
    .from('competition_participants')
    .select('*')
    .eq('challenge_id', fresh.id)
    .eq('participant_key_hash', keyHash)
    .maybeSingle();
  if (!me) {
    return { error: 'not_member', status: 403 };
  }
  return { row: fresh, me: me as ParticipantRow };
}

async function joinPublic(
  service: ReturnType<typeof createServiceClient>,
  input: {
    keyHash: string;
    ageBand: CompetitionAgeBand;
    displayName: string;
    profileId: string | null;
  },
) {
  const nowIso = new Date().toISOString();
  const { data: seats } = await service
    .from('competition_participants')
    .select('challenge_id, id')
    .eq('participant_key_hash', input.keyHash);

  for (const seat of seats ?? []) {
    const room = await refetchChallenge(service, seat.challenge_id);
    if (
      room &&
      room.visibility === 'public' &&
      room.status === 'waiting' &&
      room.age_band === input.ageBand &&
      !isExpired(room) &&
      Date.parse(room.expires_at) > Date.parse(nowIso)
    ) {
      const me = await refetchParticipant(service, seat.id);
      if (me) {
        await touchParticipant(service, me.id);
        return { challenge: room, me };
      }
    }
  }

  return createChallenge(service, {
    visibility: 'public',
    ageBand: input.ageBand,
    tier: 1,
    keyHash: input.keyHash,
    displayName: input.displayName,
    profileId: input.profileId,
    ttlHours: 4,
  });
}

async function joinByCode(
  service: ReturnType<typeof createServiceClient>,
  input: {
    code: string;
    keyHash: string;
    ageBand: CompetitionAgeBand;
    displayName: string;
    profileId: string | null;
  },
) {
  const challenge = await fetchChallengeByCode(service, input.code);
  if (!challenge || isExpired(challenge)) {
    return { errorStatus: 404, body: { error: 'not_found' } };
  }
  return joinExisting(service, challenge, input);
}

async function joinExisting(
  service: ReturnType<typeof createServiceClient>,
  challenge: ChallengeRow,
  input: {
    keyHash: string;
    ageBand: CompetitionAgeBand;
    displayName: string;
    profileId: string | null;
  },
): Promise<{
  errorStatus?: number;
  body?: unknown;
  challenge?: ChallengeRow;
  me?: ParticipantRow;
}> {
  if (isExpired(challenge)) {
    return { errorStatus: 410, body: { error: 'expired' } };
  }
  if (challenge.age_band !== input.ageBand) {
    return { errorStatus: 403, body: { error: 'age_mismatch' } };
  }

  const existing = await fetchParticipants(service, challenge.id);
  const already = existing.find((person) => person.participant_key_hash === input.keyHash);
  if (already) {
    await touchParticipant(service, already.id);
    const fresh = (await refetchChallenge(service, challenge.id)) ?? challenge;
    return {
      challenge: fresh,
      me: already,
      body: await buildState(service, fresh, already),
    };
  }

  if (
    input.profileId &&
    existing.some((person) => person.profile_id && person.profile_id === input.profileId)
  ) {
    const sameAccount = existing.find((person) => person.profile_id === input.profileId)!;
    await touchParticipant(service, sameAccount.id);
    const fresh = (await refetchChallenge(service, challenge.id)) ?? challenge;
    return {
      challenge: fresh,
      me: sameAccount,
      body: await buildState(service, fresh, sameAccount),
    };
  }

  if (existing.length >= roomCap()) {
    return { errorStatus: 409, body: { error: 'full' } };
  }
  if (challenge.status !== 'waiting') {
    return { errorStatus: 409, body: { error: 'full' } };
  }

  let me: ParticipantRow | null = null;
  for (let attempt = 0; attempt < roomCap(); attempt += 1) {
    const latest = await fetchParticipants(service, challenge.id);
    if (latest.length >= roomCap()) {
      return { errorStatus: 409, body: { error: 'full' } };
    }
    const seatIndex = latest.length;
    const { data, error } = await service
      .from('competition_participants')
      .insert({
        challenge_id: challenge.id,
        participant_key_hash: input.keyHash,
        profile_id: input.profileId,
        display_label: sanitizeDisplayLabel(input.displayName, seatIndex),
        age_band: input.ageBand,
        seat_index: seatIndex,
        last_seen_at: new Date().toISOString(),
      })
      .select('*')
      .single();
    if (data) {
      me = data as ParticipantRow;
      break;
    }
    if (error?.code === '23505' || String(error?.message ?? '').toLowerCase().includes('unique')) {
      continue;
    }
    return { errorStatus: 500, body: { error: error?.message || 'Could not join' } };
  }
  if (!me) {
    return { errorStatus: 409, body: { error: 'full' } };
  }

  const fresh = (await refetchChallenge(service, challenge.id)) ?? challenge;
  return {
    challenge: fresh,
    me,
    body: await buildState(service, fresh, me),
  };
}

async function createChallenge(
  service: ReturnType<typeof createServiceClient>,
  input: {
    visibility: 'public' | 'invite';
    ageBand: CompetitionAgeBand;
    tier: 1 | 2 | 3;
    keyHash: string;
    displayName: string;
    profileId: string | null;
    ttlHours: number;
    parentId?: string;
    excludeIds?: string[];
  },
) {
  const picked = pickChallengeQuestions(input.tier, input.ageBand, input.excludeIds ?? []);
  let code = randomCode();
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const { data: clash } = await service
      .from('competition_challenges')
      .select('id')
      .eq('code', code)
      .maybeSingle();
    if (!clash) break;
    code = randomCode();
  }

  const { data: challenge, error } = await service
    .from('competition_challenges')
    .insert({
      code,
      visibility: input.visibility,
      age_band: input.ageBand,
      status: 'waiting',
      max_participants: MAX_PARTICIPANTS_V1,
      tier: input.tier,
      question_count: picked.questions.length || QUESTION_COUNT_BY_TIER[input.tier],
      current_index: 0,
      questions_public: picked.questions,
      parent_challenge_id: input.parentId ?? null,
      expires_at: hoursFromNow(input.ttlHours),
    })
    .select('*')
    .single();

  if (error || !challenge) {
    throw new Error(error?.message || 'Could not create challenge');
  }

  await service.from('competition_question_keys').insert({
    challenge_id: challenge.id,
    answer_key: picked.answerKey,
  });

  const { data: me, error: memberError } = await service
    .from('competition_participants')
    .insert({
      challenge_id: challenge.id,
      participant_key_hash: input.keyHash,
      profile_id: input.profileId,
      display_label: sanitizeDisplayLabel(input.displayName, 0),
      age_band: input.ageBand,
      seat_index: 0,
      last_seen_at: new Date().toISOString(),
    })
    .select('*')
    .single();

  if (memberError || !me) {
    throw new Error(memberError?.message || 'Could not join challenge');
  }

  return { challenge: challenge as ChallengeRow, me: me as ParticipantRow };
}

async function startQuestion(
  service: ReturnType<typeof createServiceClient>,
  challenge: ChallengeRow,
  index: number,
  fromStatus: 'ready_check' | 'reveal' | 'waiting',
) {
  await service
    .from('competition_challenges')
    .update({
      status: 'question',
      current_index: index,
      question_started_at: new Date().toISOString(),
      question_ends_at: secondsFromNow(QUESTION_SECONDS),
      reveal_until: null,
      last_round_result: index === 0 ? null : challenge.last_round_result,
    })
    .eq('id', challenge.id)
    .eq('status', fromStatus);
}

async function closeRound(
  service: ReturnType<typeof createServiceClient>,
  challenge: ChallengeRow,
) {
  const question = challenge.questions_public[challenge.current_index];
  if (!question) return;

  const { data: secret } = await service
    .from('competition_question_keys')
    .select('answer_key')
    .eq('challenge_id', challenge.id)
    .maybeSingle();
  const answerKey = (secret?.answer_key ?? {}) as Record<string, string>;
  const correctId = answerKey[question.id] ?? '';

  const participants = await fetchParticipants(service, challenge.id);
  const { data: answers } = await service
    .from('competition_answers')
    .select('*')
    .eq('challenge_id', challenge.id)
    .eq('question_index', challenge.current_index);

  const answerRows = (answers ?? []) as Array<{
    participant_id: string;
    choice_id: string | null;
  }>;

  const players = [];
  for (const person of participants) {
    const submitted = answerRows.find((row) => row.participant_id === person.id);
    const choiceId = submitted?.choice_id ?? null;
    const correct = Boolean(choiceId && choiceId === correctId);
    const points = correct ? 1 : 0;
    if (submitted) {
      await service
        .from('competition_answers')
        .update({ is_correct: correct })
        .eq('challenge_id', challenge.id)
        .eq('participant_id', person.id)
        .eq('question_index', challenge.current_index);
    } else {
      await service.from('competition_answers').upsert(
        {
          challenge_id: challenge.id,
          participant_id: person.id,
          question_index: challenge.current_index,
          choice_id: null,
          submitted_at: new Date().toISOString(),
          is_correct: false,
        },
        { onConflict: 'challenge_id,participant_id,question_index' },
      );
    }
    if (points > 0) {
      await service
        .from('competition_participants')
        .update({ score: person.score + points })
        .eq('id', person.id);
    }
    players.push({
      participant_id: person.id,
      correct,
      points,
      choice_id: choiceId,
    });
  }

  await service
    .from('competition_challenges')
    .update({
      status: 'reveal',
      reveal_until: secondsFromNow(REVEAL_SECONDS),
      last_round_result: {
        question_index: challenge.current_index,
        correct_choice_id: correctId,
        players,
      },
    })
    .eq('id', challenge.id)
    .eq('status', 'question');
}

async function buildState(
  service: ReturnType<typeof createServiceClient>,
  challenge: ChallengeRow,
  me: ParticipantRow,
) {
  await maybeExpire(service, challenge);
  const fresh = (await refetchChallenge(service, challenge.id)) ?? challenge;
  const participants = await fetchParticipants(service, fresh.id);
  const mine = participants.find((person) => person.id === me.id) ?? me;
  const question =
    fresh.status === 'question' || fresh.status === 'reveal' || fresh.status === 'complete'
      ? fresh.questions_public[fresh.current_index] ?? null
      : null;

  let myChoiceId: string | null = null;
  if (fresh.status === 'question' || fresh.status === 'reveal' || fresh.status === 'complete') {
    const { data: myAnswer } = await service
      .from('competition_answers')
      .select('choice_id')
      .eq('challenge_id', fresh.id)
      .eq('participant_id', mine.id)
      .eq('question_index', fresh.current_index)
      .maybeSingle();
    myChoiceId = typeof myAnswer?.choice_id === 'string' ? myAnswer.choice_id : null;
  }

  const hideChoices = fresh.status === 'question';
  const pending = asPending(fresh.last_round_result);
  const lastRound = hideChoices || pending
    ? null
    : (fresh.last_round_result as {
        question_index?: number;
        correct_choice_id?: string;
        players?: Array<{
          participant_id: string;
          correct: boolean;
          points: number;
          choice_id?: string | null;
        }>;
      } | null);

  const humans = participants.filter((person) => !isFakeLabel(person.display_label));
  const available_players =
    (fresh.status === 'waiting' || fresh.status === 'ready_check') && fresh.visibility === 'public'
      ? await listAvailablePublic(service, fresh.age_band, fresh.id, mine.participant_key_hash)
      : [];

  return {
    ok: true,
    challenge: {
      id: fresh.id,
      code: fresh.code,
      visibility: fresh.visibility,
      age_band: fresh.age_band,
      status: fresh.status,
      max_participants: roomCap(),
      participant_count: humans.length,
      is_full: humans.length >= roomCap(),
      tier: fresh.tier,
      question_count: fresh.question_count,
      current_index: fresh.current_index,
      question,
      question_ends_at: fresh.question_ends_at,
      reveal_until: fresh.reveal_until,
      last_round_result: lastRound
        ? {
            question_index: lastRound.question_index ?? fresh.current_index,
            correct_choice_id: lastRound.correct_choice_id ?? null,
            players: (lastRound.players ?? []).map((player) => ({
              participant_id: player.participant_id,
              correct: player.correct,
              points: player.points,
              choice_id: hideChoices ? null : (player.choice_id ?? null),
            })),
          }
        : null,
      players: humans
        .sort((left, right) => left.seat_index - right.seat_index)
        .map((person) => ({
          participant_id: person.id,
          display_label: person.display_label,
          score: person.score,
          is_ready: person.is_ready,
          seat_index: person.seat_index,
          is_you: person.id === mine.id,
        })),
      available_players,
      pending_challenge: pending ? { label: pending.from_label } : null,
      rematch_code: fresh.rematch_code,
      expires_at: fresh.expires_at,
    },
    me: {
      participant_id: mine.id,
      display_label: mine.display_label,
      seat_index: mine.seat_index,
      is_ready: mine.is_ready,
      score: mine.score,
      my_choice_id: myChoiceId,
      rewards: await computeProgress(service, mine.participant_key_hash, {
        challenge: fresh,
        me: mine,
        players: humans,
      }),
    },
  };
}

function toPreview(challenge: ChallengeRow, participantCount: number) {
  const max = roomCap();
  return {
    code: challenge.code,
    age_band: challenge.age_band,
    status: challenge.status,
    participant_count: participantCount,
    max_participants: max,
    is_full: participantCount >= max || challenge.status !== 'waiting',
    tier: challenge.tier,
    question_count: challenge.question_count,
    visibility: challenge.visibility,
  };
}

async function listAvailablePublic(
  service: ReturnType<typeof createServiceClient>,
  ageBand: CompetitionAgeBand,
  excludeChallengeId: string | null,
  excludeKeyHash: string,
) {
  const nowIso = new Date().toISOString();
  const { data: rooms } = await service
    .from('competition_challenges')
    .select('*')
    .eq('visibility', 'public')
    .eq('age_band', ageBand)
    .eq('status', 'waiting')
    .gt('expires_at', nowIso)
    .order('created_at', { ascending: true })
    .limit(20);

  const players = [];
  for (const room of (rooms ?? []) as ChallengeRow[]) {
    if (excludeChallengeId && room.id === excludeChallengeId) {
      continue;
    }
    const people = (await fetchParticipants(service, room.id)).filter(
      (person) => !isFakeLabel(person.display_label),
    );
    if (people.length === 0) {
      continue;
    }
    if (people.some((person) => person.participant_key_hash === excludeKeyHash)) {
      continue;
    }
    if (people.length >= roomCap()) {
      continue;
    }
    const host = people[0]!;
    players.push({
      code: room.code,
      display_label: host.display_label,
      tier: room.tier,
      participant_count: people.length,
      max_participants: roomCap(),
      is_ready: host.is_ready,
    });
  }
  return players;
}

async function computeProgress(
  service: ReturnType<typeof createServiceClient>,
  keyHash: string,
  current?: { challenge: ChallengeRow; me: ParticipantRow; players: ParticipantRow[] },
) {
  const { data: mine } = await service
    .from('competition_participants')
    .select('score, challenge_id')
    .eq('participant_key_hash', keyHash)
    .limit(80);
  const challengeIds = [...new Set((mine ?? []).map((row) => String(row.challenge_id)))];
  const { data: challenges } = challengeIds.length
    ? await service.from('competition_challenges').select('id, status, tier').in('id', challengeIds)
    : { data: [] as Array<{ id: string; status: string; tier: number }> };
  const completeIds = (challenges ?? [])
    .filter((row) => row.status === 'complete')
    .map((row) => row.id);
  const { data: people } = completeIds.length
    ? await service
        .from('competition_participants')
        .select('challenge_id, participant_key_hash, score')
        .in('challenge_id', completeIds)
    : { data: [] as Array<{ challenge_id: string; participant_key_hash: string; score: number }> };

  const byChallenge = new Map<string, Array<{ hash: string; score: number }>>();
  for (const person of people ?? []) {
    const list = byChallenge.get(person.challenge_id) ?? [];
    list.push({
      hash: String(person.participant_key_hash),
      score: Number(person.score ?? 0),
    });
    byChallenge.set(person.challenge_id, list);
  }
  const tierById = new Map((challenges ?? []).map((row) => [row.id, Number(row.tier ?? 1)]));

  let power = 0;
  for (const [id, list] of byChallenge) {
    const meRow = list.find((person) => person.hash === keyHash);
    if (!meRow) continue;
    const ranked = [...list].sort((left, right) => right.score - left.score);
    const rank = ranked.findIndex((person) => person.hash === keyHash) + 1;
    power += awardPower(meRow.score, rank || list.length, list.length, tierById.get(id) ?? 1);
  }

  let earned = 0;
  if (current?.challenge.status === 'complete') {
    const ranked = [...current.players].sort(
      (left, right) => right.score - left.score || left.seat_index - right.seat_index,
    );
    const rank = ranked.findIndex((person) => person.id === current.me.id) + 1;
    earned = awardPower(
      current.me.score,
      rank || current.players.length,
      current.players.length,
      current.challenge.tier,
    );
  }

  return resolveRewards(power, earned);
}

async function weeklyLeaders(service: ReturnType<typeof createServiceClient>) {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: completed } = await service
    .from('competition_challenges')
    .select('id')
    .eq('status', 'complete')
    .gte('completed_at', since)
    .limit(200);
  const ids = (completed ?? []).map((row) => row.id as string);
  if (ids.length === 0) {
    return [];
  }
  const { data: people } = await service
    .from('competition_participants')
    .select('display_label, score, participant_key_hash')
    .in('challenge_id', ids);
  const totals = new Map<string, { display_label: string; score: number }>();
  for (const person of people ?? []) {
    const label = String(person.display_label ?? '');
    const hash = String(person.participant_key_hash ?? '');
    if (!hash || isFakeLabel(label)) {
      continue;
    }
    const current = totals.get(hash) ?? { display_label: label, score: 0 };
    current.score += Number(person.score ?? 0);
    current.display_label = label || current.display_label;
    totals.set(hash, current);
  }
  return [...totals.values()]
    .sort((left, right) => right.score - left.score || left.display_label.localeCompare(right.display_label))
    .slice(0, 3);
}

async function fetchChallengeByCode(
  service: ReturnType<typeof createServiceClient>,
  code: string,
): Promise<ChallengeRow | null> {
  const { data } = await service
    .from('competition_challenges')
    .select('*')
    .eq('code', code)
    .maybeSingle();
  return (data as ChallengeRow | null) ?? null;
}

async function refetchChallenge(
  service: ReturnType<typeof createServiceClient>,
  id: string,
): Promise<ChallengeRow | null> {
  const { data } = await service.from('competition_challenges').select('*').eq('id', id).maybeSingle();
  return (data as ChallengeRow | null) ?? null;
}

async function fetchParticipants(
  service: ReturnType<typeof createServiceClient>,
  challengeId: string,
): Promise<ParticipantRow[]> {
  const { data } = await service
    .from('competition_participants')
    .select('*')
    .eq('challenge_id', challengeId)
    .order('seat_index', { ascending: true });
  return (data ?? []) as ParticipantRow[];
}

async function refetchParticipant(
  service: ReturnType<typeof createServiceClient>,
  id: string,
): Promise<ParticipantRow | null> {
  const { data } = await service.from('competition_participants').select('*').eq('id', id).maybeSingle();
  return (data as ParticipantRow | null) ?? null;
}

async function touchParticipant(
  service: ReturnType<typeof createServiceClient>,
  id: string,
) {
  await service
    .from('competition_participants')
    .update({ last_seen_at: new Date().toISOString() })
    .eq('id', id);
}

async function maybeExpire(
  service: ReturnType<typeof createServiceClient>,
  challenge: ChallengeRow,
) {
  if (challenge.status === 'complete' || challenge.status === 'expired' || challenge.status === 'cancelled') {
    return;
  }
  if (Date.parse(challenge.expires_at) <= Date.now()) {
    await service
      .from('competition_challenges')
      .update({ status: 'expired' })
      .eq('id', challenge.id);
  }
}
