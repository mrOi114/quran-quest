-- Feature 004 update: ensure default beginner Qari column exists (idempotent)
-- for databases that already applied an earlier schema without this flag.

alter table public.reciters
  add column if not exists is_default_beginner boolean not null default false;

create unique index if not exists reciters_one_default_beginner_idx
  on public.reciters (is_default_beginner)
  where is_default_beginner = true;

-- Clear any prior default, then mark Al-Husary when present (seed may run before or after).
update public.reciters
set is_default_beginner = false
where is_default_beginner = true
  and key <> 'husary_128';

update public.reciters
set is_default_beginner = true
where key = 'husary_128';

comment on column public.reciters.is_default_beginner is
  'V1 beginner memorization default (Mahmoud Khalil Al-Husary). Future settings may pick other approved reciters.';
