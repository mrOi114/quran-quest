-- Guest Mode Qur’an Competition: 5 real players per room.
-- Does not drop v1 tables. New rooms already insert max_participants from the Edge Function.

alter table public.competition_challenges
  alter column max_participants set default 5;

comment on table public.competition_challenges is
  'Qur’an Competition Room matches. Maximum 5 real players. Server enforces capacity.';
