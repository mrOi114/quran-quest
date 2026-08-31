import { assertFunctionOk } from '@/features/auth';
import { supabase } from '@/lib/supabase';

import { challengeCodeSchema } from '../schemas';
import type {
  CompetitionAgeBand,
  CompetitionLobbyPlayer,
  CompetitionPlayerRewards,
  CompetitionPreview,
  CompetitionState,
  CompetitionWeeklyLeader,
} from '../types';
import { DEFAULT_QURAN_RANGE, type QuranRangeId } from './quranRange';
import { getOrCreateParticipantKey } from './participantKey';

type Identity = {
  displayLabel: string;
  ageBand: CompetitionAgeBand;
  profileId: string | null;
};

async function invokeCompetition(body: Record<string, unknown>): Promise<CompetitionState> {
  const participant_key = await getOrCreateParticipantKey();
  const result = await supabase.functions.invoke('competition', {
    body: { ...body, participant_key },
  });
  return assertFunctionOk<CompetitionState>(result);
}

export async function previewChallenge(code: string): Promise<CompetitionPreview> {
  const parsed = challengeCodeSchema.parse(code);
  const result = await supabase.functions.invoke('competition', {
    body: { action: 'preview', code: parsed },
  });
  const data = await assertFunctionOk<{ ok: true; preview: CompetitionPreview }>(result);
  return data.preview;
}

export async function joinPublicChallenge(
  identity: Identity,
  quranRange: QuranRangeId = DEFAULT_QURAN_RANGE,
): Promise<CompetitionState> {
  return invokeCompetition({
    action: 'join_public',
    display_label: identity.displayLabel,
    age_band: identity.ageBand,
    profile_id: identity.profileId,
    quran_range: quranRange,
  });
}

export async function createInviteChallenge(
  identity: Identity,
  quranRange: QuranRangeId = DEFAULT_QURAN_RANGE,
): Promise<CompetitionState> {
  return invokeCompetition({
    action: 'create_invite',
    display_label: identity.displayLabel,
    age_band: identity.ageBand,
    profile_id: identity.profileId,
    quran_range: quranRange,
  });
}

export async function joinChallengeByCode(
  code: string,
  identity: Identity,
): Promise<CompetitionState> {
  const parsed = challengeCodeSchema.parse(code);
  return invokeCompetition({
    action: 'join_code',
    code: parsed,
    display_label: identity.displayLabel,
    age_band: identity.ageBand,
    profile_id: identity.profileId,
  });
}

export async function getChallengeState(code: string): Promise<CompetitionState> {
  const parsed = challengeCodeSchema.parse(code);
  return invokeCompetition({
    action: 'get_state',
    code: parsed,
  });
}

export async function setChallengeReady(code: string): Promise<CompetitionState> {
  return invokeCompetition({ action: 'set_ready', code });
}

export async function submitChallengeAnswer(
  code: string,
  choiceId: string,
): Promise<CompetitionState> {
  return invokeCompetition({ action: 'submit_answer', code, choice_id: choiceId });
}

export async function closeChallengeRound(code: string): Promise<CompetitionState> {
  return invokeCompetition({ action: 'close_round', code });
}

export async function advanceChallenge(code: string): Promise<CompetitionState> {
  return invokeCompetition({ action: 'advance', code });
}

export async function requestHarderChallenge(code: string): Promise<CompetitionState> {
  return invokeCompetition({ action: 'request_rematch', code });
}

export async function listPublicPlayers(
  ageBand: CompetitionAgeBand,
): Promise<CompetitionLobbyPlayer[]> {
  const participant_key = await getOrCreateParticipantKey();
  const result = await supabase.functions.invoke('competition', {
    body: { action: 'list_public', participant_key, age_band: ageBand },
  });
  const data = await assertFunctionOk<{ ok: true; players: CompetitionLobbyPlayer[] }>(result);
  return data.players ?? [];
}

export async function challengePublicPlayer(
  code: string,
  targetCode: string,
  quranRange: QuranRangeId = DEFAULT_QURAN_RANGE,
): Promise<CompetitionState> {
  return invokeCompetition({
    action: 'challenge_player',
    code,
    target_code: targetCode,
    quran_range: quranRange,
  });
}

export async function respondPublicChallenge(
  code: string,
  accept: boolean,
): Promise<CompetitionState> {
  return invokeCompetition({ action: 'respond_challenge', code, accept });
}

export async function fetchWeeklyLeaders(): Promise<{
  leaders: CompetitionWeeklyLeader[];
  progress: CompetitionPlayerRewards | null;
}> {
  const participant_key = await getOrCreateParticipantKey();
  const result = await supabase.functions.invoke('competition', {
    body: { action: 'weekly_leaders', participant_key },
  });
  const data = await assertFunctionOk<{
    ok: true;
    leaders: CompetitionWeeklyLeader[];
    progress?: CompetitionPlayerRewards | null;
  }>(result);
  return {
    leaders: data.leaders ?? [],
    progress: data.progress ?? null,
  };
}

export function localizeCompetitionError(
  message: string,
  t: (key: 'competition.notFound' | 'competition.expired' | 'competition.roomFull' | 'competition.ageMismatch' | 'competition.error' | 'competition.rangeUnavailable') => string,
): string {
  if (message === 'not_found') return t('competition.notFound');
  if (message === 'expired') return t('competition.expired');
  if (message === 'full') return t('competition.roomFull');
  if (message === 'age_mismatch') return t('competition.ageMismatch');
  if (message === 'busy') return t('competition.roomFull');
  if (message === 'range_unavailable') return t('competition.rangeUnavailable');
  if (message === 'not_member') return t('competition.error');
  return t('competition.error');
}
