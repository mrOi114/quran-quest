-- Feature 001 hardening: hide PIN secrets from clients, freeze identity fields,
-- and restrict approved devices to parent accounts.

-- 1) Clients must not read PIN hash / lockout columns (service_role still can).
revoke select (pin_hash, pin_failed_attempts, pin_locked_until)
  on public.profiles
  from anon, authenticated;

grant select (
  id,
  role,
  email,
  display_name,
  age,
  avatar_key,
  country_code,
  preferred_language,
  parent_id,
  created_at,
  updated_at
) on public.profiles to authenticated;

-- 2) Prevent role / parent / id tampering from the client.
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

    -- Auth owns adult/parent email; children must remain email-less.
    if old.role in ('adult', 'parent') and new.email is distinct from old.email then
      raise exception 'email cannot be changed via profiles';
    end if;

    if old.role = 'child' and new.email is not null then
      raise exception 'child profiles cannot have an email';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_protect_identity on public.profiles;
create trigger profiles_protect_identity
before update on public.profiles
for each row
execute function public.protect_profile_identity();

-- 3) Only parents may manage approved devices (child unlock surface).
drop policy if exists "Owners can insert approved devices" on public.approved_devices;
drop policy if exists "Owners can update approved devices" on public.approved_devices;
drop policy if exists "Owners can delete approved devices" on public.approved_devices;
drop policy if exists "Owners can read approved devices" on public.approved_devices;

create policy "Parents can read approved devices"
on public.approved_devices
for select
to authenticated
using (
  parent_id = auth.uid()
  and exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'parent'
  )
);

create policy "Parents can insert approved devices"
on public.approved_devices
for insert
to authenticated
with check (
  parent_id = auth.uid()
  and exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'parent'
  )
);

create policy "Parents can update approved devices"
on public.approved_devices
for update
to authenticated
using (
  parent_id = auth.uid()
  and exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'parent'
  )
)
with check (
  parent_id = auth.uid()
  and exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'parent'
  )
);

create policy "Parents can delete approved devices"
on public.approved_devices
for delete
to authenticated
using (
  parent_id = auth.uid()
  and exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'parent'
  )
);

-- Narrow adult/parent self-update so RLS cannot be used to smuggle role changes
-- (trigger is the hard stop; this keeps the policy intent clear).
drop policy if exists "Users can update own non-child profile" on public.profiles;

create policy "Users can update own non-child profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id and role in ('adult', 'parent'))
with check (
  auth.uid() = id
  and role in ('adult', 'parent')
  and parent_id is null
);
