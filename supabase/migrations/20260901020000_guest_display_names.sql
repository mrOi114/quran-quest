-- Global Guest Mode nicknames so Leaderboard / Competition names stay unique across devices.
-- Claims go through the guest-name edge function (service role). Clients have no table access.

create table public.guest_display_names (
  normalized_name text primary key,
  display_name text not null,
  participant_key_hash text not null,
  created_at timestamptz not null default now()
);

create index guest_display_names_hash_idx
  on public.guest_display_names (participant_key_hash);

alter table public.guest_display_names enable row level security;
revoke all on public.guest_display_names from anon, authenticated, public;

create or replace function public.claim_guest_display_name(
  p_normalized text,
  p_display text,
  p_hash text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_hash text;
begin
  if p_normalized is null or char_length(p_normalized) < 2 or p_hash is null or char_length(p_hash) < 16 then
    return jsonb_build_object('ok', false, 'error', 'name_invalid');
  end if;

  select participant_key_hash into existing_hash
  from public.guest_display_names
  where normalized_name = p_normalized;

  if found then
    if existing_hash = p_hash then
      update public.guest_display_names
        set display_name = p_display
      where normalized_name = p_normalized;
      return jsonb_build_object('ok', true);
    end if;
    return jsonb_build_object('ok', false, 'error', 'name_taken');
  end if;

  if exists (
    select 1
    from public.profiles
    where lower(btrim(regexp_replace(display_name, '[[:space:]]+', ' ', 'g'))) = p_normalized
  ) then
    return jsonb_build_object('ok', false, 'error', 'name_taken');
  end if;

  if exists (
    select 1
    from public.competition_participants
    where lower(btrim(regexp_replace(display_label, '[[:space:]]+', ' ', 'g'))) = p_normalized
      and participant_key_hash <> p_hash
  ) then
    return jsonb_build_object('ok', false, 'error', 'name_taken');
  end if;

  begin
    insert into public.guest_display_names (normalized_name, display_name, participant_key_hash)
    values (p_normalized, p_display, p_hash);
  exception
    when unique_violation then
      return jsonb_build_object('ok', false, 'error', 'name_taken');
  end;

  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.claim_guest_display_name(text, text, text) from public, anon, authenticated;
grant execute on function public.claim_guest_display_name(text, text, text) to service_role;
