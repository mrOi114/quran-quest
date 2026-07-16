-- Feature 005: reserved future reader settings (no UI in 005)
-- Keys are app-defined; empty object means unset. Field-by-field merge uses null/missing keys.

alter table public.learner_reader_preferences
  add column if not exists future_settings jsonb not null default '{}'::jsonb;

comment on column public.learner_reader_preferences.future_settings is
  'Reserved for future Reader options (auto-play next, playback speed, mushaf style, night mode). Empty object = unset. Never stores Qur''an Arabic text.';
