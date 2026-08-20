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

console.log('Guest Mode persistence checks passed.');
