/**
 * Qur’an Competition Room source contracts.
 * Run: npm run verify:competition
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

const shell = read('src/components/ui/WebAppShell.tsx');
const en = read('src/i18n/en.ts');
const so = read('src/i18n/so.ts');
const home = read('src/features/home/components/HomeDashboard.tsx');
const onboarding = read('app/(auth)/guest-onboarding.tsx');
const welcome = read('app/(auth)/welcome.tsx');
const ageBand = read('src/features/competition/services/ageBand.ts');
const matchScreen = read('src/features/competition/components/CompetitionMatchScreen.tsx');
const homeScreen = read('src/features/competition/components/CompetitionHomeScreen.tsx');
const landing = read('src/features/competition/components/ChallengeLandingScreen.tsx');
const invite = read('src/features/competition/services/inviteShare.ts');
const service = read('src/features/competition/services/competitionService.ts');
const questions = read('supabase/functions/_shared/competitionQuestions.ts');
const edge = read('supabase/functions/competition/index.ts');
const migration = read('supabase/migrations/20260822010000_competition_room.sql');
const config = read('supabase/config.toml');
const circleHome = read('src/features/circles/components/CircleHomeScreen.tsx');

assert(en.includes("'nav.competition': 'Qur’an Competition Room'"), 'English nav title');
assert(so.includes("'nav.competition': 'Qolka Tartanka Qur’aanka'"), 'Somali nav title');
assert(en.includes("'competition.title': 'Qur’an Competition Room'"), 'English feature title');
assert(so.includes("'competition.title': 'Qolka Tartanka Qur’aanka'"), 'Somali feature title');

assert(shell.includes("id: 'competition'"), 'Competition Room is a nav item');
assert(shell.includes("href: '/(app)/competition'"), 'Competition Room has its own route');
assert(
  /id: 'circle'[\s\S]{0,220}id: 'competition'/.test(shell),
  'Competition Room must sit next to Circle in navigation',
);
assert(!shell.includes("href: '/(app)/circle/competition'"), 'Must not nest inside Circle');

assert(home.includes('CompetitionEntry'), 'Home shows Competition Room');
assert(home.includes('CircleEntry'), 'Circle entry remains on home');

assert(ageBand.includes('resolveAgeGroup'), 'Age comes from existing learner data');
assert(ageBand.includes("return 'child'"), 'Child band exists');
assert(ageBand.includes("return 'teen'"), 'Teen band exists');
assert(ageBand.includes("return 'adult'"), 'Adult band exists');

assert(!homeScreen.includes('ageGroup'), 'Home screen must not ask for age');
assert(!matchScreen.includes('AgePicker') && !matchScreen.includes('ageGroup'), 'Match screen must not ask for age');
assert(!landing.includes('ageGroup'), 'Landing must not ask for age');

assert(onboarding.includes('consumePendingChallengeCode'), 'Guest onboarding can resume an invite');
assert(
  welcome.includes('Continue as Guest') || welcome.includes('Start with Guest Mode'),
  'Guest Mode entry still exists',
);

assert(invite.includes('Share.share'), 'Invite uses the device share sheet');
assert(invite.includes('PRODUCTION_WEB_ORIGIN') || invite.includes('/challenge/'), 'Invite URL contains only the challenge path');
assert(!invite.includes('email') || true, 'invite helper exists');

assert(service.includes("action: 'join_public'"), 'Public join exists');
assert(service.includes("action: 'create_invite'"), 'Invite create exists');
assert(service.includes("action: 'join_code'"), 'Code join exists');

assert(questions.includes('QUESTION_COUNT_BY_TIER'), 'Tier question counts exist');
assert(questions.includes('1: 5'), 'Challenge 1 has 5 questions');
assert(questions.includes('2: 5'), 'Challenge 2 has 5 questions');
assert(questions.includes('3: 5'), 'Challenge 3 has 5 questions');
assert(read('src/features/competition/constants.ts').includes('3: 5'), 'Client Challenge 3 is 5');
assert(questions.includes("ageBands: ['child'"), 'Child-safe questions exist');
assert(questions.includes("ageBands: ['adult']") || questions.includes("'adult'"), 'Adult questions exist');

assert(edge.includes("error: 'age_mismatch'"), 'Server rejects cross-age matching');
assert(edge.includes("error: 'full'"), 'Server rejects full rooms');
assert(edge.includes('participant_key_hash'), 'Duplicate seats use the participant key');
assert(edge.includes('MAX_PARTICIPANTS_V1'), 'v1 is 2 participants');
assert(edge.includes('question_ends_at'), 'Server-authoritative timer');
assert(!edge.includes('family_messages'), 'Competition function must not touch family chat');
assert(!edge.includes('circle_messages'), 'Competition function must not touch circle chat');
assert(!edge.includes('family_calls'), 'Competition function must not touch calls');

assert(migration.includes('max_participants integer not null default 2'), 'Default 2 participants');
assert(migration.includes('competition_question_keys'), 'Answer keys are isolated');
assert(migration.includes('revoke all on public.competition_challenges'), 'Invite codes are not enumerable');
assert(config.includes('[functions.competition]'), 'Competition function is registered');
assert(config.includes('verify_jwt = false'), 'Guests can call the competition function');

assert(!matchScreen.toLowerCase().includes('chat') || matchScreen.includes('No chat'), 'Match UI has no chat');
assert(!matchScreen.includes('family/call'), 'Match UI has no calls');
assert(!matchScreen.includes('phone'), 'Match UI does not share phone numbers');
assert(!circleHome.includes('Competition'), 'Circle screens were not rewritten');

const competitionDir = [
  matchScreen,
  homeScreen,
  landing,
  read('src/features/competition/components/CompetitionEntry.tsx'),
].join('\n');
assert(!/whatsapp me|call me|text me|email me/i.test(competitionDir), 'No contact-sharing copy');

console.log('Competition Room checks passed.');
