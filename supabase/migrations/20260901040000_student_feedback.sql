-- Student feedback for Founder review. Writes go through the student-feedback
-- edge function (service role). Clients have no table access.

create table public.student_feedback (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  category text not null check (category in ('idea', 'problem', 'praise')),
  message text not null,
  display_name text,
  is_guest boolean not null default false,
  language text,
  participant_key_hash text not null
);

create index student_feedback_created_at_idx
  on public.student_feedback (created_at desc);

create index student_feedback_hash_idx
  on public.student_feedback (participant_key_hash);

alter table public.student_feedback enable row level security;
revoke all on public.student_feedback from anon, authenticated, public;
