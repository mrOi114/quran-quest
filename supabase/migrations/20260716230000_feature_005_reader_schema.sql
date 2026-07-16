-- Feature 005: Qur'an Reader preferences, browse state, and explanation hooks

-- ---------------------------------------------------------------------------
-- Content: child-friendly explanations (Scholar-approved; empty seed OK)
-- ---------------------------------------------------------------------------

create table public.verse_explanations (
  verse_id text not null references public.verses (id) on delete cascade,
  language_code text not null,
  text text not null,
  approval_status public.content_approval_status not null default 'draft',
  approved_at timestamptz,
  content_version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (verse_id, language_code)
);

create index verse_explanations_language_idx
  on public.verse_explanations (language_code);

create trigger verse_explanations_set_updated_at
before update on public.verse_explanations
for each row
execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Learner: reader preferences (distinct from lesson path cursor)
-- ---------------------------------------------------------------------------

create table public.learner_reader_preferences (
  learner_id uuid primary key references public.profiles (id) on delete cascade,
  show_translation boolean not null default true,
  repeat_count text not null default '1'
    check (repeat_count in ('1', '3', 'loop')),
  preferred_reciter_key text not null default 'husary_128'
    references public.reciters (key),
  preferred_translation_id text references public.translations (id),
  updated_at timestamptz not null default now()
);

create trigger learner_reader_preferences_set_updated_at
before update on public.learner_reader_preferences
for each row
execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Learner: browse resume position (not the lesson unlock cursor)
-- ---------------------------------------------------------------------------

create table public.learner_reader_state (
  learner_id uuid primary key references public.profiles (id) on delete cascade,
  last_surah_number smallint not null references public.surahs (number),
  last_ayah_number smallint not null check (last_ayah_number > 0),
  updated_at timestamptz not null default now()
);

create trigger learner_reader_state_set_updated_at
before update on public.learner_reader_state
for each row
execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.verse_explanations enable row level security;
alter table public.learner_reader_preferences enable row level security;
alter table public.learner_reader_state enable row level security;

create policy "Anyone can read approved verse explanations"
on public.verse_explanations for select to anon, authenticated
using (approval_status = 'approved');

create policy "Manage own or child reader preferences"
on public.learner_reader_preferences
for all to authenticated
using (public.can_manage_learner(learner_id))
with check (public.can_manage_learner(learner_id));

create policy "Manage own or child reader state"
on public.learner_reader_state
for all to authenticated
using (public.can_manage_learner(learner_id))
with check (public.can_manage_learner(learner_id));

revoke insert, update, delete on public.verse_explanations from anon, authenticated;
