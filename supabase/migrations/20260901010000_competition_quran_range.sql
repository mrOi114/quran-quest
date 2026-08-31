-- Persist the Qur’an range chosen by the challenger. Locked after accept.

alter table public.competition_challenges
  add column if not exists quran_range text not null default 'juz_30';

comment on column public.competition_challenges.quran_range is
  'Trusted Qur’an range for this match (juz_30, first_5…first_25, all_30). Locked after accept.';
