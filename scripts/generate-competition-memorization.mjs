/**
 * Build Competition memorization items from fullQuran.json.
 * Does not invent ayah text. Run: node ./scripts/generate-competition-memorization.mjs
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CORPUS_PATH = join(ROOT, 'src/features/reader/content/fullQuran.json');
const OUT_PATH = join(ROOT, 'supabase/functions/_shared/competitionMemorization.ts');

const corpus = JSON.parse(readFileSync(CORPUS_PATH, 'utf8'));
const surahs = corpus.surahs;
const verses = corpus.verses;
const juzList = corpus.juz;

if (!Array.isArray(verses) || verses.length !== 6236) {
  throw new Error(`Unexpected verse count: ${verses.length}`);
}
if (!Array.isArray(juzList) || juzList.length !== 30) {
  throw new Error(`Expected 30 juz, got ${juzList?.length}`);
}

const verseById = new Map(verses.map((verse) => [`${verse.surahNumber}:${verse.ayahNumber}`, verse]));
const surahByNumber = new Map(surahs.map((surah) => [surah.number, surah]));

function versesInJuz(juz) {
  return verses.filter((verse) => {
    const afterStart =
      verse.surahNumber > juz.startSurahNumber ||
      (verse.surahNumber === juz.startSurahNumber && verse.ayahNumber >= juz.startAyahNumber);
    const beforeEnd =
      verse.surahNumber < juz.endSurahNumber ||
      (verse.surahNumber === juz.endSurahNumber && verse.ayahNumber <= juz.endAyahNumber);
    return afterStart && beforeEnd;
  });
}

function sampleEven(list, max) {
  if (list.length <= max) {
    return list;
  }
  const step = list.length / max;
  return Array.from({ length: max }, (_, index) => list[Math.min(list.length - 1, Math.floor(index * step))]);
}

function shuffle(items, seed) {
  const next = [...items];
  let state = seed;
  for (let i = next.length - 1; i > 0; i -= 1) {
    state = (state * 1664525 + 1013904223) >>> 0;
    const j = state % (i + 1);
    const tmp = next[i];
    next[i] = next[j];
    next[j] = tmp;
  }
  return next;
}

function splitAyah(text) {
  const words = String(text || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length < 3) {
    return null;
  }
  const cut = Math.max(1, Math.floor(words.length / 2));
  return {
    start: words.slice(0, cut).join(' '),
    rest: words.slice(cut).join(' '),
  };
}

function distractors(target, needed) {
  const sameSurah = verses.filter(
    (verse) => verse.surahNumber === target.surahNumber && verse.ayahNumber !== target.ayahNumber,
  );
  const neighbors = verses.filter(
    (verse) =>
      Math.abs(verse.surahNumber - target.surahNumber) === 1 ||
      verse.surahNumber === 1 ||
      verse.surahNumber === 112,
  );
  const pool = [];
  const seen = new Set();
  for (const verse of [...sameSurah, ...neighbors]) {
    const key = `${verse.surahNumber}:${verse.ayahNumber}`;
    if (key === `${target.surahNumber}:${target.ayahNumber}` || seen.has(key)) {
      continue;
    }
    seen.add(key);
    pool.push(verse);
  }
  return shuffle(pool, target.surahNumber * 1000 + target.ayahNumber).slice(0, needed);
}

function arabicChoice(id, text) {
  return { id, label_en: text, label_so: text, label_ar: text, is_arabic: true };
}

function withChoices(id, kind, prompts, promptArabic, correctLabel, wrongLabels, arabicChoices, extra) {
  if (wrongLabels.length < 2) {
    return null;
  }
  const raw = shuffle(
    [
      { id: 'a', label: correctLabel },
      { id: 'b', label: wrongLabels[0] },
      { id: 'c', label: wrongLabels[1] },
    ],
    id.length + kind.length,
  );
  const letters = ['a', 'b', 'c'];
  const choices = raw.map((item, index) => {
    const choiceId = letters[index];
    if (arabicChoices) {
      return arabicChoice(choiceId, item.label);
    }
    return {
      id: choiceId,
      label_en: item.label,
      label_so: item.label,
      label_ar: extra?.labelAr?.[item.label] ?? item.label,
      is_arabic: false,
    };
  });
  const correct = choices.find((choice) => (arabicChoices ? choice.label_ar : choice.label_en) === correctLabel);
  if (!correct) {
    return null;
  }
  return {
    id,
    kind,
    prompt_en: prompts.en,
    prompt_so: prompts.so,
    prompt_ar: prompts.ar,
    prompt_arabic: promptArabic || '',
    choices,
    correctChoiceId: correct.id,
    surahNumber: extra.surahNumber,
    ayahNumber: extra.ayahNumber,
    juz: extra.juz,
  };
}

const PROMPTS = {
  next: {
    en: 'Which ayah comes next?',
    so: 'Waa luu aayadda xigta?',
    ar: 'ما الآية التالية؟',
  },
  before: {
    en: 'Which ayah comes before this?',
    so: 'Waa luu aayadda ka horreysay?',
    ar: 'ما الآية التي قبل هذه؟',
  },
  missing: {
    en: 'Choose the missing part of this ayah.',
    so: 'Dooro qaybta ka maqan ee aayaddan.',
    ar: 'اختر الجزء الناقص من هذه الآية.',
  },
  match: {
    en: 'Tap the matching ayah.',
    so: 'Taabo aayadda isku midka ah.',
    ar: 'اختر الآية المطابقة.',
  },
  identify: {
    en: 'Which ayah matches this meaning?',
    so: 'Waa luu aayadda u dhiganta macnahan?',
    ar: 'أي آية تطابق هذا المعنى؟',
  },
  surah: {
    en: 'Which Surah is this ayah from?',
    so: 'Suuraddee ayay aayaddani ka timid?',
    ar: 'من أي سورة هذه الآية؟',
  },
};

function buildForVerse(verse, juzNumber) {
  const items = [];
  const idBase = `jz${juzNumber}-${verse.surahNumber}-${verse.ayahNumber}`;
  const extra = { surahNumber: verse.surahNumber, ayahNumber: verse.ayahNumber, juz: juzNumber };

  const following = verseById.get(`${verse.surahNumber}:${verse.ayahNumber + 1}`);
  if (following) {
    const wrong = distractors(following, 2).map((item) => item.textUthmani);
    const next = withChoices(
      `${idBase}-next`,
      'next',
      PROMPTS.next,
      verse.textUthmani,
      following.textUthmani,
      wrong,
      true,
      extra,
    );
    if (next) items.push(next);
  }

  if (verse.ayahNumber > 1) {
    const previous = verseById.get(`${verse.surahNumber}:${verse.ayahNumber - 1}`);
    if (previous) {
      const wrong = distractors(previous, 2).map((item) => item.textUthmani);
      const before = withChoices(
        `${idBase}-before`,
        'before',
        PROMPTS.before,
        verse.textUthmani,
        previous.textUthmani,
        wrong,
        true,
        extra,
      );
      if (before) items.push(before);
    }
  }

  const parts = splitAyah(verse.textUthmani);
  if (parts) {
    const wrong = distractors(verse, 6)
      .map((item) => splitAyah(item.textUthmani)?.rest)
      .filter((item) => item && item !== parts.rest)
      .slice(0, 2);
    const missing = withChoices(
      `${idBase}-missing`,
      'missing',
      PROMPTS.missing,
      `${parts.start} …`,
      parts.rest,
      wrong,
      true,
      extra,
    );
    if (missing) items.push(missing);
  }

  const matchWrong = distractors(verse, 2).map((item) => item.textUthmani);
  const match = withChoices(
    `${idBase}-match`,
    'match',
    PROMPTS.match,
    verse.textUthmani,
    verse.textUthmani,
    matchWrong,
    true,
    extra,
  );
  if (match) items.push(match);

  if (verse.translationEn?.trim()) {
    const identifyWrong = distractors(verse, 2).map((item) => item.textUthmani);
    const identify = withChoices(
      `${idBase}-identify`,
      'identify',
      {
        en: `${PROMPTS.identify.en}\n${verse.translationEn}`,
        so: `${PROMPTS.identify.so}\n${verse.translationEn}`,
        ar: `${PROMPTS.identify.ar}\n${verse.translationEn}`,
      },
      '',
      verse.textUthmani,
      identifyWrong,
      true,
      extra,
    );
    if (identify) items.push(identify);
  }

  const surah = surahByNumber.get(verse.surahNumber);
  const otherA = surahByNumber.get(verse.surahNumber === 1 ? 2 : 1);
  const otherB = surahByNumber.get(verse.surahNumber === 114 ? 113 : 114);
  if (surah && otherA && otherB) {
    const labelAr = {
      [surah.nameLatin]: surah.nameArabic,
      [otherA.nameLatin]: otherA.nameArabic,
      [otherB.nameLatin]: otherB.nameArabic,
    };
    const surahItem = withChoices(
      `${idBase}-surah`,
      'surah',
      PROMPTS.surah,
      verse.textUthmani,
      surah.nameLatin,
      [otherA.nameLatin, otherB.nameLatin],
      false,
      { ...extra, labelAr },
    );
    if (surahItem) items.push(surahItem);
  }

  return items;
}

const bank = [];
for (const juz of juzList) {
  const inJuz = versesInJuz(juz);
  if (inJuz.length < 8) {
    throw new Error(`Juz ${juz.number} has too few verses: ${inJuz.length}`);
  }
  const sampled = sampleEven(inJuz, 18);
  const built = [];
  for (const verse of sampled) {
    built.push(...buildForVerse(verse, juz.number));
  }
  const unique = [];
  const seen = new Set();
  for (const item of shuffle(built, juz.number * 17)) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    unique.push(item);
  }
  if (unique.length < 8) {
    throw new Error(`Juz ${juz.number} produced only ${unique.length} memorization items`);
  }
  bank.push(...unique.slice(0, 24));
}

mkdirSync(dirname(OUT_PATH), { recursive: true });
const body = `/** Generated from fullQuran.json. Do not edit by hand. */
export type MemorizationKind = 'next' | 'before' | 'missing' | 'match' | 'identify' | 'surah';

export type MemorizationChoice = {
  id: string;
  label_en: string;
  label_so: string;
  label_ar: string;
  is_arabic?: boolean;
};

export type MemorizationItem = {
  id: string;
  kind: MemorizationKind;
  juz: number;
  surahNumber: number;
  ayahNumber: number;
  prompt_en: string;
  prompt_so: string;
  prompt_ar: string;
  prompt_arabic: string;
  choices: MemorizationChoice[];
  correctChoiceId: string;
};

export const COMPETITION_MEMORIZATION: MemorizationItem[] = ${JSON.stringify(bank, null, 2)};
`;
writeFileSync(OUT_PATH, body);
console.log(`Wrote ${bank.length} memorization items to ${OUT_PATH}`);
