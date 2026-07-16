-- Feature 004: Juz 30 Learning Engine schema (content + progress + RLS)
-- Content is platform-owned (read-only to clients). Progress is learner-owned.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.content_approval_status as enum ('draft', 'approved', 'retired');

create type public.verse_learning_status as enum (
  'not_started',
  'in_progress',
  'learned',
  'mastered'
);

create type public.revision_status as enum ('none', 'due', 'ok');

create type public.surah_learning_status as enum (
  'not_started',
  'in_progress',
  'completed'
);

create type public.learning_event_type as enum (
  'lesson_started',
  'lesson_completed',
  'verse_marked_learned',
  'verse_reviewed',
  'recitation_attempt'
);

-- ---------------------------------------------------------------------------
-- Content tables (global, immutable from clients)
-- ---------------------------------------------------------------------------

create table public.juz (
  number smallint primary key,
  name text not null,
  surah_start smallint not null,
  surah_end smallint not null,
  constraint juz_range_check check (surah_start > 0 and surah_end >= surah_start)
);

create table public.surahs (
  number smallint primary key,
  juz_number smallint not null references public.juz (number),
  name_arabic text not null,
  name_latin text not null,
  ayah_count smallint not null check (ayah_count > 0),
  revelation_type text,
  sort_order smallint not null
);

create index surahs_juz_number_idx on public.surahs (juz_number);

create table public.reciters (
  key text primary key,
  name text not null,
  style text,
  audio_base_url text not null,
  is_default_beginner boolean not null default false,
  created_at timestamptz not null default now()
);

-- At most one default beginner reciter (V1: Mahmoud Khalil Al-Husary).
create unique index reciters_one_default_beginner_idx
  on public.reciters (is_default_beginner)
  where is_default_beginner = true;

create table public.audio_assets (
  key text primary key,
  reciter_key text not null references public.reciters (key),
  url text not null,
  format text not null default 'mp3',
  duration_ms integer,
  approval_status public.content_approval_status not null default 'approved',
  created_at timestamptz not null default now()
);

create index audio_assets_reciter_key_idx on public.audio_assets (reciter_key);

create table public.verses (
  id text primary key,
  surah_number smallint not null references public.surahs (number),
  ayah_number smallint not null check (ayah_number > 0),
  text_uthmani text not null,
  text_imlaei text,
  verse_order_global integer not null,
  audio_asset_key text references public.audio_assets (key),
  content_version integer not null default 1,
  content_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint verses_id_format check (id ~ '^[0-9]+:[0-9]+$'),
  constraint verses_surah_ayah_unique unique (surah_number, ayah_number),
  constraint verses_order_unique unique (verse_order_global)
);

create index verses_surah_number_idx on public.verses (surah_number);

create trigger verses_set_updated_at
before update on public.verses
for each row
execute function public.set_updated_at();

-- Future Tajweed markup (empty in Feature 004)
create table public.verse_tajweed (
  verse_id text primary key references public.verses (id) on delete cascade,
  schema_version integer not null default 1,
  tokens jsonb not null default '[]'::jsonb,
  approval_status public.content_approval_status not null default 'draft',
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger verse_tajweed_set_updated_at
before update on public.verse_tajweed
for each row
execute function public.set_updated_at();

create table public.translations (
  id text primary key,
  language_code text not null,
  name text not null,
  source text not null,
  approval_status public.content_approval_status not null default 'draft',
  created_at timestamptz not null default now()
);

create index translations_language_code_idx on public.translations (language_code);

create table public.verse_translations (
  verse_id text not null references public.verses (id) on delete cascade,
  translation_id text not null references public.translations (id) on delete cascade,
  text text not null,
  approval_status public.content_approval_status not null default 'draft',
  approved_at timestamptz,
  content_version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (verse_id, translation_id)
);

create trigger verse_translations_set_updated_at
before update on public.verse_translations
for each row
execute function public.set_updated_at();

create table public.content_manifest (
  id text primary key,
  juz_number smallint not null references public.juz (number),
  content_version integer not null,
  corpus_hash text not null,
  arabic_source text not null,
  notes text,
  created_at timestamptz not null default now()
);

create table public.lesson_overrides (
  id uuid primary key default gen_random_uuid(),
  surah_number smallint not null references public.surahs (number),
  age_group text not null,
  start_ayah smallint not null check (start_ayah > 0),
  end_ayah smallint not null check (end_ayah >= start_ayah),
  lesson_index smallint not null check (lesson_index > 0),
  constraint lesson_overrides_unique unique (surah_number, age_group, lesson_index)
);

-- ---------------------------------------------------------------------------
-- Progress tables (learner-owned)
-- ---------------------------------------------------------------------------

create table public.learner_learning_state (
  learner_id uuid primary key references public.profiles (id) on delete cascade,
  current_surah_number smallint not null references public.surahs (number),
  current_ayah_number smallint not null check (current_ayah_number > 0),
  current_lesson_key text not null,
  age_group_snapshot text not null,
  updated_at timestamptz not null default now()
);

create trigger learner_learning_state_set_updated_at
before update on public.learner_learning_state
for each row
execute function public.set_updated_at();

create table public.verse_progress (
  learner_id uuid not null references public.profiles (id) on delete cascade,
  verse_id text not null references public.verses (id),
  status public.verse_learning_status not null default 'not_started',
  learned_at timestamptz,
  revision_status public.revision_status not null default 'none',
  memory_score numeric,
  last_practiced_at timestamptz,
  practice_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (learner_id, verse_id)
);

create index verse_progress_learner_status_idx
  on public.verse_progress (learner_id, status);

create trigger verse_progress_set_updated_at
before update on public.verse_progress
for each row
execute function public.set_updated_at();

create table public.surah_progress (
  learner_id uuid not null references public.profiles (id) on delete cascade,
  surah_number smallint not null references public.surahs (number),
  verses_learned integer not null default 0,
  verses_total integer not null,
  status public.surah_learning_status not null default 'not_started',
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (learner_id, surah_number)
);

create trigger surah_progress_set_updated_at
before update on public.surah_progress
for each row
execute function public.set_updated_at();

create table public.lesson_completions (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references public.profiles (id) on delete cascade,
  lesson_key text not null,
  surah_number smallint not null references public.surahs (number),
  start_ayah smallint not null,
  end_ayah smallint not null,
  age_group text not null,
  completed_at timestamptz not null default now(),
  constraint lesson_completions_unique unique (learner_id, lesson_key)
);

create index lesson_completions_learner_idx
  on public.lesson_completions (learner_id, completed_at desc);

create table public.learning_events (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references public.profiles (id) on delete cascade,
  verse_id text references public.verses (id),
  lesson_key text,
  event_type public.learning_event_type not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index learning_events_learner_created_idx
  on public.learning_events (learner_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Helper: can the auth user manage this learner's progress?
-- ---------------------------------------------------------------------------

create or replace function public.can_manage_learner(p_learner_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    p_learner_id = auth.uid()
    or exists (
      select 1
      from public.profiles child
      where child.id = p_learner_id
        and child.role = 'child'
        and child.parent_id = auth.uid()
    );
$$;

revoke all on function public.can_manage_learner(uuid) from public;
grant execute on function public.can_manage_learner(uuid) to authenticated;

-- Keep surah_progress in sync when verse_progress changes
create or replace function public.refresh_surah_progress_for_verse()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_surah smallint;
  v_total integer;
  v_learned integer;
  v_status public.surah_learning_status;
begin
  select surah_number into v_surah from public.verses where id = new.verse_id;
  select ayah_count into v_total from public.surahs where number = v_surah;

  select count(*)::integer into v_learned
  from public.verse_progress vp
  join public.verses v on v.id = vp.verse_id
  where vp.learner_id = new.learner_id
    and v.surah_number = v_surah
    and vp.status in ('learned', 'mastered');

  if v_learned <= 0 then
    v_status := 'not_started';
  elsif v_learned >= v_total then
    v_status := 'completed';
  else
    v_status := 'in_progress';
  end if;

  insert into public.surah_progress (
    learner_id, surah_number, verses_learned, verses_total, status, completed_at
  )
  values (
    new.learner_id,
    v_surah,
    v_learned,
    v_total,
    v_status,
    case when v_status = 'completed' then coalesce(
      (select completed_at from public.surah_progress
       where learner_id = new.learner_id and surah_number = v_surah),
      now()
    ) else null end
  )
  on conflict (learner_id, surah_number) do update set
    verses_learned = excluded.verses_learned,
    verses_total = excluded.verses_total,
    status = excluded.status,
    completed_at = excluded.completed_at,
    updated_at = now();

  return new;
end;
$$;

create trigger verse_progress_refresh_surah
after insert or update on public.verse_progress
for each row
execute function public.refresh_surah_progress_for_verse();

-- ---------------------------------------------------------------------------
-- RLS: content readable; progress learner/parent scoped; no client content writes
-- ---------------------------------------------------------------------------

alter table public.juz enable row level security;
alter table public.surahs enable row level security;
alter table public.reciters enable row level security;
alter table public.audio_assets enable row level security;
alter table public.verses enable row level security;
alter table public.verse_tajweed enable row level security;
alter table public.translations enable row level security;
alter table public.verse_translations enable row level security;
alter table public.content_manifest enable row level security;
alter table public.lesson_overrides enable row level security;
alter table public.learner_learning_state enable row level security;
alter table public.verse_progress enable row level security;
alter table public.surah_progress enable row level security;
alter table public.lesson_completions enable row level security;
alter table public.learning_events enable row level security;

-- Content SELECT for anon + authenticated (guests may prefetch; writes via service role only)
create policy "Anyone can read juz"
on public.juz for select to anon, authenticated using (true);

create policy "Anyone can read surahs"
on public.surahs for select to anon, authenticated using (true);

create policy "Anyone can read reciters"
on public.reciters for select to anon, authenticated using (true);

create policy "Anyone can read approved audio"
on public.audio_assets for select to anon, authenticated
using (approval_status = 'approved');

create policy "Anyone can read verses"
on public.verses for select to anon, authenticated using (true);

create policy "Anyone can read approved tajweed"
on public.verse_tajweed for select to anon, authenticated
using (approval_status = 'approved');

create policy "Anyone can read approved translations catalog"
on public.translations for select to anon, authenticated
using (approval_status = 'approved');

create policy "Anyone can read approved verse translations"
on public.verse_translations for select to anon, authenticated
using (approval_status = 'approved');

create policy "Anyone can read content manifest"
on public.content_manifest for select to anon, authenticated using (true);

create policy "Anyone can read lesson overrides"
on public.lesson_overrides for select to anon, authenticated using (true);

-- Progress policies
create policy "Manage own or child learning state"
on public.learner_learning_state
for all to authenticated
using (public.can_manage_learner(learner_id))
with check (public.can_manage_learner(learner_id));

create policy "Manage own or child verse progress"
on public.verse_progress
for all to authenticated
using (public.can_manage_learner(learner_id))
with check (public.can_manage_learner(learner_id));

create policy "Manage own or child surah progress"
on public.surah_progress
for all to authenticated
using (public.can_manage_learner(learner_id))
with check (public.can_manage_learner(learner_id));

create policy "Manage own or child lesson completions"
on public.lesson_completions
for all to authenticated
using (public.can_manage_learner(learner_id))
with check (public.can_manage_learner(learner_id));

create policy "Manage own or child learning events"
on public.learning_events
for all to authenticated
using (public.can_manage_learner(learner_id))
with check (public.can_manage_learner(learner_id));

-- Explicitly revoke content mutations from client roles (service_role bypasses RLS)
revoke insert, update, delete on public.juz from anon, authenticated;
revoke insert, update, delete on public.surahs from anon, authenticated;
revoke insert, update, delete on public.reciters from anon, authenticated;
revoke insert, update, delete on public.audio_assets from anon, authenticated;
revoke insert, update, delete on public.verses from anon, authenticated;
revoke insert, update, delete on public.verse_tajweed from anon, authenticated;
revoke insert, update, delete on public.translations from anon, authenticated;
revoke insert, update, delete on public.verse_translations from anon, authenticated;
revoke insert, update, delete on public.content_manifest from anon, authenticated;
revoke insert, update, delete on public.lesson_overrides from anon, authenticated;
