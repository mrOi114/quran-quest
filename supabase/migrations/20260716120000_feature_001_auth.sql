-- Feature 001: Authentication schema (profiles, devices, RLS)

create extension if not exists "pgcrypto";

create type public.profile_role as enum ('adult', 'parent', 'child');

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  role public.profile_role not null,
  email text,
  display_name text not null,
  age integer,
  avatar_key text not null default 'default-1',
  country_code text not null default 'US',
  preferred_language text not null default 'en',
  parent_id uuid references public.profiles (id) on delete cascade,
  pin_hash text,
  pin_failed_attempts integer not null default 0,
  pin_locked_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_child_parent_check check (
    (role = 'child' and parent_id is not null and email is null)
    or (role in ('adult', 'parent') and parent_id is null)
  ),
  constraint profiles_child_age_check check (
    role <> 'child' or (age is not null and age >= 3 and age <= 17)
  )
);

create index profiles_parent_id_idx on public.profiles (parent_id);
create index profiles_role_idx on public.profiles (role);

create table public.approved_devices (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.profiles (id) on delete cascade,
  device_key text not null,
  label text not null default 'Device',
  created_at timestamptz not null default now(),
  constraint approved_devices_parent_device_unique unique (parent_id, device_key)
);

create index approved_devices_parent_id_idx on public.approved_devices (parent_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

-- Create adult/parent profile when a new auth user signs up.
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

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- Prevent clients from writing pin_hash directly.
create or replace function public.protect_pin_hash()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    if new.pin_hash is not null and coalesce(current_setting('app.allow_pin_hash', true), 'false') <> 'true' then
      raise exception 'pin_hash can only be set by secure server functions';
    end if;
  elsif tg_op = 'UPDATE' then
    if new.pin_hash is distinct from old.pin_hash
      and coalesce(current_setting('app.allow_pin_hash', true), 'false') <> 'true' then
      raise exception 'pin_hash can only be set by secure server functions';
    end if;
  end if;
  return new;
end;
$$;

create trigger profiles_protect_pin_hash
before insert or update on public.profiles
for each row
execute function public.protect_pin_hash();

alter table public.profiles enable row level security;
alter table public.approved_devices enable row level security;

-- Own adult/parent profile
create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id or parent_id = auth.uid());

create policy "Users can update own non-child profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id and role in ('adult', 'parent'))
with check (auth.uid() = id and role in ('adult', 'parent'));

create policy "Parents can insert children"
on public.profiles
for insert
to authenticated
with check (
  role = 'child'
  and parent_id = auth.uid()
  and exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'parent'
  )
);

create policy "Parents can update their children"
on public.profiles
for update
to authenticated
using (role = 'child' and parent_id = auth.uid())
with check (role = 'child' and parent_id = auth.uid());

create policy "Parents can delete their children"
on public.profiles
for delete
to authenticated
using (role = 'child' and parent_id = auth.uid());

create policy "Owners can read approved devices"
on public.approved_devices
for select
to authenticated
using (parent_id = auth.uid());

create policy "Owners can insert approved devices"
on public.approved_devices
for insert
to authenticated
with check (parent_id = auth.uid());

create policy "Owners can update approved devices"
on public.approved_devices
for update
to authenticated
using (parent_id = auth.uid())
with check (parent_id = auth.uid());

create policy "Owners can delete approved devices"
on public.approved_devices
for delete
to authenticated
using (parent_id = auth.uid());

-- Secure PIN helpers (service role / security definer only)
create or replace function public.set_child_pin_hash(p_child_id uuid, p_pin_hash text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform set_config('app.allow_pin_hash', 'true', true);

  update public.profiles
  set
    pin_hash = p_pin_hash,
    pin_failed_attempts = 0,
    pin_locked_until = null
  where id = p_child_id
    and role = 'child';

  if not found then
    raise exception 'Child profile not found';
  end if;
end;
$$;

create or replace function public.record_pin_failure(p_child_id uuid, p_max_attempts integer default 5, p_lock_minutes integer default 15)
returns table (failed_attempts integer, locked_until timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  next_attempts integer;
  next_lock timestamptz;
begin
  update public.profiles
  set pin_failed_attempts = pin_failed_attempts + 1
  where id = p_child_id and role = 'child'
  returning pin_failed_attempts into next_attempts;

  if next_attempts is null then
    raise exception 'Child profile not found';
  end if;

  if next_attempts >= p_max_attempts then
    next_lock := now() + make_interval(mins => p_lock_minutes);
    update public.profiles
    set pin_locked_until = next_lock
    where id = p_child_id;
  else
    select profiles.pin_locked_until into next_lock
    from public.profiles
    where id = p_child_id;
  end if;

  failed_attempts := next_attempts;
  locked_until := next_lock;
  return next;
end;
$$;

create or replace function public.clear_pin_failures(p_child_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set pin_failed_attempts = 0, pin_locked_until = null
  where id = p_child_id and role = 'child';
end;
$$;

revoke all on function public.set_child_pin_hash(uuid, text) from public;
revoke all on function public.record_pin_failure(uuid, integer, integer) from public;
revoke all on function public.clear_pin_failures(uuid) from public;
grant execute on function public.set_child_pin_hash(uuid, text) to service_role;
grant execute on function public.record_pin_failure(uuid, integer, integer) to service_role;
grant execute on function public.clear_pin_failures(uuid) to service_role;
