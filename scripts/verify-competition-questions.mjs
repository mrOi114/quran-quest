/**
 * Validate Competition memorization bank against fullQuran.json.
 * Run: node ./scripts/verify-competition-questions.mjs
 * Also: npm run verify:competition
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BANK_PATH = join(ROOT, 'supabase/functions/_shared/competitionMemorization.ts');
const PICKER_PATH = join(ROOT, 'supabase/functions/_shared/competitionQuestions.ts');
const CORPUS_PATH = join(ROOT, 'src/features/reader/content/fullQuran.json');
const CLIENT_CONSTANTS_PATH = join(ROOT, 'src/features/competition/constants.ts');

function assert(condition, message) {
  if (!condition) {
    throw new Error(`FAIL: ${message}`);
  }
}

function parseMemorizationBank(source) {
  const marker = 'export const COMPETITION_MEMORIZATION';
  const start = source.indexOf(marker);
  assert(start >= 0, 'COMPETITION_MEMORIZATION export not found');
  const eq = source.indexOf('=', start);
  const arrStart = source.indexOf('[', eq);
  assert(arrStart >= 0, 'COMPETITION_MEMORIZATION array start not found');

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
  assert(arrEnd > arrStart, 'COMPETITION_MEMORIZATION array end not found');
  const items = JSON.parse(source.slice(arrStart, arrEnd + 1));
  assert(Array.isArray(items), 'COMPETITION_MEMORIZATION must be an array');
  return items;
}

const picker = readFileSync(PICKER_PATH, 'utf8');
const clientCounts = readFileSync(CLIENT_CONSTANTS_PATH, 'utf8');
const corpus = JSON.parse(readFileSync(CORPUS_PATH, 'utf8'));
const bankSource = readFileSync(BANK_PATH, 'utf8');

assert(picker.includes('COMPETITION_MEMORIZATION'), 'Picker must use the memorization bank');
assert(picker.includes('pickChallengeQuestions'), 'pickChallengeQuestions must remain');
assert(picker.includes('questionFitsRange'), 'Questions are filtered by Juz');
assert(picker.includes('juzNumbersForRange'), '10/20/All Juz expand to Juz lists');
assert(picker.includes("'first_10'"), '10 Juz is a playable range');
assert(picker.includes("'first_20'"), '20 Juz is a playable range');
assert(picker.includes("'all_30'"), 'All Juz is a playable range');
assert(picker.includes('3: 5'), 'Challenge 3 must be 5 questions in shared bank');
assert(clientCounts.includes('3: 5'), 'Challenge 3 must be 5 questions in client constants');
assert(!/openai|chatgpt|generateQuestion/i.test(picker), 'Bank does not generate fake questions');
assert(!picker.includes('ageBands.includes'), 'Picker must not filter by age band');

assert(Array.isArray(corpus.surahs) && corpus.surahs.length === 114, 'Corpus must have 114 surahs');
assert(Array.isArray(corpus.verses) && corpus.verses.length === 6236, 'Corpus must have 6236 verses');

const uthmani = new Set(corpus.verses.map((verse) => verse.textUthmani));
const surahLatin = new Set(corpus.surahs.map((surah) => surah.nameLatin));
const surahArabic = new Set(corpus.surahs.map((surah) => surah.nameArabic));
const verseKeys = new Set(corpus.verses.map((verse) => `${verse.surahNumber}:${verse.ayahNumber}`));

const items = parseMemorizationBank(bankSource);
assert(items.length >= 150, `Need a solid memorization bank, got ${items.length}`);

const seenIds = new Set();
const byJuz = new Map();

for (const item of items) {
  assert(item && typeof item === 'object', 'Malformed memorization record');
  const id = item.id;
  assert(typeof id === 'string' && id.length > 0, 'Item missing id');
  assert(!seenIds.has(id), `Duplicate item id ${id}`);
  seenIds.add(id);

  assert(Number.isInteger(item.juz) && item.juz >= 1 && item.juz <= 30, `${id} invalid juz`);
  assert(verseKeys.has(`${item.surahNumber}:${item.ayahNumber}`), `${id} references a verse not in the corpus`);
  assert(typeof item.prompt_en === 'string' && item.prompt_en.length > 0, `${id} missing prompt_en`);
  assert(typeof item.prompt_so === 'string' && item.prompt_so.length > 0, `${id} missing prompt_so`);
  assert(typeof item.prompt_ar === 'string' && item.prompt_ar.length > 0, `${id} missing prompt_ar`);
  assert(['next', 'before', 'missing', 'match', 'identify', 'surah'].includes(item.kind), `${id} unknown kind`);
  assert(Array.isArray(item.choices) && item.choices.length >= 3, `${id} needs at least 3 choices`);
  assert(
    item.choices.some((choice) => choice.id === item.correctChoiceId),
    `${id} correctChoiceId is not among choices`,
  );

  if (item.prompt_arabic) {
    const stripped = String(item.prompt_arabic)
      .replace(/\s*…\s*$/u, '')
      .replace(/\s*\.\.\.\s*$/u, '')
      .trim();
    const found = [...uthmani].some(
      (text) => text === item.prompt_arabic || (stripped.length > 0 && text.startsWith(stripped)),
    );
    assert(found, `${id} prompt_arabic is not from the trusted corpus`);
  }

  for (const choice of item.choices) {
    if (choice.is_arabic) {
      const text = choice.label_ar || choice.label_en;
      assert(typeof text === 'string' && text.length > 0, `${id} empty Arabic choice`);
      const found = [...uthmani].some((verse) => verse === text || verse.includes(text));
      assert(found, `${id} invented Arabic choice text`);
    } else if (item.kind === 'surah') {
      assert(
        surahLatin.has(choice.label_en) || surahArabic.has(choice.label_ar),
        `${id} invented Surah name ${choice.label_en}`,
      );
    }
  }

  const list = byJuz.get(item.juz) ?? [];
  list.push(item);
  byJuz.set(item.juz, list);
}

for (let juz = 1; juz <= 30; juz += 1) {
  const count = byJuz.get(juz)?.length ?? 0;
  assert(count >= 5, `Juz ${juz} has ${count} memorization items; need at least 5`);
}

console.log(`Competition memorization checks passed (${items.length} items, all 30 Juz).`);
