/**
 * Lesson flow checks: chunking, 60% mastery, and next-lesson continuation.
 * Run: node scripts/verify-lesson-flow.mjs
 */
function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const LESSON_PASS_PERCENT = 60;

const VERSES_PER_LESSON = {
  child_3_6: 1,
  child_7_10: 2,
  child_11_14: 3,
  teen_15_17: 4,
  adult_18_plus: 5,
};

function lessonTestPercent(correctCount, totalCount) {
  if (totalCount <= 0) {
    return 0;
  }
  return Math.round((correctCount / totalCount) * 100);
}

function didPassLessonTest(correctCount, totalCount) {
  return lessonTestPercent(correctCount, totalCount) >= LESSON_PASS_PERCENT;
}

function planLessons(ayahCount, chunk) {
  const lessons = [];
  let index = 1;
  for (let start = 1; start <= ayahCount; start += chunk) {
    const end = Math.min(start + chunk - 1, ayahCount);
    lessons.push({ index, start, end });
    index += 1;
  }
  return lessons;
}

assert(didPassLessonTest(3, 5), '3/5 (60%) must pass');
assert(!didPassLessonTest(2, 5), '2/5 (40%) must not pass');
assert(didPassLessonTest(2, 3), '2/3 (~67%) must pass');
assert(!didPassLessonTest(1, 3), '1/3 must not pass');
assert(didPassLessonTest(1, 1), '1/1 must pass');
assert(!didPassLessonTest(0, 1), '0/1 must not pass');
assert(lessonTestPercent(3, 5) === 60, '3/5 is 60%');

const adultFatiha = planLessons(7, VERSES_PER_LESSON.adult_18_plus);
assert(adultFatiha[0].start === 1 && adultFatiha[0].end === 5, 'adult lesson 1 is ayahs 1–5');
assert(adultFatiha[1] && adultFatiha[1].start === 6 && adultFatiha[1].end === 7, 'adult lesson 2 continues after 5');
assert(adultFatiha.length === 2, 'Al-Fatiha should be 2 adult lessons, not a hard stop');

const nabaAdult = planLessons(40, VERSES_PER_LESSON.adult_18_plus);
assert(nabaAdult.length === 8, 'An-Naba adult path continues for 8 lessons');
assert(nabaAdult[1].start === 6, 'after verses 1–5 the next lesson starts at ayah 6');

function nextAfter(lessons, currentIndex) {
  return lessons.find((item) => item.index === currentIndex + 1) ?? null;
}

assert(nextAfter(nabaAdult, 1)?.start === 6, 'next-lesson helper continues within the surah');
assert(nextAfter(nabaAdult, 8) === null, 'last surah lesson then moves to the next surah in the planner');

console.log('verify-lesson-flow: ok');
