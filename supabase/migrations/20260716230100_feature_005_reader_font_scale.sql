-- Feature 005: optional reader font scale (null = age-group default)

alter table public.learner_reader_preferences
  add column if not exists font_scale text
    check (font_scale is null or font_scale in ('default', 'large', 'xlarge'));

comment on column public.learner_reader_preferences.font_scale is
  'Optional Arabic size override; null means use age-group default. Never affects Uthmani text content.';
