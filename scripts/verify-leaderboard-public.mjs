/**
 * Public student leaderboard (Guest Mode + registered, top 30).
 * Run: node ./scripts/verify-leaderboard-public.mjs
 */
import { readFileSync } from 'node:fs';
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

const service = read('src/features/leaderboard/services/leaderboardService.ts');
const publicBoard = read('src/features/leaderboard/services/publicBoard.ts');
const screen = read('src/features/leaderboard/components/LeaderboardScreen.tsx');
const edge = read('supabase/functions/leaderboard/index.ts');
const migration = read('supabase/migrations/20260901030000_leaderboard_public.sql');
const constants = read('src/features/leaderboard/constants.ts');
const layout = read('app/(app)/_layout.tsx');
const en = read('src/i18n/en.ts');

assert(constants.includes('LEADERBOARD_PUBLIC_LIMIT = 30'), 'Top 30 cap exists');
assert(edge.includes('const LIMIT = 30'), 'Server list is capped at 30');
assert(edge.includes("action !== 'publish'"), 'Guests can publish without a JWT');
assert(migration.includes('leaderboard_public_entries'), 'Public projection table exists');
assert(migration.includes('revoke all on public.leaderboard_public_entries'), 'Clients cannot query the table directly');
assert(publicBoard.includes("action: 'sync'"), 'Client syncs the public board');
assert(service.includes('syncPublicLeaderboard'), 'Leaderboard model uses the public board');
assert(layout.includes('LeaderboardPresenceHost'), 'Active learners publish while using the app');
assert(screen.includes("useState<LeaderboardViewId>('all')"), 'All Students is the default board');
assert(!service.includes('COMMUNITY_PEERS'), 'Public board does not inject fake community peers');
assert(!edge.includes('Aisha') && !edge.includes('peer-'), 'Server does not create fake students');
assert(en.includes('Real Guest Mode and registered students. Top 30.'), 'Copy says guests and registered, top 30');

console.log('Public leaderboard checks passed.');
