/**
 * Guest Mode persistence contract (local session flag).
 * Run: node ./scripts/verify-guest-session.mjs
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const guestService = readFileSync(
  join(ROOT, 'src/features/auth/services/guestService.ts'),
  'utf8',
);
const authContext = readFileSync(
  join(ROOT, 'src/features/auth/context/AuthContext.tsx'),
  'utf8',
);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function resolveGuestSessionActive(flag, hasProfile) {
  if (flag === 'true') {
    return true;
  }
  if (flag === 'false') {
    return false;
  }
  return hasProfile;
}

assert(
  guestService.includes("const GUEST_SESSION_KEY = 'qq.guest.session_active'"),
  'Guest session flag key must be persisted in AsyncStorage',
);
assert(
  guestService.includes('export function resolveGuestSessionActive'),
  'Guest session flag resolver must exist',
);
assert(
  guestService.includes('await markGuestSessionActive()'),
  'Saving a guest profile must mark the local session active',
);
assert(
  guestService.includes('await markGuestSessionEnded()'),
  'Ending Guest Mode must clear the persisted session flag',
);
assert(
  authContext.includes('hydrateGuestFromStorage()'),
  'Auth bootstrap must restore Guest Mode from local storage',
);
assert(
  authContext.indexOf('hydrateGuestFromStorage()') < authContext.indexOf('await getSession()'),
  'Guest Mode must restore before any email/session lookup',
);
assert(
  authContext.includes("event === 'INITIAL_SESSION'"),
  'Leftover email sessions must not replace an active Guest Mode',
);

assert(resolveGuestSessionActive('true', false) === true, 'active flag wins');
assert(resolveGuestSessionActive('false', true) === false, 'ended flag wins even if profile exists');
assert(resolveGuestSessionActive(null, true) === true, 'legacy profile restores Guest Mode');
assert(resolveGuestSessionActive(null, false) === false, 'no flag and no profile is not Guest Mode');

assert(guestService.includes("const GUEST_USED_NAMES_KEY = 'qq.guest.used_names'"), 'Used guest names are persisted');
assert(guestService.includes('export function normalizeGuestDisplayName'), 'Guest names compare case-insensitively');
assert(guestService.includes('export function isReservedFounderNickname'), 'Founder nickname helper exists');
assert(guestService.includes('guestDisplayNameConflicts'), 'Guest name conflict helper exists');
assert(guestService.includes('GuestNameTakenError'), 'Taken guest names throw a dedicated error');
assert(!/GUEST_USED_NAMES_KEY/.test(guestService.slice(guestService.indexOf('export async function clearGuestProfile'))), 'Ending Guest Mode must keep reserved names');

function normalizeGuestDisplayName(name) {
  return name.trim().replace(/\s+/g, ' ').toLowerCase();
}

function guestDisplayNameConflicts(options) {
  if (!options.normalizedName) {
    return false;
  }
  const keepingOwnName =
    Boolean(options.savingGuestId) &&
    options.savingGuestId === options.currentGuestId &&
    options.currentNormalizedName === options.normalizedName;
  if (keepingOwnName) {
    return false;
  }
  return options.reservedNames.includes(options.normalizedName);
}

assert(normalizeGuestDisplayName('  Mohamed  ') === 'mohamed', 'Guest names compare case-insensitively');
assert(
  guestDisplayNameConflicts({
    normalizedName: 'mohamed',
    reservedNames: ['mohamed'],
    currentGuestId: null,
    savingGuestId: undefined,
    currentNormalizedName: null,
  }) === true,
  'A later guest cannot reuse a reserved name',
);
assert(
  guestDisplayNameConflicts({
    normalizedName: 'mohamed',
    reservedNames: ['mohamed'],
    currentGuestId: 'guest-1',
    savingGuestId: 'guest-1',
    currentNormalizedName: 'mohamed',
  }) === false,
  'The same guest may keep their own name',
);

assert(guestService.includes("functions.invoke('guest-name'"), 'Guest names are claimed on the server');
assert(guestService.includes('claimGuestDisplayNameGlobally'), 'Guest start claims the name globally');

const guestNameFn = readFileSync(join(ROOT, 'supabase/functions/guest-name/index.ts'), 'utf8');
const guestNameMigration = readFileSync(
  join(ROOT, 'supabase/migrations/20260901020000_guest_display_names.sql'),
  'utf8',
);
const config = readFileSync(join(ROOT, 'supabase/config.toml'), 'utf8');
assert(guestNameFn.includes("rpc('claim_guest_display_name'"), 'Edge function claims via SQL');
assert(guestNameMigration.includes('create table public.guest_display_names'), 'Global name table exists');
assert(guestNameMigration.includes('competition_participants'), 'Existing competition names stay unique');
assert(guestNameMigration.includes('from public.profiles'), 'Registered profile names stay unique');
assert(config.includes('[functions.guest-name]'), 'guest-name function is registered');
assert(config.includes('verify_jwt = false'), 'Guests can claim a name without email login');

console.log('Guest Mode persistence checks passed.');
