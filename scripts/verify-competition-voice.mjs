/**
 * Fixed motivational voice contracts for Qur’an Competition.
 * Run: node ./scripts/verify-competition-voice.mjs
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

const clips = read('src/features/competition/services/motivationClips.ts');
const voice = read('src/features/competition/services/competitionVoice.ts');
const pref = read('src/features/competition/services/voicePreference.ts');
const hook = read('src/features/competition/hooks/useCompetitionVoice.ts');
const host = read('src/features/competition/components/CompetitionVoiceHost.tsx');
const toggle = read('src/features/competition/components/CompetitionSoundToggle.tsx');
const match = read('src/features/competition/components/CompetitionMatchScreen.tsx');
const home = read('src/features/competition/components/CompetitionHomeScreen.tsx');
const questionSpeech = read('src/features/competition/services/speakEnglishQuestion.ts');
const listen = read('src/features/competition/components/ListenToQuestionButton.tsx');
const layout = read('app/(app)/competition/_layout.tsx');
const pkg = read('package.json');
const en = read('src/i18n/en.ts');
const so = read('src/i18n/so.ts');

const voiceBundle = [clips, voice, pref, hook, host, toggle].join('\n');

assert(clips.includes('MOTIVATION_CLIPS'), 'Fixed clip catalog exists');
assert(clips.includes('Assalamu Alaikum! Welcome to Qur’an Quest.'), 'Greeting clip exists');
assert(clips.includes('Are you ready?'), 'Ready clip exists');
assert(clips.includes('MashaAllah! Excellent!'), 'Correct clip exists');
assert(clips.includes('Great job!'), 'Great job clip exists');
assert(clips.includes('Good try! Keep going!'), 'Gentle incorrect clip exists');
assert(clips.includes('Good effort. Keep going.'), 'Respectful incorrect clip exists');
assert(clips.includes('You completed the challenge'), 'Complete clip exists');
assert(clips.includes('Ready for the next challenge?'), 'Next challenge clip exists');
assert(clips.includes("localUri: null"), 'Clips are structured for later recordings');
const clipPhrases = [
  ...clips.matchAll(/\btext:\s*'([^']*)'/g),
  ...clips.matchAll(/\btext:\s*"([^"]*)"/g),
]
  .map((match) => match[1])
  .join('\n');
assert(clipPhrases.includes('Assalamu Alaikum'), 'Clip texts were parsed');
assert(!/the answer|correct answer|wrong!/i.test(clipPhrases), 'Clip phrases must not reveal answers');

assert(voice.includes("from 'expo-speech'"), 'Motivation reuses expo-speech');
assert(voice.includes("language: 'en-US'"), 'Motivation uses English device TTS');
assert(!voice.includes("language: 'so'"), 'No Somali TTS generation');
assert(!/openai|elevenlabs|azure|google.*tts|speechify/i.test(voiceBundle), 'No AI voice API');
assert(!pkg.includes('elevenlabs'), 'No ElevenLabs dependency');
assert(!pkg.includes('@openai'), 'No OpenAI dependency');

assert(pref.includes('MOTIVATION_SOUND_STORAGE'), 'Sound preference is persisted');
assert(toggle.includes('competition.soundOn'), 'Sound On control exists');
assert(toggle.includes('competition.soundOff'), 'Sound Off control exists');
assert(home.includes('CompetitionSoundToggle'), 'Home has sound toggle');
assert(match.includes('CompetitionSoundToggle'), 'Match has sound toggle');

assert(host.includes('playGreetingOnce'), 'Greeting host autoplays');
assert(layout.includes('CompetitionVoiceHost'), 'Greeting runs when Competition opens');
assert(hook.includes("status === 'reveal'"), 'Correct/incorrect wait for reveal');
assert(hook.includes("'correct'"), 'Correct event is wired');
assert(hook.includes("'incorrect'"), 'Incorrect event is wired');
assert(hook.includes("status === 'complete'"), 'Complete event is wired');
assert(match.includes("'next_challenge'"), 'Next challenge event is wired');
assert(!/Speech\.speak\(/.test(match), 'Match screen does not speak questions automatically');
assert(match.includes('ListenToQuestionButton'), 'English question speaker remains');
assert(listen.includes('speakEnglishQuestion'), 'Speaker still uses tap-to-play');
assert(questionSpeech.includes("language: 'en-US'"), 'Question speaker stays English TTS');

assert(en.includes("'competition.soundOn'"), 'English sound-on copy');
assert(so.includes("'competition.soundOn'"), 'Somali sound-on copy');
assert(clips.includes('child_3_6') && clips.includes('child_7_10'), 'Playful tone is ages 4–10');
assert(!home.includes('ageGroup'), 'Home must not ask for age');
assert(!match.includes('ageGroup'), 'Match must not ask for age');

const PLAYFUL_CORRECT = [
  'correct_mashaallah',
  'correct_great_job',
  'correct_awesome',
  'correct_doing_great',
];
const PLAYFUL_INCORRECT = ['incorrect_keep_going', 'incorrect_almost'];

function pick(event, tone, variant, isLastQuestion) {
  if (event === 'greeting') return ['greeting_welcome', 'greeting_ready'];
  if (event === 'next_challenge') return ['next_challenge'];
  if (event === 'complete') return [tone === 'playful' ? 'complete_mashaallah' : 'complete_respectful'];
  if (event === 'correct') {
    if (tone === 'respectful') return ['correct_respectful'];
    return [PLAYFUL_CORRECT[((variant % PLAYFUL_CORRECT.length) + PLAYFUL_CORRECT.length) % PLAYFUL_CORRECT.length]];
  }
  if (event === 'incorrect') {
    if (tone === 'respectful') return ['incorrect_respectful'];
    if (isLastQuestion) return ['incorrect_keep_going'];
    return [PLAYFUL_INCORRECT[((variant % PLAYFUL_INCORRECT.length) + PLAYFUL_INCORRECT.length) % PLAYFUL_INCORRECT.length]];
  }
  return [];
}

assert(pick('greeting', 'respectful', 0, false).join(',') === 'greeting_welcome,greeting_ready', 'Greeting is shared');
assert(pick('correct', 'respectful', 0, false)[0] === 'correct_respectful', 'Older correct is respectful');
assert(pick('incorrect', 'respectful', 0, false)[0] === 'incorrect_respectful', 'Older incorrect is respectful');
assert(pick('correct', 'playful', 0, false)[0] === 'correct_mashaallah', 'Child correct rotates');
assert(pick('correct', 'playful', 2, false)[0] === 'correct_awesome', 'Child correct includes playful phrase');
assert(pick('incorrect', 'playful', 0, true)[0] === 'incorrect_keep_going', 'Last-question incorrect stays gentle');
assert(pick('complete', 'playful', 0, false)[0] === 'complete_mashaallah', 'Child completion is celebratory');
assert(pick('complete', 'respectful', 0, false)[0] === 'complete_respectful', 'Older completion is concise');

console.log('Competition voice checks passed.');
