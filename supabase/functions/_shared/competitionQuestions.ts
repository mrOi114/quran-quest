export type CompetitionAgeBand = 'child' | 'teen' | 'adult';

export type CompetitionQuestion = {
  id: string;
  difficulty: 1 | 2 | 3 | 4;
  ageBands: CompetitionAgeBand[];
  prompt_en: string;
  prompt_so: string;
  choices: Array<{
    id: string;
    label_en: string;
    label_so: string;
  }>;
  correctChoiceId: string;
  /** Surah number 1–114 when the item references a specific Surah. */
  surahNumber?: number;
  /** Ayah number within that Surah when the item references a specific Ayah. */
  ayahNumber?: number;
};

/**
 * Verified Qur’an competition bank.
 * Facts are grounded in the app corpus (fullQuran.json / Quran.com) — not AI memory.
 * correctChoiceId is the trusted answer key used by the server for scoring.
 */
export const COMPETITION_QUESTIONS: CompetitionQuestion[] = [
  // ——— Difficulty 1 (Challenge 1 / easier) ———
  {
    id: 'cq-01',
    difficulty: 1,
    ageBands: ['child', 'teen', 'adult'],
    prompt_en: 'How many Surahs are in the Qur’an?',
    prompt_so: 'Immisa Suurah ayuu Quraanku leeyahay?',
    choices: [
      { id: 'a', label_en: '100', label_so: '100' },
      { id: 'b', label_en: '114', label_so: '114' },
      { id: 'c', label_en: '200', label_so: '200' },
      { id: 'd', label_en: '30', label_so: '30' },
    ],
    correctChoiceId: 'b',
  },
  {
    id: 'cq-02',
    difficulty: 1,
    ageBands: ['child', 'teen', 'adult'],
    prompt_en: 'Which Surah is the opening of the Qur’an?',
    prompt_so: 'Waa luu Suuradda furitaanka Quraanka?',
    choices: [
      { id: 'a', label_en: 'Al-Fatihah', label_so: 'Al-Faatihah' },
      { id: 'b', label_en: 'An-Nas', label_so: 'An-Naas' },
      { id: 'c', label_en: 'Al-Ikhlas', label_so: 'Al-Ikhlaas' },
      { id: 'd', label_en: 'Al-Kawthar', label_so: 'Al-Kawthar' },
    ],
    correctChoiceId: 'a',
    surahNumber: 1,
  },
  {
    id: 'cq-03',
    difficulty: 1,
    ageBands: ['child', 'teen', 'adult'],
    prompt_en: 'What is the last Surah of the Qur’an?',
    prompt_so: 'Waa luu Suuradda ugu dambaysa Quraanka?',
    choices: [
      { id: 'a', label_en: 'An-Nas', label_so: 'An-Naas' },
      { id: 'b', label_en: 'Al-Fatihah', label_so: 'Al-Faatihah' },
      { id: 'c', label_en: 'Al-Ikhlas', label_so: 'Al-Ikhlaas' },
      { id: 'd', label_en: 'Al-Kawthar', label_so: 'Al-Kawthar' },
    ],
    correctChoiceId: 'a',
    surahNumber: 114,
  },
  {
    id: 'cq-04',
    difficulty: 1,
    ageBands: ['child', 'teen', 'adult'],
    prompt_en: 'The Qur’an was revealed in which language?',
    prompt_so: 'Quraanku luuqadtee buu ku soo degay?',
    choices: [
      { id: 'a', label_en: 'Arabic', label_so: 'Carabi' },
      { id: 'b', label_en: 'English', label_so: 'Ingiriisi' },
      { id: 'c', label_en: 'Latin', label_so: 'Laatiin' },
      { id: 'd', label_en: 'Persian', label_so: 'Faarisi' },
    ],
    correctChoiceId: 'a',
  },
  {
    id: 'cq-05',
    difficulty: 1,
    ageBands: ['child', 'teen', 'adult'],
    prompt_en: 'To which Prophet was the Qur’an revealed?',
    prompt_so: 'Nebi kee baa Quraanka loo soo dejiyey?',
    choices: [
      { id: 'a', label_en: 'Prophet Musa ﷺ', label_so: 'Nebi Muuse ﷺ' },
      { id: 'b', label_en: 'Prophet Isa ﷺ', label_so: 'Nebi Ciise ﷺ' },
      { id: 'c', label_en: 'Prophet Muhammad ﷺ', label_so: 'Nebi Muxammad ﷺ' },
      { id: 'd', label_en: 'Prophet Yusuf ﷺ', label_so: 'Nebi Yuusuf ﷺ' },
    ],
    correctChoiceId: 'c',
  },
  {
    id: 'cq-06',
    difficulty: 1,
    ageBands: ['child', 'teen', 'adult'],
    prompt_en: 'How many Juz (parts) is the Qur’an divided into?',
    prompt_so: 'Immisa Juz (qaybood) ayaa Quraanka loo qaybiyey?',
    choices: [
      { id: 'a', label_en: '10', label_so: '10' },
      { id: 'b', label_en: '20', label_so: '20' },
      { id: 'c', label_en: '30', label_so: '30' },
      { id: 'd', label_en: '114', label_so: '114' },
    ],
    correctChoiceId: 'c',
  },
  {
    id: 'cq-07',
    difficulty: 1,
    ageBands: ['child', 'teen', 'adult'],
    prompt_en: 'The Qur’an is the Word of…',
    prompt_so: 'Quraanku waa kalimaha…',
    choices: [
      { id: 'a', label_en: 'Allah', label_so: 'Alle' },
      { id: 'b', label_en: 'A poet', label_so: 'Gabyaa' },
      { id: 'c', label_en: 'A king', label_so: 'Boqor' },
      { id: 'd', label_en: 'A teacher only', label_so: 'Macallin oo keliya' },
    ],
    correctChoiceId: 'a',
  },
  {
    id: 'cq-08',
    difficulty: 1,
    ageBands: ['child', 'teen', 'adult'],
    prompt_en: 'What is the holy book of Muslims?',
    prompt_so: 'Waa maxay kitaabka quduuska ah ee muslimiinta?',
    choices: [
      { id: 'a', label_en: 'The Qur’an', label_so: 'Quraanka' },
      { id: 'b', label_en: 'A storybook', label_so: 'Buug sheeko' },
      { id: 'c', label_en: 'A comic', label_so: 'Majaajillo' },
      { id: 'd', label_en: 'A dictionary', label_so: 'Qaamuus' },
    ],
    correctChoiceId: 'a',
  },
  {
    id: 'cq-09',
    difficulty: 1,
    ageBands: ['child', 'teen', 'adult'],
    prompt_en: 'How many ayahs are in Surah Al-Fatihah?',
    prompt_so: 'Immisa aayadood ayay leedahay Suuradda Al-Faatihah?',
    choices: [
      { id: 'a', label_en: '5', label_so: '5' },
      { id: 'b', label_en: '7', label_so: '7' },
      { id: 'c', label_en: '10', label_so: '10' },
      { id: 'd', label_en: '14', label_so: '14' },
    ],
    correctChoiceId: 'b',
    surahNumber: 1,
  },
  {
    id: 'cq-10',
    difficulty: 1,
    ageBands: ['child', 'teen', 'adult'],
    prompt_en: 'Which Surah is named “The Elephant”?',
    prompt_so: 'Waa luu Suuradda loogu magac daray “Maroodiga”?',
    choices: [
      { id: 'a', label_en: 'Al-Fil', label_so: 'Al-Fiil' },
      { id: 'b', label_en: 'An-Naml', label_so: 'An-Naml' },
      { id: 'c', label_en: 'Al-Ankabut', label_so: 'Al-Cankabuut' },
      { id: 'd', label_en: 'An-Nahl', label_so: 'An-Nahl' },
    ],
    correctChoiceId: 'a',
    surahNumber: 105,
  },
  {
    id: 'cq-11',
    difficulty: 1,
    ageBands: ['child', 'teen', 'adult'],
    prompt_en: 'Surah Al-Ikhlas teaches…',
    prompt_so: 'Suuradda Al-Ikhlaas waxay baraysaa…',
    choices: [
      { id: 'a', label_en: 'The Oneness of Allah', label_so: 'Tawxiidka / Kali ahaanta Alle' },
      { id: 'b', label_en: 'How to travel', label_so: 'Sida loo safro' },
      { id: 'c', label_en: 'How to farm', label_so: 'Sida loo beero' },
      { id: 'd', label_en: 'Names of cities only', label_so: 'Magacyada magaalooyin oo keliya' },
    ],
    correctChoiceId: 'a',
    surahNumber: 112,
    ayahNumber: 1,
  },
  {
    id: 'cq-12',
    difficulty: 1,
    ageBands: ['child', 'teen', 'adult'],
    prompt_en: 'Which Surah is named “The Cow”?',
    prompt_so: 'Waa luu Suuradda loogu magac daray “Saciga”?',
    choices: [
      { id: 'a', label_en: 'Al-Baqarah', label_so: 'Al-Baqarah' },
      { id: 'b', label_en: 'Al-Fil', label_so: 'Al-Fiil' },
      { id: 'c', label_en: 'An-Naml', label_so: 'An-Naml' },
      { id: 'd', label_en: 'Al-Ma’idah', label_so: 'Al-Maa’idah' },
    ],
    correctChoiceId: 'a',
    surahNumber: 2,
  },

  // ——— Difficulty 2 (Challenge 1–2) ———
  {
    id: 'cq-13',
    difficulty: 2,
    ageBands: ['child', 'teen', 'adult'],
    prompt_en: 'What is the longest Surah in the Qur’an?',
    prompt_so: 'Waa luu Suuradda ugu dheer Quraanka?',
    choices: [
      { id: 'a', label_en: 'Al-Fatihah', label_so: 'Al-Faatihah' },
      { id: 'b', label_en: 'Al-Baqarah', label_so: 'Al-Baqarah' },
      { id: 'c', label_en: 'An-Nas', label_so: 'An-Naas' },
      { id: 'd', label_en: 'Al-Ikhlas', label_so: 'Al-Ikhlaas' },
    ],
    correctChoiceId: 'b',
    surahNumber: 2,
  },
  {
    id: 'cq-14',
    difficulty: 2,
    ageBands: ['child', 'teen', 'adult'],
    prompt_en: 'How many ayahs are in Surah Al-Kawthar?',
    prompt_so: 'Immisa aayadood ayay leedahay Suuradda Al-Kawthar?',
    choices: [
      { id: 'a', label_en: '3', label_so: '3' },
      { id: 'b', label_en: '7', label_so: '7' },
      { id: 'c', label_en: '10', label_so: '10' },
      { id: 'd', label_en: '19', label_so: '19' },
    ],
    correctChoiceId: 'a',
    surahNumber: 108,
  },
  {
    id: 'cq-15',
    difficulty: 2,
    ageBands: ['child', 'teen', 'adult'],
    prompt_en: 'Which Surah contains Ayat al-Kursi?',
    prompt_so: 'Waa luu Suuradda ku jirta Aayadda al-Kursi?',
    choices: [
      { id: 'a', label_en: 'Al-Fatihah', label_so: 'Al-Faatihah' },
      { id: 'b', label_en: 'Al-Baqarah', label_so: 'Al-Baqarah' },
      { id: 'c', label_en: 'Ali ‘Imran', label_so: 'Aal Cimraan' },
      { id: 'd', label_en: 'An-Nisa', label_so: 'An-Nisaa' },
    ],
    correctChoiceId: 'b',
    surahNumber: 2,
    ayahNumber: 255,
  },
  {
    id: 'cq-16',
    difficulty: 2,
    ageBands: ['child', 'teen', 'adult'],
    prompt_en: 'Surah Yusuf tells the story of which Prophet?',
    prompt_so: 'Suuradda Yuusuf waxay ka warramaysaa Nebi kee?',
    choices: [
      { id: 'a', label_en: 'Prophet Nuh ﷺ', label_so: 'Nebi Nuux ﷺ' },
      { id: 'b', label_en: 'Prophet Yusuf ﷺ', label_so: 'Nebi Yuusuf ﷺ' },
      { id: 'c', label_en: 'Prophet Yunus ﷺ', label_so: 'Nebi Yoonis ﷺ' },
      { id: 'd', label_en: 'Prophet Hud ﷺ', label_so: 'Nebi Huud ﷺ' },
    ],
    correctChoiceId: 'b',
    surahNumber: 12,
  },
  {
    id: 'cq-17',
    difficulty: 2,
    ageBands: ['child', 'teen', 'adult'],
    prompt_en: 'Which Surah is named “The Bee”?',
    prompt_so: 'Waa luu Suuradda loogu magac daray “Shinni”?',
    choices: [
      { id: 'a', label_en: 'An-Nahl', label_so: 'An-Nahl' },
      { id: 'b', label_en: 'An-Naml', label_so: 'An-Naml' },
      { id: 'c', label_en: 'Al-Ankabut', label_so: 'Al-Cankabuut' },
      { id: 'd', label_en: 'Al-Fil', label_so: 'Al-Fiil' },
    ],
    correctChoiceId: 'a',
    surahNumber: 16,
  },
  {
    id: 'cq-18',
    difficulty: 2,
    ageBands: ['child', 'teen', 'adult'],
    prompt_en: 'Which Surah is named “The Ant”?',
    prompt_so: 'Waa luu Suuradda loogu magac daray “Qudhaanjada”?',
    choices: [
      { id: 'a', label_en: 'An-Naml', label_so: 'An-Naml' },
      { id: 'b', label_en: 'An-Nahl', label_so: 'An-Nahl' },
      { id: 'c', label_en: 'Al-Baqarah', label_so: 'Al-Baqarah' },
      { id: 'd', label_en: 'Al-Fil', label_so: 'Al-Fiil' },
    ],
    correctChoiceId: 'a',
    surahNumber: 27,
  },
  {
    id: 'cq-19',
    difficulty: 2,
    ageBands: ['child', 'teen', 'adult'],
    prompt_en: 'Which Surah is named “The Spider”?',
    prompt_so: 'Waa luu Suuradda loogu magac daray “Caarada”?',
    choices: [
      { id: 'a', label_en: 'Al-Ankabut', label_so: 'Al-Cankabuut' },
      { id: 'b', label_en: 'An-Nahl', label_so: 'An-Nahl' },
      { id: 'c', label_en: 'An-Naml', label_so: 'An-Naml' },
      { id: 'd', label_en: 'Al-Fil', label_so: 'Al-Fiil' },
    ],
    correctChoiceId: 'a',
    surahNumber: 29,
  },
  {
    id: 'cq-20',
    difficulty: 2,
    ageBands: ['child', 'teen', 'adult'],
    prompt_en: 'Laylat al-Qadr (the Night of Decree) is mentioned in which Surah?',
    prompt_so: 'Laylatul Qadr waxaa lagu xusay Suuraddee?',
    choices: [
      { id: 'a', label_en: 'Al-Qadr', label_so: 'Al-Qadr' },
      { id: 'b', label_en: 'Al-Fil', label_so: 'Al-Fiil' },
      { id: 'c', label_en: 'Al-Ma’un', label_so: 'Al-Maaacuun' },
      { id: 'd', label_en: 'Al-Humazah', label_so: 'Al-Humazah' },
    ],
    correctChoiceId: 'a',
    surahNumber: 97,
  },
  {
    id: 'cq-21',
    difficulty: 2,
    ageBands: ['child', 'teen', 'adult'],
    prompt_en: 'Which Surah is named “Sincerity” / “Purity of Faith”?',
    prompt_so: 'Waa luu Suuradda loogu magac daray “Daaacadnimada / Ikhlaaska iimaanka”?',
    choices: [
      { id: 'a', label_en: 'Al-Ikhlas', label_so: 'Al-Ikhlaas' },
      { id: 'b', label_en: 'Al-Fil', label_so: 'Al-Fiil' },
      { id: 'c', label_en: 'Al-Ma’un', label_so: 'Al-Maaacuun' },
      { id: 'd', label_en: 'Al-‘Asr', label_so: 'Al-Casr' },
    ],
    correctChoiceId: 'a',
    surahNumber: 112,
  },
  {
    id: 'cq-22',
    difficulty: 2,
    ageBands: ['child', 'teen', 'adult'],
    prompt_en: 'How many ayahs are in Surah Al-Ikhlas?',
    prompt_so: 'Immisa aayadood ayay leedahay Suuradda Al-Ikhlaas?',
    choices: [
      { id: 'a', label_en: '3', label_so: '3' },
      { id: 'b', label_en: '4', label_so: '4' },
      { id: 'c', label_en: '5', label_so: '5' },
      { id: 'd', label_en: '7', label_so: '7' },
    ],
    correctChoiceId: 'b',
    surahNumber: 112,
  },
  {
    id: 'cq-23',
    difficulty: 2,
    ageBands: ['teen', 'adult'],
    prompt_en: 'How many ayahs are in Surah Al-Baqarah?',
    prompt_so: 'Immisa aayadood ayay leedahay Suuradda Al-Baqarah?',
    choices: [
      { id: 'a', label_en: '200', label_so: '200' },
      { id: 'b', label_en: '255', label_so: '255' },
      { id: 'c', label_en: '286', label_so: '286' },
      { id: 'd', label_en: '300', label_so: '300' },
    ],
    correctChoiceId: 'c',
    surahNumber: 2,
  },
  {
    id: 'cq-24',
    difficulty: 2,
    ageBands: ['child', 'teen', 'adult'],
    prompt_en: 'Which Surah is named “The Kingdom” / “Dominion”?',
    prompt_so: 'Waa luu Suuradda loogu magac daray “Boqortooyada”?',
    choices: [
      { id: 'a', label_en: 'Al-Mulk', label_so: 'Al-Mulk' },
      { id: 'b', label_en: 'Al-Kahf', label_so: 'Al-Kahf' },
      { id: 'c', label_en: 'An-Nasr', label_so: 'An-Nasr' },
      { id: 'd', label_en: 'Al-‘Asr', label_so: 'Al-Casr' },
    ],
    correctChoiceId: 'a',
    surahNumber: 67,
  },

  // ——— Difficulty 3 (Challenge 2–3) ———
  {
    id: 'cq-25',
    difficulty: 3,
    ageBands: ['teen', 'adult'],
    prompt_en: 'Which Surah does not begin with Bismillah in the mushaf?',
    prompt_so: 'Waa luu Suuradda aan ku bilaabmin Bismillaah ee mushafka?',
    choices: [
      { id: 'a', label_en: 'At-Tawbah', label_so: 'At-Tawbah' },
      { id: 'b', label_en: 'Al-Fatihah', label_so: 'Al-Faatihah' },
      { id: 'c', label_en: 'Ya-Sin', label_so: 'Yaasiin' },
      { id: 'd', label_en: 'Al-Kahf', label_so: 'Al-Kahf' },
    ],
    correctChoiceId: 'a',
    surahNumber: 9,
  },
  {
    id: 'cq-26',
    difficulty: 3,
    ageBands: ['child', 'teen', 'adult'],
    prompt_en: 'The companions of the cave are mentioned in which Surah?',
    prompt_so: 'Asxaabtii godka waxaa lagu xusay Suuraddee?',
    choices: [
      { id: 'a', label_en: 'Al-Kahf', label_so: 'Al-Kahf' },
      { id: 'b', label_en: 'Al-Mulk', label_so: 'Al-Mulk' },
      { id: 'c', label_en: 'An-Naba', label_so: 'An-Naba’' },
      { id: 'd', label_en: 'Al-Waqi‘ah', label_so: 'Al-Waaqicah' },
    ],
    correctChoiceId: 'a',
    surahNumber: 18,
    ayahNumber: 9,
  },
  {
    id: 'cq-27',
    difficulty: 3,
    ageBands: ['child', 'teen', 'adult'],
    prompt_en: 'Surah Maryam mentions the birth and prophethood of which Prophet?',
    prompt_so: 'Suuradda Maryam waxay xusaysaa dhalashada iyo nabiinimada Nebi kee?',
    choices: [
      { id: 'a', label_en: 'Prophet Isa ﷺ', label_so: 'Nebi Ciise ﷺ' },
      { id: 'b', label_en: 'Prophet Musa ﷺ', label_so: 'Nebi Muuse ﷺ' },
      { id: 'c', label_en: 'Prophet Yusuf ﷺ', label_so: 'Nebi Yuusuf ﷺ' },
      { id: 'd', label_en: 'Prophet Yunus ﷺ', label_so: 'Nebi Yoonis ﷺ' },
    ],
    correctChoiceId: 'a',
    surahNumber: 19,
    ayahNumber: 30,
  },
  {
    id: 'cq-28',
    difficulty: 3,
    ageBands: ['teen', 'adult'],
    prompt_en: 'Ayat al-Kursi is which ayah number of Surah Al-Baqarah?',
    prompt_so: 'Aayadda al-Kursi waa aayadda numberkee ee Suuradda Al-Baqarah?',
    choices: [
      { id: 'a', label_en: '2', label_so: '2' },
      { id: 'b', label_en: '255', label_so: '255' },
      { id: 'c', label_en: '114', label_so: '114' },
      { id: 'd', label_en: '286', label_so: '286' },
    ],
    correctChoiceId: 'b',
    surahNumber: 2,
    ayahNumber: 255,
  },
  {
    id: 'cq-29',
    difficulty: 3,
    ageBands: ['teen', 'adult'],
    prompt_en: 'Which Surah begins with “Qaf. By the honored Qur’an”?',
    prompt_so: 'Waa luu Suuradda ku bilaabmaysa “Qaaf. Waxaan ku dhaartay Quraanka sharafta leh”?',
    choices: [
      { id: 'a', label_en: 'Qaf', label_so: 'Qaaf' },
      { id: 'b', label_en: 'Sad', label_so: 'Saad' },
      { id: 'c', label_en: 'Ya-Sin', label_so: 'Yaa-Siin' },
      { id: 'd', label_en: 'Ta-Ha', label_so: 'Taa-Haa' },
    ],
    correctChoiceId: 'a',
    surahNumber: 50,
    ayahNumber: 1,
  },
  {
    id: 'cq-30',
    difficulty: 3,
    ageBands: ['teen', 'adult'],
    prompt_en: 'Surah Al-‘Alaq ayah 1 begins with which command?',
    prompt_so: 'Suuradda Al-Calaq aayadda 1 waxay ku bilaabmaysaa amarkee?',
    choices: [
      { id: 'a', label_en: 'Recite (Iqra’)', label_so: 'Akhri (Iqra’)' },
      { id: 'b', label_en: 'Write', label_so: 'Qor' },
      { id: 'c', label_en: 'Travel', label_so: 'Safar' },
      { id: 'd', label_en: 'Sleep', label_so: 'Seexo' },
    ],
    correctChoiceId: 'a',
    surahNumber: 96,
    ayahNumber: 1,
  },
  {
    id: 'cq-31',
    difficulty: 3,
    ageBands: ['child', 'teen', 'adult'],
    prompt_en: 'According to Surah Al-Qadr, the Night of Decree is better than…',
    prompt_so: 'Sida ku cad Suuradda Al-Qadr, Laylatul Qadr way ka wanaagsan tahay…',
    choices: [
      { id: 'a', label_en: 'A thousand months', label_so: 'Kun bilood' },
      { id: 'b', label_en: 'Ten days', label_so: 'Toban maalmood' },
      { id: 'c', label_en: 'One year', label_so: 'Hal sano' },
      { id: 'd', label_en: 'Seven nights', label_so: 'Toddoba habeen' },
    ],
    correctChoiceId: 'a',
    surahNumber: 97,
    ayahNumber: 3,
  },
  {
    id: 'cq-32',
    difficulty: 3,
    ageBands: ['teen', 'adult'],
    prompt_en: 'Surah An-Nasr opens by mentioning…',
    prompt_so: 'Suuradda An-Nasr waxay ku furmaysaa xusidda…',
    choices: [
      { id: 'a', label_en: 'The victory of Allah and the conquest', label_so: 'Guusha Alle iyo furashada' },
      { id: 'b', label_en: 'The companions of the elephant', label_so: 'Asxaabtii maroodiga' },
      { id: 'c', label_en: 'The people of the cave', label_so: 'Dadkii godka' },
      { id: 'd', label_en: 'The bees', label_so: 'Shinnida' },
    ],
    correctChoiceId: 'a',
    surahNumber: 110,
    ayahNumber: 1,
  },
  {
    id: 'cq-33',
    difficulty: 3,
    ageBands: ['child', 'teen', 'adult'],
    prompt_en: 'Surah Al-Fil asks how the Lord dealt with…',
    prompt_so: 'Suuradda Al-Fiil waxay weydiineysaa sida Rabbi ula dhaqmay…',
    choices: [
      { id: 'a', label_en: 'The companions of the elephant', label_so: 'Asxaabtii maroodiga' },
      { id: 'b', label_en: 'The people of the cave', label_so: 'Dadkii godka' },
      { id: 'c', label_en: 'The bees', label_so: 'Shinnida' },
      { id: 'd', label_en: 'The ants', label_so: 'Qudhaanjada' },
    ],
    correctChoiceId: 'a',
    surahNumber: 105,
    ayahNumber: 1,
  },
  {
    id: 'cq-34',
    difficulty: 3,
    ageBands: ['child', 'teen', 'adult'],
    prompt_en: 'Surah Al-Ikhlas ayah 1 says: “Say, He is Allah…”',
    prompt_so: 'Suuradda Al-Ikhlaas aayadda 1 waxay tidhaahdaa: “Dheh, Isagu waa Alle…”',
    choices: [
      { id: 'a', label_en: 'One (Ahad)', label_so: 'Keliya (Ahad)' },
      { id: 'b', label_en: 'Two', label_so: 'Laba' },
      { id: 'c', label_en: 'Three', label_so: 'Saddex' },
      { id: 'd', label_en: 'Four', label_so: 'Afar' },
    ],
    correctChoiceId: 'a',
    surahNumber: 112,
    ayahNumber: 1,
  },
  {
    id: 'cq-35',
    difficulty: 3,
    ageBands: ['teen', 'adult'],
    prompt_en: 'Juz 30 (the final Juz) begins with which Surah?',
    prompt_so: 'Juz-ka 30-aad (kan ugu dambeeya) wuxuu ku bilaabmaa Suuraddee?',
    choices: [
      { id: 'a', label_en: 'An-Naba', label_so: 'An-Naba’' },
      { id: 'b', label_en: 'Al-Mulk', label_so: 'Al-Mulk' },
      { id: 'c', label_en: 'Ya-Sin', label_so: 'Yaasiin' },
      { id: 'd', label_en: 'Al-Fatihah', label_so: 'Al-Faatihah' },
    ],
    correctChoiceId: 'a',
    surahNumber: 78,
    ayahNumber: 1,
  },
  {
    id: 'cq-36',
    difficulty: 3,
    ageBands: ['teen', 'adult'],
    prompt_en: 'What is the Surah number of Ya-Sin?',
    prompt_so: 'Waa immisa numberka Suuradda Yaasiin?',
    choices: [
      { id: 'a', label_en: '18', label_so: '18' },
      { id: 'b', label_en: '36', label_so: '36' },
      { id: 'c', label_en: '55', label_so: '55' },
      { id: 'd', label_en: '67', label_so: '67' },
    ],
    correctChoiceId: 'b',
    surahNumber: 36,
  },

  // ——— Difficulty 4 (Challenge 3 / hardest) ———
  {
    id: 'cq-37',
    difficulty: 4,
    ageBands: ['teen', 'adult'],
    prompt_en: 'Musa ﷺ and the knowledgeable servant are mentioned in which Surah?',
    prompt_so: 'Muuse ﷺ iyo addoonkii aqoonta lahaa waxaa lagu xusay Suuraddee?',
    choices: [
      { id: 'a', label_en: 'Al-Kahf', label_so: 'Al-Kahf' },
      { id: 'b', label_en: 'Yusuf', label_so: 'Yuusuf' },
      { id: 'c', label_en: 'Maryam', label_so: 'Maryam' },
      { id: 'd', label_en: 'Al-Fil', label_so: 'Al-Fiil' },
    ],
    correctChoiceId: 'a',
    surahNumber: 18,
    ayahNumber: 60,
  },
  {
    id: 'cq-38',
    difficulty: 4,
    ageBands: ['teen', 'adult'],
    prompt_en: 'Which Surah tells believers not to say “Ra‘ina” but to say “Unzurna”?',
    prompt_so: 'Waa luu Suuradda mu’miniinta ku amartay inaan la odhan “Raacinaa” ee la odhan “Unzurnaa”?',
    choices: [
      { id: 'a', label_en: 'Al-Baqarah', label_so: 'Al-Baqarah' },
      { id: 'b', label_en: 'Al-Fil', label_so: 'Al-Fiil' },
      { id: 'c', label_en: 'Al-Kawthar', label_so: 'Al-Kawthar' },
      { id: 'd', label_en: 'An-Nas', label_so: 'An-Naas' },
    ],
    correctChoiceId: 'a',
    surahNumber: 2,
    ayahNumber: 104,
  },
  {
    id: 'cq-39',
    difficulty: 4,
    ageBands: ['teen', 'adult'],
    prompt_en: 'The ayah commanding believers to face al-Masjid al-Haram (the Qiblah) is in which Surah?',
    prompt_so: 'Aayadda amarta mu’miniinta inay u jeestaan Masjidul Xaraam (Qiblada) waxay ku jirtaa Suuraddee?',
    choices: [
      { id: 'a', label_en: 'Al-Baqarah', label_so: 'Al-Baqarah' },
      { id: 'b', label_en: 'Al-Ikhlas', label_so: 'Al-Ikhlaas' },
      { id: 'c', label_en: 'An-Nas', label_so: 'An-Naas' },
      { id: 'd', label_en: 'Al-Kawthar', label_so: 'Al-Kawthar' },
    ],
    correctChoiceId: 'a',
    surahNumber: 2,
    ayahNumber: 144,
  },
  {
    id: 'cq-40',
    difficulty: 4,
    ageBands: ['adult'],
    prompt_en: 'How many ayahs are in Surah At-Tawbah?',
    prompt_so: 'Immisa aayadood ayay leedahay Suuradda At-Tawbah?',
    choices: [
      { id: 'a', label_en: '110', label_so: '110' },
      { id: 'b', label_en: '120', label_so: '120' },
      { id: 'c', label_en: '129', label_so: '129' },
      { id: 'd', label_en: '200', label_so: '200' },
    ],
    correctChoiceId: 'c',
    surahNumber: 9,
  },
  {
    id: 'cq-41',
    difficulty: 4,
    ageBands: ['teen', 'adult'],
    prompt_en: 'What is the Surah number of Al-Kawthar?',
    prompt_so: 'Waa immisa numberka Suuradda Al-Kawthar?',
    choices: [
      { id: 'a', label_en: '100', label_so: '100' },
      { id: 'b', label_en: '108', label_so: '108' },
      { id: 'c', label_en: '112', label_so: '112' },
      { id: 'd', label_en: '114', label_so: '114' },
    ],
    correctChoiceId: 'b',
    surahNumber: 108,
  },
  {
    id: 'cq-42',
    difficulty: 4,
    ageBands: ['teen', 'adult'],
    prompt_en: 'In Surah Al-Kahf ayah 9, Allah mentions the companions of…',
    prompt_so: 'Suuradda Al-Kahf aayadda 9, Alle wuxuu xusayaa asxaabtii…',
    choices: [
      { id: 'a', label_en: 'The cave', label_so: 'Godka' },
      { id: 'b', label_en: 'The elephant', label_so: 'Maroodiga' },
      { id: 'c', label_en: 'The bee', label_so: 'Shinnida' },
      { id: 'd', label_en: 'The ant', label_so: 'Qudhaanjada' },
    ],
    correctChoiceId: 'a',
    surahNumber: 18,
    ayahNumber: 9,
  },
  {
    id: 'cq-43',
    difficulty: 4,
    ageBands: ['teen', 'adult'],
    prompt_en: 'Surah Al-‘Asr ayah 1 begins with…',
    prompt_so: 'Suuradda Al-Casr aayadda 1 waxay ku bilaabmaysaa…',
    choices: [
      { id: 'a', label_en: 'By time', label_so: 'Waqtiga' },
      { id: 'b', label_en: 'By the dawn', label_so: 'Waagga' },
      { id: 'c', label_en: 'By the sun', label_so: 'Qorraxda' },
      { id: 'd', label_en: 'By the night', label_so: 'Habeenka' },
    ],
    correctChoiceId: 'a',
    surahNumber: 103,
    ayahNumber: 1,
  },
  {
    id: 'cq-44',
    difficulty: 4,
    ageBands: ['adult'],
    prompt_en: 'How many ayahs are in Surah An-Nas?',
    prompt_so: 'Immisa aayadood ayay leedahay Suuradda An-Naas?',
    choices: [
      { id: 'a', label_en: '4', label_so: '4' },
      { id: 'b', label_en: '5', label_so: '5' },
      { id: 'c', label_en: '6', label_so: '6' },
      { id: 'd', label_en: '7', label_so: '7' },
    ],
    correctChoiceId: 'c',
    surahNumber: 114,
  },
  {
    id: 'cq-45',
    difficulty: 4,
    ageBands: ['adult'],
    prompt_en: 'The repeated ayah “So which of the favors of your Lord would you deny?” is in which Surah?',
    prompt_so: 'Aayadda soo noqnoqota “Dee nicmooyinka Rabbihee midkee baad beeninaysaan?” waxay ku jirtaa Suuraddee?',
    choices: [
      { id: 'a', label_en: 'Ar-Rahman', label_so: 'Ar-Raxmaan' },
      { id: 'b', label_en: 'Al-Waqi‘ah', label_so: 'Al-Waaqicah' },
      { id: 'c', label_en: 'Al-Mulk', label_so: 'Al-Mulk' },
      { id: 'd', label_en: 'Ya-Sin', label_so: 'Yaasiin' },
    ],
    correctChoiceId: 'a',
    surahNumber: 55,
    ayahNumber: 13,
  },
  {
    id: 'cq-46',
    difficulty: 4,
    ageBands: ['teen', 'adult'],
    prompt_en: 'In Surah Yusuf, Yusuf ﷺ tells his father he saw in a dream…',
    prompt_so: 'Suuradda Yuusuf, Yuusuf ﷺ wuxuu aabbihiis u sheegay inuu riyo ku arkay…',
    choices: [
      { id: 'a', label_en: 'Eleven stars, the sun, and the moon', label_so: 'Kow iyo toban xiddigood, qorraxda, iyo dayaxa' },
      { id: 'b', label_en: 'A green bird only', label_so: 'Shimbir cagaaran oo keliya' },
      { id: 'c', label_en: 'Seven mountains', label_so: 'Toddoba buurood' },
      { id: 'd', label_en: 'A closed door', label_so: 'Albaab xidhan' },
    ],
    correctChoiceId: 'a',
    surahNumber: 12,
    ayahNumber: 4,
  },
  {
    id: 'cq-47',
    difficulty: 4,
    ageBands: ['teen', 'adult'],
    prompt_en: 'How many ayahs are in Surah Al-Fil?',
    prompt_so: 'Immisa aayadood ayay leedahay Suuradda Al-Fiil?',
    choices: [
      { id: 'a', label_en: '3', label_so: '3' },
      { id: 'b', label_en: '4', label_so: '4' },
      { id: 'c', label_en: '5', label_so: '5' },
      { id: 'd', label_en: '7', label_so: '7' },
    ],
    correctChoiceId: 'c',
    surahNumber: 105,
  },
  {
    id: 'cq-48',
    difficulty: 4,
    ageBands: ['adult'],
    prompt_en: 'Surah Al-Mulk ayah 1 says dominion is in whose hand?',
    prompt_so: 'Suuradda Al-Mulk aayadda 1 waxay tidhaahdaa boqortooyadu gacantee bay ku jirtaa?',
    choices: [
      { id: 'a', label_en: 'He (Allah) in whose hand is dominion', label_so: 'Isaga (Alle) oo gacantiisa boqortooyadu ku jirto' },
      { id: 'b', label_en: 'A king of Egypt', label_so: 'Boqor Masar ah' },
      { id: 'c', label_en: 'A merchant', label_so: 'Ganacsade' },
      { id: 'd', label_en: 'A soldier', label_so: 'Askari' },
    ],
    correctChoiceId: 'a',
    surahNumber: 67,
    ayahNumber: 1,
  },
  {
    id: 'cq-49',
    difficulty: 4,
    ageBands: ['teen', 'adult'],
    prompt_en: 'What is the Surah number of Al-Fatihah?',
    prompt_so: 'Waa immisa numberka Suuradda Al-Faatihah?',
    choices: [
      { id: 'a', label_en: '1', label_so: '1' },
      { id: 'b', label_en: '2', label_so: '2' },
      { id: 'c', label_en: '9', label_so: '9' },
      { id: 'd', label_en: '114', label_so: '114' },
    ],
    correctChoiceId: 'a',
    surahNumber: 1,
  },
  {
    id: 'cq-50',
    difficulty: 4,
    ageBands: ['adult'],
    prompt_en: 'What is the last ayah number of Surah Al-Baqarah?',
    prompt_so: 'Waa immisa numberka aayadda ugu dambaysa ee Suuradda Al-Baqarah?',
    choices: [
      { id: 'a', label_en: '255', label_so: '255' },
      { id: 'b', label_en: '280', label_so: '280' },
      { id: 'c', label_en: '286', label_so: '286' },
      { id: 'd', label_en: '300', label_so: '300' },
    ],
    correctChoiceId: 'c',
    surahNumber: 2,
    ayahNumber: 286,
  },
  {
    id: 'cq-51',
    difficulty: 4,
    ageBands: ['teen', 'adult'],
    prompt_en: 'Surah Al-Kafirun ayah 1 begins with…',
    prompt_so: 'Suuradda Al-Kaafiruun aayadda 1 waxay ku bilaabmaysaa…',
    choices: [
      { id: 'a', label_en: 'Say, “O disbelievers,”', label_so: 'Dheh, “Markaasiyayaalow,”' },
      { id: 'b', label_en: 'By the fig', label_so: 'Berde' },
      { id: 'c', label_en: 'By the morning brightness', label_so: 'Waagga subaxda' },
      { id: 'd', label_en: 'When the earth is shaken', label_so: 'Marka dhulka la gariiriyo' },
    ],
    correctChoiceId: 'a',
    surahNumber: 109,
    ayahNumber: 1,
  },
  {
    id: 'cq-52',
    difficulty: 4,
    ageBands: ['adult'],
    prompt_en: 'How many ayahs are in Surah Al-‘Alaq?',
    prompt_so: 'Immisa aayadood ayay leedahay Suuradda Al-Calaq?',
    choices: [
      { id: 'a', label_en: '5', label_so: '5' },
      { id: 'b', label_en: '10', label_so: '10' },
      { id: 'c', label_en: '19', label_so: '19' },
      { id: 'd', label_en: '30', label_so: '30' },
    ],
    correctChoiceId: 'c',
    surahNumber: 96,
  },
];

export const QUESTION_COUNT_BY_TIER: Record<1 | 2 | 3, number> = {
  1: 5,
  2: 5,
  3: 5,
};

export const QUESTION_SECONDS = 60;
export const REVEAL_SECONDS = 4;
export const MAX_PARTICIPANTS_V1 = 5;
export const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function difficultyRange(
  tier: 1 | 2 | 3,
  ageBand: CompetitionAgeBand,
): { min: number; max: number } {
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

export function choiceCountForAge(ageBand: CompetitionAgeBand): number {
  if (ageBand === 'child') return 3;
  return 4;
}

export function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = next[i];
    next[i] = next[j]!;
    next[j] = temp!;
  }
  return next;
}

export type PublicQuestion = {
  id: string;
  prompt_en: string;
  prompt_so: string;
  choices: Array<{ id: string; label_en: string; label_so: string }>;
};

export function pickChallengeQuestions(
  tier: 1 | 2 | 3,
  ageBand: CompetitionAgeBand,
  excludeIds: string[] = [],
): { questions: PublicQuestion[]; answerKey: Record<string, string> } {
  const count = QUESTION_COUNT_BY_TIER[tier];
  const range = difficultyRange(tier, ageBand);
  const wantedChoices = choiceCountForAge(ageBand);
  const exclude = new Set(excludeIds);

  const pool = COMPETITION_QUESTIONS.filter(
    (question) =>
      question.ageBands.includes(ageBand) &&
      question.difficulty >= range.min &&
      question.difficulty <= range.max &&
      !exclude.has(question.id),
  );

  const fallback = COMPETITION_QUESTIONS.filter(
    (question) =>
      question.ageBands.includes(ageBand) &&
      question.difficulty <= range.max &&
      !exclude.has(question.id),
  );

  const source = pool.length >= count ? pool : fallback.length >= count ? fallback : COMPETITION_QUESTIONS;
  const selected = shuffle(source).slice(0, Math.min(count, source.length));

  const questions: PublicQuestion[] = [];
  const answerKey: Record<string, string> = {};

  for (const question of selected) {
    const correct = question.choices.find((choice) => choice.id === question.correctChoiceId);
    const distractors = shuffle(
      question.choices.filter((choice) => choice.id !== question.correctChoiceId),
    );
    const kept = shuffle([
      correct,
      ...distractors.slice(0, Math.max(0, wantedChoices - 1)),
    ].filter((choice): choice is NonNullable<typeof choice> => Boolean(choice)));

    questions.push({
      id: question.id,
      prompt_en: question.prompt_en,
      prompt_so: question.prompt_so,
      choices: kept.map((choice) => ({
        id: choice.id,
        label_en: choice.label_en,
        label_so: choice.label_so,
      })),
    });
    answerKey[question.id] = question.correctChoiceId;
  }

  return { questions, answerKey };
}
