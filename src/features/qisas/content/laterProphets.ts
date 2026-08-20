import { choice, createQisasStory, rememberProphetQuestion, TRUE_FALSE_CHOICES } from './storyFactory';
import type { QisasStory } from '../types';

export const ILYAS_STORY: QisasStory = createQisasStory({
  id: 'qisas-story-019',
  prophetKey: 'ilyas',
  title: {
    en: 'The Story of Prophet Ilyas عليه السلام',
    so: 'Qisadii Nebi Ilyaas عليه السلام',
  },
  prophetName: { en: 'Ilyas عليه السلام', so: 'Ilyaas عليه السلام' },
  summary: {
    en: 'Ilyas عليه السلام was a messenger of Allah. He called his people away from Ba‘l and back to Allah, the best of creators.',
    so: 'Ilyaas عليه السلام wuxuu ahaa rasuul Alle. Wuxuu dadkiisa uga yeedhay Bacal, wuxuuna ku celiyay Alle, Kan ugu wanaagsan abuurayaasha.',
  },
  chapters: [
    {
      id: 'ilyas-messenger',
      title: { en: 'A messenger of Allah', so: 'Rasuul Alle' },
      body: {
        en: 'Allah said Ilyas عليه السلام was one of the messengers. He called his people: will you not fear Allah? Messengers come to remind people of their Lord.',
        so: 'Alle wuxuu yiri Ilyaas عليه السلام wuxuu ka mid ahaa rasuullada. Wuxuu dadkiisa ku yiri: miyeydaan Alle ka cabsanayn? Rasuulladu waxay dadka xasuusiyaan Rabbiga.',
      },
    },
    {
      id: 'ilyas-bal',
      title: { en: 'Leave Ba‘l', so: 'Bacal ka taga' },
      body: {
        en: 'His people called upon Ba‘l and left Allah. Ilyas عليه السلام asked them: do you call upon Ba‘l and leave the best of creators — Allah, your Lord and the Lord of your fathers? They denied him, except Allah’s chosen servants.',
        so: 'Dadkiisu waxay u yeedheen Bacal, Alle na way ka tageen. Ilyaas عليه السلام wuxuu weydiiyay: ma Bacal baad u yeedhaan oo aad uga tagaan Kan ugu wanaagsan abuurayaasha — Alle, Rabbigiin iyo Rabbiga aabbayaashiin? Way beeniyeen, marka laga reebo addoommada Alle doortay.',
      },
    },
    {
      id: 'ilyas-peace',
      title: { en: 'Peace upon Ilyas', so: 'Nabadgelyo Ilyaas' },
      body: {
        en: 'Allah sent peace upon Ilyas عليه السلام. The story teaches us to worship Allah alone and not to call upon anything besides Him, even if many people do.',
        so: 'Alle wuxuu nabadgelyo u diray Ilyaas عليه السلام. Sheekadu waxay ina bartaa inaan Alle keliya caabudno, hana u yeedhin wax kale xitaa haddii dad badani sameeyaan.',
      },
    },
  ],
  quranReferences: ['37:123–132', '6:85'],
  learnQuestions: [
    {
      id: 'ilyas-learn-1',
      type: 'multiple_choice',
      prompt: {
        en: 'Who was Ilyas عليه السلام?',
        so: 'Waa kuma Ilyaas عليه السلام?',
      },
      choices: [
        choice('messenger', 'A messenger of Allah', 'Rasuul Alle'),
        choice('king', 'A king of Egypt', 'Boqor Masar ah'),
        choice('sailor', 'A sailor', 'Badmareen'),
      ],
      correctChoiceId: 'messenger',
      explanation: {
        en: 'Allah said Ilyas was one of the messengers.',
        so: 'Alle wuxuu yiri Ilyaas wuxuu ka mid ahaa rasuullada.',
      },
    },
    {
      id: 'ilyas-learn-2',
      type: 'multiple_choice',
      prompt: {
        en: 'What were his people calling upon besides Allah?',
        so: 'Maxay dadkiisu u yeedhayeen Alle ka sokow?',
      },
      choices: [
        choice('bal', 'Ba‘l', 'Bacal'),
        choice('sun-only', 'The staff of Musa', 'Uska Muuse'),
        choice('ark', 'The ark of Nuh', 'Doonkii Nuux'),
      ],
      correctChoiceId: 'bal',
      explanation: {
        en: 'They called upon Ba‘l and left the best of creators.',
        so: 'Waxay u yeedheen Bacal, waxayna uga tageen Kan ugu wanaagsan abuurayaasha.',
      },
    },
    {
      id: 'ilyas-learn-3',
      type: 'true_false',
      prompt: {
        en: 'Ilyas عليه السلام told his people to leave Ba‘l and worship Allah.',
        so: 'Ilyaas عليه السلام wuxuu dadkiisa ku yiri Bacal ka taga oo Alle caabuda.',
      },
      choices: TRUE_FALSE_CHOICES,
      correctChoiceId: 'true',
      explanation: {
        en: 'He asked them why they called upon Ba‘l and left Allah, their Lord.',
        so: 'Wuxuu weydiiyay maxay Bacal u yeedhaan oo Alle uga tagaan, Rabbiga.',
      },
    },
    {
      id: 'ilyas-learn-4',
      type: 'multiple_choice',
      prompt: {
        en: 'Did all of his people believe?',
        so: 'Dadkiisa oo dhan ma rumeeyeen?',
      },
      choices: [
        choice('chosen', 'They denied him, except Allah’s chosen servants', 'Way beeniyeen, marka laga reebo addoommada Alle doortay'),
        choice('all', 'Every person believed at once', 'Qof kasta si degdeg ah ayuu u rumaystay'),
        choice('none-called', 'He never called anyone', 'Waligiis cidna uma yeedhin'),
      ],
      correctChoiceId: 'chosen',
      explanation: {
        en: 'Most denied him. Allah’s chosen servants believed.',
        so: 'Inta badan way beeniyeen. Addoommada Alle doortay ayaa rumaystay.',
      },
    },
    {
      id: 'ilyas-learn-5',
      type: 'multiple_choice',
      prompt: {
        en: 'What can we learn from Ilyas عليه السلام?',
        so: 'Maxaan ka baran karnaa Ilyaas عليه السلام?',
      },
      choices: [
        choice('alone', 'Worship Allah alone; do not call upon anything besides Him', 'Alle keliya caabud; ha u yeedhin wax kale'),
        choice('bal', 'Call upon Ba‘l if a crowd does', 'Bacal u yeedh haddii dad badan sameeyaan'),
        choice('fearless', 'Never fear Allah', 'Weligaa ha ka cabsan Alle'),
      ],
      correctChoiceId: 'alone',
      explanation: {
        en: 'He called people back to Allah, the best of creators.',
        so: 'Wuxuu dadka ku celiyay Alle, Kan ugu wanaagsan abuurayaasha.',
      },
    },
  ],
  gameQuestions: [
    {
      id: 'ilyas-game-order',
      type: 'ordering',
      prompt: {
        en: 'What happened first? Put the events in order.',
        so: 'Maxaa marka hore dhacay? Dhacdooyinka si nidaam ah u dhig.',
      },
      orderItems: [
        choice('sent', 'Allah sent Ilyas as a messenger', 'Alle wuxuu Ilyaas u diray rasuul'),
        choice('call', 'He called his people to fear Allah', 'Wuxuu dadkiisa ugu yeedhay inay Alle ka cabsadaan'),
        choice('bal', 'He told them to leave Ba‘l', 'Wuxuu ku yiri Bacal ka taga'),
        choice('deny', 'Most denied him; chosen servants believed', 'Inta badan way beeniyeen; addoommada la doortay way rumeeyeen'),
      ],
      explanation: {
        en: 'He was sent, he called them, he warned them about Ba‘l, then most denied him.',
        so: 'Waa la diray, wuu u yeedhay, Bacal wuu uga digeeray, inta badan way beeniyeen.',
      },
    },
    rememberProphetQuestion(
      'ilyas-game-remember',
      'ilyas',
      [
        choice('ilyas', 'Ilyas عليه السلام', 'Ilyaas عليه السلام'),
        choice('hud', 'Hud عليه السلام', 'Huud عليه السلام'),
        choice('shuayb', 'Shu‘ayb عليه السلام', 'Shucayb عليه السلام'),
      ],
      { en: 'Ilyas عليه السلام', so: 'Ilyaas عليه السلام' },
    ),
    {
      id: 'ilyas-game-tf',
      type: 'true_false',
      prompt: {
        en: 'Allah sent peace upon Ilyas عليه السلام.',
        so: 'Alle wuxuu nabadgelyo u diray Ilyaas عليه السلام.',
      },
      choices: TRUE_FALSE_CHOICES,
      correctChoiceId: 'true',
      explanation: {
        en: 'The Qur’an sends peace upon him.',
        so: 'Quraanku nabadgelyo buu u diraa.',
      },
    },
    {
      id: 'ilyas-game-match',
      type: 'match',
      prompt: {
        en: 'Match the lesson: Ba‘l was…',
        so: 'Casharka la xiriir: Bacal wuxuu ahaa…',
      },
      choices: [
        choice('false', 'Something they called besides Allah', 'Wax ay u yeedheen Alle ka sokow'),
        choice('lord', 'The true Lord', 'Rabbiga dhabta ah'),
        choice('prophet', 'A prophet of Allah', 'Nabi Alle soo diray'),
      ],
      correctChoiceId: 'false',
      explanation: {
        en: 'Ilyas told them to leave Ba‘l and worship Allah, the best of creators.',
        so: 'Ilyaas wuxuu ku yiri Bacal ka taga oo caabuda Alle, Kan ugu wanaagsan abuurayaasha.',
      },
    },
    {
      id: 'ilyas-game-lord',
      type: 'multiple_choice',
      prompt: {
        en: 'Whom did Ilyas عليه السلام call the best of creators?',
        so: 'Yuu Ilyaas عليه السلام ugu magacaabay Kan ugu wanaagsan abuurayaasha?',
      },
      choices: [
        choice('allah', 'Allah', 'Alle'),
        choice('bal', 'Ba‘l', 'Bacal'),
        choice('people', 'His people', 'Dadkiisa'),
      ],
      correctChoiceId: 'allah',
      explanation: {
        en: 'Allah is your Lord and the Lord of your fathers.',
        so: 'Alle waa Rabbigaaga iyo Rabbiga aabbayaashaaga.',
      },
    },
  ],
});

export const AL_YASA_STORY: QisasStory = createQisasStory({
  id: 'qisas-story-020',
  prophetKey: 'al-yasa',
  title: {
    en: 'The Story of Prophet Al-Yasa‘ عليه السلام',
    so: 'Qisadii Nebi Alyasac عليه السلام',
  },
  prophetName: { en: 'Al-Yasa‘ عليه السلام', so: 'Alyasac عليه السلام' },
  summary: {
    en: 'Allah named Al-Yasa‘ عليه السلام among the prophets He favoured. The Qur’an does not tell a long story about him, so we keep to what Allah said.',
    so: 'Alle wuxuu Alyasac عليه السلام ku daray nebiyadii uu dooray. Quraanku sheeko dheer kama sheegin, sidaas darteed waxaan ku ekaanaynaa wixii Alle yiri.',
  },
  chapters: [
    {
      id: 'alyasa-named',
      title: { en: 'Named among the favoured', so: 'Lagu daray kuwa la dooray' },
      body: {
        en: 'Allah mentioned Al-Yasa‘ عليه السلام with other prophets. Allah said We favoured them over the worlds. He was a prophet of Allah.',
        so: 'Alle wuxuu Alyasac عليه السلام kula xusay nebiyo kale. Alle wuxuu yiri waan ka doorannay caalamka. Wuxuu ahaa nebi Alle soo diray.',
      },
    },
    {
      id: 'alyasa-excellent',
      title: { en: 'Among the excellent', so: 'Kuwa wanaagsan dhexdooda' },
      body: {
        en: 'Allah also named Al-Yasa‘ عليه السلام among the excellent. The Qur’an does not tell every detail of his life. What we know is enough: Allah honoured him as a prophet.',
        so: 'Alle wuxuu kaloo Alyasac عليه السلام ku daray kuwa wanaagsan. Quraanku nolosha oo dhan nooma sheegin. Waxa aan ognahay waa ku filan yahay: Alle wuxuu u sharafeeyay nebi ahaan.',
      },
    },
    {
      id: 'alyasa-lesson',
      title: { en: 'What we learn', so: 'Waxa aan baranno' },
      body: {
        en: 'This story teaches us to honour every prophet Allah named, even when the Qur’an is brief. We do not invent extra stories. We follow the messengers Allah sent.',
        so: 'Sheekadani waxay ina bartaa inaan sharafnno nebi kasta oo Alle magacaabay, xitaa marka Quraanku kooban yahay. Sheekooyin dheeraad ah ma abuurno. Waxaan raacnaa rasuulladii Alle soo diray.',
      },
    },
  ],
  quranReferences: ['6:86', '38:48'],
  learnQuestions: [
    {
      id: 'alyasa-learn-1',
      type: 'multiple_choice',
      prompt: {
        en: 'How does the Qur’an honour Al-Yasa‘ عليه السلام?',
        so: 'Sidee Quraanku u sharafeeyaa Alyasac عليه السلام?',
      },
      choices: [
        choice('favoured', 'Allah named him among the prophets He favoured', 'Alle wuxuu ku daray nebiyadii uu dooray'),
        choice('king', 'Allah named him king of Egypt', 'Alle wuxuu ugu magacaabay boqor Masar'),
        choice('sailor', 'Allah named him a sailor', 'Alle wuxuu ugu magacaabay badmareen'),
      ],
      correctChoiceId: 'favoured',
      explanation: {
        en: 'Allah mentioned him among those He favoured over the worlds.',
        so: 'Alle wuxuu ku xusay kuwa uu ka dooray caalamka.',
      },
    },
    {
      id: 'alyasa-learn-2',
      type: 'true_false',
      prompt: {
        en: 'The Qur’an tells a long, detailed biography of Al-Yasa‘ عليه السلام.',
        so: 'Quraanku wuxuu sheegay taariikh dheer oo faahfaahsan oo Alyasac عليه السلام ah.',
      },
      choices: TRUE_FALSE_CHOICES,
      correctChoiceId: 'false',
      explanation: {
        en: 'The Qur’an names him among the favoured and the excellent. Extra details are not in this story.',
        so: 'Quraanku wuxuu ku daraa kuwa la dooray iyo kuwa wanaagsan. Faahfaahin kale sheekadan kuma jirto.',
      },
    },
    {
      id: 'alyasa-learn-3',
      type: 'multiple_choice',
      prompt: {
        en: 'Was Al-Yasa‘ عليه السلام a prophet?',
        so: 'Alyasac عليه السلام ma nebi baa ahaa?',
      },
      choices: [
        choice('yes', 'Yes. Allah named him with the prophets.', 'Haa. Alle wuxuu kula xusay nebiyada.'),
        choice('no', 'No. He was only a king.', 'Maya. Kaliya boqor buu ahaa.'),
        choice('angel', 'He was an angel, not a prophet.', 'Wuxuu ahaa malag, ma aha nebi.'),
      ],
      correctChoiceId: 'yes',
      explanation: {
        en: 'Allah listed him with other prophets He favoured.',
        so: 'Alle wuxuu kula xusay nebiyo kale oo uu dooray.',
      },
    },
    {
      id: 'alyasa-learn-4',
      type: 'multiple_choice',
      prompt: {
        en: 'What should we do when the Qur’an is brief about a prophet?',
        so: 'Maxaan sameynaa marka Quraanku kooban yahay nebiga?',
      },
      choices: [
        choice('keep', 'Keep to what Allah said; do not invent extra stories', 'Ku ekaan wixii Alle yiri; ha abuurin sheekooyin dheeraad ah'),
        choice('invent', 'Invent a long story so it feels complete', 'Sheeko dheer abuuro si ay u dhammaystiran tahay'),
        choice('ignore', 'Ignore that prophet', 'Nebigaas iska daa'),
      ],
      correctChoiceId: 'keep',
      explanation: {
        en: 'We honour him with what Allah said, and we do not add what we do not know.',
        so: 'Waxaan ku sharafnnaa wixii Alle yiri, kama darin waxaanan aqoon.',
      },
    },
    {
      id: 'alyasa-learn-5',
      type: 'multiple_choice',
      prompt: {
        en: 'What can we learn from Al-Yasa‘ عليه السلام?',
        so: 'Maxaan ka baran karnaa Alyasac عليه السلام?',
      },
      choices: [
        choice('honour', 'Honour every prophet Allah named', 'Sharafee nebi kasta oo Alle magacaabay'),
        choice('skip', 'Skip prophets with short mentions', 'Ka bood nebiyada kooban'),
        choice('idols', 'Call upon Ba‘l', 'Bacal u yeedh'),
      ],
      correctChoiceId: 'honour',
      explanation: {
        en: 'Allah favoured him. A short mention is still an honour.',
        so: 'Alle wuu dooray. Xus kooban weli waa sharaf.',
      },
    },
  ],
  gameQuestions: [
    {
      id: 'alyasa-game-order',
      type: 'ordering',
      prompt: {
        en: 'What happened first? Put the events in order.',
        so: 'Maxaa marka hore dhacay? Dhacdooyinka si nidaam ah u dhig.',
      },
      orderItems: [
        choice('named', 'Allah named Al-Yasa‘ as a prophet', 'Alle wuxuu Alyasac ugu magacaabay nebi'),
        choice('favoured', 'Allah favoured him over the worlds', 'Alle wuxuu ka dooray caalamka'),
        choice('excellent', 'Allah named him among the excellent', 'Alle wuxuu ku daray kuwa wanaagsan'),
        choice('learn', 'We honour him without inventing extra stories', 'Waanu sharafnnaa anagoon sheekooyin dheeraad ah abuurin'),
      ],
      explanation: {
        en: 'Allah named him, favoured him, counted him among the excellent, and we keep to that.',
        so: 'Alle wuu magacaabay, wuu dooray, kuwa wanaagsan ayuu ku daray, annaguna taas ayaan ku ekaanaynaa.',
      },
    },
    rememberProphetQuestion(
      'alyasa-game-remember',
      'al-yasa',
      [
        choice('al-yasa', 'Al-Yasa‘ عليه السلام', 'Alyasac عليه السلام'),
        choice('yunus', 'Yunus عليه السلام', 'Yuunas عليه السلام'),
        choice('hud', 'Hud عليه السلام', 'Huud عليه السلام'),
      ],
      { en: 'Al-Yasa‘ عليه السلام', so: 'Alyasac عليه السلام' },
    ),
    {
      id: 'alyasa-game-tf',
      type: 'true_false',
      prompt: {
        en: 'Al-Yasa‘ عليه السلام was among the prophets Allah favoured.',
        so: 'Alyasac عليه السلام wuxuu ka mid ahaa nebiyadii Alle dooray.',
      },
      choices: TRUE_FALSE_CHOICES,
      correctChoiceId: 'true',
      explanation: {
        en: 'The Qur’an lists him among those favoured over the worlds.',
        so: 'Quraanku wuxuu ku daraa kuwa laga dooray caalamka.',
      },
    },
    {
      id: 'alyasa-game-match',
      type: 'match',
      prompt: {
        en: 'Match the lesson: a brief Qur’an mention means…',
        so: 'Casharka la xiriir: xuska Quraanka oo kooban wuxuu ka dhigan yahay…',
      },
      choices: [
        choice('enough', 'What Allah said is enough', 'Wixii Alle yiri waa ku filan yahay'),
        choice('invent', 'We must invent the rest', 'Waa inaan inta kale abuurno'),
        choice('weak', 'The prophet was not important', 'Nebigu muhiim ma ahayn'),
      ],
      correctChoiceId: 'enough',
      explanation: {
        en: 'We do not add extra stories the Qur’an did not tell.',
        so: 'Kama darin sheekooyin dheeraad ah oo Quraanku sheegin.',
      },
    },
    {
      id: 'alyasa-game-who',
      type: 'multiple_choice',
      prompt: {
        en: 'Who sent Al-Yasa‘ عليه السلام?',
        so: 'Yaa soo diray Alyasac عليه السلام?',
      },
      choices: [
        choice('allah', 'Allah', 'Alle'),
        choice('people', 'His people', 'Dadkiisa'),
        choice('kings', 'The kings of the land', 'Boqorrada dhulka'),
      ],
      correctChoiceId: 'allah',
      explanation: {
        en: 'Every prophet is sent by Allah.',
        so: 'Nebi kasta Alle ayaa soo dira.',
      },
    },
  ],
});

export const YUNUS_STORY: QisasStory = createQisasStory({
  id: 'qisas-story-021',
  prophetKey: 'yunus',
  title: {
    en: 'The Story of Prophet Yunus عليه السلام',
    so: 'Qisadii Nebi Yuunas عليه السلام',
  },
  prophetName: { en: 'Yunus عليه السلام', so: 'Yuunas عليه السلام' },
  summary: {
    en: 'Yunus عليه السلام left in anger, was swallowed by a fish, glorified Allah in the darkness, and was saved. His people then believed.',
    so: 'Yuunas عليه السلام wuxuu ka tegey isagoo cadhaysan, kalluun baa liqay, mugdiga dhexdiisa Alle ayuu u tasbiixsaday, waa la badbaadiyay. Dadkiisiina way rumeeyeen.',
  },
  chapters: [
    {
      id: 'yunus-sent',
      title: { en: 'Sent to his people', so: 'Loo diray dadkiisa' },
      body: {
        en: 'Yunus عليه السلام was a messenger. He called his people to Allah. When they did not believe, he left them in anger, thinking Allah would not hold him to account in that way. A messenger should be patient and wait for Allah’s command.',
        so: 'Yuunas عليه السلام wuxuu ahaa rasuul. Wuxuu dadkiisa ugu yeedhay Alle. Markayan rumaysan, wuu ka tegey isagoo cadhaysan, isagoo moodaya inaan Alle sidaas u xisaabin. Rasuulku waa inuu samro oo uu sugo amarka Alle.',
      },
    },
    {
      id: 'yunus-fish',
      title: { en: 'The fish', so: 'Kalluunkii' },
      body: {
        en: 'He boarded a loaded ship. Lots were cast, and he was thrown into the sea. A fish swallowed him. He was in darkness — the darkness of the belly, the night, and the sea.',
        so: 'Wuxuu fuulay markab culeys badan. Saami ayaa la tuuray, baddana waa lagu tuuray. Kalluun baa liqay. Wuxuu ku jiray mugdi — mugdiga caloosha, habeenka, iyo badda.',
      },
    },
    {
      id: 'yunus-tasbih',
      title: { en: 'He glorified Allah', so: 'Alle ayuu u tasbiixsaday' },
      body: {
        en: 'In the darkness Yunus عليه السلام called: there is no god except You; glory be to You; I was among the wrongdoers. Allah saved him. If he had not been of those who glorify Allah, he would have remained in the belly until the Day of Resurrection. Allah cast him onto a shore, sick, and caused a plant to grow over him.',
        so: 'Mugdiga dhexdiisa Yuunas عليه السلام wuxuu ku yeedhay: ilaah kale ma jiro Adiga mooyaane; subxaanaaka; waxaan ka mid ahaa kuwa xumaan fala. Alle wuu badbaadiyay. Haddii uusan ka mid ahaan lahayn kuwa tasbiixsada, caloosha ayuu ku sii nagaadi lahaa ilaa Maalinta Qiyaamaha. Alle wuxuu ku tuuray xeeb, isagoo jiran, geedna wuu korka koriyay.',
      },
    },
    {
      id: 'yunus-people',
      title: { en: 'His people believed', so: 'Dadkiisii way rumeeyeen' },
      body: {
        en: 'Allah sent him again to a great number of people. They believed, and Allah gave them enjoyment for a time. The story teaches us to remember Allah in hardship, to admit our mistakes, and that Allah saves those who glorify Him.',
        so: 'Alle mar kale wuxuu u diray dad aad u badan. Way rumeeyeen, Alle na wuxuu u raaxaystay in muddo ah. Sheekadu waxay ina bartaa inaan Alle xusuusanno dhibka, qaladaadkeenna qiranno, iyo in Alle badbaadiyo kuwa u tasbiixsada.',
      },
    },
  ],
  quranReferences: ['10:98', '21:87–88', '37:139–148', '68:48'],
  learnQuestions: [
    {
      id: 'yunus-learn-1',
      type: 'multiple_choice',
      prompt: {
        en: 'Why did Yunus عليه السلام leave his people?',
        so: 'Maxuu Yuunas عليه السلام uga tegey dadkiisa?',
      },
      choices: [
        choice('anger', 'He left in anger when they did not believe', 'Wuu ka tegey isagoo cadhaysan markayan rumaysan'),
        choice('flood', 'A flood carried him away at once', 'Daad ayaa isla markiiba qaaday'),
        choice('king', 'A king invited him to a palace', 'Boqor ayaa qasri ugu yeedhay'),
      ],
      correctChoiceId: 'anger',
      explanation: {
        en: 'He left in anger. A messenger should wait for Allah’s command.',
        so: 'Wuu ka tegey isagoo cadhaysan. Rasuulku waa inuu sugo amarka Alle.',
      },
    },
    {
      id: 'yunus-learn-2',
      type: 'multiple_choice',
      prompt: {
        en: 'What swallowed Yunus عليه السلام?',
        so: 'Maxaa liqay Yuunas عليه السلام?',
      },
      choices: [
        choice('fish', 'A fish', 'Kalluun'),
        choice('camel', 'A camel', 'Geel'),
        choice('bird', 'A bird', 'Shimbir'),
      ],
      correctChoiceId: 'fish',
      explanation: {
        en: 'After he was thrown into the sea, a fish swallowed him.',
        so: 'Kadib markii badda lagu tuuray, kalluun baa liqay.',
      },
    },
    {
      id: 'yunus-learn-3',
      type: 'true_false',
      prompt: {
        en: 'In the darkness Yunus عليه السلام said: there is no god except You; glory be to You; I was among the wrongdoers.',
        so: 'Mugdiga dhexdiisa Yuunas عليه السلام wuxuu yiri: ilaah kale ma jiro Adiga mooyaane; subxaanaaka; waxaan ka mid ahaa kuwa xumaan fala.',
      },
      choices: TRUE_FALSE_CHOICES,
      correctChoiceId: 'true',
      explanation: {
        en: 'He glorified Allah and admitted his mistake. Allah saved him.',
        so: 'Alle ayuu u tasbiixsaday qaladkiisana wuu qiray. Alle wuu badbaadiyay.',
      },
    },
    {
      id: 'yunus-learn-4',
      type: 'multiple_choice',
      prompt: {
        en: 'What happened to the people of Yunus عليه السلام?',
        so: 'Maxaa ku dhacay dadkii Yuunas عليه السلام?',
      },
      choices: [
        choice('believed', 'They believed, and Allah gave them enjoyment for a time', 'Way rumeeyeen, Alle na wuxuu u raaxaystay in muddo ah'),
        choice('drowned', 'They were all drowned like Pharaoh', 'Dhammaantood sidii Fircoon ayaa loo liqay'),
        choice('never', 'They never heard a messenger', 'Waligood rasuul ma maqal'),
      ],
      correctChoiceId: 'believed',
      explanation: {
        en: 'The Qur’an says they believed and benefited, unlike other towns that denied.',
        so: 'Quraanku wuxuu yiri way rumeeyeen wayna faa’iideysteen, si ka duwan magaalooyin kale oo beeniyay.',
      },
    },
    {
      id: 'yunus-learn-5',
      type: 'multiple_choice',
      prompt: {
        en: 'What can we learn from Yunus عليه السلام?',
        so: 'Maxaan ka baran karnaa Yuunas عليه السلام?',
      },
      choices: [
        choice('remember', 'Remember Allah in hardship and admit mistakes', 'Alle xusuusnow dhibka oo qaladaadka qiro'),
        choice('run', 'Leave people in anger and never return', 'Dadka uga tag cadho, dibna ha u noqon'),
        choice('hide', 'Hide from Allah in the dark', 'Alle uga dhuumo mugdiga'),
      ],
      correctChoiceId: 'remember',
      explanation: {
        en: 'Glorifying Allah saved him. Allah is the One who rescues.',
        so: 'Tasbiixda Alle ayaa badbaadisay. Alle waa Kan badbaadiya.',
      },
    },
  ],
  gameQuestions: [
    {
      id: 'yunus-game-order',
      type: 'ordering',
      prompt: {
        en: 'What happened first? Put the events in order.',
        so: 'Maxaa marka hore dhacay? Dhacdooyinka si nidaam ah u dhig.',
      },
      orderItems: [
        choice('leave', 'Yunus left his people in anger', 'Yuunas wuxuu dadkiisa uga tegey isagoo cadhaysan'),
        choice('fish', 'A fish swallowed him', 'Kalluun baa liqay'),
        choice('tasbih', 'He glorified Allah in the darkness', 'Mugdiga dhexdiisa Alle ayuu u tasbiixsaday'),
        choice('saved', 'Allah saved him and his people believed', 'Alle wuu badbaadiyay dadkiisiina way rumeeyeen'),
      ],
      explanation: {
        en: 'He left, the fish swallowed him, he glorified Allah, then he was saved and his people believed.',
        so: 'Wuu tegey, kalluunku wuu liqay, Alle ayuu u tasbiixsaday, waa la badbaadiyay dadkiisiina way rumeeyeen.',
      },
    },
    rememberProphetQuestion(
      'yunus-game-remember',
      'yunus',
      [
        choice('yunus', 'Yunus عليه السلام', 'Yuunas عليه السلام'),
        choice('idris', 'Idris عليه السلام', 'Idriis عليه السلام'),
        choice('hud', 'Hud عليه السلام', 'Huud عليه السلام'),
      ],
      { en: 'Yunus عليه السلام', so: 'Yuunas عليه السلام' },
    ),
    {
      id: 'yunus-game-tf',
      type: 'true_false',
      prompt: {
        en: 'If Yunus عليه السلام had not glorified Allah, he would have remained in the belly until the Day of Resurrection.',
        so: 'Haddii Yuunas عليه السلام uusan Alle u tasbiixin, caloosha ayuu ku sii nagaadi lahaa ilaa Maalinta Qiyaamaha.',
      },
      choices: TRUE_FALSE_CHOICES,
      correctChoiceId: 'true',
      explanation: {
        en: 'The Qur’an says glorifying Allah is what saved him from remaining there.',
        so: 'Quraanku wuxuu yiri tasbiixda Alle ayaa ka badbaadisay inuu halkaas sii joogo.',
      },
    },
    {
      id: 'yunus-game-match',
      type: 'match',
      prompt: {
        en: 'Match the lesson: in hardship we should…',
        so: 'Casharka la xiriir: dhibka waa inaan…',
      },
      choices: [
        choice('tasbih', 'Glorify Allah and admit our mistakes', 'Alle u tasbiixsanno oo qaladaadkeenna qiranno'),
        choice('blame', 'Blame Allah', 'Alle eedayno'),
        choice('hide', 'Hide and never call upon Allah', 'Dhuumanno oo waligeen Alle u yeedhin'),
      ],
      correctChoiceId: 'tasbih',
      explanation: {
        en: 'Yunus called upon Allah in the darkness and was saved.',
        so: 'Yuunas mugdiga dhexdiisa Alle ayuu u yeedhay waa la badbaadiyay.',
      },
    },
    {
      id: 'yunus-game-plant',
      type: 'multiple_choice',
      prompt: {
        en: 'After Allah saved Yunus عليه السلام, what grew over him?',
        so: 'Kadib markii Alle badbaadiyay Yuunas عليه السلام, maxaa korka ka baxay?',
      },
      choices: [
        choice('plant', 'A plant', 'Geed'),
        choice('palace', 'A palace of gold', 'Qasri dahab ah'),
        choice('mountain', 'A mountain of iron', 'Buur bir ah'),
      ],
      correctChoiceId: 'plant',
      explanation: {
        en: 'Allah cast him onto a shore, sick, and caused a plant to grow over him.',
        so: 'Alle wuxuu ku tuuray xeeb, isagoo jiran, geedna wuu korka koriyay.',
      },
    },
  ],
});

export const ZAKARIYYA_STORY: QisasStory = createQisasStory({
  id: 'qisas-story-022',
  prophetKey: 'zakariyya',
  title: {
    en: 'The Story of Prophet Zakariyya عليه السلام',
    so: 'Qisadii Nebi Zakariya عليه السلام',
  },
  prophetName: { en: 'Zakariyya عليه السلام', so: 'Zakariya عليه السلام' },
  summary: {
    en: 'Zakariyya عليه السلام cared for Maryam, asked Allah for a son, and Allah gave him Yahya even though he and his wife were old.',
    so: 'Zakariya عليه السلام wuxuu daryeelay Maryam, wuxuu Alle weydiistay wiil, Alle na wuxuu siiyay Yaxye inkasta oo isaga iyo xaaskiisu da’ weynaa.',
  },
  chapters: [
    {
      id: 'zakariyya-maryam',
      title: { en: 'Guardian of Maryam', so: 'Ilaaliyaha Maryam' },
      body: {
        en: 'Allah accepted Maryam and made her grow in a good way. Zakariyya عليه السلام was her guardian. Whenever he entered her place of prayer, he found provision with her. He asked where it came from. She said: it is from Allah. Allah provides for whom He wills without measure.',
        so: 'Alle wuu aqbali Maryam wuuna ku koriay si wanaagsan. Zakariya عليه السلام wuxuu ahaa ilaaliyaheeda. Markasta oo uu galo meesha ay ku tukato, wuxuu la helay rizq. Wuxuu weydiiyay xaggee ka yimid. Waxay tidhi: Alle ka yimid. Alle wuxuu ku siiyaa cidduu doono xisaab la’aan.',
      },
    },
    {
      id: 'zakariyya-asked',
      title: { en: 'He asked for a son', so: 'Wuxuu weydiistay wiil' },
      body: {
        en: 'Zakariyya عليه السلام called his Lord in secret. He said he feared for those who would come after him, and his wife could not have a child. He asked Allah for a pure son who would inherit from him and from the family of Ya‘qub, and be pleasing to Allah.',
        so: 'Zakariya عليه السلام wuxuu Rabbiga ugu yeedhay si qarsoodi ah. Wuxuu yiri wuxuu ka baqayaa kuwa ka dambeeya, xaaskiisuna ilmo ma dhalin karto. Wuxuu Alle weydiistay wiil daahir ah oo isaga iyo reer Yacquub dhaxla, Alle na ka farxiya.',
      },
    },
    {
      id: 'zakariyya-yahya',
      title: { en: 'Allah gave him Yahya', so: 'Alle wuxuu siiyay Yaxye' },
      body: {
        en: 'The angels called him while he was praying: Allah gives you good news of Yahya, confirming a word from Allah. Zakariyya asked how, when he was old and his wife could not have a child. Allah said: it is easy for Me. His sign was that he would not speak to people for three days except by gesture, while still remembering Allah much. The story teaches us to ask Allah even when a thing looks impossible, and to remember Him always.',
        so: 'Malaa’igtu way u yeedheen isagoo tukada: Alle wuxuu kuugu bishaaraynayaa Yaxye, eray Alle ka yimid xaqiijinaya. Zakariya wuxuu weydiiyay sidee, isagoo da’ weyn xaaskiisuna ilmo aan dhalin karin. Alle wuxuu yiri: way igu fududahay. Calaamaddiisu waxay ahayd inuusan dadka la hadlin saddex maalmood mooyaane tilmaan, isagoo weli Alle aad u xusuusanaya. Sheekadu waxay ina bartaa inaan Alle weydiisanno xitaa marka arrintu adag tahay, iyo inaan mar walba xusuusanno.',
      },
    },
  ],
  quranReferences: ['3:37–41', '19:2–11', '21:89–90'],
  learnQuestions: [
    {
      id: 'zakariyya-learn-1',
      type: 'multiple_choice',
      prompt: {
        en: 'Who was the guardian of Maryam?',
        so: 'Waa kuma ilaaliyaha Maryam?',
      },
      choices: [
        choice('zakariyya', 'Zakariyya عليه السلام', 'Zakariya عليه السلام'),
        choice('firawn', 'Pharaoh', 'Fircoon'),
        choice('jalut', 'Jalut', 'Jaaluut'),
      ],
      correctChoiceId: 'zakariyya',
      explanation: {
        en: 'Whenever Zakariyya entered her prayer place, he found provision from Allah.',
        so: 'Markasta oo Zakariya galo meesha ay ku tukato, wuxuu la helay rizqi Alle ka yimid.',
      },
    },
    {
      id: 'zakariyya-learn-2',
      type: 'multiple_choice',
      prompt: {
        en: 'What did Zakariyya عليه السلام ask Allah for?',
        so: 'Maxuu Zakariya عليه السلام Alle weydiistay?',
      },
      choices: [
        choice('son', 'A pure son', 'Wiil daahir ah'),
        choice('palace', 'A palace of gold', 'Qasri dahab ah'),
        choice('army', 'An army like Pharaoh’s', 'Ciidan sidii Fircoon'),
      ],
      correctChoiceId: 'son',
      explanation: {
        en: 'He asked for a pure son who would inherit and be pleasing to Allah.',
        so: 'Wuxuu weydiistay wiil daahir ah oo dhaxla oo Alle ka farxiya.',
      },
    },
    {
      id: 'zakariyya-learn-3',
      type: 'true_false',
      prompt: {
        en: 'Allah gave Zakariyya عليه السلام good news of Yahya even though he and his wife were old.',
        so: 'Alle wuxuu Zakariya عليه السلام ugu bishaaray Yaxye inkasta oo isaga iyo xaaskiisu da’ weynaa.',
      },
      choices: TRUE_FALSE_CHOICES,
      correctChoiceId: 'true',
      explanation: {
        en: 'Allah said it is easy for Him.',
        so: 'Alle wuxuu yiri way igu fududahay.',
      },
    },
    {
      id: 'zakariyya-learn-4',
      type: 'multiple_choice',
      prompt: {
        en: 'What was the sign given to Zakariyya عليه السلام?',
        so: 'Waa maxay calaamada la siiyay Zakariya عليه السلام?',
      },
      choices: [
        choice('silent', 'He would not speak to people for three days except by gesture', 'Saddex maalmood dadka kuma hadli karo mooyaane tilmaan'),
        choice('staff', 'His staff became a snake', 'Uskiisu wuxuu noqday mas'),
        choice('sea', 'The sea parted for him', 'Baddii ayaa u kala jabtay'),
      ],
      correctChoiceId: 'silent',
      explanation: {
        en: 'He still remembered Allah much during those days.',
        so: 'Weli Alle aad buu u xusuusanayay maalmahaas.',
      },
    },
    {
      id: 'zakariyya-learn-5',
      type: 'multiple_choice',
      prompt: {
        en: 'What can we learn from Zakariyya عليه السلام?',
        so: 'Maxaan ka baran karnaa Zakariya عليه السلام?',
      },
      choices: [
        choice('ask', 'Ask Allah even when a thing looks impossible', 'Alle weydiiso xitaa marka arrintu adag tahay'),
        choice('give-up', 'Stop asking Allah when you are old', 'Jooji weydiinta Alle markaad da’ weyn tahay'),
        choice('hide-dhikr', 'Forget Allah after a blessing', 'Alle illow kadib nicmo'),
      ],
      correctChoiceId: 'ask',
      explanation: {
        en: 'He called his Lord in secret, and Allah answered him.',
        so: 'Wuxuu Rabbiga ugu yeedhay si qarsoodi ah, Alle na wuu u jawaabay.',
      },
    },
  ],
  gameQuestions: [
    {
      id: 'zakariyya-game-order',
      type: 'ordering',
      prompt: {
        en: 'What happened first? Put the events in order.',
        so: 'Maxaa marka hore dhacay? Dhacdooyinka si nidaam ah u dhig.',
      },
      orderItems: [
        choice('guard', 'Zakariyya cared for Maryam', 'Zakariya wuxuu daryeelay Maryam'),
        choice('ask', 'He asked Allah for a pure son', 'Wuxuu Alle weydiistay wiil daahir ah'),
        choice('news', 'Allah gave him good news of Yahya', 'Alle wuxuu ugu bishaaray Yaxye'),
        choice('sign', 'His sign was not speaking for three days except by gesture', 'Calaamaddiisu waxay ahayd inuusan hadlin saddex maalmood mooyaane tilmaan'),
      ],
      explanation: {
        en: 'He guarded Maryam, asked for a son, received news of Yahya, then the sign.',
        so: 'Maryam wuu daryeelay, wiil buu weydiistay, Yaxye baa loogu bishaaray, kadib calaamada.',
      },
    },
    rememberProphetQuestion(
      'zakariyya-game-remember',
      'zakariyya',
      [
        choice('zakariyya', 'Zakariyya عليه السلام', 'Zakariya عليه السلام'),
        choice('yunus', 'Yunus عليه السلام', 'Yuunas عليه السلام'),
        choice('hud', 'Hud عليه السلام', 'Huud عليه السلام'),
      ],
      { en: 'Zakariyya عليه السلام', so: 'Zakariya عليه السلام' },
    ),
    {
      id: 'zakariyya-game-tf',
      type: 'true_false',
      prompt: {
        en: 'Maryam told Zakariyya عليه السلام that her provision was from Allah.',
        so: 'Maryam waxay Zakariya عليه السلام u sheegtay in rizqigeedu Alle ka yimid.',
      },
      choices: TRUE_FALSE_CHOICES,
      correctChoiceId: 'true',
      explanation: {
        en: 'She said: it is from Allah. Allah provides without measure.',
        so: 'Waxay tidhi: Alle ka yimid. Alle xisaab la’aan buu ku siiyaa.',
      },
    },
    {
      id: 'zakariyya-game-match',
      type: 'match',
      prompt: {
        en: 'Match the lesson: when a blessing looks impossible…',
        so: 'Casharka la xiriir: marka nicmadu adag tahay…',
      },
      choices: [
        choice('ask', 'Ask Allah; it is easy for Him', 'Alle weydiiso; way ugu fududahay'),
        choice('stop', 'Stop asking', 'Jooji weydiinta'),
        choice('idols', 'Call upon Ba‘l', 'Bacal u yeedh'),
      ],
      correctChoiceId: 'ask',
      explanation: {
        en: 'Allah gave him Yahya when he and his wife were old.',
        so: 'Alle wuxuu siiyay Yaxye markii isaga iyo xaaskiisu da’ weynaa.',
      },
    },
    {
      id: 'zakariyya-game-son',
      type: 'multiple_choice',
      prompt: {
        en: 'Which prophet was the son of Zakariyya عليه السلام?',
        so: 'Nebikee baa ahaa wiilka Zakariya عليه السلام?',
      },
      choices: [
        choice('yahya', 'Yahya عليه السلام', 'Yaxye عليه السلام'),
        choice('yunus', 'Yunus عليه السلام', 'Yuunas عليه السلام'),
        choice('nuh', 'Nuh عليه السلام', 'Nuux عليه السلام'),
      ],
      correctChoiceId: 'yahya',
      explanation: {
        en: 'Allah gave him good news of Yahya, confirming a word from Allah.',
        so: 'Alle wuxuu ugu bishaaray Yaxye, eray Alle ka yimid xaqiijinaya.',
      },
    },
  ],
});

export const YAHYA_STORY: QisasStory = createQisasStory({
  id: 'qisas-story-023',
  prophetKey: 'yahya',
  title: {
    en: 'The Story of Prophet Yahya عليه السلام',
    so: 'Qisadii Nebi Yaxye عليه السلام',
  },
  prophetName: { en: 'Yahya عليه السلام', so: 'Yaxye عليه السلام' },
  summary: {
    en: 'Yahya عليه السلام was the son of Zakariyya. Allah gave him wisdom while he was still a boy. He was dutiful, not arrogant, and Allah sent peace upon him.',
    so: 'Yaxye عليه السلام wuxuu ahaa wiilkii Zakariya. Alle wuxuu siiyay xigmad isagoo weli ilmo ah. Wuxuu ahaa mid waalidka ixtiraama, aan kibrin, Alle na nabadgelyo buu u diray.',
  },
  chapters: [
    {
      id: 'yahya-gift',
      title: { en: 'A gift from Allah', so: 'Hadiyad Alle ka timid' },
      body: {
        en: 'Yahya عليه السلام was the son Allah gave Zakariyya عليه السلام. The angels said he would confirm a word from Allah, be honourable, chaste, and a prophet from among the righteous.',
        so: 'Yaxye عليه السلام wuxuu ahaa wiilkii Alle siiyay Zakariya عليه السلام. Malaa’igtu waxay yiraahdeen wuxuu xaqiijin doonaa eray Alle ka yimid, wuxuu noqon doonaa sharaf leh, daahir, iyo nebi kuwa suubban ka mid ah.',
      },
    },
    {
      id: 'yahya-wisdom',
      title: { en: 'Wisdom as a boy', so: 'Xigmad isagoo ilmo ah' },
      body: {
        en: 'Allah said: O Yahya, take the Scripture with strength. Allah gave him wisdom while he was still a boy, and tenderness from Himself, and purity. He was dutiful to his parents, and he was not arrogant or disobedient.',
        so: 'Alle wuxuu yiri: Yaxyeow, Kitaabka ku qaado xoog. Alle wuxuu siiyay xigmad isagoo weli ilmo ah, iyo naxariis isaga ka timid, iyo daahirnimo. Wuxuu ixtiraami jiray waalidkiis, mana ahayn kibirsan ama caasi.',
      },
    },
    {
      id: 'yahya-peace',
      title: { en: 'Peace upon him', so: 'Nabadgelyo isaga' },
      body: {
        en: 'Allah sent peace upon Yahya عليه السلام the day he was born, the day he dies, and the day he is raised alive. The Qur’an does not tell extra stories beyond this honour. We learn to take Allah’s Book seriously, to be dutiful, and not to be proud.',
        so: 'Alle wuxuu nabadgelyo u diray Yaxye عليه السلام maalintii dhashay, maalinta uu dhimanayo, iyo maalinta dib loo soo noolaynayo. Quraanku sheekooyin dheeraad ah kama sheegin sharaftan ka sokow. Waxaan baranna inaan Kitaabka Alle si dhab ah u qaadanno, inaan ixtiraamno, hana kibrinno.',
      },
    },
  ],
  quranReferences: ['3:39', '19:7–15', '21:90'],
  learnQuestions: [
    {
      id: 'yahya-learn-1',
      type: 'multiple_choice',
      prompt: {
        en: 'Who was the father of Yahya عليه السلام?',
        so: 'Yuu ahaa aabbihii Yaxye عليه السلام?',
      },
      choices: [
        choice('zakariyya', 'Zakariyya عليه السلام', 'Zakariya عليه السلام'),
        choice('nuh', 'Nuh عليه السلام', 'Nuux عليه السلام'),
        choice('musa', 'Musa عليه السلام', 'Muuse عليه السلام'),
      ],
      correctChoiceId: 'zakariyya',
      explanation: {
        en: 'Allah gave Zakariyya good news of Yahya.',
        so: 'Alle wuxuu Zakariya ugu bishaaray Yaxye.',
      },
    },
    {
      id: 'yahya-learn-2',
      type: 'true_false',
      prompt: {
        en: 'Allah gave Yahya عليه السلام wisdom while he was still a boy.',
        so: 'Alle wuxuu Yaxye عليه السلام siiyay xigmad isagoo weli ilmo ah.',
      },
      choices: TRUE_FALSE_CHOICES,
      correctChoiceId: 'true',
      explanation: {
        en: 'Allah told him to take the Scripture with strength and gave him wisdom as a boy.',
        so: 'Alle wuxuu ku yiri Kitaabka ku qaado xoog, xigmadna wuu siiyay isagoo ilmo ah.',
      },
    },
    {
      id: 'yahya-learn-3',
      type: 'multiple_choice',
      prompt: {
        en: 'How does the Qur’an describe Yahya عليه السلام with his parents?',
        so: 'Sidee Quraanku u tilmaamay Yaxye عليه السلام waalidkiis?',
      },
      choices: [
        choice('dutiful', 'Dutiful, not arrogant or disobedient', 'Ixtiraamaya, aan kibrin ama caasi ahayn'),
        choice('proud', 'Proud and harsh', 'Kibirsan oo adag'),
        choice('silent-always', 'He never spoke to them', 'Waligiis kama hadlin'),
      ],
      correctChoiceId: 'dutiful',
      explanation: {
        en: 'He was dutiful to his parents and was not arrogant.',
        so: 'Wuxuu ixtiraami jiray waalidkiis mana ahayn kibirsan.',
      },
    },
    {
      id: 'yahya-learn-4',
      type: 'multiple_choice',
      prompt: {
        en: 'When did Allah send peace upon Yahya عليه السلام?',
        so: 'Goorma Alle nabadgelyo ugu diray Yaxye عليه السلام?',
      },
      choices: [
        choice('three', 'The day he was born, the day he dies, and the day he is raised alive', 'Maalintii dhashay, maalinta dhimanayo, iyo maalinta dib loo soo noolaynayo'),
        choice('only-birth', 'Only on one feast day', 'Kaliya maalin ciid ah'),
        choice('never', 'Never', 'Waligiis'),
      ],
      correctChoiceId: 'three',
      explanation: {
        en: 'The Qur’an sends peace upon him at birth, death, and resurrection.',
        so: 'Quraanku nabadgelyo buu u diraa dhalashada, geerida, iyo sarakicidda.',
      },
    },
    {
      id: 'yahya-learn-5',
      type: 'multiple_choice',
      prompt: {
        en: 'What can we learn from Yahya عليه السلام?',
        so: 'Maxaan ka baran karnaa Yaxye عليه السلام?',
      },
      choices: [
        choice('book', 'Take Allah’s Book seriously, be dutiful, and do not be proud', 'Kitaabka Alle si dhab ah u qaado, ixtiraam, hana kibrin'),
        choice('invent', 'Invent extra stories the Qur’an did not tell', 'Sheekooyin dheeraad ah abuuro oo Quraanku sheegin'),
        choice('disobey', 'Disobey parents if you are wise', 'Waalidka caasi haddii aad xigmad leedahay'),
      ],
      correctChoiceId: 'book',
      explanation: {
        en: 'He took the Scripture with strength and was dutiful, not arrogant.',
        so: 'Kitaabka xoog buu ku qaatay, wuxuu ixtiraamay, mana kibrin.',
      },
    },
  ],
  gameQuestions: [
    {
      id: 'yahya-game-order',
      type: 'ordering',
      prompt: {
        en: 'What happened first? Put the events in order.',
        so: 'Maxaa marka hore dhacay? Dhacdooyinka si nidaam ah u dhig.',
      },
      orderItems: [
        choice('news', 'Allah gave Zakariyya good news of Yahya', 'Alle wuxuu Zakariya ugu bishaaray Yaxye'),
        choice('boy', 'Allah gave Yahya wisdom as a boy', 'Alle wuxuu Yaxye siiyay xigmad isagoo ilmo ah'),
        choice('dutiful', 'He was dutiful to his parents', 'Wuxuu ixtiraamay waalidkiis'),
        choice('peace', 'Allah sent peace upon him', 'Alle wuxuu nabadgelyo u diray'),
      ],
      explanation: {
        en: 'Good news, wisdom as a boy, duty to parents, then peace from Allah.',
        so: 'Bishaaro, xigmad ilmo ahaan, ixtiraam waalid, kadib nabadgelyo Alle.',
      },
    },
    rememberProphetQuestion(
      'yahya-game-remember',
      'yahya',
      [
        choice('yahya', 'Yahya عليه السلام', 'Yaxye عليه السلام'),
        choice('yunus', 'Yunus عليه السلام', 'Yuunas عليه السلام'),
        choice('hud', 'Hud عليه السلام', 'Huud عليه السلام'),
      ],
      { en: 'Yahya عليه السلام', so: 'Yaxye عليه السلام' },
    ),
    {
      id: 'yahya-game-tf',
      type: 'true_false',
      prompt: {
        en: 'Yahya عليه السلام was arrogant and disobedient to his parents.',
        so: 'Yaxye عليه السلام wuxuu ahaa kibirsan oo waalidkiis caasiya.',
      },
      choices: TRUE_FALSE_CHOICES,
      correctChoiceId: 'false',
      explanation: {
        en: 'The Qur’an says he was dutiful and was not arrogant or disobedient.',
        so: 'Quraanku wuxuu yiri wuxuu ixtiraamay mana ahayn kibirsan ama caasi.',
      },
    },
    {
      id: 'yahya-game-match',
      type: 'match',
      prompt: {
        en: 'Match the lesson: Allah’s Book should be taken…',
        so: 'Casharka la xiriir: Kitaabka Alle waa in lagu qaato…',
      },
      choices: [
        choice('strength', 'With strength', 'Xoog'),
        choice('joke', 'As a joke', 'Kaftan ahaan'),
        choice('ignore', 'And then ignored', 'Kadibna la iska daayo'),
      ],
      correctChoiceId: 'strength',
      explanation: {
        en: 'Allah said: O Yahya, take the Scripture with strength.',
        so: 'Alle wuxuu yiri: Yaxyeow, Kitaabka ku qaado xoog.',
      },
    },
    {
      id: 'yahya-game-confirm',
      type: 'multiple_choice',
      prompt: {
        en: 'The angels said Yahya عليه السلام would confirm…',
        so: 'Malaa’igtu waxay yiraahdeen Yaxye عليه السلام wuxuu xaqiijin doonaa…',
      },
      choices: [
        choice('word', 'A word from Allah', 'Eray Alle ka yimid'),
        choice('bal', 'Ba‘l', 'Bacal'),
        choice('pharaoh', 'Pharaoh’s law', 'Sharciga Fircoon'),
      ],
      correctChoiceId: 'word',
      explanation: {
        en: 'He would confirm a word from Allah, and be a prophet from the righteous.',
        so: 'Wuxuu xaqiijin doonaa eray Alle ka yimid, wuxuuna noqon doonaa nebi kuwa suubban.',
      },
    },
  ],
});

export const ISA_STORY: QisasStory = createQisasStory({
  id: 'qisas-story-024',
  prophetKey: 'isa',
  title: {
    en: 'The Story of Prophet Isa عليه السلام',
    so: 'Qisadii Nebi Ciisa عليه السلام',
  },
  prophetName: { en: 'Isa عليه السلام', so: 'Ciisa عليه السلام' },
  summary: {
    en: 'Isa عليه السلام was born to Maryam by Allah’s word. He spoke in the cradle, was a messenger — not God — and Allah raised him. They did not kill him.',
    so: 'Ciisa عليه السلام waxaa dhashay Maryam erayga Alle. Wuxuu ku hadlay sariirta, wuxuu ahaa rasuul — ma aha Ilaah — Alle na wuu qaaday. Ma dilin.',
  },
  chapters: [
    {
      id: 'isa-birth',
      title: { en: 'Born to Maryam', so: 'Maryam ayay dhashay' },
      body: {
        en: 'Maryam was a truthful servant of Allah. An angel told her Allah gives her a boy named Isa, son of Maryam, held in honour in this world and the Hereafter. She asked how, when no man had touched her. Allah said: it is easy for Me. Isa عليه السلام was born by Allah’s word: Be, and he was.',
        so: 'Maryam waxay ahayd addoon run ah oo Alle. Malag ayaa u sheegay in Alle wiil siinayo oo lagu magacaabo Ciisa, ina Maryam, sharaf leh adduunkan iyo Aakhiro. Waxay weydiisay sidee, iyadoo nin aan taaban. Alle wuxuu yiri: way igu fududahay. Ciisa عليه السلام wuxuu ku dhashay erayga Alle: Noqo, wuuna noqday.',
      },
    },
    {
      id: 'isa-cradle',
      title: { en: 'He spoke in the cradle', so: 'Wuxuu ku hadlay sariirta' },
      body: {
        en: 'When people were surprised about the baby, Isa عليه السلام spoke in the cradle. He said: I am the servant of Allah. He has given me the Scripture and made me a prophet. He has made me blessed wherever I am. Peace be upon me the day I was born, the day I die, and the day I am raised alive. That is Isa, son of Maryam — a statement of truth.',
        so: 'Markii dadku ka yaabeen ilmaha, Ciisa عليه السلام wuxuu ku hadlay sariirta. Wuxuu yiri: waxaan ahay addoonka Alle. Wuxuu i siiyay Kitaabka wuuna i dhigay nebi. Wuxuu igu dhigay barakaysan meel kasta oo aan joogo. Nabadgelyo i dul joogto maalintii aan dhashay, maalinta aan dhimanayo, iyo maalinta dib loo i soo noolaynayo. Kaasi waa Ciisa, ina Maryam — odhaah run ah.',
      },
    },
    {
      id: 'isa-messenger',
      title: { en: 'A messenger, not God', so: 'Rasuul, ma aha Ilaah' },
      body: {
        en: 'Isa عليه السلام called the Children of Israel to Allah. He told them to worship Allah, his Lord and their Lord. The Messiah, son of Maryam, was only a messenger. Allah is one God. It is not for Allah to take a son. Isa ate food as other people do. By Allah’s permission he healed and brought the dead to life, as signs — not as a lord besides Allah.',
        so: 'Ciisa عليه السلام wuxuu Banu Israa’iil ugu yeedhay Alle. Wuxuu ku yiri caabuda Alle, Rabbiga iyo Rabbigiin. Masiixu, ina Maryam, wuxuu ahaa rasuul keliya. Alle waa Ilaah keliya. Alle uma egna inuu wiil qaato. Ciisa cuntuu cuni jiray sida dadka kale. Idanka Alle wuu bogsiiyay wuuna soo nooleeyay dad dhintay, calaamado ahaan — ma aha sayid Alle ka mid ah.',
      },
    },
    {
      id: 'isa-raised',
      title: { en: 'They did not kill him', so: 'Ma dilin' },
      body: {
        en: 'Some people claimed they killed Isa عليه السلام. Allah said they did not kill him and they did not crucify him, but it was made to appear so to them. Allah raised him to Himself. Allah is Mighty and Wise. The story teaches us that Isa is Allah’s servant and messenger, and that Allah alone is God.',
        so: 'Dad qaar waxay sheegeen inay dileen Ciisa عليه السلام. Alle wuxuu yiri ma dilin mana iskutallaabta saarin, laakiin waxaa loo muujiyay sidii. Alle wuu u qaaday. Alle waa Kan xoogga iyo xigmadda leh. Sheekadu waxay ina bartaa in Ciisa yahay addoonka iyo rasuulka Alle, iyo in Alle keliya yahay Ilaah.',
      },
    },
  ],
  quranReferences: ['3:45–59', '4:157–158', '4:171–172', '5:72–75', '5:110', '19:16–36'],
  learnQuestions: [
    {
      id: 'isa-learn-1',
      type: 'multiple_choice',
      prompt: {
        en: 'How was Isa عليه السلام born?',
        so: 'Sidee Ciisa عليه السلام u dhashay?',
      },
      choices: [
        choice('word', 'By Allah’s word, to Maryam, with no father', 'Erayga Alle, Maryam, aabbe la’aan'),
        choice('ordinary', 'Like any other birth with a father', 'Sida dhalasho kale oo aabbe leh'),
        choice('angel-father', 'An angel was his father', 'Malag ayaa aabbe u ahaa'),
      ],
      correctChoiceId: 'word',
      explanation: {
        en: 'Allah said: Be, and he was. Maryam was surprised because no man had touched her.',
        so: 'Alle wuxuu yiri: Noqo, wuuna noqday. Maryam way yaabtay maxaa yeelay nin ma taaban.',
      },
    },
    {
      id: 'isa-learn-2',
      type: 'true_false',
      prompt: {
        en: 'Isa عليه السلام spoke in the cradle and said: I am the servant of Allah.',
        so: 'Ciisa عليه السلام wuxuu ku hadlay sariirta wuxuuna yiri: waxaan ahay addoonka Alle.',
      },
      choices: TRUE_FALSE_CHOICES,
      correctChoiceId: 'true',
      explanation: {
        en: 'He said Allah gave him the Scripture and made him a prophet.',
        so: 'Wuxuu yiri Alle wuxuu i siiyay Kitaabka wuuna i dhigay nebi.',
      },
    },
    {
      id: 'isa-learn-3',
      type: 'multiple_choice',
      prompt: {
        en: 'Is Isa عليه السلام God, or the son of God?',
        so: 'Ciisa عليه السلام ma Ilaah baa, mise wiilka Ilaah?',
      },
      choices: [
        choice('no', 'No. He is Allah’s servant and messenger. Allah is one God.', 'Maya. Waa addoonka iyo rasuulka Alle. Alle waa Ilaah keliya.'),
        choice('god', 'Yes. He is God.', 'Haa. Waa Ilaah.'),
        choice('son', 'Yes. He is the son of God.', 'Haa. Waa wiilka Ilaah.'),
      ],
      correctChoiceId: 'no',
      explanation: {
        en: 'The Messiah, son of Maryam, was only a messenger. It is not for Allah to take a son.',
        so: 'Masiixu, ina Maryam, wuxuu ahaa rasuul keliya. Alle uma egna inuu wiil qaato.',
      },
    },
    {
      id: 'isa-learn-4',
      type: 'multiple_choice',
      prompt: {
        en: 'Did people kill or crucify Isa عليه السلام?',
        so: 'Dadku ma dileen ama iskutallaabta ma saareen Ciisa عليه السلام?',
      },
      choices: [
        choice('no', 'No. They did not kill him and they did not crucify him. Allah raised him.', 'Maya. Ma dilin mana iskutallaabta saarin. Alle wuu qaaday.'),
        choice('yes', 'Yes. They killed him on a cross.', 'Haa. Iskutallaab bay ku dileen.'),
        choice('unknown', 'The Qur’an does not mention this at all.', 'Quraanku arrintan kama sheegin gebi ahaan.'),
      ],
      correctChoiceId: 'no',
      explanation: {
        en: 'Allah said it was made to appear so to them. Allah raised him to Himself.',
        so: 'Alle wuxuu yiri waxaa loo muujiyay sidii. Alle wuu u qaaday.',
      },
    },
    {
      id: 'isa-learn-5',
      type: 'multiple_choice',
      prompt: {
        en: 'What can we learn from Isa عليه السلام?',
        so: 'Maxaan ka baran karnaa Ciisa عليه السلام?',
      },
      choices: [
        choice('servant', 'Worship Allah alone; Isa is a servant and messenger', 'Alle keliya caabud; Ciisa waa addoon iyo rasuul'),
        choice('god', 'Worship Isa as God', 'Ciisa Ilaah ahaan u caabud'),
        choice('cross', 'Say that they killed him', 'Dheh way dileen'),
      ],
      correctChoiceId: 'servant',
      explanation: {
        en: 'He told people to worship Allah, his Lord and their Lord.',
        so: 'Wuxuu dadka ku yiri caabuda Alle, Rabbiga iyo Rabbigiin.',
      },
    },
  ],
  gameQuestions: [
    {
      id: 'isa-game-order',
      type: 'ordering',
      prompt: {
        en: 'What happened first? Put the events in order.',
        so: 'Maxaa marka hore dhacay? Dhacdooyinka si nidaam ah u dhig.',
      },
      orderItems: [
        choice('born', 'Isa was born to Maryam by Allah’s word', 'Ciisa waxaa dhashay Maryam erayga Alle'),
        choice('spoke', 'He spoke in the cradle as Allah’s servant', 'Wuxuu ku hadlay sariirta isagoo addoonka Alle ah'),
        choice('call', 'He called people to worship Allah alone', 'Wuxuu dadka ugu yeedhay inay Alle keliya caabudaan'),
        choice('raised', 'They did not kill him; Allah raised him', 'Ma dilin; Alle wuu qaaday'),
      ],
      explanation: {
        en: 'Birth, speech in the cradle, calling to Allah, then Allah raised him.',
        so: 'Dhalasho, hadalka sariirta, u yeedhida Alle, kadib Alle wuu qaaday.',
      },
    },
    rememberProphetQuestion(
      'isa-game-remember',
      'isa',
      [
        choice('isa', 'Isa عليه السلام', 'Ciisa عليه السلام'),
        choice('yunus', 'Yunus عليه السلام', 'Yuunas عليه السلام'),
        choice('hud', 'Hud عليه السلام', 'Huud عليه السلام'),
      ],
      { en: 'Isa عليه السلام', so: 'Ciisa عليه السلام' },
    ),
    {
      id: 'isa-game-tf',
      type: 'true_false',
      prompt: {
        en: 'Isa عليه السلام told people to worship Allah, his Lord and their Lord.',
        so: 'Ciisa عليه السلام wuxuu dadka ku yiri caabuda Alle, Rabbiga iyo Rabbigiin.',
      },
      choices: TRUE_FALSE_CHOICES,
      correctChoiceId: 'true',
      explanation: {
        en: 'He was a messenger. Allah is one God.',
        so: 'Wuxuu ahaa rasuul. Alle waa Ilaah keliya.',
      },
    },
    {
      id: 'isa-game-match',
      type: 'match',
      prompt: {
        en: 'Match the lesson: Isa عليه السلام is…',
        so: 'Casharka la xiriir: Ciisa عليه السلام waa…',
      },
      choices: [
        choice('servant', 'The servant and messenger of Allah', 'Addoonka iyo rasuulka Alle'),
        choice('god', 'God Himself', 'Ilaah qudhiisa'),
        choice('son', 'The son of God', 'Wiilka Ilaah'),
      ],
      correctChoiceId: 'servant',
      explanation: {
        en: 'He said in the cradle: I am the servant of Allah.',
        so: 'Sariirta ayuu ku yiri: waxaan ahay addoonka Alle.',
      },
    },
    {
      id: 'isa-game-signs',
      type: 'multiple_choice',
      prompt: {
        en: 'How did Isa عليه السلام heal and bring the dead to life?',
        so: 'Sidee Ciisa عليه السلام u bogsiiyay una soo nooleeyay dad dhintay?',
      },
      choices: [
        choice('permission', 'By Allah’s permission, as signs', 'Idanka Alle, calaamado ahaan'),
        choice('himself', 'By his own power as Lord', 'Xooggiisa isaga oo Sayid ah'),
        choice('never', 'He never did any sign', 'Waligiis calaamad ma samayn'),
      ],
      correctChoiceId: 'permission',
      explanation: {
        en: 'The signs were by Allah’s permission, not as a lord besides Allah.',
        so: 'Calaamadaha waxay ahaayeen idanka Alle, ma aha sayid Alle ka mid ah.',
      },
    },
  ],
});

export const LATER_PROPHET_STORIES: QisasStory[] = [
  ILYAS_STORY,
  AL_YASA_STORY,
  YUNUS_STORY,
  ZAKARIYYA_STORY,
  YAHYA_STORY,
  ISA_STORY,
];
