import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Background audio + 1×/2×/3× repeat contracts.
 * Run: node scripts/verify-background-audio-repeat.mjs
 */
function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

function readSrc(relPath) {
  return readFileSync(join(ROOT, relPath), 'utf8');
}

function playsFor(count) {
  if (count === 'loop') {
    return Number.POSITIVE_INFINITY;
  }
  if (count === '3') {
    return 3;
  }
  if (count === '2') {
    return 2;
  }
  return 1;
}

function shouldPreserveRemaining(resetRemaining, sameCursor, remainingPlays) {
  return resetRemaining === false && sameCursor && remainingPlays > 0;
}

function resolveEndedAction(remainingAfterDecrement, advance) {
  if (remainingAfterDecrement > 0) {
    return 'replay';
  }
  if (advance) {
    return 'advance';
  }
  return 'complete';
}

function shouldResetEndedGuard(alreadyPlayingSameTrack) {
  return !alreadyPlayingSameTrack;
}

/**
 * Auto Listen remounts the ayah UI and re-calls play() while the next ayah
 * is already playing. If that remount clears the ended-ready flag, the
 * second ayah's ended event is ignored and playback stops.
 */
function simulateAutoListen(startSurah, startAyah, ayahCountBySurah, endedEvents) {
  let surah = startSurah;
  let ayah = startAyah;
  let readyForFinish = true;
  let playing = true;
  const path = [`${surah}:${ayah}`];

  for (let i = 0; i < endedEvents; i += 1) {
    if (!readyForFinish) {
      return { path, stoppedAt: `${surah}:${ayah}`, ignoredEnded: true };
    }
    readyForFinish = false;
    const next = nextCursor(surah, ayah, ayahCountBySurah[surah] ?? 1);
    if (!next) {
      playing = false;
      return { path, stoppedAt: `${surah}:${ayah}`, ignoredEnded: false, completed: true };
    }
    surah = next.surahNumber;
    ayah = next.ayahNumber;
    playing = true;
    readyForFinish = true;
    if (shouldResetEndedGuard(playing)) {
      readyForFinish = false;
    }
    path.push(`${surah}:${ayah}`);
  }
  return { path, stoppedAt: `${surah}:${ayah}`, ignoredEnded: false };
}

function runAyahCycle(repeatCount, advance) {
  let remaining = playsFor(repeatCount);
  let plays = 0;
  let action = 'complete';
  const limit = Number.isFinite(remaining) ? remaining : 8;
  for (let i = 0; i < limit; i += 1) {
    remaining -= 1;
    plays += 1;
    action = resolveEndedAction(remaining, advance);
    if (action !== 'replay') {
      break;
    }
  }
  return { plays, action, remaining };
}

function nextCursor(surahNumber, ayahNumber, ayahCount, lastSurah = 114) {
  if (ayahNumber < ayahCount) {
    return { surahNumber, ayahNumber: ayahNumber + 1 };
  }
  if (surahNumber >= lastSurah) {
    return null;
  }
  return { surahNumber: surahNumber + 1, ayahNumber: 1 };
}

assert(runAyahCycle('1', false).plays === 1, '1× must play exactly once');
assert(runAyahCycle('2', false).plays === 2, '2× must play exactly twice');
assert(runAyahCycle('3', false).plays === 3, '3× must play exactly three times');
assert(runAyahCycle('1', false).action === 'complete', '1× finishes the ayah');
assert(runAyahCycle('2', false).action === 'complete', '2× finishes the ayah');
assert(runAyahCycle('3', false).action === 'complete', '3× finishes the ayah');
assert(runAyahCycle('1', true).plays === 1, '1× listen plays exactly once');
assert(runAyahCycle('1', true).action === 'advance', '1× listen then next ayah');
assert(runAyahCycle('2', true).plays === 2, '2× listen plays exactly twice');
assert(runAyahCycle('2', true).action === 'advance', '2× then next ayah');
assert(runAyahCycle('3', true).plays === 3, '3× with listen-queue still plays three times');
assert(runAyahCycle('3', true).action === 'advance', '3× then existing next-ayah');
assert(runAyahCycle('loop', true).plays === 8, 'loop stays on the ayah');
assert(runAyahCycle('loop', true).action === 'replay', 'loop never advances from remaining');

let remaining = playsFor('3');
remaining -= 1;
assert(remaining === 2, 'after first 3× play, two remain');
assert(
  shouldPreserveRemaining(false, true, remaining),
  'simulated lock/background must keep remaining plays',
);
assert(
  !shouldPreserveRemaining(true, true, remaining),
  'explicit replay/play may reset remaining',
);
remaining -= 1;
remaining -= 1;
assert(remaining === 0, 'third completed play consumes the 3× counter');
assert(resolveEndedAction(remaining, true) === 'advance', 'after 3rd play, next ayah');

remaining = 2;
assert(
  shouldPreserveRemaining(false, true, remaining),
  'interruption remount must not reset remaining',
);
assert(resolveEndedAction(remaining, false) === 'replay', 'resume continues the same cycle');

assert(nextCursor(1, 1, 7).ayahNumber === 2, 'ayah finish → next ayah');
assert(nextCursor(113, 5, 5).surahNumber === 114, 'end of surah → next surah');
assert(nextCursor(113, 5, 5).ayahNumber === 1, 'next surah starts at ayah 1');
assert(nextCursor(114, 6, 6) === null, 'end of 114 completes the listen queue');

assert(
  shouldResetEndedGuard(true) === false,
  'already-playing remount must keep the ended-ready flag',
);
assert(
  shouldResetEndedGuard(false) === true,
  'a new or paused source may reset the ended-ready flag',
);

const fiveAyahs = simulateAutoListen(1, 1, { 1: 7 }, 5);
assert(!fiveAyahs.ignoredEnded, 'Auto Listen must consume every ayah ended event');
assert(
  fiveAyahs.path.join(',') === '1:1,1:2,1:3,1:4,1:5,1:6',
  'Auto Listen must advance 5+ consecutive ayahs',
);

const surahWrap = simulateAutoListen(113, 4, { 113: 5, 114: 6 }, 2);
assert(!surahWrap.ignoredEnded, 'Surah end ended event must not be ignored');
assert(
  surahWrap.path.join(',') === '113:4,113:5,114:1',
  'end of a surah must continue at ayah 1 of the next surah',
);

const session = readSrc('src/features/audio/createBackgroundAudioSession.ts');
assert(session.includes('shouldPlayInBackground: true'), 'Expo audio mode keeps background play');
assert(session.includes("interruptionMode: 'doNotMix'"), 'lock-screen requires doNotMix');
assert(session.includes('keepAudioSessionActive: true'), 'player keeps the native session');
assert(session.includes('finishedCurrentTrack'), 'ended tracks must be marked finished');
assert(session.includes('shouldResetEndedGuard'), 'already-playing remount must not drop ended');
const playNowSrc = session.slice(
  session.indexOf('async function playNow'),
  session.indexOf('function playImmediateNow'),
);
assert(
  playNowSrc.includes('if (alreadyThisTrack)') &&
    playNowSrc.indexOf('if (alreadyThisTrack)') < playNowSrc.indexOf('readyForFinish = false'),
  'already-playing play() must return before clearing the ended-ready flag',
);
assert(session.includes('holdLockScreen'), 'lock/background keeps the media session');
assert(session.includes('resumeNativeIfWanted'), 'Android background can resume if still wanted');
assert(
  session.includes("if (next === 'inactive')"),
  'inactive (calls / Control Center) must not force play',
);
assert(
  session.includes('!finishedCurrentTrack'),
  'finished ayah must not be restarted by lock/background',
);

const config = readSrc('app.config.ts');
assert(config.includes("UIBackgroundModes: ['audio']"), 'iOS UIBackgroundModes audio');
assert(config.includes('enableBackgroundPlayback: true'), 'expo-audio background playback plugin');
assert(
  config.includes('FOREGROUND_SERVICE_MEDIA_PLAYBACK'),
  'Android media playback foreground service',
);

const queue = readSrc('src/features/reader/services/quranListenQueue.ts');
assert(queue.includes('advanceOnComplete'), 'lesson stays on ayah; listen queue can advance');
assert(queue.includes('shouldPreserveRemainingPlays'), 'background remount preserves remaining');
assert(queue.includes('getQuranListenRemainingPlays'), 'remaining plays are inspectable');
assert(
  queue.includes('if (options?.advance !== undefined)'),
  'lessons can keep advance off; listen mode can turn it on',
);

const repeat = readSrc('src/features/reader/services/quranListenRepeat.ts');
assert(repeat.includes("if (count === '2')"), '2× is a first-class play count');
assert(repeat.includes('return 3'), '3× is exactly three plays');

const constants = readSrc('src/features/reader/constants.ts');
assert(
  constants.includes("DEFAULT_READER_REPEAT: AudioRepeatCount = '3'"),
  'default learning option is Repeat 3×',
);
assert(
  constants.includes("ageGroup === 'child_3_6' || ageGroup === 'child_7_10'"),
  'lesson/Hifz default repeat is still age-based 3×',
);

const lesson = readSrc('src/features/learning/components/LessonScreen.tsx');
assert(lesson.includes("if (current === '1') return '2'"), 'lesson cycles 1× → 2×');
assert(lesson.includes("if (current === '2') return '3'"), 'lesson cycles 2× → 3×');

const player = readSrc('src/features/reader/services/audioPlayerService.ts');
assert(player.includes('advance: Boolean(options.continuous)'), 'listen mode still advances ayahs');

const hook = readSrc('src/features/reader/hooks/useVerseAudio.ts');
assert(hook.includes('getQuranListenRemainingPlays'), 'remount restores remaining from the queue');
assert(hook.includes('resetRemaining: false'), 'background remount does not reset the counter');

const controls = readSrc('src/features/reader/components/VerseAudioControls.tsx');
assert(controls.includes("t('reader.times2')"), 'existing repeat control shows 2×');

const focus = readSrc('src/features/reader/components/ReaderVerseFocus.tsx');
assert(
  focus.includes('continuous: continuous ?? (autoPlay && audioEnabled)'),
  'listen can keep the queue advancing without autoPlay',
);

const fullReader = readSrc('src/features/reader/components/FullQuranReaderScreen.tsx');
assert(
  fullReader.includes("continuous={listenMode === 'listen' ? audioEnabled : undefined}"),
  'listen mode wires continuous independently of UI autoPlay',
);
assert(
  fullReader.includes("listenMode === 'listen' ? listenRepeatCount : preferences.repeatCount"),
  'listen mode uses its own 1× default, not lesson prefs',
);
assert(fullReader.includes('function nextListenRepeat'), 'listen 2×/3×/loop cycle stays local');
assert(
  !fullReader.includes("void setRepeatCount(nextListenRepeat"),
  'listen repeat must not persist into lesson preferences',
);

const fullReaderHook = readSrc('src/features/reader/hooks/useFullQuranReader.ts');
assert(
  fullReaderHook.includes("useState<AudioRepeatCount>('1')"),
  'Read Qur’an by listening defaults to 1×',
);
assert(
  fullReaderHook.includes('setListenRepeatCountState(value)'),
  'listen 2×/3× stays on the reader session',
);

console.log('verify-background-audio-repeat: all contracts passed');
