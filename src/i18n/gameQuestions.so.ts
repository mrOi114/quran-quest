type GameQuestionOverlay = {
  prompt: string;
  clue?: string;
  explanation: string;
  hint?: string;
  answerLabel?: string;
  choices?: Record<string, string>;
  orderItems?: Record<string, string>;
};

/** Child-friendly Somali overlays. Islamic proper nouns stay in established form. */
export const GAME_QUESTION_SO: Record<string, GameQuestionOverlay> = {
  'wudu-mc-1': {
    prompt: 'Maxay Muslimiinta sameeyaan ka hor Salaadda si ay u nadiifaan?',
    choices: { a: 'Wuduu', b: 'Hurdo', c: 'Orod' },
    explanation: 'Wuduu waa maydhashada qaybo ka mid ah jidhka ka hor salaadda.',
    hint: 'Waa maydhas gaar ah oo ka horreeya salaadda.',
  },
  'wudu-mc-2': {
    prompt: 'Kee baa ka mid ah samaynta wuduu?',
    choices: { a: 'Maydhashada wejiga', b: 'Daawashada TV-ga', c: 'Cunista nacnaca' },
    explanation: 'Maydhashada wejigu waa qayb muhiim ah oo wuduu ka mid ah.',
    hint: 'Ka fikir maydhashada loo sameeyo salaadda.',
  },
  'wudu-mc-3': {
    prompt: 'Wuduuga waxaan kaloo maydhannaa…',
    choices: { a: 'Gacmaha ilaa xusullada', b: 'Timo keliya', c: 'Kabo' },
    explanation: 'Muslimiintu waxay maydhaan gacmaha ilaa xusullada marka ay wuduu sameeyaan.',
    hint: 'Laga bilaabo gacmaha ilaa xusullada.',
  },
  'wudu-mc-4': {
    prompt: 'Maxaan ku masaxnaa wuduuga?',
    choices: { a: 'Madaxa', b: 'Dhabarka', c: 'Jilibyada keliya' },
    explanation: 'Masaxidda madaxa (masax) waa qayb ka mid ah wuduu.',
    hint: 'Waxaa lagu sameeyaa gacmo qoyan oo madaxa lagu mariyo.',
  },
  'wudu-mc-5': {
    prompt: 'Maxay Muslimiintu u sameeyaan wuduu?',
    choices: {
      a: 'Si loogu diyaar galo Salaadda iyagoo nadiif ah',
      b: 'Si loogu guulaysto orod',
      c: 'Si looga boodo salaadda',
    },
    explanation: 'Wuduugu wuxuu naga caawiyaa inaan Salaadda ku diyaar galo anagoo nadiif ah.',
    hint: 'Wuxuu ku xiran yahay salaadda.',
  },
  'wudu-order-1': {
    prompt: 'U dhig tillaabooyinkan wuduu nidaam wanaagsan oo barasho ah.',
    orderItems: {
      '1': 'Maydh gacmaha',
      '2': 'Maydh wejiga',
      '3': 'Maydh gacmaha dhaadheer',
      '4': 'Masax madaxa',
      '5': 'Maydh cagaha',
    },
    explanation:
      'Nidaam caawimaad leh: gacmaha, wejiga, gacmaha dhaadheer, masax madaxa, ka dib maydh cagaha.',
    hint: 'Ka bilow gacmaha, ka dib wejiga.',
  },
  'wudu-order-2': {
    prompt: 'Maxaa ugu horreeya marka wuduu la bilaabo?',
    orderItems: {
      '1': 'Maydh gacmaha',
      '2': 'Maydh wejiga',
      '3': 'Maydh cagaha',
    },
    explanation: 'Waxaan ku bilownaa maydhashada gacmaha, ka dibna wejiga iyo cagaha.',
    hint: 'Gacmahu way ka horreeyaan wejiga.',
  },
  'wudu-mc-6': {
    prompt: 'Xubnaha jidhka kee ayaa la maydhaa wuduuga?',
    choices: {
      a: 'Wejiga, gacmaha, iyo cagaha (madaxana waa la masaxaa)',
      b: 'Timo keliya',
      c: 'Xusullada keliya',
    },
    explanation: 'Wuduuga waxaan ku maydhannaa wejiga, gacmaha, iyo cagaha, madaxana waan masaxnaa.',
    hint: 'Xusuuso maydhid iyo masaxid.',
  },

  'salah-mc-1': {
    prompt: 'Immisa salaadood oo waajib ah ayaa maalintii la tukadaa?',
    choices: { a: '3', b: '4', c: '5', d: '7' },
    explanation: 'Muslimiintu waxay tukadaan shan salaadood oo waajib ah maalin kasta.',
    hint: 'Waxay ka badan yihiin afar.',
  },
  'salah-mc-2': {
    prompt: 'Salaaddee baa la tukadaa waaberiga?',
    choices: { a: 'Fajr', b: 'Maghrib', c: 'Cishaa' },
    explanation: 'Fajr waa salaadda subaxa hore ee ka horreysa qorrax soo baxa.',
    hint: 'Waa salaadda ugu horreysa ee maalinta.',
  },
  'salah-mc-3': {
    prompt: 'Jihadee bay Muslimiintu u jeestaan Salaadda?',
    choices: {
      a: 'Qiblada (xagga Kacbada)',
      b: 'Jiho kasta oo aan loo malayn',
      c: 'Xagga geedka ugu dhow',
    },
    explanation: 'Muslimiintu waxay u jeestaan Qiblada — xagga Kacbada ee Makkah.',
    hint: 'Waxay ku xiran tahay Kacbada.',
  },
  'salah-mc-4': {
    prompt: 'Salaaddee baa la tukadaa isla marka qorraxdu dhacdo?',
    choices: { a: 'Maghrib', b: 'Fajr', c: 'Dhuhr' },
    explanation: 'Maghrib waa la tukadaa qorraxdu markay dhacdo.',
    hint: 'Waxay timaaddaa qorrax dhaca ka dib.',
  },
  'salah-mc-5': {
    prompt: 'Salaadda duhurka maxaa la yiraahdaa?',
    choices: { a: 'Dhuhr', b: 'Cishaa', c: 'Fajr' },
    explanation: 'Dhuhr waa salaadda duhurka.',
    hint: 'Waxaa la tukadaa qorraxdu markay ka gudubto meesha ugu sarreysa.',
  },
  'salah-mc-6': {
    prompt: 'Salaaddee baa ah salaadda habeennimo?',
    choices: { a: 'Cishaa', b: 'Fajr', c: 'Casr' },
    explanation: 'Cishaa waa salaadda habeenka.',
    hint: 'Waa tii ugu dambaysa ee shanta salaadood.',
  },
  'salah-mc-7': {
    prompt: 'Ka hor inta aan la bilaabin Salaadda, Muslimiintu waa inay…',
    choices: {
      a: 'Yeeshaan wuduu oo u jeestaan Qiblada',
      b: 'Marka hore cunaan cunto weyn',
      c: 'Ka leexdaan Qiblada',
    },
    explanation: 'Waxaan ku diyaar garannaa wuduu iyo u jeedidda Qiblada ka hor salaadda.',
    hint: 'Ka fikir nadiifinta iyo jihada.',
  },
  'salah-mc-8': {
    prompt: 'Casr waxaa la tukadaa…',
    choices: { a: 'Gelinka dambe', b: 'Waaberiga', c: 'Jimcaha keliya' },
    explanation: 'Casr waa salaadda gelinka dambe ee shanta salaadood.',
    hint: 'Waxay timaaddaa Dhuhr ka dib.',
  },
  'salah-order-1': {
    prompt: 'U dhig shanta salaadood nidaamka subax ilaa habeen.',
    orderItems: {
      '1': 'Fajr',
      '2': 'Dhuhr',
      '3': 'Casr',
      '4': 'Maghrib',
      '5': 'Cishaa',
    },
    explanation: 'Nidaamku waa Fajr, Dhuhr, Casr, Maghrib, ka dib Cishaa.',
    hint: 'Ka bilow Fajr ee waaberiga.',
  },

  'prophet-nuh-1': {
    prompt: 'Yaan ahay?',
    clue: 'Allah wuxuu igu amray inaan dhiso Doonnida.',
    choices: { nuh: 'Nuh ﷺ', musa: 'Muuse ﷺ', yunus: 'Yunus ﷺ' },
    answerLabel: 'Nuh ﷺ',
    explanation: 'Nabi Nuh ﷺ wuxuu dhisay Doonnida amarka Allah.',
    hint: 'Ka fikir daadka weyn iyo Doonnida.',
  },
  'prophet-musa-1': {
    prompt: 'Yaan ahay?',
    clue: 'Allah wuxuu ii diray Fircoon.',
    choices: { musa: 'Muuse ﷺ', ibrahim: 'Ibraahim ﷺ', isa: 'Ciise ﷺ' },
    answerLabel: 'Muuse ﷺ',
    explanation: 'Nabi Muuse ﷺ waxaa loo diray Fircoon.',
    hint: 'Wuxuu Fircoon kula hadlay in Allah keligiis la caabudo.',
  },
  'prophet-ibrahim-1': {
    prompt: 'Yaan ahay?',
    clue: 'Waxaan ahaa aabbihii Ismaaciil ﷺ.',
    choices: { ibrahim: 'Ibraahim ﷺ', nuh: 'Nuh ﷺ', yunus: 'Yunus ﷺ' },
    answerLabel: 'Ibraahim ﷺ',
    explanation: 'Nabi Ibraahim ﷺ wuxuu ahaa aabbihii Ismaaciil ﷺ.',
    hint: 'Waxaa loo yaqaan Khaliilullah — saaxiibka dhow ee Allah.',
  },
  'prophet-yunus-1': {
    prompt: 'Yaan ahay?',
    clue: 'Kalluun weyn ayaa i liqay, Allahna waan u yeedhay.',
    choices: { yunus: 'Yunus ﷺ', musa: 'Muuse ﷺ', nuh: 'Nuh ﷺ' },
    answerLabel: 'Yunus ﷺ',
    explanation: 'Nabi Yunus ﷺ wuxuu Allah uga yeedhay gudaha kalluunka.',
    hint: 'Sheekadiisu waxay ku xiran tahay kalluun weyn.',
  },
  'prophet-isa-1': {
    prompt: 'Yaan ahay?',
    clue: 'Hooyaday waa Maryam (nabi nabadgelyo korkeeda ha ahaato).',
    choices: { isa: 'Ciise ﷺ', musa: 'Muuse ﷺ', ibrahim: 'Ibraahim ﷺ' },
    answerLabel: 'Ciise ﷺ',
    explanation: 'Nabi Ciise ﷺ waa ina Maryam (nabi nabadgelyo korkeeda ha ahaato).',
    hint: 'Maryam waa hooyadiis.',
  },
  'prophet-muhammad-1': {
    prompt: 'Yaan ahay?',
    clue: 'Waxaan ahay Rasuulkii ugu dambeeyay ee Allah.',
    choices: { muhammad: 'Muxammad ﷺ', musa: 'Muuse ﷺ', isa: 'Ciise ﷺ' },
    answerLabel: 'Muxammad ﷺ',
    explanation: 'Nabi Muxammad ﷺ waa Rasuulkii ugu dambeeyay ee Allah.',
    hint: 'Isaga ayaa loo soo dejiyay Quraanka.',
  },
  'prophet-ibrahim-2': {
    prompt: 'Yaan ahay?',
    clue: 'Aniga iyo wiilkayga Ismaaciil ﷺ ayaan kor u qaadnay aasaaska Kacbada.',
    choices: { ibrahim: 'Ibraahim ﷺ', nuh: 'Nuh ﷺ', yunus: 'Yunus ﷺ' },
    answerLabel: 'Ibraahim ﷺ',
    explanation: 'Nabi Ibraahim ﷺ iyo Ismaaciil ﷺ ayaa kor u qaaday aasaaska Kacbada.',
    hint: 'Waxay ku xiran tahay Kacbada ee Makkah.',
  },
  'prophet-musa-2': {
    prompt: 'Yaan ahay?',
    clue: 'Allah wuxuu ila hadlay dooxada quduuska ah ee Tuwā.',
    choices: { musa: 'Muuse ﷺ', ibrahim: 'Ibraahim ﷺ', isa: 'Ciise ﷺ' },
    answerLabel: 'Muuse ﷺ',
    explanation: 'Allah wuxuu kula hadlay Nabi Muuse ﷺ dooxada Tuwā.',
    hint: 'Waxaa loo yaqaan Kaliimullah.',
  },

  'char-1': {
    prompt: 'Saaxiibkaa buugaagtiisii ayay ka dhaceen. Maxaa lagaa rabaa inaad sameyso?',
    choices: {
      a: 'Qoslo',
      b: 'Iska tag',
      c: 'Caawi',
      d: 'Qari buugaagta',
    },
    explanation: 'Islaamku wuxuu ina barayaa inaan dadka caawino oo aan muujino akhlaaq wanaagsan.',
    hint: 'Dooro falka naxariista leh.',
  },
  'char-2': {
    prompt: 'Koor ayaad si qalad ah u jebisay. Maxaa lagaa rabaa inaad sameyso?',
    choices: {
      a: 'Runta sheeg oo raali galin',
      b: 'Qof kale ku eedee',
      c: 'Qari oo aamus',
    },
    explanation: 'Muslimiintu runta way sheegaan oo mas’uuliyad way qaataan.',
    hint: 'Daacadnimadu waa qayb ka mid ah akhlaaqda wanaagsan.',
  },
  'char-3': {
    prompt: 'Waalidkaa caawimaad ayay ku weydiisteen. Maxaa lagaa rabaa inaad sameyso?',
    choices: {
      a: 'Si naxariis leh u caawi',
      b: 'Iska indha-tir',
      c: 'Cadhoob',
    },
    explanation: 'Islaamku wuxuu ina barayaa inaan ixtiraamno oo caawino waalidkeenna.',
    hint: 'Waalidku waxay mudan yihiin naxariis.',
  },
  'char-4': {
    prompt: 'Waxaad ballan qaadday inaad wadaagto toy. Maxaa lagaa rabaa inaad sameyso?',
    choices: {
      a: 'Oof ballantaada',
      b: 'Si taxadar la’aan ah u beddel maskaxdaada',
      c: 'Dib u qaado oo qayli',
    },
    explanation: 'Oofinta ballanku waa qayb ka mid ah akhlaaqda Islaamka.',
    hint: 'Ballan waa in la oofiyo.',
  },
  'char-5': {
    prompt: 'Qof ayaa sugayaa markiisa. Maxaa lagaa rabaa inaad sameyso?',
    choices: {
      a: 'Si samir leh u sug markaaga',
      b: 'Hore u riix',
      c: 'Ku qayli',
    },
    explanation: 'Samirka iyo caddaaladdu waa akhlaaq qurux badan oo Islaam ah.',
    hint: 'Samirku waa sifo weyn.',
  },
  'char-6': {
    prompt: 'Arday jaal ah ayaa u muuqda mid murugaysan oo keligiis ah. Doorasho wanaagsan waa?',
    choices: {
      a: 'Naxariiso oo la wadaag',
      b: 'Ku qosol',
      c: 'Dadka u sheeg inay iska indha-tiraan',
    },
    explanation: 'Akhlaaqda wanaagsani waxay ka dhigan tahay naxariis iyo daryeel dadka kale.',
    hint: 'Dooro naxariista.',
  },
  'char-7': {
    prompt: 'Waxaad maqashay xan ku saabsan qof. Maxaa lagaa rabaa inaad sameyso?',
    choices: {
      a: 'Ha ku biirin; sharaftiisa ilaali',
      b: 'Kordhi wararka been abuurka ah',
      c: 'Si degdeg ah u faafi',
    },
    explanation: 'Islaamku wuxuu ina barayaa inaan ilaalino sharafta dadka oo aan ka fogaanno hadalka waxyeellada leh.',
    hint: 'Dadka ilaali, ha ku dhaawicin erayo.',
  },
  'char-8': {
    prompt: 'Cunto fudud ayaad haysataa, saaxiibkaana midna ma haysto. Maxaa lagaa rabaa inaad sameyso?',
    choices: {
      a: 'La wadaag',
      b: 'Si qarsoodi ah u cun dhammaan',
      c: 'Ku jeesjees',
    },
    explanation: 'Wadaagistu waa qayb ka mid ah deeqsinimada iyo akhlaaqda wanaagsan ee Islaamka.',
    hint: 'Noqo deeqsi.',
  },

  'know-1': {
    prompt: 'Imaamaha Islaamku immisa ayay yihiin?',
    choices: { a: '3', b: '5', c: '7' },
    explanation: 'Imaamaha Islaamku waa shan.',
    hint: 'Waa tiro la mid ah salaadaha maalinlaha ah.',
  },
  'know-2': {
    prompt: 'Waa maxay kitaabka quduuska ah ee Muslimiinta?',
    choices: { a: 'Quraanka', b: 'Buug sheeko', c: 'Majaajillo' },
    explanation: 'Quraanku waa Kaladda Allah oo loo soo dejiyay Nabi Muxammad ﷺ.',
    hint: 'Muslimiintu waxay ku akhriyaan Salaadda.',
  },
  'know-3': {
    prompt: 'Muslimiintu waxay caabudaan…',
    choices: { a: 'Allah keligiis', b: 'Ilaahyo badan', c: 'Qorraxda' },
    explanation: 'Islaamku wuxuu barayaa Tawxiid — in Allah keligiis la caabudo.',
    hint: 'Ilaah keliya ayaa jira.',
  },
  'know-4': {
    prompt: 'Xaggee bay Muslimiintu u tagaan Xajka?',
    choices: { a: 'Makkah', b: 'Magaalo kasta', c: 'Buur aan loo malayn' },
    explanation: 'Xajka waxaa lagu guta Makkah iyo hareeraheeda.',
    hint: 'Waa magaalada Kacbada.',
  },
  'know-5': {
    prompt: 'Bishii ay Muslimiintu sooman yihiin?',
    choices: { a: 'Ramadaan', b: 'Bil kasta si aan nidaam lahayn', c: 'Jiilaalka keliya' },
    explanation: 'Muslimiintu waxay soomaan bisha Ramadaan.',
    hint: 'Waa bil barakaysan oo soon ah.',
  },
  'know-6': {
    prompt: 'Waa maxay magaca salaadda Jimcaha?',
    choices: { a: 'Jumuucah', b: 'Taraawix keliya', c: 'Ciid keliya' },
    explanation: 'Jumuucah waa salaadda gaarka ah ee Jimcaha ee la wada tukado.',
    hint: 'Hal mar toddobaadkii ayay dhacdaa Jimcaha.',
  },
  'know-7': {
    prompt: 'Odhaahda “Assalamu Alaikum” macnaheedu waa…',
    choices: { a: 'Nabadgelyo korkaaga ha ahaato', b: 'Nabadgelyo weligeed ah', c: 'Waan cadhaysan ahay' },
    explanation: 'Salaanta Islaamku waxay dadka ugu rajaynaysaa nabadgelyo.',
    hint: 'Waa salaanta nabadgelyada.',
  },
  'know-8': {
    prompt: 'Waa maxay Kacbada?',
    choices: {
      a: 'Guriga quduuska ah ee Allah ee Makkah',
      b: 'Goob suuq ah',
      c: 'Buur qurxin keliya ah',
    },
    explanation: 'Kacbadu waa Guriga quduuska ah ee Allah ee Makkah.',
    hint: 'Muslimiintu way u jeestaan markay tukadaan.',
  },
  'know-9': {
    prompt: 'Muslimiintu waxay aaminsan yihiin…',
    choices: {
      a: 'Dhammaan Nebiyada Allah, oo ku dhammaada Muxammad ﷺ',
      b: 'Nebiyo ma jiraan',
      c: 'Boqorro keliya',
    },
    explanation:
      'Rumeysha Nebiyadu waa qayb ka mid ah iimaanka, Muxammad ﷺ-na waa Rasuulkii ugu dambeeyay.',
    hint: 'Nabi-nimadu waa rukun ka mid ah iimaanka.',
  },
  'know-10': {
    prompt: 'Dhismekee bay Muslimiintu u tagaan si ay u wada tukadaan?',
    choices: { a: 'Masjid', b: 'Goob ciyaar keliya', c: 'Suuq weyn' },
    explanation: 'Masjidku waa meesha Muslimiintu ku wada tukadaan.',
    hint: 'Waxaa kaloo loo yaqaan mosque.',
  },
};
