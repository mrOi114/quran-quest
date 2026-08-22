-- Qur’an Competition Room
-- Isolated from lessons, reader, Family, and Circle.
-- Mutations go through the `competition` edge function (service role).
-- Clients do not receive SELECT on invite codes or answer keys.

create type public.competition_visibility as enum ('public', 'invite');

create type public.competition_status as enum (
  'waiting',
  'ready_check',
  'question',
  'reveal',
  'complete',
  'expired',
  'cancelled'
);

create type public.competition_age_band as enum ('child', 'teen', 'adult');

create table public.competition_challenges (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  visibility public.competition_visibility not null,
  age_band public.competition_age_band not null,
  status public.competition_status not null default 'waiting',
  max_participants integer not null default 2
    check (max_participants >= 2 and max_participants <= 50),
  tier integer not null default 1 check (tier between 1 and 3),
  question_count integer not null,
  current_index integer not null default 0,
  questions_public jsonb not null default '[]'::jsonb,
  question_started_at timestamptz,
  question_ends_at timestamptz,
  reveal_until timestamptz,
  last_round_result jsonb,
  rematch_code text,
  parent_challenge_id uuid references public.competition_challenges(id) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  completed_at timestamptz
);

create index competition_challenges_public_waiting_idx
  on public.competition_challenges (age_band, status, expires_at)
  where visibility = 'public' and status = 'waiting';

create index competition_challenges_expires_idx
  on public.competition_challenges (expires_at);

create table public.competition_question_keys (
  challenge_id uuid primary key
    references public.competition_challenges(id) on delete cascade,
  answer_key jsonb not null
);

create table public.competition_participants (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null
    references public.competition_challenges(id) on delete cascade,
  participant_key_hash text not null,
  profile_id uuid references public.profiles(id) on delete set null,
  display_label text not null,
  age_band public.competition_age_band not null,
  is_ready boolean not null default false,
  score integer not null default 0,
  seat_index integer not null check (seat_index >= 0),
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (challenge_id, participant_key_hash),
  unique (challenge_id, seat_index)
);

create unique index competition_participants_profile_unique
  on public.competition_participants (challenge_id, profile_id)
  where profile_id is not null;

create table public.competition_answers (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null
    references public.competition_challenges(id) on delete cascade,
  participant_id uuid not null
    references public.competition_participants(id) on delete cascade,
  question_index integer not null,
  choice_id text,
  submitted_at timestamptz,
  is_correct boolean,
  unique (challenge_id, participant_id, question_index)
);

create index competition_answers_challenge_idx
  on public.competition_answers (challenge_id, question_index);

alter table public.competition_challenges enable row level security;
alter table public.competition_question_keys enable row level security;
alter table public.competition_participants enable row level security;
alter table public.competition_answers enable row level security;

-- No client policies: guests have no JWT, and invite codes must not be enumerable.
revoke all on public.competition_challenges from anon, authenticated, public;
revoke all on public.competition_question_keys from anon, authenticated, public;
revoke all on public.competition_participants from anon, authenticated, public;
revoke all on public.competition_answers from anon, authenticated, public;

comment on table public.competition_challenges is
  'Qur’an Competition Room matches. 2 participants in v1; max_participants allows larger rooms later.';
comment on table public.competition_question_keys is
  'Correct answers. Service role only. Never grant to anon/authenticated.';
comment on table public.competition_participants is
  'Competition seats. participant_key_hash and profile_id stay server-side.';
comment on table public.competition_answers is
  'Private per-round answers until the server publishes last_round_result.';
