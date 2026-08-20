import { LESSON_PASS_PERCENT, MASTERY_ENCOURAGEMENT } from '../constants';
import { getSurah, getVerse, getVersesForSurah, getVersesInRange } from '../content';
import type {
  LessonPlan,
  LessonTestChoice,
  LessonTestQuestion,
  VerseContent,
} from '../types';

export function lessonTestPercent(correctCount: number, totalCount: number): number {
  if (totalCount <= 0) {
    return 0;
  }
  return Math.round((correctCount / totalCount) * 100);
}

export function didPassLessonTest(correctCount: number, totalCount: number): boolean {
  return lessonTestPercent(correctCount, totalCount) >= LESSON_PASS_PERCENT;
}

export function masteryPassMessage(percent: number, hasNextLesson: boolean): string {
  if (percent >= LESSON_PASS_PERCENT && !hasNextLesson) {
    return MASTERY_ENCOURAGEMENT.quranComplete;
  }
  return MASTERY_ENCOURAGEMENT.pass;
}

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const current = next[i];
    const swap = next[j];
    if (current === undefined || swap === undefined) {
      continue;
    }
    next[i] = swap;
    next[j] = current;
  }
  return next;
}

function uniqueVerses(verses: VerseContent[]): VerseContent[] {
  const seen = new Set<string>();
  const result: VerseContent[] = [];
  for (const verse of verses) {
    if (seen.has(verse.id)) {
      continue;
    }
    seen.add(verse.id);
    result.push(verse);
  }
  return result;
}

function distractorsFor(target: VerseContent, needed: number): VerseContent[] {
  const sameSurah = getVersesForSurah(target.surahNumber).filter(
    (verse) => verse.id !== target.id,
  );
  const neighbors: VerseContent[] = [];
  for (const surahNumber of [
    target.surahNumber - 1,
    target.surahNumber + 1,
    target.surahNumber - 2,
    1,
    112,
  ]) {
    if (surahNumber < 1 || surahNumber > 114 || surahNumber === target.surahNumber) {
      continue;
    }
    neighbors.push(...getVersesForSurah(surahNumber));
  }
  return shuffle(uniqueVerses([...sameSurah, ...neighbors])).slice(0, needed);
}

function meaningQuestion(verse: VerseContent): LessonTestQuestion | null {
  const wrong = distractorsFor(verse, 2).filter((item) => item.translationEn.trim());
  if (wrong.length < 2 || !verse.translationEn.trim()) {
    return null;
  }
  const choices: LessonTestChoice[] = shuffle([
    { id: `${verse.id}-m-ok`, label: verse.translationEn },
    ...wrong.map((item, index) => ({
      id: `${verse.id}-m-${index}`,
      label: item.translationEn,
    })),
  ]);
  const correct = choices.find((choice) => choice.label === verse.translationEn);
  if (!correct) {
    return null;
  }
  return {
    id: `${verse.id}-meaning`,
    prompt: 'What does this ayah mean?',
    promptArabic: verse.textUthmani,
    choices,
    correctChoiceId: correct.id,
  };
}

function identifyQuestion(verse: VerseContent): LessonTestQuestion | null {
  const wrong = distractorsFor(verse, 2).filter((item) => item.textUthmani.trim());
  if (wrong.length < 2 || !verse.textUthmani.trim()) {
    return null;
  }
  const choices: LessonTestChoice[] = shuffle([
    { id: `${verse.id}-i-ok`, label: verse.textUthmani, isArabic: true },
    ...wrong.map((item, index) => ({
      id: `${verse.id}-i-${index}`,
      label: item.textUthmani,
      isArabic: true,
    })),
  ]);
  const correct = choices.find((choice) => choice.label === verse.textUthmani);
  if (!correct) {
    return null;
  }
  return {
    id: `${verse.id}-identify`,
    prompt: `Which ayah matches this meaning?\n${verse.translationEn}`,
    choices,
    correctChoiceId: correct.id,
  };
}

function nextAyahQuestion(verse: VerseContent): LessonTestQuestion | null {
  const following = getVerse(`${verse.surahNumber}:${verse.ayahNumber + 1}`);
  if (!following) {
    return null;
  }
  const wrong = distractorsFor(following, 2).filter((item) => item.id !== following.id);
  if (wrong.length < 2) {
    return null;
  }
  const choices: LessonTestChoice[] = shuffle([
    { id: `${verse.id}-n-ok`, label: following.textUthmani, isArabic: true },
    ...wrong.map((item, index) => ({
      id: `${verse.id}-n-${index}`,
      label: item.textUthmani,
      isArabic: true,
    })),
  ]);
  const correct = choices.find((choice) => choice.label === following.textUthmani);
  if (!correct) {
    return null;
  }
  return {
    id: `${verse.id}-next`,
    prompt: 'Which ayah comes next?',
    promptArabic: verse.textUthmani,
    choices,
    correctChoiceId: correct.id,
  };
}

function questionsFromVerses(verses: VerseContent[]): LessonTestQuestion[] {
  const built: LessonTestQuestion[] = [];
  for (const verse of verses) {
    const meaning = meaningQuestion(verse);
    if (meaning) {
      built.push(meaning);
    }
    const identify = identifyQuestion(verse);
    if (identify) {
      built.push(identify);
    }
    const nextAyah = nextAyahQuestion(verse);
    if (nextAyah) {
      built.push(nextAyah);
    }
  }
  return built;
}

const MIN_TEST_QUESTIONS = 3;
const MAX_TEST_QUESTIONS = 5;

export function buildMasteryQuestions(lesson: LessonPlan): LessonTestQuestion[] {
  const verses = getVersesInRange(lesson.surahNumber, lesson.startAyah, lesson.endAyah);
  return pickTestQuestions(verses);
}

export function buildUnlockQuestions(priorLessons: LessonPlan[]): LessonTestQuestion[] {
  const verses: VerseContent[] = [];
  for (const lesson of priorLessons) {
    verses.push(
      ...getVersesInRange(lesson.surahNumber, lesson.startAyah, lesson.endAyah),
    );
  }
  return pickTestQuestions(uniqueVerses(verses));
}

function pickTestQuestions(verses: VerseContent[]): LessonTestQuestion[] {
  const pool = questionsFromVerses(verses);
  if (pool.length === 0) {
    return fallbackSurahQuestions(verses[0] ?? null);
  }
  const shuffled = shuffle(pool);
  const target = Math.min(
    MAX_TEST_QUESTIONS,
    Math.max(MIN_TEST_QUESTIONS, verses.length),
  );
  const picked = shuffled.slice(0, Math.min(target, shuffled.length));
  const padded = [...picked];
  const fallback = fallbackSurahQuestions(verses[0] ?? null);
  let pad = 0;
  while (padded.length < MIN_TEST_QUESTIONS && fallback[0]) {
    const base = fallback[0];
    padded.push({
      ...base,
      id: `${base.id}-pad-${pad}`,
    });
    pad += 1;
    if (pad > MIN_TEST_QUESTIONS) {
      break;
    }
  }
  return padded.length > 0 ? padded : fallback;
}

function fallbackSurahQuestions(verse: VerseContent | null): LessonTestQuestion[] {
  if (!verse) {
    return [];
  }
  const surah = getSurah(verse.surahNumber);
  const other = getSurah(verse.surahNumber === 1 ? 2 : 1);
  if (!surah || !other) {
    return [];
  }
  const choices: LessonTestChoice[] = shuffle([
    { id: 'surah-ok', label: surah.nameLatin },
    { id: 'surah-a', label: other.nameLatin },
    {
      id: 'surah-b',
      label: getSurah(verse.surahNumber === 114 ? 113 : 114)?.nameLatin ?? 'An-Nas',
    },
  ]);
  const correct = choices.find((choice) => choice.label === surah.nameLatin);
  if (!correct) {
    return [];
  }
  return [
    {
      id: `${verse.id}-surah`,
      prompt: 'Which Surah is this ayah from?',
      promptArabic: verse.textUthmani,
      choices,
      correctChoiceId: correct.id,
    },
  ];
}
