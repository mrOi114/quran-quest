export type CompetitionAgeBand = 'child' | 'teen' | 'adult';

export type CompetitionVisibility = 'public' | 'invite';

export type CompetitionStatus =
  | 'waiting'
  | 'ready_check'
  | 'question'
  | 'reveal'
  | 'complete'
  | 'expired'
  | 'cancelled';

export type CompetitionChoice = {
  id: string;
  label_en: string;
  label_so: string;
};

export type CompetitionQuestionView = {
  id: string;
  prompt_en: string;
  prompt_so: string;
  choices: CompetitionChoice[];
};

export type CompetitionPlayerView = {
  participant_id: string;
  display_label: string;
  score: number;
  is_ready: boolean;
  seat_index: number;
  is_you: boolean;
};

export type CompetitionLobbyPlayer = {
  code: string;
  display_label: string;
  tier: number;
  participant_count: number;
  max_participants: number;
  is_ready: boolean;
  quran_range?: string;
};

export type CompetitionPendingChallenge = {
  label: string;
  quran_range?: string;
  tier?: number;
  question_count?: number;
  question_seconds?: number;
};

export type CompetitionWeeklyLeader = {
  display_label: string;
  score: number;
};

export type CompetitionPowerLevel = 'beginner' | 'star' | 'gold' | 'diamond' | 'champion';

export type CompetitionPlayerRewards = {
  power: number;
  earned: number;
  level_key: CompetitionPowerLevel;
  avatar_key: string;
  avatar_emoji: string;
};

export type CompetitionRoundPlayer = {
  participant_id: string;
  correct: boolean;
  points: number;
  choice_id: string | null;
};

export type CompetitionRoundResult = {
  question_index: number;
  correct_choice_id: string | null;
  players: CompetitionRoundPlayer[];
};

export type CompetitionChallengeView = {
  id: string;
  code: string;
  visibility: CompetitionVisibility;
  age_band: CompetitionAgeBand;
  status: CompetitionStatus;
  max_participants: number;
  participant_count: number;
  is_full: boolean;
  tier: 1 | 2 | 3;
  question_count: number;
  current_index: number;
  question: CompetitionQuestionView | null;
  question_ends_at: string | null;
  reveal_until: string | null;
  last_round_result: CompetitionRoundResult | null;
  players: CompetitionPlayerView[];
  available_players: CompetitionLobbyPlayer[];
  pending_challenge: CompetitionPendingChallenge | null;
  quran_range?: string;
  rematch_code: string | null;
  expires_at: string;
};

export type CompetitionMeView = {
  participant_id: string;
  display_label: string;
  seat_index: number;
  is_ready: boolean;
  score: number;
  my_choice_id: string | null;
  rewards: CompetitionPlayerRewards | null;
};

export type CompetitionState = {
  ok: true;
  challenge: CompetitionChallengeView;
  me: CompetitionMeView;
};

export type CompetitionPreview = {
  code: string;
  age_band: CompetitionAgeBand;
  status: CompetitionStatus;
  participant_count: number;
  max_participants: number;
  is_full: boolean;
  tier: number;
  question_count: number;
  visibility: CompetitionVisibility;
  quran_range?: string;
};
