import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { createServiceClient, createUserClient } from '../_shared/supabase.ts';

const LIMIT = 30;
const LEARNING_NOW_MS = 5 * 60 * 1000;
const AGE_GROUPS = new Set([
  'child_3_6',
  'child_7_10',
  'child_11_14',
  'teen_15_17',
  'adult_18_plus',
]);
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Action = 'publish' | 'list' | 'sync';

type Body = {
  action?: Action;
  participant_key?: string;
  learner_id?: string;
  display_label?: string;
  age_group?: string;
  country_code?: string;
  avatar_key?: string;
  lifetime_points?: number;
  juz_points?: number;
  current_power?: number;
  juz_current_power?: number;
};

type EntryRow = {
  subject_kind: 'guest' | 'profile';
  subject_key: string;
  display_label: string;
  age_group: string;
  country_code: string;
  avatar_key: string;
  lifetime_points: number;
  juz_points: number;
  current_power: number;
  juz_current_power: number;
  last_active_at: string;
};

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = (await request.json()) as Body;
    const action = body.action;
    if (action !== 'publish' && action !== 'list' && action !== 'sync') {
      return jsonResponse({ error: 'Missing action' }, 400);
    }

    const service = createServiceClient();
    const jwtUserId = await readJwtUserId(request);

    if (action === 'list') {
      const ageGroup = AGE_GROUPS.has(body.age_group ?? '') ? body.age_group! : null;
      const learnerId = parseUuid(body.learner_id);
      return jsonResponse(
        await buildSnapshot(service, ageGroup, learnerId),
      );
    }

    const published = await publishEntry(service, body, jwtUserId);
    if ('error' in published) {
      return jsonResponse({ error: published.error }, published.status);
    }

    if (action === 'publish') {
      return jsonResponse({ ok: true });
    }

    return jsonResponse(
      await buildSnapshot(service, published.age_group, published.subject_key),
    );
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : 'Unexpected error' },
      500,
    );
  }
});

async function sha256Hex(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function parseUuid(value: string | undefined): string | null {
  const raw = typeof value === 'string' ? value.trim() : '';
  return UUID_RE.test(raw) ? raw.toLowerCase() : null;
}

function clampPoints(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n) || n < 0) {
    return 0;
  }
  return Math.min(Math.round(n), 10_000_000);
}

function sanitizeDisplayLabel(raw: string): string {
  const cleaned = raw.replace(/\s+/g, ' ').trim().slice(0, 40);
  if (cleaned.includes('@') || cleaned.length < 1) {
    return '';
  }
  return cleaned;
}

async function readJwtUserId(request: Request): Promise<string | null> {
  const header = request.headers.get('Authorization') ?? '';
  if (!header.toLowerCase().startsWith('bearer ')) {
    return null;
  }
  try {
    const client = createUserClient(header);
    const { data } = await client.auth.getUser();
    return data.user?.id ?? null;
  } catch {
    return null;
  }
}

async function publishEntry(
  service: ReturnType<typeof createServiceClient>,
  body: Body,
  jwtUserId: string | null,
): Promise<
  | { subject_key: string; age_group: string }
  | { error: string; status: number }
> {
  const participantKey = typeof body.participant_key === 'string' ? body.participant_key.trim() : '';
  if (participantKey.length < 16) {
    return { error: 'missing_key', status: 400 };
  }
  const display = sanitizeDisplayLabel(typeof body.display_label === 'string' ? body.display_label : '');
  const ageGroup = typeof body.age_group === 'string' ? body.age_group : '';
  if (!display || !AGE_GROUPS.has(ageGroup)) {
    return { error: 'invalid_profile', status: 400 };
  }

  const hash = await sha256Hex(participantKey);
  const learnerId = parseUuid(body.learner_id);
  let kind: 'guest' | 'profile' = 'guest';
  let subjectKey = learnerId;

  if (jwtUserId) {
    kind = 'profile';
    subjectKey = jwtUserId;
    if (learnerId && learnerId !== jwtUserId) {
      const { data } = await service
        .from('profiles')
        .select('id, parent_id')
        .eq('id', learnerId)
        .maybeSingle();
      if (data?.parent_id === jwtUserId) {
        subjectKey = learnerId;
      }
    }
  } else if (!subjectKey) {
    return { error: 'invalid_profile', status: 400 };
  }

  const payload = {
    subject_kind: kind,
    subject_key: subjectKey,
    participant_key_hash: hash,
    display_label: display,
    age_group: ageGroup,
    country_code: (body.country_code ?? '').trim().toUpperCase().slice(0, 2),
    avatar_key: (body.avatar_key ?? 'default-1').trim().slice(0, 32) || 'default-1',
    lifetime_points: clampPoints(body.lifetime_points),
    juz_points: clampPoints(body.juz_points),
    current_power: clampPoints(body.current_power),
    juz_current_power: clampPoints(body.juz_current_power),
    last_active_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (kind === 'guest') {
    const { data: byHash } = await service
      .from('leaderboard_public_entries')
      .select('id, subject_key')
      .eq('subject_kind', 'guest')
      .eq('participant_key_hash', hash)
      .maybeSingle();
    if (byHash?.id) {
      const { error: updateError } = await service
        .from('leaderboard_public_entries')
        .update({ ...payload, subject_key: subjectKey ?? byHash.subject_key })
        .eq('id', byHash.id);
      if (updateError) {
        await service
          .from('leaderboard_public_entries')
          .update({ ...payload, subject_key: byHash.subject_key })
          .eq('id', byHash.id);
        return { subject_key: byHash.subject_key, age_group: ageGroup };
      }
      return { subject_key: subjectKey ?? byHash.subject_key, age_group: ageGroup };
    }
  }

  const { error } = await service.from('leaderboard_public_entries').upsert(payload, {
    onConflict: 'subject_kind,subject_key',
  });
  if (error) {
    return { error: error.message, status: 500 };
  }
  return { subject_key: subjectKey!, age_group: ageGroup };
}

function toPublic(row: EntryRow) {
  return {
    id: row.subject_key,
    kind: row.subject_kind,
    displayName: row.display_label,
    ageGroup: row.age_group,
    countryCode: row.country_code,
    avatarKey: row.avatar_key,
    lifetimePoints: row.lifetime_points,
    juzPoints: row.juz_points,
    currentPower: row.current_power,
    juzCurrentPower: row.juz_current_power,
    lastActiveAt: row.last_active_at,
  };
}

async function fetchOrdered(
  service: ReturnType<typeof createServiceClient>,
  column: 'lifetime_points' | 'juz_current_power',
  ageGroup?: string,
) {
  let query = service
    .from('leaderboard_public_entries')
    .select(
      'subject_kind, subject_key, display_label, age_group, country_code, avatar_key, lifetime_points, juz_points, current_power, juz_current_power, last_active_at',
    )
    .order(column, { ascending: false })
    .order('last_active_at', { ascending: false })
    .limit(LIMIT);
  if (ageGroup) {
    query = query.eq('age_group', ageGroup);
  }
  const { data } = await query;
  return ((data ?? []) as EntryRow[]).map(toPublic);
}

async function rankOf(
  service: ReturnType<typeof createServiceClient>,
  column: 'lifetime_points' | 'juz_current_power',
  points: number,
  subjectKey: string,
  ageGroup?: string,
) {
  let higher = service
    .from('leaderboard_public_entries')
    .select('id', { count: 'exact', head: true })
    .gt(column, points);
  let tied = service
    .from('leaderboard_public_entries')
    .select('id', { count: 'exact', head: true })
    .eq(column, points)
    .lt('subject_key', subjectKey);
  if (ageGroup) {
    higher = higher.eq('age_group', ageGroup);
    tied = tied.eq('age_group', ageGroup);
  }
  const [above, same] = await Promise.all([higher, tied]);
  return (above.count ?? 0) + (same.count ?? 0) + 1;
}

async function totalOf(
  service: ReturnType<typeof createServiceClient>,
  ageGroup?: string,
) {
  let query = service
    .from('leaderboard_public_entries')
    .select('id', { count: 'exact', head: true });
  if (ageGroup) {
    query = query.eq('age_group', ageGroup);
  }
  const { count } = await query;
  return count ?? 0;
}

async function buildSnapshot(
  service: ReturnType<typeof createServiceClient>,
  ageGroup: string | null,
  learnerId: string | null,
) {
  const meRows = learnerId
    ? ((
        await service
          .from('leaderboard_public_entries')
          .select('subject_key, age_group, lifetime_points, juz_current_power, updated_at')
          .eq('subject_key', learnerId)
          .order('updated_at', { ascending: false })
          .limit(1)
      ).data as Array<{
        subject_key: string;
        age_group: string;
        lifetime_points: number;
        juz_current_power: number;
      }> | null)
    : null;
  const me = meRows?.[0] ?? null;

  const age = ageGroup ?? me?.age_group ?? null;
  const [allEntries, ageEntries, juzEntries, learningNowRows, totalAll, totalAge, totalJuz] =
    await Promise.all([
      fetchOrdered(service, 'lifetime_points'),
      age ? fetchOrdered(service, 'lifetime_points', age) : Promise.resolve([]),
      fetchOrdered(service, 'juz_current_power'),
      service
        .from('leaderboard_public_entries')
        .select('subject_key, display_label, last_active_at')
        .gt('last_active_at', new Date(Date.now() - LEARNING_NOW_MS).toISOString())
        .order('last_active_at', { ascending: false })
        .limit(12),
      totalOf(service),
      age ? totalOf(service, age) : Promise.resolve(0),
      totalOf(service),
    ]);

  const myRankAll = me
    ? await rankOf(service, 'lifetime_points', me.lifetime_points, me.subject_key)
    : totalAll + 1;
  const myRankAge =
    me && age
      ? await rankOf(service, 'lifetime_points', me.lifetime_points, me.subject_key, age)
      : totalAge + 1;
  const myRankJuz = me
    ? await rankOf(service, 'juz_current_power', me.juz_current_power, me.subject_key)
    : totalJuz + 1;

  return {
    ok: true,
    all: { entries: allEntries, myRank: myRankAll, total: totalAll },
    age: { entries: ageEntries, myRank: myRankAge, total: totalAge },
    juz: { entries: juzEntries, myRank: myRankJuz, total: totalJuz },
    learningNow: ((learningNowRows.data ?? []) as Array<{
      subject_key: string;
      display_label: string;
    }>).map((row) => ({
      id: row.subject_key,
      displayName: row.display_label,
    })),
  };
}
