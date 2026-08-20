-- Family Group vs Circle.
-- Family membership stays on profiles (parent + children). Circles are a
-- separate social-group system for public and madrasah/dugsi only.

-- ---------------------------------------------------------------------------
-- Configurable member cap (default 7). Change the row, not the schema.
-- ---------------------------------------------------------------------------

create table public.app_group_limits (
  key text primary key,
  member_limit integer not null check (member_limit >= 2 and member_limit <= 500),
  updated_at timestamptz not null default now()
);

insert into public.app_group_limits (key, member_limit)
values ('default', 7)
on conflict (key) do nothing;

comment on table public.app_group_limits is
  'Product-wide max members per Family Group or Circle. Not hard-wired to 7 forever.';

alter table public.app_group_limits enable row level security;

create policy "Anyone can read group member limit"
on public.app_group_limits
for select
to anon, authenticated
using (true);

grant select on public.app_group_limits to anon, authenticated;

create or replace function public.group_member_limit()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select member_limit from public.app_group_limits where key = 'default'),
    7
  );
$$;

revoke all on function public.group_member_limit() from public;
grant execute on function public.group_member_limit() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Family Group: adults may become parents; enforce member cap on children.
-- ---------------------------------------------------------------------------

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
      if not (
        old.role = 'adult'
        and new.role = 'parent'
        and coalesce(current_setting('app.allow_parent_promote', true), 'false') = 'true'
      ) then
        raise exception 'profile role cannot be changed';
      end if;
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

create or replace function public.assert_family_member_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_children integer;
  member_limit integer;
begin
  if new.role = 'child' and new.parent_id is not null then
    member_limit := public.group_member_limit();
    select count(*) into existing_children
    from public.profiles
    where parent_id = new.parent_id
      and role = 'child'
      and (tg_op = 'INSERT' or id is distinct from new.id);

    -- Parent counts as member 1.
    if 1 + existing_children >= member_limit then
      raise exception 'This family group already has the maximum number of members';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_family_member_limit on public.profiles;
create trigger profiles_family_member_limit
before insert on public.profiles
for each row
execute function public.assert_family_member_limit();

create or replace function public.ensure_family_group()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  actor_role public.profile_role;
  current_code text;
  child_count integer;
  member_limit integer := public.group_member_limit();
begin
  if actor is null then
    raise exception 'Not authenticated';
  end if;

  select role, family_code
    into actor_role, current_code
  from public.profiles
  where id = actor
  for update;

  if actor_role is null or actor_role = 'child' then
    raise exception 'Only an adult or parent can create a Family Group';
  end if;

  if actor_role = 'adult' then
    perform set_config('app.allow_parent_promote', 'true', true);
    update public.profiles
      set role = 'parent'
    where id = actor;
    actor_role := 'parent';
  end if;

  if current_code is null or length(trim(current_code)) = 0 then
    current_code := public.ensure_parent_family_code(actor);
  end if;

  select count(*) into child_count
  from public.profiles
  where parent_id = actor and role = 'child';

  return jsonb_build_object(
    'kind', 'family',
    'family_id', actor,
    'family_code', current_code,
    'admin_id', actor,
    'member_count', 1 + child_count,
    'member_limit', member_limit
  );
end;
$$;

revoke all on function public.ensure_family_group() from public;
grant execute on function public.ensure_family_group() to authenticated;

-- ---------------------------------------------------------------------------
-- Contact-info detector (Circle safety). Family chat stays private/trusted.
-- ---------------------------------------------------------------------------

create or replace function public.contains_contact_info(p_body text)
returns boolean
language plpgsql
immutable
as $$
declare
  normalized text;
begin
  normalized := lower(coalesce(p_body, ''));

  if normalized ~* '[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}' then
    return true;
  end if;

  if normalized ~* '\y(at)\y.{0,16}\y(gmail|yahoo|hotmail|outlook|icloud|proton)\y' then
    return true;
  end if;

  if normalized ~ '[0-9]{3}[-.\s][0-9]{3}[-.\s][0-9]{4}' then
    return true;
  end if;

  if normalized ~ '\+[0-9]{8,15}' then
    return true;
  end if;

  if normalized ~ '[0-9]{10,}' then
    return true;
  end if;

  if normalized ~* '(whatsapp|telegram|signal app|my number|phone number|call me|text me|email me|dm me)' then
    return true;
  end if;

  return false;
end;
$$;

revoke all on function public.contains_contact_info(text) from public;
grant execute on function public.contains_contact_info(text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Teacher approval (required before creating Madrasah / Dugsi Circles)
-- ---------------------------------------------------------------------------

create type public.teacher_approval_status as enum ('pending', 'approved', 'revoked');

create table public.teacher_approvals (
  profile_id uuid primary key references public.profiles (id) on delete cascade,
  status public.teacher_approval_status not null default 'pending',
  requested_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles (id) on delete set null
);

comment on table public.teacher_approvals is
  'Platform teacher permission. A normal adult cannot create a Madrasah/Dugsi Circle until approved.';

alter table public.teacher_approvals enable row level security;

create policy "Users can read own teacher approval"
on public.teacher_approvals
for select
to authenticated
using (
  profile_id = auth.uid()
  or exists (
    select 1
    from public.teacher_approvals me
    where me.profile_id = auth.uid()
      and me.status = 'approved'
  )
);

grant select on public.teacher_approvals to authenticated;

create or replace function public.is_approved_teacher(p_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.teacher_approvals t
    join public.profiles p on p.id = t.profile_id
    where t.profile_id = p_profile_id
      and t.status = 'approved'
      and p.role in ('adult', 'parent')
  );
$$;

revoke all on function public.is_approved_teacher(uuid) from public;
grant execute on function public.is_approved_teacher(uuid) to authenticated;

create or replace function public.request_teacher_role()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  actor_role public.profile_role;
  approved_count integer;
  current_status public.teacher_approval_status;
begin
  if actor is null then
    raise exception 'Not authenticated';
  end if;

  select role into actor_role from public.profiles where id = actor;
  if actor_role is null or actor_role = 'child' then
    raise exception 'Only adults and parents can request teacher permission';
  end if;

  select status into current_status
  from public.teacher_approvals
  where profile_id = actor;

  if current_status = 'approved' then
    return jsonb_build_object('profile_id', actor, 'status', 'approved');
  end if;

  select count(*) into approved_count
  from public.teacher_approvals
  where status = 'approved';

  -- Bootstrap: the first requester becomes the seed Admin/Teacher.
  if approved_count = 0 then
    insert into public.teacher_approvals (profile_id, status, requested_at, reviewed_at, reviewed_by)
    values (actor, 'approved', now(), now(), actor)
    on conflict (profile_id) do update
      set status = 'approved',
          reviewed_at = now(),
          reviewed_by = actor;
    return jsonb_build_object('profile_id', actor, 'status', 'approved', 'bootstrap', true);
  end if;

  insert into public.teacher_approvals (profile_id, status, requested_at)
  values (actor, 'pending', now())
  on conflict (profile_id) do update
    set status = case
      when public.teacher_approvals.status = 'revoked' then 'pending'
      else public.teacher_approvals.status
    end,
        requested_at = case
          when public.teacher_approvals.status = 'revoked' then now()
          else public.teacher_approvals.requested_at
        end;

  select status into current_status from public.teacher_approvals where profile_id = actor;
  return jsonb_build_object('profile_id', actor, 'status', current_status);
end;
$$;

create or replace function public.approve_teacher(p_profile_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  target_role public.profile_role;
begin
  if actor is null then
    raise exception 'Not authenticated';
  end if;

  if not public.is_approved_teacher(actor) then
    raise exception 'Only an approved teacher can approve another teacher';
  end if;

  if p_profile_id is null or p_profile_id = actor then
    raise exception 'Access denied';
  end if;

  select role into target_role from public.profiles where id = p_profile_id;
  if target_role is null or target_role = 'child' then
    raise exception 'Access denied';
  end if;

  insert into public.teacher_approvals (profile_id, status, requested_at, reviewed_at, reviewed_by)
  values (p_profile_id, 'approved', now(), now(), actor)
  on conflict (profile_id) do update
    set status = 'approved',
        reviewed_at = now(),
        reviewed_by = actor;

  return jsonb_build_object('profile_id', p_profile_id, 'status', 'approved');
end;
$$;

create or replace function public.list_pending_teachers()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
begin
  if actor is null then
    raise exception 'Not authenticated';
  end if;
  if not public.is_approved_teacher(actor) then
    raise exception 'Access denied';
  end if;

  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'profile_id', t.profile_id,
      'display_name', p.display_name,
      'status', t.status,
      'requested_at', t.requested_at
    ) order by t.requested_at)
    from public.teacher_approvals t
    join public.profiles p on p.id = t.profile_id
    where t.status = 'pending'
  ), '[]'::jsonb);
end;
$$;

revoke all on function public.request_teacher_role() from public;
revoke all on function public.approve_teacher(uuid) from public;
revoke all on function public.list_pending_teachers() from public;
grant execute on function public.request_teacher_role() to authenticated;
grant execute on function public.approve_teacher(uuid) to authenticated;
grant execute on function public.list_pending_teachers() to authenticated;

-- ---------------------------------------------------------------------------
-- Circles (public + madrasah). Family is NOT stored here.
-- ---------------------------------------------------------------------------

create type public.circle_kind as enum ('public', 'madrasah');
create type public.circle_member_role as enum ('admin', 'teacher', 'member', 'child');

create table public.circles (
  id uuid primary key default gen_random_uuid(),
  kind public.circle_kind not null,
  name text not null,
  creator_id uuid not null references public.profiles (id) on delete cascade,
  join_code text not null,
  chat_enabled boolean not null default true,
  audio_enabled boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint circles_name_len check (char_length(btrim(name)) between 2 and 80)
);

create unique index circles_join_code_uidx on public.circles (join_code);
create index circles_kind_active_idx on public.circles (kind, is_active);

comment on table public.circles is
  'Public Circle and Madrasah/Dugsi Circle. Private Family Groups live on profiles, not here.';

create table public.circle_members (
  circle_id uuid not null references public.circles (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  role public.circle_member_role not null default 'member',
  invited_by uuid references public.profiles (id) on delete set null,
  joined_at timestamptz not null default now(),
  timeout_until timestamptz,
  permanently_removed boolean not null default false,
  primary key (circle_id, profile_id)
);

create index circle_members_profile_idx on public.circle_members (profile_id);
create index circle_members_timeout_idx on public.circle_members (timeout_until)
  where timeout_until is not null;

create table public.circle_messages (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references public.circles (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  constraint circle_messages_body_len check (char_length(btrim(body)) between 1 and 2000)
);

create index circle_messages_circle_created_idx
  on public.circle_messages (circle_id, created_at desc);

create table public.circle_message_reactions (
  message_id uuid not null references public.circle_messages (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  emoji text not null,
  created_at timestamptz not null default now(),
  primary key (message_id, profile_id),
  constraint circle_reactions_safe_emoji check (
    emoji in (
      '😀', '🙂', '😊', '❤️', '💚', '👍', '🤲', '🌟',
      '✨', '🎉', '👏', '🥰', '😇', '💪', '📖', '🕌'
    )
  )
);

create index circle_reactions_message_idx on public.circle_message_reactions (message_id);

create trigger circles_set_updated_at
before update on public.circles
for each row
execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Circle helpers
-- ---------------------------------------------------------------------------

create or replace function public.generate_circle_join_code()
returns text
language plpgsql
as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  candidate text;
  i integer;
begin
  loop
    candidate := '';
    for i in 1..8 loop
      candidate := candidate || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    exit when not exists (select 1 from public.circles c where c.join_code = candidate);
  end loop;
  return candidate;
end;
$$;

create or replace function public.circle_member_count(p_circle_id uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::integer
  from public.circle_members
  where circle_id = p_circle_id
    and permanently_removed = false
    and (timeout_until is null or timeout_until <= now());
$$;

create or replace function public.is_circle_member(p_profile_id uuid, p_circle_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.circle_members m
    where m.circle_id = p_circle_id
      and m.profile_id = p_profile_id
      and m.permanently_removed = false
  )
$$;

create or replace function public.is_active_circle_member(p_profile_id uuid, p_circle_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.circle_members m
    where m.circle_id = p_circle_id
      and m.profile_id = p_profile_id
      and m.permanently_removed = false
      and (m.timeout_until is null or m.timeout_until <= now())
  )
$$;

create or replace function public.circle_role_of(p_profile_id uuid, p_circle_id uuid)
returns public.circle_member_role
language sql
stable
security definer
set search_path = public
as $$
  select m.role
  from public.circle_members m
  where m.circle_id = p_circle_id
    and m.profile_id = p_profile_id
    and m.permanently_removed = false
    and (m.timeout_until is null or m.timeout_until <= now())
$$;

create or replace function public.is_circle_admin(p_profile_id uuid, p_circle_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.circle_role_of(p_profile_id, p_circle_id) = 'admin'
$$;

create or replace function public.can_manage_circle(p_profile_id uuid, p_circle_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.circle_role_of(p_profile_id, p_circle_id) in ('admin', 'teacher')
$$;

create or replace function public.can_view_circle(p_profile_id uuid, p_circle_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    p_profile_id is not null
    and (
      public.is_circle_member(p_profile_id, p_circle_id)
      or exists (
        select 1
        from public.circle_members m
        join public.profiles child on child.id = m.profile_id
        where m.circle_id = p_circle_id
          and m.permanently_removed = false
          and child.role = 'child'
          and child.parent_id = p_profile_id
      )
    )
$$;

create or replace function public.circle_timeout_message()
returns text
language sql
immutable
as $$
  select 'You have been temporarily removed from this group for 1 hour. You can join again after the timeout ends.';
$$;

revoke all on function public.generate_circle_join_code() from public;
revoke all on function public.circle_member_count(uuid) from public;
revoke all on function public.is_circle_member(uuid, uuid) from public;
revoke all on function public.is_active_circle_member(uuid, uuid) from public;
revoke all on function public.circle_role_of(uuid, uuid) from public;
revoke all on function public.is_circle_admin(uuid, uuid) from public;
revoke all on function public.can_manage_circle(uuid, uuid) from public;
revoke all on function public.can_view_circle(uuid, uuid) from public;
revoke all on function public.circle_timeout_message() from public;

grant execute on function public.circle_member_count(uuid) to authenticated;
grant execute on function public.is_circle_member(uuid, uuid) to authenticated;
grant execute on function public.is_active_circle_member(uuid, uuid) to authenticated;
grant execute on function public.circle_role_of(uuid, uuid) to authenticated;
grant execute on function public.is_circle_admin(uuid, uuid) to authenticated;
grant execute on function public.can_manage_circle(uuid, uuid) to authenticated;
grant execute on function public.can_view_circle(uuid, uuid) to authenticated;
grant execute on function public.circle_timeout_message() to authenticated, anon;

-- ---------------------------------------------------------------------------
-- Circle RPCs
-- ---------------------------------------------------------------------------

create or replace function public.create_circle(p_kind public.circle_kind, p_name text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  actor_role public.profile_role;
  new_id uuid;
  code text;
  trimmed text := btrim(coalesce(p_name, ''));
  audio_on boolean := false;
begin
  if actor is null then
    raise exception 'Not authenticated';
  end if;

  select role into actor_role from public.profiles where id = actor;
  if actor_role is null or actor_role = 'child' then
    raise exception 'Access denied';
  end if;

  if char_length(trimmed) < 2 or char_length(trimmed) > 80 then
    raise exception 'Enter a circle name';
  end if;

  if p_kind = 'public' then
    if actor_role not in ('adult', 'parent') then
      raise exception 'Only adults and parents can create a Public Circle';
    end if;
    audio_on := false;
  elsif p_kind = 'madrasah' then
    if not public.is_approved_teacher(actor) then
      raise exception 'Only an approved teacher can create a Madrasah / Dugsi Circle';
    end if;
    audio_on := false;
  else
    raise exception 'Access denied';
  end if;

  code := public.generate_circle_join_code();
  insert into public.circles (kind, name, creator_id, join_code, chat_enabled, audio_enabled)
  values (p_kind, trimmed, actor, code, true, audio_on)
  returning id into new_id;

  insert into public.circle_members (circle_id, profile_id, role, invited_by)
  values (new_id, actor, 'admin', actor);

  return public.get_circle(new_id);
end;
$$;

create or replace function public.join_circle(p_join_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  actor_role public.profile_role;
  circle_row public.circles;
  existing public.circle_members;
  code text;
  member_limit integer := public.group_member_limit();
begin
  if actor is null then
    raise exception 'Not authenticated';
  end if;

  code := upper(regexp_replace(coalesce(p_join_code, ''), '[^A-Za-z0-9]', '', 'g'));
  if char_length(code) < 4 then
    raise exception 'Enter a valid join code';
  end if;

  select role into actor_role from public.profiles where id = actor;
  if actor_role is null or actor_role = 'child' then
    raise exception 'Children cannot join this circle by themselves. Ask a parent to connect you.';
  end if;

  select * into circle_row
  from public.circles
  where join_code = code and is_active
  for update;

  if circle_row.id is null then
    raise exception 'Circle code not found';
  end if;

  select * into existing
  from public.circle_members
  where circle_id = circle_row.id and profile_id = actor;

  if existing.profile_id is not null then
    if existing.permanently_removed then
      raise exception 'You cannot rejoin this circle';
    end if;
    if existing.timeout_until is not null and existing.timeout_until > now() then
      raise exception '%', public.circle_timeout_message();
    end if;
    if existing.timeout_until is not null and existing.timeout_until <= now() then
      update public.circle_members
        set timeout_until = null
      where circle_id = circle_row.id and profile_id = actor;
    end if;
    return public.get_circle(circle_row.id);
  end if;

  if public.circle_member_count(circle_row.id) >= member_limit then
    raise exception 'This circle already has the maximum number of members';
  end if;

  insert into public.circle_members (circle_id, profile_id, role)
  values (circle_row.id, actor, 'member');

  return public.get_circle(circle_row.id);
end;
$$;

create or replace function public.connect_child_to_circle(p_circle_id uuid, p_child_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  child_row public.profiles;
  existing public.circle_members;
  member_limit integer := public.group_member_limit();
begin
  if actor is null then
    raise exception 'Not authenticated';
  end if;

  if not exists (select 1 from public.circles c where c.id = p_circle_id and c.is_active) then
    raise exception 'Access denied';
  end if;

  if not public.is_active_circle_member(actor, p_circle_id) then
    raise exception 'Join this circle first, then connect your child';
  end if;

  select * into child_row from public.profiles where id = p_child_id;
  if child_row.id is null
     or child_row.role is distinct from 'child'
     or child_row.parent_id is distinct from actor then
    raise exception 'Access denied';
  end if;

  select * into existing
  from public.circle_members
  where circle_id = p_circle_id and profile_id = p_child_id;

  if existing.profile_id is not null then
    if existing.permanently_removed then
      raise exception 'This child cannot rejoin this circle';
    end if;
    if existing.timeout_until is not null and existing.timeout_until > now() then
      raise exception '%', public.circle_timeout_message();
    end if;
    return public.get_circle(p_circle_id);
  end if;

  if public.circle_member_count(p_circle_id) >= member_limit then
    raise exception 'This circle already has the maximum number of members';
  end if;

  insert into public.circle_members (circle_id, profile_id, role, invited_by)
  values (p_circle_id, p_child_id, 'child', actor);

  return public.get_circle(p_circle_id);
end;
$$;

create or replace function public.timeout_circle_member(p_circle_id uuid, p_profile_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  target_role public.circle_member_role;
begin
  if actor is null then
    raise exception 'Not authenticated';
  end if;
  if not public.is_circle_admin(actor, p_circle_id) then
    raise exception 'Only an admin can do that';
  end if;
  if p_profile_id is null or p_profile_id = actor then
    raise exception 'Access denied';
  end if;

  select role into target_role
  from public.circle_members
  where circle_id = p_circle_id
    and profile_id = p_profile_id
    and permanently_removed = false;

  if target_role is null or target_role = 'admin' then
    raise exception 'Access denied';
  end if;

  update public.circle_members
    set timeout_until = now() + interval '1 hour'
  where circle_id = p_circle_id and profile_id = p_profile_id;

  return public.get_circle(p_circle_id);
end;
$$;

create or replace function public.permanently_remove_circle_member(p_circle_id uuid, p_profile_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  target_role public.circle_member_role;
begin
  if actor is null then
    raise exception 'Not authenticated';
  end if;
  if not public.is_circle_admin(actor, p_circle_id) then
    raise exception 'Only an admin can do that';
  end if;
  if p_profile_id is null or p_profile_id = actor then
    raise exception 'Access denied';
  end if;

  select role into target_role
  from public.circle_members
  where circle_id = p_circle_id
    and profile_id = p_profile_id
    and permanently_removed = false;

  if target_role is null or target_role = 'admin' then
    raise exception 'Access denied';
  end if;

  update public.circle_members
    set permanently_removed = true,
        timeout_until = null,
        role = 'member'
  where circle_id = p_circle_id and profile_id = p_profile_id;

  return public.get_circle(p_circle_id);
end;
$$;

create or replace function public.set_circle_chat_enabled(p_circle_id uuid, p_enabled boolean)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  circle_row public.circles;
begin
  if actor is null then
    raise exception 'Not authenticated';
  end if;

  select * into circle_row from public.circles where id = p_circle_id;
  if circle_row.id is null then
    raise exception 'Access denied';
  end if;

  if circle_row.kind = 'public' then
    if not public.is_circle_admin(actor, p_circle_id) then
      raise exception 'Only an admin can do that';
    end if;
  else
    if not public.can_manage_circle(actor, p_circle_id) then
      raise exception 'Only an approved teacher or admin can do that';
    end if;
  end if;

  update public.circles
    set chat_enabled = coalesce(p_enabled, true)
  where id = p_circle_id;

  return public.get_circle(p_circle_id);
end;
$$;

create or replace function public.set_circle_audio_enabled(p_circle_id uuid, p_enabled boolean)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  circle_row public.circles;
begin
  if actor is null then
    raise exception 'Not authenticated';
  end if;

  select * into circle_row from public.circles where id = p_circle_id;
  if circle_row.id is null then
    raise exception 'Access denied';
  end if;

  -- Public Circle audio stays off for child safety (no stranger calling).
  if circle_row.kind = 'public' then
    raise exception 'Audio calling stays off in Public Circles';
  end if;

  if not public.can_manage_circle(actor, p_circle_id) then
    raise exception 'Only an approved teacher or admin can do that';
  end if;

  update public.circles
    set audio_enabled = coalesce(p_enabled, false)
  where id = p_circle_id;

  return public.get_circle(p_circle_id);
end;
$$;

create or replace function public.list_circle_directory(p_circle_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
begin
  if actor is null then
    raise exception 'Not authenticated';
  end if;
  if not public.can_view_circle(actor, p_circle_id) then
    raise exception 'Access denied';
  end if;

  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'profile_id', m.profile_id,
      'display_name', p.display_name,
      'avatar_key', p.avatar_key,
      'member_role', m.role,
      'profile_role', p.role,
      'age', case
        when public.can_manage_circle(actor, p_circle_id) and p.role = 'child' then p.age
        when p.id = actor then p.age
        else null
      end,
      'joined_at', m.joined_at,
      'timeout_until', m.timeout_until,
      'timed_out', (m.timeout_until is not null and m.timeout_until > now())
    ) order by m.joined_at)
    from public.circle_members m
    join public.profiles p on p.id = m.profile_id
    where m.circle_id = p_circle_id
      and m.permanently_removed = false
  ), '[]'::jsonb);
end;
$$;

create or replace function public.get_circle(p_circle_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  circle_row public.circles;
  membership public.circle_members;
  my_timeout timestamptz;
begin
  if actor is null then
    raise exception 'Not authenticated';
  end if;

  select * into circle_row from public.circles where id = p_circle_id and is_active;
  if circle_row.id is null then
    raise exception 'Access denied';
  end if;

  if not public.can_view_circle(actor, p_circle_id) then
    raise exception 'Access denied';
  end if;

  select * into membership
  from public.circle_members
  where circle_id = p_circle_id and profile_id = actor;

  my_timeout := membership.timeout_until;

  return jsonb_build_object(
    'id', circle_row.id,
    'kind', circle_row.kind,
    'name', circle_row.name,
    'creator_id', circle_row.creator_id,
    'join_code', circle_row.join_code,
    'chat_enabled', circle_row.chat_enabled,
    'audio_enabled', circle_row.audio_enabled,
    'is_active', circle_row.is_active,
    'created_at', circle_row.created_at,
    'member_count', public.circle_member_count(circle_row.id),
    'member_limit', public.group_member_limit(),
    'my_role', membership.role,
    'timeout_until', my_timeout,
    'timed_out', (my_timeout is not null and my_timeout > now()),
    'can_manage', public.can_manage_circle(actor, circle_row.id),
    'is_admin', public.is_circle_admin(actor, circle_row.id),
    'members', public.list_circle_directory(circle_row.id)
  );
end;
$$;

create or replace function public.list_my_circles()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
begin
  if actor is null then
    raise exception 'Not authenticated';
  end if;

  return coalesce((
    select jsonb_agg(public.get_circle(c.id) order by c.created_at desc)
    from public.circles c
    where c.is_active
      and public.can_view_circle(actor, c.id)
  ), '[]'::jsonb);
end;
$$;

revoke all on function public.create_circle(public.circle_kind, text) from public;
revoke all on function public.join_circle(text) from public;
revoke all on function public.connect_child_to_circle(uuid, uuid) from public;
revoke all on function public.timeout_circle_member(uuid, uuid) from public;
revoke all on function public.permanently_remove_circle_member(uuid, uuid) from public;
revoke all on function public.set_circle_chat_enabled(uuid, boolean) from public;
revoke all on function public.set_circle_audio_enabled(uuid, boolean) from public;
revoke all on function public.list_circle_directory(uuid) from public;
revoke all on function public.get_circle(uuid) from public;
revoke all on function public.list_my_circles() from public;

grant execute on function public.create_circle(public.circle_kind, text) to authenticated;
grant execute on function public.join_circle(text) to authenticated;
grant execute on function public.connect_child_to_circle(uuid, uuid) to authenticated;
grant execute on function public.timeout_circle_member(uuid, uuid) to authenticated;
grant execute on function public.permanently_remove_circle_member(uuid, uuid) to authenticated;
grant execute on function public.set_circle_chat_enabled(uuid, boolean) to authenticated;
grant execute on function public.set_circle_audio_enabled(uuid, boolean) to authenticated;
grant execute on function public.list_circle_directory(uuid) to authenticated;
grant execute on function public.get_circle(uuid) to authenticated;
grant execute on function public.list_my_circles() to authenticated;

-- ---------------------------------------------------------------------------
-- Chat / reaction triggers + RLS
-- ---------------------------------------------------------------------------

create or replace function public.assert_circle_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  circle_row public.circles;
  sender_role public.profile_role;
begin
  new.body := btrim(new.body);

  select * into circle_row from public.circles where id = new.circle_id and is_active;
  if circle_row.id is null then
    raise exception 'Access denied';
  end if;

  if not public.can_act_as_family_member(new.sender_id)
     and new.sender_id is distinct from auth.uid() then
    raise exception 'Access denied';
  end if;

  if new.sender_id is distinct from auth.uid()
     and not public.can_act_as_family_member(new.sender_id) then
    raise exception 'Access denied';
  end if;

  if auth.uid() is distinct from new.sender_id
     and not public.can_act_as_family_member(new.sender_id) then
    raise exception 'Access denied';
  end if;

  if not public.is_active_circle_member(new.sender_id, new.circle_id) then
    if exists (
      select 1 from public.circle_members m
      where m.circle_id = new.circle_id
        and m.profile_id = new.sender_id
        and m.permanently_removed = false
        and m.timeout_until is not null
        and m.timeout_until > now()
    ) then
      raise exception '%', public.circle_timeout_message();
    end if;
    raise exception 'Access denied';
  end if;

  if not circle_row.chat_enabled then
    raise exception 'Group chat is turned off';
  end if;

  select role into sender_role from public.profiles where id = new.sender_id;
  -- Children may only post in the protected group room, never a private channel.
  -- There is no DM table; this still blocks timed-out / non-members above.

  if public.contains_contact_info(new.body) then
    raise exception 'For your safety, sharing phone numbers or email addresses isn''t allowed here.';
  end if;

  return new;
end;
$$;

create trigger circle_messages_assert
before insert on public.circle_messages
for each row
execute function public.assert_circle_message();

create or replace function public.assert_circle_reaction()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  msg public.circle_messages;
begin
  select * into msg from public.circle_messages where id = new.message_id;
  if msg.id is null then
    raise exception 'Access denied';
  end if;

  if new.profile_id is distinct from auth.uid()
     and not public.can_act_as_family_member(new.profile_id) then
    raise exception 'Access denied';
  end if;

  if not public.is_active_circle_member(new.profile_id, msg.circle_id) then
    if exists (
      select 1 from public.circle_members m
      where m.circle_id = msg.circle_id
        and m.profile_id = new.profile_id
        and m.timeout_until is not null
        and m.timeout_until > now()
        and m.permanently_removed = false
    ) then
      raise exception '%', public.circle_timeout_message();
    end if;
    raise exception 'Access denied';
  end if;

  return new;
end;
$$;

create trigger circle_reactions_assert
before insert or update on public.circle_message_reactions
for each row
execute function public.assert_circle_reaction();

alter table public.circles enable row level security;
alter table public.circle_members enable row level security;
alter table public.circle_messages enable row level security;
alter table public.circle_message_reactions enable row level security;

-- Direct writes go through RPCs / triggers. Clients may read their own circles.
create policy "Members can read their circles"
on public.circles
for select
to authenticated
using (public.can_view_circle(auth.uid(), id));

create policy "Members can read circle membership"
on public.circle_members
for select
to authenticated
using (public.can_view_circle(auth.uid(), circle_id));

create policy "Active members can read circle chat"
on public.circle_messages
for select
to authenticated
using (public.is_active_circle_member(auth.uid(), circle_id));

create policy "Active members can send circle chat"
on public.circle_messages
for insert
to authenticated
with check (
  (sender_id = auth.uid() or public.can_act_as_family_member(sender_id))
  and public.is_active_circle_member(sender_id, circle_id)
);

create policy "Active members can read reactions"
on public.circle_message_reactions
for select
to authenticated
using (
  exists (
    select 1
    from public.circle_messages msg
    where msg.id = message_id
      and public.is_active_circle_member(auth.uid(), msg.circle_id)
  )
);

create policy "Active members can react"
on public.circle_message_reactions
for insert
to authenticated
with check (
  (profile_id = auth.uid() or public.can_act_as_family_member(profile_id))
  and exists (
    select 1
    from public.circle_messages msg
    where msg.id = message_id
      and public.is_active_circle_member(profile_id, msg.circle_id)
  )
);

create policy "Active members can change own reaction"
on public.circle_message_reactions
for update
to authenticated
using (profile_id = auth.uid() or public.can_act_as_family_member(profile_id))
with check (profile_id = auth.uid() or public.can_act_as_family_member(profile_id));

create policy "Active members can remove own reaction"
on public.circle_message_reactions
for delete
to authenticated
using (profile_id = auth.uid() or public.can_act_as_family_member(profile_id));

grant select on public.circles to authenticated;
grant select on public.circle_members to authenticated;
grant select, insert on public.circle_messages to authenticated;
grant select, insert, update, delete on public.circle_message_reactions to authenticated;

alter table public.circle_messages replica identity full;
alter table public.circle_message_reactions replica identity full;

do $$
begin
  begin
    alter publication supabase_realtime add table public.circle_messages;
  exception
    when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.circle_message_reactions;
  exception
    when duplicate_object then null;
  end;
end;
$$;
