/**
 * Validate competition question bank integrity against fullQuran.json.
 * Run: node ./scripts/verify-competition-questions.mjs
 * Also: npm run verify:competition
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const QUESTIONS_PATH = join(ROOT, 'supabase/functions/_shared/competitionQuestions.ts');
const CORPUS_PATH = join(ROOT, 'src/features/reader/content/fullQuran.json');
const CLIENT_CONSTANTS_PATH = join(ROOT, 'src/features/competition/constants.ts');

const VALID_DIFFICULTIES = new Set([1, 2, 3, 4]);
const VALID_AGE_BANDS = new Set(['child', 'teen', 'adult']);
const CHOICE_IDS = ['a', 'b', 'c', 'd'];
const TIER_COUNT = 5;

function assert(condition, message) {
  if (!condition) {
    throw new Error(`FAIL: ${message}`);
  }
}

function read(path) {
  return readFileSync(path, 'utf8');
}

/** Extract COMPETITION_QUESTIONS array and evaluate as data (no TypeScript types in objects). */
function parseQuestionBank(source) {
  const marker = 'export const COMPETITION_QUESTIONS';
  const start = source.indexOf(marker);
  assert(start >= 0, 'COMPETITION_QUESTIONS export not found');
  const eq = source.indexOf('=', start);
  const arrStart = source.indexOf('[', eq);
  assert(arrStart >= 0, 'COMPETITION_QUESTIONS array start not found');

  let depth = 0;
  let arrEnd = -1;
  for (let i = arrStart; i < source.length; i += 1) {
    const ch = source[i];
    if (ch === '[') depth += 1;
    else if (ch === ']') {
      depth -= 1;
      if (depth === 0) {
        arrEnd = i;
        break;
      }
    }
  }
  assert(arrEnd > arrStart, 'COMPETITION_QUESTIONS array end not found');

  const literal = source.slice(arrStart, arrEnd + 1);
  // Object keys are unquoted identifiers; values use single-quoted strings — safe to eval.
  // eslint-disable-next-line no-new-func
  const questions = new Function(`return (${literal});`)();
  assert(Array.isArray(questions), 'COMPETITION_QUESTIONS must be an array');
  return questions;
}

function normalizePrompt(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function choiceSignature(choices) {
  return CHOICE_IDS.map((id) => {
    const choice = choices.find((c) => c.id === id);
    return `${id}:${normalizePrompt(choice?.label_en)}`;
  }).join('|');
}

function difficultyRange(tier, ageBand) {
  if (ageBand === 'child') {
    if (tier === 1) return { min: 1, max: 1 };
    if (tier === 2) return { min: 1, max: 2 };
    return { min: 2, max: 3 };
  }
  if (ageBand === 'teen') {
    if (tier === 1) return { min: 1, max: 2 };
    if (tier === 2) return { min: 2, max: 3 };
    return { min: 3, max: 4 };
  }
  if (tier === 1) return { min: 2, max: 3 };
  if (tier === 2) return { min: 3, max: 4 };
  return { min: 4, max: 4 };
}

function poolFor(questions, ageBand, min, max, excludeIds = []) {
  const exclude = new Set(excludeIds);
  return questions.filter(
    (q) =>
      q.ageBands.includes(ageBand) &&
      q.difficulty >= min &&
      q.difficulty <= max &&
      !exclude.has(q.id),
  );
}

function assertCanBuildFifteen(questions, ageBand) {
  // Worst-case: each tier consumes from overlapping pools; ensure unique capacity.
  const used = [];
  for (const tier of [1, 2, 3]) {
    const { min, max } = difficultyRange(tier, ageBand);
    const primary = poolFor(questions, ageBand, min, max, used);
    assert(
      primary.length >= TIER_COUNT,
      `${ageBand} Challenge ${tier} primary pool has ${primary.length} after exclusions; need ${TIER_COUNT}`,
    );
    // Simulate depleting TIER_COUNT from this pool (deterministic: take first N by id).
    const take = [...primary].sort((a, b) => a.id.localeCompare(b.id)).slice(0, TIER_COUNT);
    used.push(...take.map((q) => q.id));
  }
  assert(new Set(used).size === 15, `${ageBand} 15-question run must be 15 unique ids, got ${new Set(used).size}`);
}

const source = read(QUESTIONS_PATH);
const clientCounts = read(CLIENT_CONSTANTS_PATH);
const corpus = JSON.parse(read(CORPUS_PATH));

assert(source.includes('3: 5'), 'Challenge 3 must be 5 questions in shared bank');
assert(clientCounts.includes('3: 5'), 'Challenge 3 must be 5 questions in client constants');
assert(source.includes('correctChoiceId'), 'Trusted answer key field correctChoiceId required');
assert(source.includes('pickChallengeQuestions'), 'pickChallengeQuestions must remain');

assert(Array.isArray(corpus.surahs) && corpus.surahs.length === 114, 'Corpus must have 114 surahs');
assert(Array.isArray(corpus.verses) && corpus.verses.length === 6236, 'Corpus must have 6236 verses');

const surahByNumber = new Map(corpus.surahs.map((s) => [s.number, s]));
const verseKeys = new Set(corpus.verses.map((v) => `${v.surahNumber}:${v.ayahNumber}`));

const questions = parseQuestionBank(source);
assert(questions.length >= 40, `Need a solid bank, got ${questions.length}`);

const seenIds = new Set();
const seenPromptsEn = new Set();
const seenPromptsSo = new Set();
const seenAnswerSets = new Set();
const byBandDiff = {
  child: { 1: 0, 2: 0, 3: 0, 4: 0 },
  teen: { 1: 0, 2: 0, 3: 0, 4: 0 },
  adult: { 1: 0, 2: 0, 3: 0, 4: 0 },
};

for (const question of questions) {
  assert(question && typeof question === 'object', 'Malformed question record (not an object)');

  const id = question.id;
  assert(typeof id === 'string' && id.length > 0, 'Question missing id');
  assert(!seenIds.has(id), `Duplicate question id ${id}`);
  seenIds.add(id);

  assert(VALID_DIFFICULTIES.has(question.difficulty), `${id} invalid difficulty ${question.difficulty}`);

  assert(Array.isArray(question.ageBands) && question.ageBands.length > 0, `${id} missing ageBands`);
  for (const band of question.ageBands) {
    assert(VALID_AGE_BANDS.has(band), `${id} invalid age band ${band}`);
  }

  assert(typeof question.prompt_en === 'string' && question.prompt_en.trim().length > 0, `${id} empty prompt_en`);
  assert(typeof question.prompt_so === 'string' && question.prompt_so.trim().length > 0, `${id} empty prompt_so`);

  const promptEnKey = normalizePrompt(question.prompt_en);
  const promptSoKey = normalizePrompt(question.prompt_so);
  assert(!seenPromptsEn.has(promptEnKey), `${id} duplicate English question wording`);
  assert(!seenPromptsSo.has(promptSoKey), `${id} duplicate Somali question wording`);
  seenPromptsEn.add(promptEnKey);
  seenPromptsSo.add(promptSoKey);

  assert(Array.isArray(question.choices), `${id} choices must be an array`);
  assert(question.choices.length === 4, `${id} must have exactly four choices, got ${question.choices.length}`);

  const choiceIds = question.choices.map((c) => c.id);
  assert(choiceIds.length === 4, `${id} must list four choice ids`);
  assert(new Set(choiceIds).size === 4, `${id} has duplicate choice ids`);
  for (const required of CHOICE_IDS) {
    assert(choiceIds.includes(required), `${id} missing choice ${required}`);
  }

  for (const choice of question.choices) {
    assert(CHOICE_IDS.includes(choice.id), `${id} invalid choice id ${choice.id}`);
    assert(typeof choice.label_en === 'string' && choice.label_en.trim().length > 0, `${id} empty label_en for ${choice.id}`);
    assert(typeof choice.label_so === 'string' && choice.label_so.trim().length > 0, `${id} empty label_so for ${choice.id}`);
  }

  const correct = question.correctChoiceId;
  assert(typeof correct === 'string' && CHOICE_IDS.includes(correct), `${id} correctChoiceId must be a/b/c/d`);
  assert(choiceIds.includes(correct), `${id} correctChoiceId ${correct} not in choices`);
  // Exactly one correct: the stored key points to one choice id only.
  assert(
    question.choices.filter((c) => c.id === correct).length === 1,
    `${id} must have exactly one correct choice`,
  );

  const answerSetKey = `${promptEnKey}::${choiceSignature(question.choices)}`;
  assert(!seenAnswerSets.has(answerSetKey), `${id} duplicate question+answer set`);
  seenAnswerSets.add(answerSetKey);

  if (question.surahNumber !== undefined && question.surahNumber !== null) {
    assert(
      Number.isInteger(question.surahNumber) && question.surahNumber >= 1 && question.surahNumber <= 114,
      `${id} invalid surahNumber ${question.surahNumber}`,
    );
    assert(surahByNumber.has(question.surahNumber), `${id} surah ${question.surahNumber} missing from fullQuran.json`);
  }

  if (question.ayahNumber !== undefined && question.ayahNumber !== null) {
    assert(
      question.surahNumber !== undefined && question.surahNumber !== null,
      `${id} ayahNumber requires surahNumber`,
    );
    assert(
      Number.isInteger(question.ayahNumber) && question.ayahNumber >= 1,
      `${id} invalid ayahNumber ${question.ayahNumber}`,
    );
    const surah = surahByNumber.get(question.surahNumber);
    assert(
      question.ayahNumber <= surah.ayahCount,
      `${id} ayah ${question.ayahNumber} exceeds Surah ${question.surahNumber} ayahCount ${surah.ayahCount}`,
    );
    const key = `${question.surahNumber}:${question.ayahNumber}`;
    assert(verseKeys.has(key), `${id} referenced ayah ${key} does not exist in fullQuran.json`);
  }

  // If only surah is referenced, still require it exists (already checked).
  for (const band of question.ageBands) {
    byBandDiff[band][question.difficulty] += 1;
  }
}

function poolSize(band, min, max) {
  let n = 0;
  for (let d = min; d <= max; d += 1) n += byBandDiff[band][d];
  return n;
}

assert(poolSize('child', 1, 1) >= 5, 'Child Challenge 1 pool too small');
assert(poolSize('child', 1, 2) >= 5, 'Child Challenge 2 pool too small');
assert(poolSize('child', 2, 3) >= 5, 'Child Challenge 3 pool too small');
assert(poolSize('teen', 1, 2) >= 5, 'Teen Challenge 1 pool too small');
assert(poolSize('teen', 2, 3) >= 5, 'Teen Challenge 2 pool too small');
assert(poolSize('teen', 3, 4) >= 5, 'Teen Challenge 3 pool too small');
assert(poolSize('adult', 2, 3) >= 5, 'Adult Challenge 1 pool too small');
assert(poolSize('adult', 3, 4) >= 5, 'Adult Challenge 2 pool too small');
assert(poolSize('adult', 4, 4) >= 5, 'Adult Challenge 3 (hardest) pool too small');

for (const band of ['child', 'teen', 'adult']) {
  assertCanBuildFifteen(questions, band);
}

// Spot-check corpus facts used by the bank (hard fail if corpus drifts).
assert(surahByNumber.get(1).ayahCount === 7, 'Corpus: Al-Fatihah must have 7 ayahs');
assert(surahByNumber.get(2).ayahCount === 286, 'Corpus: Al-Baqarah must have 286 ayahs');
assert(surahByNumber.get(108).ayahCount === 3, 'Corpus: Al-Kawthar must have 3 ayahs');
assert(surahByNumber.get(112).ayahCount === 4, 'Corpus: Al-Ikhlas must have 4 ayahs');
assert(verseKeys.has('2:255'), 'Corpus: Ayat al-Kursi 2:255 must exist');
assert(verseKeys.has('96:1'), 'Corpus: 96:1 must exist');
assert(verseKeys.has('97:3'), 'Corpus: 97:3 must exist');
assert(corpus.juz?.[29]?.startSurahNumber === 78, 'Corpus: Juz 30 must start at Surah 78');

assert(source.includes('questionFitsRange'), 'Range filter exists on the trusted bank');
assert(source.includes('isQuranRangePlayable'), 'Playable ranges require enough verified items');
assert(source.includes('quranRange'), 'Question picker stays inside the selected range');
assert(!/openai|chatgpt|generateQuestion/i.test(source), 'Bank does not invent questions');

console.log(`Competition question bank OK (${questions.length} questions, corpus-verified).`);
