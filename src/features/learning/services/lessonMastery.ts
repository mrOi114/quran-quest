import { LESSON_PASS_PERCENT, MASTERY_ENCOURAGEMENT } from '../constants';
import { getSurah, getVerse, getVersesForSurah, getVersesInRange } from '../content';
import type {
  LearningSnapshot,
  LessonPlan,
  LessonTestChoice,
  LessonTestQuestion,
  VerseContent,
} from '../types';
import {
  allowedQuestionKinds,
  capBandByAge,
  resolveAbilityBand,
  type QuizStyle,
} from './lessonAbility';
import type { LessonTestKind } from '../types';

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
  if (percent >= 90) {
    return MASTERY_ENCOURAGEMENT.mastered;
  }
  if (hasNextLesson) {
    return MASTERY_ENCOURAGEMENT.nextPart;
  }
  return MASTERY_ENCOURAGEMENT.pass;
}

export type AdaptiveQuizOptions = {
  ageYears: number;
  snapshot: LearningSnapshot;
  style: QuizStyle;
};

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

function withChoices(
  id: string,
  kind: LessonTestKind,
  prompt: string,
  correctLabel: string,
  wrongLabels: string[],
  options: {
    promptArabic?: string;
    isArabic?: boolean;
    audioUrl?: string;
  } = {},
): LessonTestQuestion | null {
  if (wrongLabels.length < 2) {
    return null;
  }
  const choices: LessonTestChoice[] = shuffle([
    { id: `${id}-ok`, label: correctLabel, isArabic: options.isArabic },
    ...wrongLabels.slice(0, 2).map((label, index) => ({
      id: `${id}-${index}`,
      label,
      isArabic: options.isArabic,
    })),
  ]);
  const correct = choices.find((choice) => choice.label === correctLabel);
  if (!correct) {
    return null;
  }
  return {
    id,
    kind,
    prompt,
    promptArabic: options.promptArabic,
    audioUrl: options.audioUrl,
    choices,
    correctChoiceId: correct.id,
  };
}

function listenQuestion(verse: VerseContent): LessonTestQuestion | null {
  const wrong = distractorsFor(verse, 2).map((item) => item.textUthmani);
  return withChoices(
    `${verse.id}-listen`,
    'listen',
    'Listen, then tap the ayah you heard.',
    verse.textUthmani,
    wrong,
    { isArabic: true, audioUrl: verse.audioUrl },
  );
}

function matchQuestion(verse: VerseContent): LessonTestQuestion | null {
  const wrong = distractorsFor(verse, 2).map((item) => item.textUthmani);
  return withChoices(
    `${verse.id}-match`,
    'match',
    'Tap the matching ayah.',
    verse.textUthmani,
    wrong,
    { promptArabic: verse.textUthmani, isArabic: true },
  );
}

function nextAyahQuestion(verse: VerseContent): LessonTestQuestion | null {
  const following = getVerse(`${verse.surahNumber}:${verse.ayahNumber + 1}`);
  if (!following) {
    return null;
  }
  const wrong = distractorsFor(following, 2).map((item) => item.textUthmani);
  return withChoices(
    `${verse.id}-next`,
    'next',
    'Which ayah comes next?',
    following.textUthmani,
    wrong,
    { promptArabic: verse.textUthmani, isArabic: true },
  );
}

function beforeAyahQuestion(verse: VerseContent): LessonTestQuestion | null {
  if (verse.ayahNumber <= 1) {
    return null;
  }
  const previous = getVerse(`${verse.surahNumber}:${verse.ayahNumber - 1}`);
  if (!previous) {
    return null;
  }
  const wrong = distractorsFor(previous, 2).map((item) => item.textUthmani);
  return withChoices(
    `${verse.id}-before`,
    'before',
    'Which ayah comes before this?',
    previous.textUthmani,
    wrong,
    { promptArabic: verse.textUthmani, isArabic: true },
  );
}

function splitAyah(text: string): { start: string; rest: string } | null {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length < 3) {
    return null;
  }
  const cut = Math.max(1, Math.floor(words.length / 2));
  return {
    start: words.slice(0, cut).join(' '),
    rest: words.slice(cut).join(' '),
  };
}

function missingPartQuestion(verse: VerseContent): LessonTestQuestion | null {
  const parts = splitAyah(verse.textUthmani);
  if (!parts) {
    return null;
  }
  const wrong = distractorsFor(verse, 4)
    .map((item) => splitAyah(item.textUthmani)?.rest)
    .filter((item): item is string => Boolean(item) && item !== parts.rest)
    .slice(0, 2);
  return withChoices(
    `${verse.id}-missing`,
    'missing',
    'Choose the missing part.',
    parts.rest,
    wrong,
    { promptArabic: `${parts.start} …`, isArabic: true },
  );
}

function meaningQuestion(verse: VerseContent): LessonTestQuestion | null {
  const wrong = distractorsFor(verse, 2)
    .map((item) => item.translationEn)
    .filter((item) => item.trim());
  return withChoices(
    `${verse.id}-meaning`,
    'meaning',
    'What does this ayah mean?',
    verse.translationEn,
    wrong,
    { promptArabic: verse.textUthmani },
  );
}

function identifyQuestion(verse: VerseContent): LessonTestQuestion | null {
  const wrong = distractorsFor(verse, 2).map((item) => item.textUthmani);
  return withChoices(
    `${verse.id}-identify`,
    'identify',
    `Which ayah matches this meaning?\n${verse.translationEn}`,
    verse.textUthmani,
    wrong,
    { isArabic: true },
  );
}

function surahQuestion(verse: VerseContent): LessonTestQuestion | null {
  const surah = getSurah(verse.surahNumber);
  const otherA = getSurah(verse.surahNumber === 1 ? 2 : 1);
  const otherB = getSurah(verse.surahNumber === 114 ? 113 : 114);
  if (!surah || !otherA || !otherB) {
    return null;
  }
  return withChoices(
    `${verse.id}-surah`,
    'surah',
    'Which Surah is this ayah from?',
    surah.nameLatin,
    [otherA.nameLatin, otherB.nameLatin],
    { promptArabic: verse.textUthmani },
  );
}

const BUILDERS: Record<LessonTestKind, (verse: VerseContent) => LessonTestQuestion | null> = {
  listen: listenQuestion,
  match: matchQuestion,
  next: nextAyahQuestion,
  surah: surahQuestion,
  missing: missingPartQuestion,
  before: beforeAyahQuestion,
  meaning: meaningQuestion,
  identify: identifyQuestion,
};

function questionsFromVerses(
  verses: VerseContent[],
  kinds: LessonTestKind[],
): LessonTestQuestion[] {
  const built: LessonTestQuestion[] = [];
  for (const verse of verses) {
    for (const kind of kinds) {
      const question = BUILDERS[kind](verse);
      if (question) {
        built.push(question);
      }
    }
  }
  return built;
}

const MIN_TEST_QUESTIONS = 3;
const MAX_TEST_QUESTIONS = 5;

export function buildAdaptiveQuestions(
  verses: VerseContent[],
  options: AdaptiveQuizOptions,
): LessonTestQuestion[] {
  const band = capBandByAge(resolveAbilityBand(options.snapshot), options.ageYears);
  const kinds = allowedQuestionKinds(options.ageYears, band, options.style);
  return pickTestQuestions(uniqueVerses(verses), kinds);
}

export function buildMasteryQuestions(
  lesson: LessonPlan,
  options: AdaptiveQuizOptions,
): LessonTestQuestion[] {
  const verses = getVersesInRange(lesson.surahNumber, lesson.startAyah, lesson.endAyah);
  return buildAdaptiveQuestions(verses, options);
}

export function buildUnlockQuestions(
  priorLessons: LessonPlan[],
  options: AdaptiveQuizOptions,
): LessonTestQuestion[] {
  const verses: VerseContent[] = [];
  for (const lesson of priorLessons) {
    verses.push(
      ...getVersesInRange(lesson.surahNumber, lesson.startAyah, lesson.endAyah),
    );
  }
  return buildAdaptiveQuestions(verses, { ...options, style: 'test' });
}

function pickTestQuestions(
  verses: VerseContent[],
  kinds: LessonTestKind[],
): LessonTestQuestion[] {
  const pool = questionsFromVerses(verses, kinds);
  const easyPool = questionsFromVerses(verses, ['listen', 'match', 'next', 'surah']);
  const source = pool.length > 0 ? pool : easyPool;
  if (source.length === 0) {
    return [];
  }
  const shuffled = shuffle(source);
  const target = Math.min(
    MAX_TEST_QUESTIONS,
    Math.max(MIN_TEST_QUESTIONS, verses.length),
  );
  const picked = shuffled.slice(0, Math.min(target, shuffled.length));
  let pad = 0;
  while (picked.length < MIN_TEST_QUESTIONS && easyPool[0]) {
    const base = easyPool[pad % easyPool.length];
    if (!base) {
      break;
    }
    picked.push({
      ...base,
      id: `${base.id}-pad-${pad}`,
    });
    pad += 1;
    if (pad > MIN_TEST_QUESTIONS) {
      break;
    }
  }
  return picked;
}
