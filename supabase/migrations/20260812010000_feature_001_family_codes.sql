-- Feature 001b: Parent family codes for child entry without email/password

alter table public.profiles
  add column if not exists family_code text;

create unique index if not exists profiles_family_code_uidx
  on public.profiles (family_code)
  where family_code is not null;

comment on column public.profiles.family_code is
  'Short join code for parent families. Children use this with their PIN — no email.';

create or replace function public.generate_family_code()
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
    for i in 1..6 loop
      candidate := candidate || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    exit when not exists (
      select 1 from public.profiles p where p.family_code = candidate
    );
  end loop;
  return candidate;
end;
$$;

create or replace function public.ensure_parent_family_code(p_parent_id uuid default auth.uid())
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  current_code text;
  parent_role public.profile_role;
begin
  if p_parent_id is null then
    raise exception 'Not authenticated';
  end if;

  if auth.uid() is distinct from p_parent_id then
    raise exception 'Not allowed';
  end if;

  select role, family_code
    into parent_role, current_code
  from public.profiles
  where id = p_parent_id
  for update;

  if parent_role is distinct from 'parent' then
    raise exception 'Only parents have family codes';
  end if;

  if current_code is not null and length(trim(current_code)) > 0 then
    return current_code;
  end if;

  current_code := public.generate_family_code();
  update public.profiles
    set family_code = current_code
  where id = p_parent_id;

  return current_code;
end;
$$;

revoke all on function public.ensure_parent_family_code(uuid) from public;
grant execute on function public.ensure_parent_family_code(uuid) to authenticated;

-- Column was added after the Feature 001 hardening GRANT list.
grant select (family_code) on public.profiles to authenticated;
revoke update (family_code) on public.profiles from authenticated, anon;

-- Backfill codes for existing parents
update public.profiles p
set family_code = public.generate_family_code()
where p.role = 'parent'
  and (p.family_code is null or length(trim(p.family_code)) = 0);
