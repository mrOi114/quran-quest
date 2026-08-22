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
};

/** Qur’an knowledge only. Both languages are stored so each player can localize the same item. */
export const COMPETITION_QUESTIONS: CompetitionQuestion[] = [
  {
    id: 'cq-1',
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
    id: 'cq-2',
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
    id: 'cq-3',
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
  },
  {
    id: 'cq-4',
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
    id: 'cq-5',
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
    id: 'cq-6',
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
    id: 'cq-7',
    difficulty: 1,
    ageBands: ['child', 'teen', 'adult'],
    prompt_en: 'Which Surah do Muslims recite in every prayer unit (rak‘ah)?',
    prompt_so: 'Waa luu Suuradda muslimiintu ku akhriyaan rikci kasta?',
    choices: [
      { id: 'a', label_en: 'Al-Fatihah', label_so: 'Al-Faatihah' },
      { id: 'b', label_en: 'Al-Fil', label_so: 'Al-Fiil' },
      { id: 'c', label_en: 'An-Nasr', label_so: 'An-Nasr' },
      { id: 'd', label_en: 'Al-Asr', label_so: 'Al-Casr' },
    ],
    correctChoiceId: 'a',
  },
  {
    id: 'cq-8',
    difficulty: 2,
    ageBands: ['child', 'teen', 'adult'],
    prompt_en: 'Which Surah contains Ayat al-Kursi?',
    prompt_so: 'Waa luu Suuradda ku jirta Aayadda al-Kursi?',
    choices: [
      { id: 'a', label_en: 'Al-Fatihah', label_so: 'Al-Faatihah' },
      { id: 'b', label_en: 'Al-Baqarah', label_so: 'Al-Baqarah' },
      { id: 'c', label_en: 'Aal Imran', label_so: 'Aal Cimraan' },
      { id: 'd', label_en: 'An-Nisa', label_so: 'An-Nisaa' },
    ],
    correctChoiceId: 'b',
  },
  {
    id: 'cq-9',
    difficulty: 2,
    ageBands: ['child', 'teen', 'adult'],
    prompt_en: 'What is the shortest Surah in the Qur’an?',
    prompt_so: 'Waa luu Suuradda ugu gaaban Quraanka?',
    choices: [
      { id: 'a', label_en: 'Al-Kawthar', label_so: 'Al-Kawthar' },
      { id: 'b', label_en: 'Al-Baqarah', label_so: 'Al-Baqarah' },
      { id: 'c', label_en: 'Yasin', label_so: 'Yaasiin' },
      { id: 'd', label_en: 'Al-Mulk', label_so: 'Al-Mulk' },
    ],
    correctChoiceId: 'a',
  },
  {
    id: 'cq-10',
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
  },
  {
    id: 'cq-11',
    difficulty: 2,
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
  },
  {
    id: 'cq-12',
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
  },
  {
    id: 'cq-13',
    difficulty: 2,
    ageBands: ['child', 'teen', 'adult'],
    prompt_en: 'Which two short Surahs are often recited for protection?',
    prompt_so: 'Labada Suurah ee gaaban ee badanaa loo akhriyo ilaalin ahaan waa?',
    choices: [
      { id: 'a', label_en: 'Al-Falaq and An-Nas', label_so: 'Al-Falaq iyo An-Naas' },
      { id: 'b', label_en: 'Al-Fil and Al-Asr', label_so: 'Al-Fiil iyo Al-Casr' },
      { id: 'c', label_en: 'Al-Kawthar and An-Nasr', label_so: 'Al-Kawthar iyo An-Nasr' },
      { id: 'd', label_en: 'Abasa and At-Takathur', label_so: 'Cabasa iyo At-Takaathur' },
    ],
    correctChoiceId: 'a',
  },
  {
    id: 'cq-14',
    difficulty: 2,
    ageBands: ['child', 'teen', 'adult'],
    prompt_en: 'Laylat al-Qadr is mentioned in which Surah?',
    prompt_so: 'Laylatul Qadr waxaa lagu xusay Suuraddee?',
    choices: [
      { id: 'a', label_en: 'Al-Qadr', label_so: 'Al-Qadr' },
      { id: 'b', label_en: 'Al-Fil', label_so: 'Al-Fiil' },
      { id: 'c', label_en: 'Al-Maun', label_so: 'Al-Maaacuun' },
      { id: 'd', label_en: 'Al-Humazah', label_so: 'Al-Humazah' },
    ],
    correctChoiceId: 'a',
  },
  {
    id: 'cq-15',
    difficulty: 2,
    ageBands: ['teen', 'adult'],
    prompt_en: 'The first revealed words of the Qur’an begin with…',
    prompt_so: 'Erayadii ugu horreeyey ee Quraanka soo degay waxay ku bilaabmaan…',
    choices: [
      { id: 'a', label_en: 'Iqra’ (Read)', label_so: 'Iqra’ (Akhri)' },
      { id: 'b', label_en: 'Sami‘a (He heard)', label_so: 'Sami‘a (Wuu maqlay)' },
      { id: 'c', label_en: 'Kataba (He wrote)', label_so: 'Kataba (Wuu qoray)' },
      { id: 'd', label_en: 'Dhahaba (He went)', label_so: 'Dhahaba (Wuu tegey)' },
    ],
    correctChoiceId: 'a',
  },
  {
    id: 'cq-16',
    difficulty: 2,
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
  },
  {
    id: 'cq-17',
    difficulty: 3,
    ageBands: ['child', 'teen', 'adult'],
    prompt_en: 'How many verses are in Surah Al-Fatihah?',
    prompt_so: 'Immisa aayadood ayay leedahay Suuradda Al-Faatihah?',
    choices: [
      { id: 'a', label_en: '5', label_so: '5' },
      { id: 'b', label_en: '7', label_so: '7' },
      { id: 'c', label_en: '10', label_so: '10' },
      { id: 'd', label_en: '14', label_so: '14' },
    ],
    correctChoiceId: 'b',
  },
  {
    id: 'cq-18',
    difficulty: 3,
    ageBands: ['teen', 'adult'],
    prompt_en: 'Which Surah does not begin with Bismillah?',
    prompt_so: 'Waa luu Suuradda aan ku bilaabmin Bismillaah?',
    choices: [
      { id: 'a', label_en: 'At-Tawbah', label_so: 'At-Tawbah' },
      { id: 'b', label_en: 'Al-Fatihah', label_so: 'Al-Faatihah' },
      { id: 'c', label_en: 'Yasin', label_so: 'Yaasiin' },
      { id: 'd', label_en: 'Al-Kahf', label_so: 'Al-Kahf' },
    ],
    correctChoiceId: 'a',
  },
  {
    id: 'cq-19',
    difficulty: 3,
    ageBands: ['teen', 'adult'],
    prompt_en: 'The first revelation took place in…',
    prompt_so: 'Waxyigii ugu horreeyey wuxuu ka dhacay…',
    choices: [
      { id: 'a', label_en: 'The Cave of Hira', label_so: 'Godka Xiraa' },
      { id: 'b', label_en: 'The Ka‘bah door', label_so: 'Albaabka Kacbada' },
      { id: 'c', label_en: 'Mount Uhud', label_so: 'Buurta Uhud' },
      { id: 'd', label_en: 'The well of Zamzam', label_so: 'Ceelka Zamzam' },
    ],
    correctChoiceId: 'a',
  },
  {
    id: 'cq-20',
    difficulty: 3,
    ageBands: ['child', 'teen', 'adult'],
    prompt_en: 'Which Surah is named after a woman mentioned in the Qur’an?',
    prompt_so: 'Waa luu Suuradda loogu magac daray naag Quraanka ku xusan?',
    choices: [
      { id: 'a', label_en: 'Maryam', label_so: 'Maryam' },
      { id: 'b', label_en: 'Al-Fil', label_so: 'Al-Fiil' },
      { id: 'c', label_en: 'Al-Asr', label_so: 'Al-Casr' },
      { id: 'd', label_en: 'Al-Kafirun', label_so: 'Al-Kaafiruun' },
    ],
    correctChoiceId: 'a',
  },
  {
    id: 'cq-21',
    difficulty: 3,
    ageBands: ['teen', 'adult'],
    prompt_en: 'The People of the Cave are mentioned in which Surah?',
    prompt_so: 'Dadkii Godka waxaa lagu xusay Suuraddee?',
    choices: [
      { id: 'a', label_en: 'Al-Kahf', label_so: 'Al-Kahf' },
      { id: 'b', label_en: 'Al-Mulk', label_so: 'Al-Mulk' },
      { id: 'c', label_en: 'An-Naba', label_so: 'An-Naba’' },
      { id: 'd', label_en: 'Al-Waqi‘ah', label_so: 'Al-Waaqicah' },
    ],
    correctChoiceId: 'a',
  },
  {
    id: 'cq-22',
    difficulty: 3,
    ageBands: ['teen', 'adult'],
    prompt_en: 'Surah Yasin is often called…',
    prompt_so: 'Suuradda Yaasiin badanaa waxaa loogu yeeraa…',
    choices: [
      { id: 'a', label_en: 'The heart of the Qur’an', label_so: 'Wadnaha Quraanka' },
      { id: 'b', label_en: 'The shortest Surah', label_so: 'Suuradda ugu gaaban' },
      { id: 'c', label_en: 'The last Surah', label_so: 'Suuradda ugu dambaysa' },
      { id: 'd', label_en: 'The first Juz', label_so: 'Juz-ka ugu horreeya' },
    ],
    correctChoiceId: 'a',
  },
  {
    id: 'cq-23',
    difficulty: 3,
    ageBands: ['teen', 'adult'],
    prompt_en: 'Which Surah is named “The Bee”?',
    prompt_so: 'Waa luu Suuradda loogu magac daray “Shinni”?',
    choices: [
      { id: 'a', label_en: 'An-Nahl', label_so: 'An-Nahl' },
      { id: 'b', label_en: 'An-Naml', label_so: 'An-Naml' },
      { id: 'c', label_en: 'Al-Ankabut', label_so: 'Al-Cankabuut' },
      { id: 'd', label_en: 'Al-Fil', label_so: 'Al-Fiil' },
    ],
    correctChoiceId: 'a',
  },
  {
    id: 'cq-24',
    difficulty: 3,
    ageBands: ['teen', 'adult'],
    prompt_en: 'Which Surah is named “The Ant”?',
    prompt_so: 'Waa luu Suuradda loogu magac daray “Qudhaanjada”?',
    choices: [
      { id: 'a', label_en: 'An-Naml', label_so: 'An-Naml' },
      { id: 'b', label_en: 'An-Nahl', label_so: 'An-Nahl' },
      { id: 'c', label_en: 'Al-Baqarah', label_so: 'Al-Baqarah' },
      { id: 'd', label_en: 'Al-Fil', label_so: 'Al-Fiil' },
    ],
    correctChoiceId: 'a',
  },
  {
    id: 'cq-25',
    difficulty: 3,
    ageBands: ['child', 'teen', 'adult'],
    prompt_en: 'The last Juz of the Qur’an is commonly called…',
    prompt_so: 'Juz-ka ugu dambeeya ee Quraanka waxaa badanaa loogu yeeraa…',
    choices: [
      { id: 'a', label_en: 'Juz Amma', label_so: 'Juz Amma' },
      { id: 'b', label_en: 'Juz Tabarak', label_so: 'Juz Tabaarak' },
      { id: 'c', label_en: 'Juz Qad Sami‘a', label_so: 'Juz Qad Sami‘a' },
      { id: 'd', label_en: 'Juz Alif Lam Mim', label_so: 'Juz Alif Laam Miim' },
    ],
    correctChoiceId: 'a',
  },
  {
    id: 'cq-26',
    difficulty: 3,
    ageBands: ['teen', 'adult'],
    prompt_en: 'Which Surah is named “The Spider”?',
    prompt_so: 'Waa luu Suuradda loogu magac daray “Caarada”?',
    choices: [
      { id: 'a', label_en: 'Al-Ankabut', label_so: 'Al-Cankabuut' },
      { id: 'b', label_en: 'An-Nahl', label_so: 'An-Nahl' },
      { id: 'c', label_en: 'An-Naml', label_so: 'An-Naml' },
      { id: 'd', label_en: 'Al-Fil', label_so: 'Al-Fiil' },
    ],
    correctChoiceId: 'a',
  },
  {
    id: 'cq-27',
    difficulty: 4,
    ageBands: ['teen', 'adult'],
    prompt_en: 'Musa ﷺ and the righteous servant are mentioned in which Surah?',
    prompt_so: 'Muuse ﷺ iyo addoonkii suubban waxaa lagu xusay Suuraddee?',
    choices: [
      { id: 'a', label_en: 'Al-Kahf', label_so: 'Al-Kahf' },
      { id: 'b', label_en: 'Yusuf', label_so: 'Yuusuf' },
      { id: 'c', label_en: 'Maryam', label_so: 'Maryam' },
      { id: 'd', label_en: 'Al-Fil', label_so: 'Al-Fiil' },
    ],
    correctChoiceId: 'a',
  },
  {
    id: 'cq-28',
    difficulty: 4,
    ageBands: ['adult'],
    prompt_en: 'Which Prophet is mentioned most often in the Qur’an?',
    prompt_so: 'Nebi kee ayaa Quraanka ugu badan lagu xusay?',
    choices: [
      { id: 'a', label_en: 'Prophet Musa ﷺ', label_so: 'Nebi Muuse ﷺ' },
      { id: 'b', label_en: 'Prophet Isa ﷺ', label_so: 'Nebi Ciise ﷺ' },
      { id: 'c', label_en: 'Prophet Ibrahim ﷺ', label_so: 'Nebi Ibraahim ﷺ' },
      { id: 'd', label_en: 'Prophet Nuh ﷺ', label_so: 'Nebi Nuux ﷺ' },
    ],
    correctChoiceId: 'a',
  },
  {
    id: 'cq-29',
    difficulty: 4,
    ageBands: ['teen', 'adult'],
    prompt_en: 'Surah Al-Alaq is best known because it…',
    prompt_so: 'Suuradda Al-Calaq waxaa ugu caansan inay…',
    choices: [
      { id: 'a', label_en: 'Contains the first revealed verses', label_so: 'Ku jiraan aayadihii ugu horreeyey ee soo degay' },
      { id: 'b', label_en: 'Is the longest Surah', label_so: 'Tahay Suuradda ugu dheer' },
      { id: 'c', label_en: 'Has no verses', label_so: 'Aan lahayn aayado' },
      { id: 'd', label_en: 'Is only recited at Hajj', label_so: 'Kaliya Hajka lagu akhriyo' },
    ],
    correctChoiceId: 'a',
  },
  {
    id: 'cq-30',
    difficulty: 4,
    ageBands: ['adult'],
    prompt_en: 'Which Surah begins with “Qaf. By the Glorious Qur’an.”?',
    prompt_so: 'Waa luu Suuradda ku bilaabmaysa “Qaaf. Waxaan ku dhaartay Quraanka sharafta leh.”?',
    choices: [
      { id: 'a', label_en: 'Qaf', label_so: 'Qaaf' },
      { id: 'b', label_en: 'Sad', label_so: 'Saad' },
      { id: 'c', label_en: 'Ya-Sin', label_so: 'Yaa-Siin' },
      { id: 'd', label_en: 'Ta-Ha', label_so: 'Taa-Haa' },
    ],
    correctChoiceId: 'a',
  },
  {
    id: 'cq-31',
    difficulty: 4,
    ageBands: ['teen', 'adult'],
    prompt_en: 'Surah An-Nasr is mainly about…',
    prompt_so: 'Suuradda An-Nasr inta badan waxay ka warramaysaa…',
    choices: [
      { id: 'a', label_en: 'The help of Allah and victory', label_so: 'Gargaarka Alle iyo guusha' },
      { id: 'b', label_en: 'The story of the elephant', label_so: 'Sheekada maroodiga' },
      { id: 'c', label_en: 'The people of the cave', label_so: 'Dadkii godka' },
      { id: 'd', label_en: 'The bees', label_so: 'Shinnida' },
    ],
    correctChoiceId: 'a',
  },
  {
    id: 'cq-32',
    difficulty: 4,
    ageBands: ['adult'],
    prompt_en: 'Ayat al-Kursi is verse number ___ of Surah Al-Baqarah.',
    prompt_so: 'Aayadda al-Kursi waa aayadda ___ ee Suuradda Al-Baqarah.',
    choices: [
      { id: 'a', label_en: '2', label_so: '2' },
      { id: 'b', label_en: '255', label_so: '255' },
      { id: 'c', label_en: '114', label_so: '114' },
      { id: 'd', label_en: '1', label_so: '1' },
    ],
    correctChoiceId: 'b',
  },
  {
    id: 'cq-33',
    difficulty: 2,
    ageBands: ['child', 'teen', 'adult'],
    prompt_en: 'Which Surah is named “The Cow”?',
    prompt_so: 'Waa luu Suuradda loogu magac daray “Saciga”?',
    choices: [
      { id: 'a', label_en: 'Al-Baqarah', label_so: 'Al-Baqarah' },
      { id: 'b', label_en: 'Al-Fil', label_so: 'Al-Fiil' },
      { id: 'c', label_en: 'An-Naml', label_so: 'An-Naml' },
      { id: 'd', label_en: 'Al-Maidah', label_so: 'Al-Maa’idah' },
    ],
    correctChoiceId: 'a',
  },
  {
    id: 'cq-34',
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
  },
  {
    id: 'cq-35',
    difficulty: 3,
    ageBands: ['teen', 'adult'],
    prompt_en: 'Which Surah is named “The Kingdom”?',
    prompt_so: 'Waa luu Suuradda loogu magac daray “Boqortooyada”?',
    choices: [
      { id: 'a', label_en: 'Al-Mulk', label_so: 'Al-Mulk' },
      { id: 'b', label_en: 'Al-Kahf', label_so: 'Al-Kahf' },
      { id: 'c', label_en: 'An-Nasr', label_so: 'An-Nasr' },
      { id: 'd', label_en: 'Al-Asr', label_so: 'Al-Casr' },
    ],
    correctChoiceId: 'a',
  },
  {
    id: 'cq-36',
    difficulty: 4,
    ageBands: ['adult'],
    prompt_en: 'Surah Maryam mentions the birth of which Prophet?',
    prompt_so: 'Suuradda Maryam waxay xusaysaa dhalashada Nebi kee?',
    choices: [
      { id: 'a', label_en: 'Prophet Isa ﷺ', label_so: 'Nebi Ciise ﷺ' },
      { id: 'b', label_en: 'Prophet Musa ﷺ', label_so: 'Nebi Muuse ﷺ' },
      { id: 'c', label_en: 'Prophet Yusuf ﷺ', label_so: 'Nebi Yuusuf ﷺ' },
      { id: 'd', label_en: 'Prophet Yunus ﷺ', label_so: 'Nebi Yoonis ﷺ' },
    ],
    correctChoiceId: 'a',
  },
  {
    id: 'cq-37',
    difficulty: 2,
    ageBands: ['child', 'teen', 'adult'],
    prompt_en: 'Muslims face which direction when they pray, as taught with the Qur’an?',
    prompt_so: 'Muslimiintu jihadee bay u jeestaan marka ay tukadaan, sida Quraanku tilmaamay?',
    choices: [
      { id: 'a', label_en: 'The Qiblah (toward the Ka‘bah)', label_so: 'Qiblada (xagga Kacbada)' },
      { id: 'b', label_en: 'Any random door', label_so: 'Albaab kasta oo aan loo jeedin' },
      { id: 'c', label_en: 'The nearest mountain only', label_so: 'Buurta ugu dhow oo keliya' },
      { id: 'd', label_en: 'The sunrise always', label_so: 'Had iyo jeer qorrax ka soo baxa' },
    ],
    correctChoiceId: 'a',
  },
  {
    id: 'cq-38',
    difficulty: 4,
    ageBands: ['adult'],
    prompt_en: 'Which Surah contains the verse of the throne (Ayat al-Kursi)?',
    prompt_so: 'Waa luu Suuradda ku jirta aayadda carshiga (Aayadda al-Kursi)?',
    choices: [
      { id: 'a', label_en: 'Al-Baqarah', label_so: 'Al-Baqarah' },
      { id: 'b', label_en: 'Al-Ikhlas', label_so: 'Al-Ikhlaas' },
      { id: 'c', label_en: 'An-Nas', label_so: 'An-Naas' },
      { id: 'd', label_en: 'Al-Kawthar', label_so: 'Al-Kawthar' },
    ],
    correctChoiceId: 'a',
  },
  {
    id: 'cq-39',
    difficulty: 3,
    ageBands: ['child', 'teen', 'adult'],
    prompt_en: 'Surah Al-Kawthar is best known as…',
    prompt_so: 'Suuradda Al-Kawthar waxaa ugu caansan inay tahay…',
    choices: [
      { id: 'a', label_en: 'The shortest Surah', label_so: 'Suuradda ugu gaaban' },
      { id: 'b', label_en: 'The longest Surah', label_so: 'Suuradda ugu dheer' },
      { id: 'c', label_en: 'The first Juz', label_so: 'Juz-ka ugu horreeya' },
      { id: 'd', label_en: 'A Surah with 255 verses', label_so: 'Suurah leh 255 aayadood' },
    ],
    correctChoiceId: 'a',
  },
  {
    id: 'cq-40',
    difficulty: 4,
    ageBands: ['teen', 'adult'],
    prompt_en: 'Which Surah tells Muslims not to say “Ra‘ina” and to say “Unzurna” instead?',
    prompt_so: 'Waa luu Suuradda muslimiinta ku amartay inaan la odhan “Raacinaa” ee la odhan “Unzurnaa”?',
    choices: [
      { id: 'a', label_en: 'Al-Baqarah', label_so: 'Al-Baqarah' },
      { id: 'b', label_en: 'Al-Fil', label_so: 'Al-Fiil' },
      { id: 'c', label_en: 'Al-Kawthar', label_so: 'Al-Kawthar' },
      { id: 'd', label_en: 'An-Nas', label_so: 'An-Naas' },
    ],
    correctChoiceId: 'a',
  },
  {
    id: 'cq-41',
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
    id: 'cq-42',
    difficulty: 2,
    ageBands: ['child', 'teen', 'adult'],
    prompt_en: 'Which Surah is named “Sincerity” / “Purity of Faith”?',
    prompt_so: 'Waa luu Suuradda loogu magac daray “Daaacadnimada / Ikhlaaska iimaanka”?',
    choices: [
      { id: 'a', label_en: 'Al-Ikhlas', label_so: 'Al-Ikhlaas' },
      { id: 'b', label_en: 'Al-Fil', label_so: 'Al-Fiil' },
      { id: 'c', label_en: 'Al-Maun', label_so: 'Al-Maaacuun' },
      { id: 'd', label_en: 'Al-Asr', label_so: 'Al-Casr' },
    ],
    correctChoiceId: 'a',
  },
];

export const QUESTION_COUNT_BY_TIER: Record<1 | 2 | 3, number> = {
  1: 5,
  2: 5,
  3: 3,
};

export const QUESTION_SECONDS = 15;
export const REVEAL_SECONDS = 4;
export const MAX_PARTICIPANTS_V1 = 2;
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
