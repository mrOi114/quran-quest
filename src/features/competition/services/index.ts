export { resolveCompetitionAgeBand, ageGroupToCompetitionBand } from './ageBand';
export {
  previewChallenge,
  joinPublicChallenge,
  createInviteChallenge,
  joinChallengeByCode,
  getChallengeState,
  setChallengeReady,
  submitChallengeAnswer,
  closeChallengeRound,
  advanceChallenge,
  requestHarderChallenge,
  listPublicPlayers,
  challengePublicPlayer,
  respondPublicChallenge,
  fetchWeeklyLeaders,
  localizeCompetitionError,
} from './competitionService';
export { getOrCreateParticipantKey } from './participantKey';
export {
  savePendingChallengeCode,
  peekPendingChallengeCode,
  consumePendingChallengeCode,
  normalizeChallengeCode,
} from './pendingChallenge';
export { buildChallengeUrl, shareChallengeInvite, buildInviteMessage } from './inviteShare';
export { localizeCompetitionQuestion, formatCompetitionTimer } from './localizeQuestion';
export { buildCelebrationSummary } from './finalRanking';
export type { CelebrationSummary, CelebrationRow } from './finalRanking';
export {
  MOTIVATION_CLIPS,
  pickMotivationClipIds,
  joinClipText,
  motivationToneForLearner,
  isPlayfulMotivation,
} from './motivationClips';
export { playGreetingOnce, playMotivationEvent, stopMotivationSpeech } from './competitionVoice';
export { useMotivationSound } from './voicePreference';
export {
  DEFAULT_QURAN_RANGE,
  QURAN_RANGE_OPTIONS,
  isQuranRangeId,
  isQuranRangePlayable,
  rangeLabelKey,
} from './quranRange';
export type { QuranRangeId } from './quranRange';
