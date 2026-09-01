import type { ActiveLearner, AgeGroupId } from '@/features/auth';
import { AGE_GROUPS, assertFunctionOk } from '@/features/auth';
import { getOrCreateParticipantKey } from '@/features/competition/services/participantKey';
import { supabase } from '@/lib/supabase';
import { LEADERBOARD_PUBLIC_LIMIT } from '../constants';
import type { PublicLeaderboardSnapshot } from '../types';

const AGE_GROUP_IDS = new Set<string>(AGE_GROUPS.map((item) => item.id));

function isAgeGroup(value: string): value is AgeGroupId {
  return AGE_GROUP_IDS.has(value);
}

export async function syncPublicLeaderboard(options: {
  learner: ActiveLearner;
  ageGroup: AgeGroupId;
  lifetimePoints: number;
  juzPoints: number;
  currentPower: number;
  juzCurrentPower: number;
}): Promise<PublicLeaderboardSnapshot | null> {
  try {
    const participant_key = await getOrCreateParticipantKey();
    const result = await supabase.functions.invoke('leaderboard', {
      body: {
        action: 'sync',
        participant_key,
        learner_id: options.learner.id,
        display_label: options.learner.display_name,
        age_group: options.ageGroup,
        country_code: options.learner.country_code,
        avatar_key: options.learner.avatar_key,
        lifetime_points: options.lifetimePoints,
        juz_points: options.juzPoints,
        current_power: options.currentPower,
        juz_current_power: options.juzCurrentPower,
      },
    });
    const data = await assertFunctionOk<PublicLeaderboardSnapshot & { ok?: true }>(result);
    if (!data.all || !Array.isArray(data.all.entries)) {
      return null;
    }
    return normalizeSnapshot(data);
  } catch {
    return null;
  }
}

export async function publishPublicLeaderboard(options: {
  learner: ActiveLearner;
  lifetimePoints: number;
  juzPoints: number;
  currentPower: number;
  juzCurrentPower: number;
  ageGroup: AgeGroupId;
}): Promise<void> {
  const participant_key = await getOrCreateParticipantKey();
  const result = await supabase.functions.invoke('leaderboard', {
    body: {
      action: 'publish',
      participant_key,
      learner_id: options.learner.id,
      display_label: options.learner.display_name,
      age_group: options.ageGroup,
      country_code: options.learner.country_code,
      avatar_key: options.learner.avatar_key,
      lifetime_points: options.lifetimePoints,
      juz_points: options.juzPoints,
      current_power: options.currentPower,
      juz_current_power: options.juzCurrentPower,
    },
  });
  await assertFunctionOk<{ ok: true }>(result);
}

function normalizeSnapshot(raw: PublicLeaderboardSnapshot): PublicLeaderboardSnapshot {
  return {
    all: normalizeSlice(raw.all),
    age: normalizeSlice(raw.age),
    juz: normalizeSlice(raw.juz),
    learningNow: (raw.learningNow ?? [])
      .filter((row) => row.id && row.displayName)
      .slice(0, 12),
  };
}

function normalizeSlice(slice: PublicLeaderboardSnapshot['all'] | undefined) {
  const seen = new Set<string>();
  const entries = (slice?.entries ?? [])
    .filter((row) => {
      if (!row?.id || !row.displayName || !isAgeGroup(row.ageGroup) || seen.has(row.id)) {
        return false;
      }
      seen.add(row.id);
      return true;
    })
    .slice(0, LEADERBOARD_PUBLIC_LIMIT)
    .map((row) => ({
      ...row,
      ageGroup: row.ageGroup,
      lifetimePoints: Math.max(0, Number(row.lifetimePoints) || 0),
      juzPoints: Math.max(0, Number(row.juzPoints) || 0),
      currentPower: Math.max(0, Number(row.currentPower) || 0),
      juzCurrentPower: Math.max(0, Number(row.juzCurrentPower) || 0),
      countryCode: row.countryCode ?? '',
      avatarKey: row.avatarKey || 'default-1',
    }));
  return {
    entries,
    myRank: Math.max(1, Number(slice?.myRank) || entries.length + 1),
    total: Math.max(entries.length, Number(slice?.total) || entries.length),
  };
}
