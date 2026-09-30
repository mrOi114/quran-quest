/**
 * Madarasah 1 private room contracts.
 * Run: node --experimental-strip-types ./scripts/verify-madarasah-room.mjs
 */
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function read(relPath) {
  return readFileSync(join(ROOT, relPath), 'utf8');
}

function walk(dir, found = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      if (name === 'node_modules' || name === '.expo') continue;
      walk(full, found);
    } else if (/\.(ts|tsx|js|jsx)$/.test(name)) {
      found.push(full);
    }
  }
  return found;
}

const access = read('supabase/functions/_shared/madarasahAccess.ts');
const room = read('supabase/functions/_shared/madarasahRoom.ts');
const edge = read('supabase/functions/competition/index.ts');
const migration = read('supabase/migrations/20260930010000_madarasah_private_room.sql');
const en = read('src/i18n/en.ts');
const so = read('src/i18n/so.ts');
const ar = read('src/i18n/ar.ts');
const match = read('src/features/competition/components/CompetitionMatchScreen.tsx');
const home = read('src/features/competition/components/CompetitionHomeScreen.tsx');
const comms = read('src/features/competition/components/MadarasahComms.tsx');
const callHook = read('src/features/competition/hooks/useMadarasahComms.ts');
const screen = read('src/features/competition/components/MadarasahRoomScreen.tsx');

const ACCESS_CODE = 'aabo114';
const codeHash = createHash('sha256').update(ACCESS_CODE).digest('hex');
assert(access.includes(codeHash), 'Server stores only the access-code hash');
assert(!access.includes(ACCESS_CODE), 'Access helper does not store the raw code');
assert(!access.includes('1144'), 'Access helper does not keep the previous code');
assert(!room.includes(ACCESS_CODE), 'Room handler does not store the raw code');
assert(!edge.includes(ACCESS_CODE), 'Competition function does not store the raw code');
assert(!migration.includes(ACCESS_CODE), 'Database migration does not store the raw code');

for (const file of [...walk(join(ROOT, 'src')), ...walk(join(ROOT, 'app'))]) {
  const text = readFileSync(file, 'utf8');
  assert(!text.includes(ACCESS_CODE), `Client must not contain the access code: ${file}`);
  assert(!text.includes(codeHash), `Client must not contain the access-code hash: ${file}`);
}

const { madarasahAccessGranted } = await import('../supabase/functions/_shared/madarasahAccess.ts');
assert(await madarasahAccessGranted(ACCESS_CODE), 'Access code grants access');
assert(await madarasahAccessGranted(` ${ACCESS_CODE} `), 'Trimmed access code grants access');
assert(!(await madarasahAccessGranted('1144')), 'Previous code is denied');
assert(!(await madarasahAccessGranted(ACCESS_CODE.toUpperCase())), 'Wrong case is denied');
assert(!(await madarasahAccessGranted('aabo115')), 'Wrong code is denied');
assert(!(await madarasahAccessGranted('')), 'Empty code is denied');

assert(edge.includes("action === 'join_public'"), 'Public join remains');
const joinCodeHandler = edge.slice(edge.indexOf("action === 'join_code'"), edge.indexOf("action === 'resume'"));
assert(joinCodeHandler.includes('joinByCode'), 'Public code join still looks up a challenge');
assert(!joinCodeHandler.includes('madarasahAccessGranted'), 'Public code join does not treat the access code as a challenge');
assert(edge.includes("action === 'madarasah_enter'"), 'Private enter is a separate action');
assert(edge.includes("action === 'madarasah_join'"), 'Private matches use a separate join');
assert(edge.includes(".is('private_room_id', null)"), 'Public matchmaking skips private rooms');
assert(edge.includes('challenge.private_room_id'), 'Private challenges are recognized');
assert(room.includes("error: 'code_denied'"), 'Wrong code is rejected on the server');
assert(room.includes("error: 'room_unavailable'"), 'A missing private room is not a missing challenge');
assert(!room.includes("error: 'not_found'"), 'Private enter does not return the challenge-not-found error');
assert(room.includes("error: 'not_member'"), 'Non-members are rejected on the server');
assert(edge.includes('revokeMadarasahMember'), 'Leave removes private membership');
assert(edge.includes('leaveMadarasahSeats'), 'Leave removes private match seats');
assert(room.includes('if (!member)'), 'Chat and calls require an active member');
assert(
  room.includes('and(sender_member_id.eq.${mineId},peer_member_id.eq.${peerId})'),
  'Direct messages are limited to the two participants',
);
assert(room.includes('call.callee_member_id !== member.id'), 'Only the callee can accept or decline');
assert(room.includes('call.caller_member_id !== member.id && call.callee_member_id !== member.id'), 'Calls are limited to the two participants');
assert(migration.includes("values ('madarasah_1', 'Madarasah 1')"), 'Room name is Madarasah 1');
assert(migration.includes('revoke all on public.competition_room_messages'), 'Room chat is not publicly readable');
assert(migration.includes('revoke all on public.competition_room_calls'), 'Room calls are not publicly readable');
assert(migration.includes('between 1 and 2000'), 'Chat uses the family message length limit');
assert(!edge.includes('family_messages'), 'Competition function does not use family chat');
assert(!edge.includes('family_calls'), 'Competition function does not use family calls');
assert(!edge.includes('circle_messages'), 'Competition function does not use circle chat');
assert(callHook.includes('FamilyCallPeer'), 'Calls reuse the existing voice peer');
assert(comms.includes('competition.madarasahCalling'), 'Incoming call names the caller');
assert(comms.includes('call.accept'), 'Incoming call can be accepted');
assert(comms.includes('call.decline'), 'Incoming call can be declined');
assert(screen.includes('enterMadarasahRoom'), 'Madarasah screen enters through the private action');
assert(!screen.includes('joinCode'), 'Madarasah screen does not look up a challenge');
assert(screen.includes("message === 'not_found'"), 'Madarasah enter does not treat a missing room as a missing challenge');
assert(screen.includes('competition.madarasahUnavailable'), 'Missing room uses its own message');
assert(screen.includes('competition.madarasahDenied') || read('src/features/competition/services/competitionService.ts').includes('competition.madarasahDenied'), 'Wrong code keeps the access-denied message');
assert(screen.includes('autoCapitalize="none"'), 'Access code keeps the typed characters');
assert(!screen.includes('number-pad'), 'Access code can include letters');
assert(screen.includes('secureTextEntry'), 'Access code is not shown while typing');
assert(screen.includes('leaveMadarasahRoom'), 'Leave Competition clears the private room');
assert(match.includes('privateRoom'), 'Private matches keep the room name');
assert(match.includes('!privateRoom'), 'Private matches do not show or share a room code');
assert(match.includes('MadarasahComms'), 'Private matches keep chat and calls');
assert(match.includes('competition.madarasahBack'), 'Players can return to Madarasah 1');
assert(home.includes("action === 'join_public'") || home.includes('joinPublic'), 'Public start challenge remains');
assert(home.includes('competition/madarasah'), 'Madarasah 1 is a separate entry');
assert(home.includes("action: 'join_code'") || home.includes('joinCode'), 'Public code join remains on the home screen');
assert(en.includes("'competition.madarasahCalling': '{name} is calling you'"), 'English incoming call');
assert(so.includes('competition.madarasahCalling'), 'Somali incoming call');
assert(ar.includes('competition.madarasahCalling'), 'Arabic incoming call');
assert(en.includes('competition.madarasahTitle'), 'English room name');
assert(so.includes('competition.madarasahTitle'), 'Somali room name');
assert(ar.includes('competition.madarasahTitle'), 'Arabic room name');
assert(en.includes("'competition.madarasahUnavailable': 'Madarasah 1 is not available right now.'"), 'English missing-room message');
assert(so.includes('competition.madarasahUnavailable'), 'Somali missing-room message');
assert(ar.includes('competition.madarasahUnavailable'), 'Arabic missing-room message');
assert(en.includes("'competition.madarasahDenied': 'That access code is not correct.'"), 'English wrong-code message');
assert(read('supabase/functions/_shared/competitionQuestions.ts').includes('QUESTION_SECONDS = 30'), 'Question timer stays 30 seconds');

console.log('Madarasah 1 private room checks passed');
