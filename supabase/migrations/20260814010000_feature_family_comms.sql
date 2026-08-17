-- Family Circle private chat + 1:1 voice calls.
-- Isolation is by family_id (the parent profile id). Adults, guests, and other
-- families must never read or write another family's messages or calls.

-- ---------------------------------------------------------------------------
-- Child auth users: skip profile insert when the child row already exists.
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_role text;
  resolved_role public.profile_role;
  resolved_name text;
begin
  if exists (select 1 from public.profiles p where p.id = new.id) then
    return new;
  end if;

  selected_role := coalesce(new.raw_user_meta_data ->> 'role', 'adult');

  if selected_role = 'parent' then
    resolved_role := 'parent';
  else
    resolved_role := 'adult';
  end if;

  resolved_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
    split_part(new.email, '@', 1),
    'Learner'
  );

  insert into public.profiles (id, role, email, display_name)
  values (new.id, resolved_role, new.email, resolved_name);

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Parent-controlled child communication switches (default: family-only ON)
-- ---------------------------------------------------------------------------

alter table public.profiles
  add column if not exists chat_enabled boolean not null default true;

alter table public.profiles
  add column if not exists calls_enabled boolean not null default true;

comment on column public.profiles.chat_enabled is
  'When false, a child cannot send Family Chat messages. Parents always can.';
comment on column public.profiles.calls_enabled is
  'When false, a child cannot place or receive Family Calls. Parents always can.';

grant select (chat_enabled, calls_enabled) on public.profiles to authenticated;

create or replace function public.protect_profile_identity()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE' then
    if new.id is distinct from old.id then
      raise exception 'profile id cannot be changed';
    end if;

    if new.role is distinct from old.role then
      raise exception 'profile role cannot be changed';
    end if;

    if new.parent_id is distinct from old.parent_id then
      raise exception 'parent_id cannot be changed';
    end if;

    if old.role in ('adult', 'parent') and new.email is distinct from old.email then
      raise exception 'email cannot be changed via profiles';
    end if;

    if old.role = 'child' and new.email is not null then
      raise exception 'child profiles cannot have an email';
    end if;

    -- Children must not toggle their own communication settings.
    if old.role = 'child'
       and auth.uid() is not null
       and auth.uid() = old.id
       and (
         new.chat_enabled is distinct from old.chat_enabled
         or new.calls_enabled is distinct from old.calls_enabled
       ) then
      raise exception 'Only a parent can change child communication settings';
    end if;
  end if;

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Family membership helpers (security definer so RLS can use them safely)
-- ---------------------------------------------------------------------------

create or replace function public.family_id_of(p_profile_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select case
    when p.role = 'parent' then p.id
    when p.role = 'child' then p.parent_id
    else null
  end
  from public.profiles p
  where p.id = p_profile_id
$$;

create or replace function public.is_family_member(p_profile_id uuid, p_family_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select p_family_id is not null
     and public.family_id_of(p_profile_id) = p_family_id
$$;

create or replace function public.same_family(p_left uuid, p_right uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.family_id_of(p_left) is not null
     and public.family_id_of(p_left) = public.family_id_of(p_right)
$$;

-- Parent JWT may act as a child on a shared device. Child JWT may only act as self.
create or replace function public.can_act_as_family_member(p_member_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    auth.uid() is not null
    and p_member_id is not null
    and (
      p_member_id = auth.uid()
      or exists (
        select 1
        from public.profiles child
        where child.id = p_member_id
          and child.role = 'child'
          and child.parent_id = auth.uid()
      )
    )
$$;

create or replace function public.child_chat_allowed(p_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = p_profile_id
      and (
        p.role = 'parent'
        or (p.role = 'child' and p.chat_enabled)
      )
  )
$$;

create or replace function public.child_calls_allowed(p_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = p_profile_id
      and (
        p.role = 'parent'
        or (p.role = 'child' and p.calls_enabled)
      )
  )
$$;

revoke all on function public.family_id_of(uuid) from public;
revoke all on function public.is_family_member(uuid, uuid) from public;
revoke all on function public.same_family(uuid, uuid) from public;
revoke all on function public.can_act_as_family_member(uuid) from public;
revoke all on function public.child_chat_allowed(uuid) from public;
revoke all on function public.child_calls_allowed(uuid) from public;

grant execute on function public.family_id_of(uuid) to authenticated;
grant execute on function public.is_family_member(uuid, uuid) to authenticated;
grant execute on function public.same_family(uuid, uuid) to authenticated;
grant execute on function public.can_act_as_family_member(uuid) to authenticated;
grant execute on function public.child_chat_allowed(uuid) to authenticated;
grant execute on function public.child_calls_allowed(uuid) to authenticated;

-- Family members may read sibling / parent display fields (not PIN secrets).
drop policy if exists "Users can read own profile" on public.profiles;

create policy "Users can read own or family profiles"
on public.profiles
for select
to authenticated
using (
  auth.uid() = id
  or parent_id = auth.uid()
  or (
    public.family_id_of(auth.uid()) is not null
    and public.family_id_of(id) = public.family_id_of(auth.uid())
  )
);

-- ---------------------------------------------------------------------------
-- Chat
-- ---------------------------------------------------------------------------

create type public.family_message_kind as enum (
  'text',
  'encouragement',
  'practice_update',
  'dua'
);

create table public.family_messages (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.profiles (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  kind public.family_message_kind not null default 'text',
  body text not null,
  created_at timestamptz not null default now(),
  constraint family_messages_body_len check (char_length(btrim(body)) between 1 and 2000)
);

create index family_messages_family_created_idx
  on public.family_messages (family_id, created_at desc);

comment on table public.family_messages is
  'Private Family Circle chat. One room per parent family. Never public.';

create or replace function public.assert_family_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.body := btrim(new.body);

  if new.family_id is null
     or new.sender_id is null
     or not public.is_family_member(new.sender_id, new.family_id) then
    raise exception 'Access denied';
  end if;

  if not public.can_act_as_family_member(new.sender_id) then
    raise exception 'Access denied';
  end if;

  if not public.child_chat_allowed(new.sender_id) then
    raise exception 'Access denied';
  end if;

  return new;
end;
$$;

create trigger family_messages_assert
before insert on public.family_messages
for each row
execute function public.assert_family_message();

alter table public.family_messages enable row level security;

create policy "Family members can read family chat"
on public.family_messages
for select
to authenticated
using (public.is_family_member(auth.uid(), family_id));

create policy "Family members can send family chat"
on public.family_messages
for insert
to authenticated
with check (
  public.can_act_as_family_member(sender_id)
  and public.is_family_member(sender_id, family_id)
  and public.is_family_member(auth.uid(), family_id)
  and public.child_chat_allowed(sender_id)
);

grant select, insert on public.family_messages to authenticated;

-- ---------------------------------------------------------------------------
-- Calls (1:1 now; participants table is the group-call extension point)
-- ---------------------------------------------------------------------------

create type public.family_call_kind as enum ('p2p', 'group');
create type public.family_call_status as enum (
  'ringing',
  'accepted',
  'declined',
  'ended',
  'missed'
);

create table public.family_calls (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.profiles (id) on delete cascade,
  kind public.family_call_kind not null default 'p2p',
  created_by uuid not null references public.profiles (id) on delete cascade,
  callee_id uuid not null references public.profiles (id) on delete cascade,
  status public.family_call_status not null default 'ringing',
  created_at timestamptz not null default now(),
  answered_at timestamptz,
  ended_at timestamptz,
  constraint family_calls_not_self check (created_by <> callee_id)
);

create index family_calls_family_created_idx
  on public.family_calls (family_id, created_at desc);
create index family_calls_callee_status_idx
  on public.family_calls (callee_id, status);

comment on table public.family_calls is
  'Private Family Circle calls. V1 is one-to-one voice. Group kind is reserved.';

create table public.family_call_participants (
  call_id uuid not null references public.family_calls (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'invited',
  muted boolean not null default false,
  joined_at timestamptz,
  left_at timestamptz,
  primary key (call_id, profile_id)
);

comment on table public.family_call_participants is
  'Per-member call state. V1 seeds caller + callee; later rows enable group calls.';

create table public.family_call_signals (
  id uuid primary key default gen_random_uuid(),
  call_id uuid not null references public.family_calls (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create index family_call_signals_call_idx
  on public.family_call_signals (call_id, created_at);

create or replace function public.assert_family_call()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    if new.kind is distinct from 'p2p' then
      raise exception 'Access denied';
    end if;

    if not public.can_act_as_family_member(new.created_by) then
      raise exception 'Access denied';
    end if;

    if not public.is_family_member(new.created_by, new.family_id)
       or not public.is_family_member(new.callee_id, new.family_id)
       or not public.same_family(new.created_by, new.callee_id) then
      raise exception 'Access denied';
    end if;

    if not public.child_calls_allowed(new.created_by)
       or not public.child_calls_allowed(new.callee_id) then
      raise exception 'Access denied';
    end if;

    return new;
  end if;

  if tg_op = 'UPDATE' then
    if new.family_id is distinct from old.family_id
       or new.created_by is distinct from old.created_by
       or new.callee_id is distinct from old.callee_id
       or new.kind is distinct from old.kind then
      raise exception 'Access denied';
    end if;

    if old.status = 'ringing' and new.status = 'accepted' then
      if not public.can_act_as_family_member(old.callee_id) then
        raise exception 'Access denied';
      end if;
      new.answered_at := coalesce(new.answered_at, now());
    elsif old.status = 'ringing' and new.status in ('declined', 'ended', 'missed') then
      if not (
        public.can_act_as_family_member(old.callee_id)
        or public.can_act_as_family_member(old.created_by)
      ) then
        raise exception 'Access denied';
      end if;
      new.ended_at := coalesce(new.ended_at, now());
    elsif old.status = 'accepted' and new.status = 'ended' then
      if not (
        public.can_act_as_family_member(old.callee_id)
        or public.can_act_as_family_member(old.created_by)
      ) then
        raise exception 'Access denied';
      end if;
      new.ended_at := coalesce(new.ended_at, now());
    elsif old.status = new.status then
      return new;
    else
      raise exception 'Access denied';
    end if;

    return new;
  end if;

  return new;
end;
$$;

create trigger family_calls_assert
before insert or update on public.family_calls
for each row
execute function public.assert_family_call();

create or replace function public.seed_family_call_participants()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.family_call_participants (call_id, profile_id, status)
  values
    (new.id, new.created_by, 'invited'),
    (new.id, new.callee_id, 'invited')
  on conflict do nothing;
  return new;
end;
$$;

create trigger family_calls_seed_participants
after insert on public.family_calls
for each row
execute function public.seed_family_call_participants();

create or replace function public.assert_family_call_signal()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  call_row public.family_calls;
begin
  select * into call_row from public.family_calls where id = new.call_id;
  if call_row.id is null then
    raise exception 'Access denied';
  end if;

  if not public.can_act_as_family_member(new.sender_id) then
    raise exception 'Access denied';
  end if;

  if new.sender_id is distinct from call_row.created_by
     and new.sender_id is distinct from call_row.callee_id then
    raise exception 'Access denied';
  end if;

  if not public.is_family_member(new.sender_id, call_row.family_id) then
    raise exception 'Access denied';
  end if;

  return new;
end;
$$;

create trigger family_call_signals_assert
before insert on public.family_call_signals
for each row
execute function public.assert_family_call_signal();

alter table public.family_calls enable row level security;
alter table public.family_call_participants enable row level security;
alter table public.family_call_signals enable row level security;

create policy "Family members can read family calls"
on public.family_calls
for select
to authenticated
using (public.is_family_member(auth.uid(), family_id));

create policy "Family members can start family calls"
on public.family_calls
for insert
to authenticated
with check (
  kind = 'p2p'
  and public.can_act_as_family_member(created_by)
  and public.is_family_member(created_by, family_id)
  and public.is_family_member(callee_id, family_id)
  and public.same_family(created_by, callee_id)
  and public.child_calls_allowed(created_by)
  and public.child_calls_allowed(callee_id)
);

create policy "Call parties can update family calls"
on public.family_calls
for update
to authenticated
using (
  public.is_family_member(auth.uid(), family_id)
  and (
    public.can_act_as_family_member(created_by)
    or public.can_act_as_family_member(callee_id)
  )
)
with check (
  public.is_family_member(auth.uid(), family_id)
  and (
    public.can_act_as_family_member(created_by)
    or public.can_act_as_family_member(callee_id)
  )
);

create policy "Family members can read call participants"
on public.family_call_participants
for select
to authenticated
using (
  exists (
    select 1
    from public.family_calls c
    where c.id = call_id
      and public.is_family_member(auth.uid(), c.family_id)
  )
);

create policy "Call parties can update own participant row"
on public.family_call_participants
for update
to authenticated
using (public.can_act_as_family_member(profile_id))
with check (public.can_act_as_family_member(profile_id));

create policy "Call parties can read signals"
on public.family_call_signals
for select
to authenticated
using (
  exists (
    select 1
    from public.family_calls c
    where c.id = call_id
      and public.is_family_member(auth.uid(), c.family_id)
      and (
        public.can_act_as_family_member(c.created_by)
        or public.can_act_as_family_member(c.callee_id)
      )
  )
);

create policy "Call parties can send signals"
on public.family_call_signals
for insert
to authenticated
with check (
  public.can_act_as_family_member(sender_id)
  and exists (
    select 1
    from public.family_calls c
    where c.id = call_id
      and public.is_family_member(auth.uid(), c.family_id)
      and (sender_id = c.created_by or sender_id = c.callee_id)
  )
);

grant select, insert, update on public.family_calls to authenticated;
grant select, update on public.family_call_participants to authenticated;
grant select, insert on public.family_call_signals to authenticated;

-- ---------------------------------------------------------------------------
-- Push tokens (no contact info; Expo token only)
-- ---------------------------------------------------------------------------

create table public.family_push_tokens (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  device_key text not null,
  expo_push_token text not null,
  platform text not null default 'unknown',
  updated_at timestamptz not null default now(),
  constraint family_push_tokens_profile_device unique (profile_id, device_key)
);

create index family_push_tokens_profile_idx on public.family_push_tokens (profile_id);

alter table public.family_push_tokens enable row level security;

create policy "Users can read own push tokens"
on public.family_push_tokens
for select
to authenticated
using (profile_id = auth.uid());

create policy "Users can upsert own push tokens"
on public.family_push_tokens
for insert
to authenticated
with check (profile_id = auth.uid());

create policy "Users can update own push tokens"
on public.family_push_tokens
for update
to authenticated
using (profile_id = auth.uid())
with check (profile_id = auth.uid());

create policy "Users can delete own push tokens"
on public.family_push_tokens
for delete
to authenticated
using (profile_id = auth.uid());

grant select, insert, update, delete on public.family_push_tokens to authenticated;

-- ---------------------------------------------------------------------------
-- Realtime
-- ---------------------------------------------------------------------------

alter table public.family_messages replica identity full;
alter table public.family_calls replica identity full;
alter table public.family_call_signals replica identity full;
alter table public.family_call_participants replica identity full;

do $$
begin
  begin
    alter publication supabase_realtime add table public.family_messages;
  exception
    when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.family_calls;
  exception
    when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.family_call_signals;
  exception
    when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.family_call_participants;
  exception
    when duplicate_object then null;
  end;
end;
$$;
