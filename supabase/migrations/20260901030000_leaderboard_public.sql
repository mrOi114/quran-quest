-- Public student leaderboard (top 30). Guests and registered learners publish
-- a small projection. Clients never read this table directly.

create table public.leaderboard_public_entries (
  id uuid primary key default gen_random_uuid(),
  subject_kind text not null check (subject_kind in ('guest', 'profile')),
  subject_key text not null,
  participant_key_hash text,
  display_label text not null,
  age_group text not null,
  country_code text not null default '',
  avatar_key text not null default 'default-1',
  lifetime_points integer not null default 0 check (lifetime_points >= 0),
  juz_points integer not null default 0 check (juz_points >= 0),
  current_power integer not null default 0 check (current_power >= 0),
  juz_current_power integer not null default 0 check (juz_current_power >= 0),
  last_active_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint leaderboard_public_subject_unique unique (subject_kind, subject_key)
);

create unique index leaderboard_public_guest_hash_uidx
  on public.leaderboard_public_entries (participant_key_hash)
  where subject_kind = 'guest' and participant_key_hash is not null;

create index leaderboard_public_points_idx
  on public.leaderboard_public_entries (lifetime_points desc, last_active_at desc);

create index leaderboard_public_age_points_idx
  on public.leaderboard_public_entries (age_group, lifetime_points desc);

create index leaderboard_public_juz_idx
  on public.leaderboard_public_entries (juz_current_power desc, last_active_at desc);

create index leaderboard_public_active_idx
  on public.leaderboard_public_entries (last_active_at desc);

alter table public.leaderboard_public_entries enable row level security;
revoke all on public.leaderboard_public_entries from anon, authenticated, public;
