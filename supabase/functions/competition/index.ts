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
  | 'play_against_ai';

type Body = {
  action?: Action;
  participant_key?: string;
  display_label?: string;
  age_band?: CompetitionAgeBand;
  profile_id?: string | null;
  code?: string;
  challenge_id?: string;
  choice_id?: string;
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

const AI_OPPONENT_LABEL = '🤖 AI Opponent';

function isAiParticipant(person: { display_label: string }): boolean {
  return person.display_label === AI_OPPONENT_LABEL;
}

function hashSeed(text: string): number {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function aiAccuracy(ageBand: CompetitionAgeBand, tier: 1 | 2 | 3): number {
  const base = ageBand === 'child' ? 0.74 : ageBand === 'teen' ? 0.66 : 0.62;
  const penalty = (tier - 1) * 0.08;
  return Math.min(0.82, Math.max(0.42, base - penalty));
}

/** Picks from the same choices. Does not read the human answer. Correctness is scored later. */
function pickAiChoice(options: {
  challengeId: string;
  questionIndex: number;
  choices: Array<{ id: string }>;
  correctId: string;
  ageBand: CompetitionAgeBand;
  tier: 1 | 2 | 3;
}): string {
  const ids = options.choices.map((choice) => choice.id);
  if (ids.length === 0) {
    return options.correctId;
  }
  const seed = hashSeed(`${options.challengeId}:${options.questionIndex}:ai-opponent`);
  const roll = (seed % 1000) / 1000;
  if (roll < aiAccuracy(options.ageBand, options.tier) && ids.includes(options.correctId)) {
    return options.correctId;
  }
  const wrong = ids.filter((id) => id !== options.correctId);
  if (wrong.length === 0) {
    return ids[0]!;
  }
  return wrong[seed % wrong.length]!;
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
  if (cleaned.length < 2) {
    return seatIndex === 0 ? 'Player 1' : 'Player 2';
  }
  return cleaned;
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
    return { status: 200, body: await buildState(service, challenge.row, challenge.me) };
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
    if (participants.length >= 2 && participants.every((person) => person.is_ready)) {
      if (fresh.status === 'waiting') {
        await service
          .from('competition_challenges')
          .update({ status: 'ready_check' })
          .eq('id', fresh.id)
          .eq('status', 'waiting');
      }
      await startQuestion(service, fresh, 0, 'ready_check');
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
  const { data: rooms } = await service
    .from('competition_challenges')
    .select('*')
    .eq('visibility', 'public')
    .eq('age_band', input.ageBand)
    .eq('status', 'waiting')
    .gt('expires_at', nowIso)
    .order('created_at', { ascending: true })
    .limit(12);

  for (const room of (rooms ?? []) as ChallengeRow[]) {
    const joined = await joinExisting(service, room, input);
    if (!joined.errorStatus) {
      return { challenge: joined.challenge!, me: joined.me! };
    }
    if (joined.errorStatus !== 409) {
      continue;
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

  if (existing.length >= challenge.max_participants) {
    return { errorStatus: 409, body: { error: 'full' } };
  }
  if (challenge.status !== 'waiting') {
    return { errorStatus: 409, body: { error: 'full' } };
  }

  const seatIndex = existing.length;
  const insert = {
    challenge_id: challenge.id,
    participant_key_hash: input.keyHash,
    profile_id: input.profileId,
    display_label: sanitizeDisplayLabel(input.displayName, seatIndex),
    age_band: input.ageBand,
    seat_index: seatIndex,
    last_seen_at: new Date().toISOString(),
  };

  const { data: me, error } = await service
    .from('competition_participants')
    .insert(insert)
    .select('*')
    .single();

  if (error || !me) {
    if (String(error?.message ?? '').toLowerCase().includes('unique') || error?.code === '23505') {
      return { errorStatus: 409, body: { error: 'full' } };
    }
    return { errorStatus: 500, body: { error: error?.message || 'Could not join' } };
  }

  const participants = await fetchParticipants(service, challenge.id);
  if (participants.length >= 2 && challenge.status === 'waiting') {
    await service
      .from('competition_challenges')
      .update({ status: 'ready_check' })
      .eq('id', challenge.id)
      .eq('status', 'waiting');
  }

  const fresh = (await refetchChallenge(service, challenge.id)) ?? challenge;
  const mine = me as ParticipantRow;
  return {
    challenge: fresh,
    me: mine,
    body: await buildState(service, fresh, mine),
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
  fromStatus: 'ready_check' | 'reveal',
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
  const isFull = participants.length >= fresh.max_participants;
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
  const lastRound = hideChoices
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

  return {
    ok: true,
    challenge: {
      id: fresh.id,
      code: fresh.code,
      visibility: fresh.visibility,
      age_band: fresh.age_band,
      status: fresh.status,
      max_participants: fresh.max_participants,
      participant_count: participants.length,
      is_full: isFull,
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
      players: participants
        .sort((left, right) => left.seat_index - right.seat_index)
        .map((person) => ({
          participant_id: person.id,
          display_label: person.display_label,
          score: person.score,
          is_ready: person.is_ready,
          seat_index: person.seat_index,
          is_you: person.id === mine.id,
        })),
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
    },
  };
}

function toPreview(challenge: ChallengeRow, participantCount: number) {
  return {
    code: challenge.code,
    age_band: challenge.age_band,
    status: challenge.status,
    participant_count: participantCount,
    max_participants: challenge.max_participants,
    is_full: participantCount >= challenge.max_participants || challenge.status !== 'waiting',
    tier: challenge.tier,
    question_count: challenge.question_count,
    visibility: challenge.visibility,
  };
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
