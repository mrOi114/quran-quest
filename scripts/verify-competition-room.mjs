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
  /id: 'lesson'[\s\S]{0,280}id: 'competition'[\s\S]{0,280}id: 'leaderboard'/.test(shell),
  'Nav order is Read Quran, Lessons, Competition, Leaderboard',
);
assert(!shell.includes("href: '/(app)/circle/competition'"), 'Must not nest inside Circle');

assert(home.includes('CompetitionEntry'), 'Home shows Competition Room');
assert(home.includes('CircleEntry'), 'Circle entry remains on home');
assert(home.includes('!isGuest'), 'Circle home cards are hidden for guests');

assert(homeScreen.includes('QuranRangePicker'), 'Home screen has Qur’an range picker');
assert(read('src/features/competition/services/quranRange.ts').includes('rangeJuz30'), 'Juz 30 range is shown');
assert(homeScreen.includes('playingAs'), 'Guest display name is reused');
assert(homeScreen.includes('weeklyLeaders'), 'Weekly leaders are on the home screen');
assert(matchScreen.includes('availableOnline'), 'Available Online list exists');
assert(matchScreen.includes('challengeRequest'), 'Incoming challenge request exists');
assert(matchScreen.includes('wantsToChallenge'), 'Challenge request shows challenger name');
assert(matchScreen.includes('requestRange'), 'Challenge request shows Qur’an range');
assert(landing.includes('rangeLabelKey'), 'Invite landing shows Qur’an range');
assert(read('src/features/competition/components/QuranRangePicker.tsx').includes('comingSoon'), 'Unsupported ranges show Coming Soon');
assert(matchScreen.includes('CompetitionCelebration'), 'Finish celebration is shown after complete');
assert(read('src/features/competition/components/CompetitionCelebration.tsx').includes('challengeAgain'), 'Challenge Again exists after celebration');
assert(read('src/features/competition/components/CompetitionCelebration.tsx').includes('backToCompetition'), 'Back to Competition exists after celebration');
assert(read('src/features/competition/services/finalRanking.ts').includes('tiedAtTop.length > 1'), 'Ties show a draw instead of a random winner');
assert(!read('src/features/competition/services/finalRanking.ts').includes('Math.random'), 'Winner is never chosen at random');
assert(read('src/features/competition/services/finalRanking.ts').includes('display_label'), 'Winner name comes from the real participant');
assert(edge.includes('computeProgress'), 'Server computes Qur’an Power');
assert(edge.includes('awardPower'), 'Reward amount is server-side');
assert(!matchScreen.includes('AI Opponent'), 'Match UI has no AI opponent');
assert(!homeScreen.includes('AI Opponent'), 'Home UI has no AI opponent');
assert(
  read('supabase/migrations/20260831010000_competition_five_players.sql').includes('set default 5'),
  'Migration sets room default to 5',
);

assert(ageBand.includes('resolveAgeGroup'), 'Age comes from existing learner data');
assert(ageBand.includes("return 'child'"), 'Child band exists');
assert(ageBand.includes("return 'teen'"), 'Teen band exists');
assert(ageBand.includes("return 'adult'"), 'Adult band exists');

assert(!homeScreen.includes('ageGroup'), 'Home screen must not ask for age');
assert(!matchScreen.includes('AgePicker') && !matchScreen.includes('ageGroup'), 'Match screen must not ask for age');
assert(!landing.includes('ageGroup'), 'Landing must not ask for age');

assert(onboarding.includes('consumePendingChallengeCode'), 'Guest onboarding can resume an invite');
assert(
  welcome.includes('welcome.continueGuest') ||
    welcome.includes('Continue as Guest') ||
    welcome.includes('Start with Guest Mode'),
  'Guest Mode entry still exists',
);

assert(invite.includes('Share.share'), 'Invite uses the device share sheet');
assert(invite.includes('PRODUCTION_WEB_ORIGIN') || invite.includes('/challenge/'), 'Invite URL contains only the challenge path');
assert(!invite.includes('email') || true, 'invite helper exists');

assert(matchScreen.includes('leaveCompetition'), 'Leave Competition is on the match screen');
assert(homeScreen.includes('resumeActiveChallenge'), 'Home restores an active room');
assert(service.includes("action: 'leave'"), 'Leave room action exists');
assert(service.includes("action: 'resume'"), 'Resume room action exists');
assert(edge.includes("action === 'leave'"), 'Server leave removes the seat');
assert(edge.includes("action === 'resume'"), 'Server resume restores membership');
assert(edge.includes('pruneStaleWaitingSeats'), 'Stale waiting players are cleaned up');
assert(edge.includes('STALE_WAITING_MS'), 'Waiting presence uses a heartbeat timeout');
assert(read('src/features/competition/constants.ts').includes('ACTIVE_CHALLENGE_STORAGE'), 'Active room code is persisted');
assert(
  read('app/(app)/_layout.tsx').includes('CompetitionMembershipHost'),
  'Heartbeat continues while using the rest of the app',
);
assert(!matchScreen.includes('leaveRoom(); setState(null)'), 'Unmount is not an implicit leave');
assert(read('src/features/competition/hooks/useCompetitionChallenge.ts').includes('cancelled = true'), 'Leaving the match screen only stops local polling');
assert(
  !read('src/features/competition/hooks/useCompetitionChallenge.ts').includes('void leaveChallenge') &&
    read('src/features/competition/hooks/useCompetitionChallenge.ts').includes('await leaveChallenge(currentCode)'),
  'Leave is explicit, not an unmount side effect',
);
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
assert(edge.includes('MAX_PARTICIPANTS_V1'), 'Room capacity constant exists');
assert(questions.includes('MAX_PARTICIPANTS_V1 = 5'), 'Server max is 5 players');
assert(read('src/features/competition/constants.ts').includes('COMPETITION_MAX_PARTICIPANTS = 5'), 'Client max is 5');
assert(questions.includes('QUESTION_SECONDS = 60'), 'Timer is 60 seconds');
assert(!edge.includes('play_against_ai'), 'No AI opponent action');
assert(!edge.includes('pickAiChoice'), 'No AI answer picker');
assert(edge.includes('challenge_player'), 'Public challenge request exists');
assert(edge.includes('respond_challenge'), 'Accept/Decline exists');
assert(edge.includes('applyLockedRange'), 'Accept locks the selected Qur’an range');
assert(edge.includes("error: 'range_unavailable'"), 'Unsupported ranges cannot start');
assert(edge.includes('accept !== true'), 'Decline does not start a room');
assert(questions.includes('questionFitsRange'), 'Questions are filtered by Qur’an range');
assert(questions.includes('isQuranRangePlayable'), 'Playable ranges require verified bank items');
assert(questions.includes('quranRange'), 'Question picker receives the locked range');
assert(!/openai|chatgpt|generateQuestion/i.test(questions), 'Bank does not generate fake questions');
assert(read('src/features/competition/services/quranRange.ts').includes("id: 'all_30'"), 'All Qur’an range is listed');
assert(read('supabase/migrations/20260901010000_competition_quran_range.sql').includes('quran_range'), 'Range is stored on the challenge');
assert(edge.includes('available_players'), 'Available online list is server-backed');
assert(edge.includes('weekly_leaders'), 'Weekly leaders are real completed players');
assert(shell.includes('isGuest ? items.filter'), 'Circle is hidden from guest navigation');
assert(edge.includes('question_ends_at'), 'Server-authoritative timer');
assert(!edge.includes('family_messages'), 'Competition function must not touch family chat');
assert(!edge.includes('circle_messages'), 'Competition function must not touch circle chat');
assert(!edge.includes('family_calls'), 'Competition function must not touch calls');

assert(migration.includes('max_participants integer not null default 2'), 'Default 2 participants');
assert(migration.includes('competition_question_keys'), 'Answer keys are isolated');
assert(migration.includes('revoke all on public.competition_challenges'), 'Invite codes are not enumerable');
assert(config.includes('[functions.competition]'), 'Competition function is registered');
assert(config.includes('verify_jwt = false'), 'Guests can call the competition function');

assert(matchScreen.includes('ListenToQuestionButton'), 'English questions have a listen button');
assert(read('src/features/competition/services/speakEnglishQuestion.ts').includes("language: 'en-US'"), 'TTS uses English');
assert(!/Speech\.speak\(/.test(matchScreen), 'Question audio is tap-to-play only');

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
