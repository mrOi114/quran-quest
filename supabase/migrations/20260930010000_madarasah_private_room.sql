-- Private Madarasah 1 room. The access code is not stored here.
-- Clients have no table access. The competition edge function uses the service role.

create table public.competition_private_rooms (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  display_name text not null,
  created_at timestamptz not null default now()
);

insert into public.competition_private_rooms (slug, display_name)
values ('madarasah_1', 'Madarasah 1');

create table public.competition_private_members (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.competition_private_rooms(id) on delete cascade,
  participant_key_hash text not null,
  profile_id uuid,
  display_label text not null,
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  last_seen_at timestamptz not null default now(),
  unique (room_id, participant_key_hash)
);

create index competition_private_members_active_idx
  on public.competition_private_members (room_id, left_at);

create table public.competition_private_code_attempts (
  participant_key_hash text primary key,
  failed_count integer not null default 0,
  window_started_at timestamptz not null default now()
);

alter table public.competition_challenges
  add column private_room_id uuid references public.competition_private_rooms(id) on delete set null;

create index competition_challenges_private_waiting_idx
  on public.competition_challenges (private_room_id, status, expires_at)
  where private_room_id is not null and status = 'waiting';

-- Same history window as family chat: short text, newest messages returned by the server.
create table public.competition_room_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.competition_private_rooms(id) on delete cascade,
  channel text not null check (channel in ('room', 'direct')),
  sender_member_id uuid not null references public.competition_private_members(id) on delete cascade,
  sender_label text not null,
  peer_member_id uuid references public.competition_private_members(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  constraint competition_room_messages_body_len check (char_length(btrim(body)) between 1 and 2000),
  constraint competition_room_messages_direct_peer check (
    (channel = 'room' and peer_member_id is null)
    or (channel = 'direct' and peer_member_id is not null)
  )
);

create index competition_room_messages_room_created_idx
  on public.competition_room_messages (room_id, channel, created_at desc);

create table public.competition_room_calls (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.competition_private_rooms(id) on delete cascade,
  caller_member_id uuid not null references public.competition_private_members(id) on delete cascade,
  caller_label text not null,
  callee_member_id uuid not null references public.competition_private_members(id) on delete cascade,
  callee_label text not null,
  status text not null check (status in ('ringing', 'accepted', 'declined', 'ended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index competition_room_calls_room_idx
  on public.competition_room_calls (room_id, status, created_at desc);

create table public.competition_room_call_signals (
  id uuid primary key default gen_random_uuid(),
  call_id uuid not null references public.competition_room_calls(id) on delete cascade,
  sender_member_id uuid not null references public.competition_private_members(id) on delete cascade,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create index competition_room_call_signals_call_idx
  on public.competition_room_call_signals (call_id, created_at);

alter table public.competition_private_rooms enable row level security;
alter table public.competition_private_members enable row level security;
alter table public.competition_private_code_attempts enable row level security;
alter table public.competition_room_messages enable row level security;
alter table public.competition_room_calls enable row level security;
alter table public.competition_room_call_signals enable row level security;

revoke all on public.competition_private_rooms from anon, authenticated, public;
revoke all on public.competition_private_members from anon, authenticated, public;
revoke all on public.competition_private_code_attempts from anon, authenticated, public;
revoke all on public.competition_room_messages from anon, authenticated, public;
revoke all on public.competition_room_calls from anon, authenticated, public;
revoke all on public.competition_room_call_signals from anon, authenticated, public;

comment on table public.competition_private_rooms is
  'Named private competition rooms. Access codes are not stored in this table.';
comment on table public.competition_room_messages is
  'Madarasah room and direct chat. Service role only. History is the latest 80 messages, body max 2000, matching family chat.';
