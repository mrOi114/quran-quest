import { choice, createQisasStory, rememberProphetQuestion, TRUE_FALSE_CHOICES } from './storyFactory';
import type { QisasStory } from '../types';

export const IBRAHIM_STORY: QisasStory = createQisasStory({
  id: 'qisas-story-006',
  prophetKey: 'ibrahim',
  title: {
    en: 'The Story of Prophet Ibrahim عليه السلام',
    so: 'Qisadii Nebi Ibraahim عليه السلام',
  },
  prophetName: { en: 'Ibrahim عليه السلام', so: 'Ibraahim عليه السلام' },
  summary: {
    en: 'Ibrahim عليه السلام called his people away from idols. Allah saved him from the fire. He was a close friend of Allah, and with Ismail he raised the foundations of the Ka‘bah.',
    so: 'Ibraahim عليه السلام wuxuu dadkiisa uga yeedhay sanamyada. Alle wuxuu ka badbaadiyay dabka. Wuxuu ahaa saaxiibka Alle, Ismaaciilna wuxuu la dhisay aasaaska Kabcah.',
  },
  chapters: [
    {
      id: 'ibrahim-idols',
      title: { en: 'He called people away from idols', so: 'Wuxuu uga yeedhay sanamyada' },
      body: {
        en: 'Allah sent Prophet Ibrahim عليه السلام. His people worshipped idols that could not hear or help. Ibrahim told his father and his people: worship Allah. The idols cannot benefit you or harm you.',
        so: 'Alle wuxuu soo diray Nebi Ibraahim عليه السلام. Dadkiisu waxay caabudi jireen sanamyo aan maqli karin ama caawin karin. Ibraahim wuxuu aabbihiis iyo dadkiisa ku yiri: Alle caabuda. Sanamyadu idinma anfacaan idinmana dhaawacaan.',
      },
    },
    {
      id: 'ibrahim-fire',
      title: { en: 'The fire', so: 'Dabkii' },
      body: {
        en: 'They became angry. They said: burn him. Allah said to the fire: be cool and safe for Ibrahim. Allah saved him. No one can harm a servant when Allah protects him.',
        so: 'Way cadhoodeen. Waxay yiraahdeen: guba. Alle wuxuu dabka ku yiri: noqo qabow iyo nabad Ibraahim. Alle wuu badbaadiyay. Cidna ma dhaawaci karto addoonka Alle ilaaliyo.',
      },
    },
    {
      id: 'ibrahim-sons',
      title: { en: 'Good news of sons', so: 'Bishaarada wiilasha' },
      body: {
        en: 'Allah gave Ibrahim عليه السلام good news of a forbearing boy, then later good news of Ishaq عليه السلام and of a grandson, Yaqub عليه السلام. Ibrahim was Allah’s close friend. He turned to Allah in every matter.',
        so: 'Alle wuxuu Ibraahim عليه السلام u bishaareeyay wiil samir leh, kadibna Isxaaq عليه السلام iyo wiil-wiil Yacquub عليه السلام. Ibraahim wuxuu ahaa saaxiibka Alle. Arrin kasta Alle ayuu u jeestay.',
      },
    },
    {
      id: 'ibrahim-kabah',
      title: { en: 'The Sacred House', so: 'Guriga xurmada leh' },
      body: {
        en: 'With his son Ismail عليه السلام, Ibrahim raised the foundations of the House in Makkah. They prayed that Allah would accept their work and would send a messenger from their descendants.',
        so: 'Wiilkiisa Ismaaciil عليه السلام, Ibraahim wuxuu dhisay aasaaska Guriga Makkah. Waxay ducaysteen in Alle aqbalo shaqadooda oo uu ka soo diro rasuul faracooda.',
      },
    },
  ],
  quranReferences: [
    '2:124–129',
    '6:74–83',
    '14:35–41',
    '19:41–50',
    '21:51–73',
    '26:69–89',
    '37:83–113',
  ],
  learnQuestions: [
    {
      id: 'ibrahim-learn-1',
      type: 'multiple_choice',
      prompt: {
        en: 'What did Ibrahim عليه السلام tell his people to leave?',
        so: 'Maxuu Ibraahim عليه السلام ku yiri dadkiisa inay ka tagaan?',
      },
      choices: [
        choice('idols', 'Idols that cannot hear or help', 'Sanamyo aan maqli karin ama caawin karin'),
        choice('prayer', 'Prayer to Allah', 'Salaadda Alle'),
        choice('parents', 'Kindness to parents', 'U naxariis waalidka'),
      ],
      correctChoiceId: 'idols',
      explanation: {
        en: 'He called them to leave idols and worship Allah alone.',
        so: 'Wuxuu ugu yeedhay inay ka tagaan sanamyada oo ay Alle keliya caabudaan.',
      },
    },
    {
      id: 'ibrahim-learn-2',
      type: 'multiple_choice',
      prompt: {
        en: 'What did Allah say to the fire?',
        so: 'Maxaa Alle ku yiri dabka?',
      },
      choices: [
        choice('cool', 'Be cool and safe for Ibrahim', 'Noqo qabow iyo nabad Ibraahim'),
        choice('hot', 'Burn hotter', 'Ka sii kululow'),
        choice('rain', 'Become rain', 'Noqo roob'),
      ],
      correctChoiceId: 'cool',
      explanation: {
        en: 'Allah made the fire cool and safe for Ibrahim عليه السلام.',
        so: 'Alle wuxuu dabka ka dhigay qabow iyo nabad Ibraahim عليه السلام.',
      },
    },
    {
      id: 'ibrahim-learn-3',
      type: 'true_false',
      prompt: {
        en: 'Ibrahim عليه السلام and Ismail عليه السلام raised the foundations of the Sacred House.',
        so: 'Ibraahim عليه السلام iyo Ismaaciil عليه السلام way dhiseen aasaaska Guriga xurmada leh.',
      },
      choices: TRUE_FALSE_CHOICES,
      correctChoiceId: 'true',
      explanation: {
        en: 'The Qur’an says they raised the foundations of the House.',
        so: 'Quraanku wuxuu yiri way dhiseen aasaaska Guriga.',
      },
    },
    {
      id: 'ibrahim-learn-4',
      type: 'multiple_choice',
      prompt: {
        en: 'What did they ask Allah when they built the House?',
        so: 'Maxay Alle weydiisteen markay Guriga dhisayeen?',
      },
      choices: [
        choice('accept', 'To accept their work and send a messenger from their descendants', 'Inuu aqbalo shaqadooda oo uu rasuul ka soo diro faracooda'),
        choice('gold', 'To fill the House with gold', 'Inuu Guriga dahab ka buuxiyo'),
        choice('army', 'To give them an army', 'Inuu ciidan siiyo'),
      ],
      correctChoiceId: 'accept',
      explanation: {
        en: 'They asked Allah to accept, and to send a messenger from their offspring.',
        so: 'Waxay Alle weydiisteen inuu aqbalo, oo uu rasuul ka soo diro faracooda.',
      },
    },
    {
      id: 'ibrahim-learn-5',
      type: 'multiple_choice',
      prompt: {
        en: 'What can we learn from Ibrahim عليه السلام?',
        so: 'Maxaan ka baran karnaa Ibraahim عليه السلام?',
      },
      choices: [
        choice('tawhid', 'Worship Allah alone and trust Him', 'Alle keliya caabud oo isaga tawakkal'),
        choice('idols', 'Ask idols for help', 'Sanamyada caawimaad weydii'),
        choice('fear-people', 'Fear people more than Allah', 'Dadka ka cabsada Alle ka badan'),
      ],
      correctChoiceId: 'tawhid',
      explanation: {
        en: 'He turned to Allah alone. Allah saved him and honoured him.',
        so: 'Alle keliya ayuu u jeestay. Alle wuu badbaadiyay wuuna sharafeeyay.',
      },
    },
  ],
  gameQuestions: [
    {
      id: 'ibrahim-game-order',
      type: 'ordering',
      prompt: {
        en: 'What happened first? Put the events in order.',
        so: 'Maxaa marka hore dhacay? Dhacdooyinka si nidaam ah u dhig.',
      },
      orderItems: [
        choice('call', 'Ibrahim called people away from idols', 'Ibraahim wuxuu dadka uga yeedhay sanamyada'),
        choice('fire', 'They tried to burn him; Allah made the fire cool', 'Waxay isku dayeen inay gubaan; Alle dabka wuu qaboojiyay'),
        choice('sons', 'Allah gave him good news of sons', 'Alle wuxuu u bishaareeyay wiilal'),
        choice('house', 'He and Ismail raised the House', 'Isaga iyo Ismaaciil way dhiseen Guriga'),
      ],
      explanation: {
        en: 'He called them, Allah saved him from the fire, sons were given, then the House was raised.',
        so: 'Wuu yeedhay, Alle dabka ka badbaadiyay, wiilal ayaa la siiyay, Gurigana waa la dhisay.',
      },
    },
    rememberProphetQuestion(
      'ibrahim-game-remember',
      'ibrahim',
      [
        choice('ibrahim', 'Ibrahim عليه السلام', 'Ibraahim عليه السلام'),
        choice('nuh', 'Nuh عليه السلام', 'Nuux عليه السلام'),
        choice('yunus', 'Yunus عليه السلام', 'Yuunas عليه السلام'),
      ],
      { en: 'Ibrahim عليه السلام', so: 'Ibraahim عليه السلام' },
    ),
    {
      id: 'ibrahim-game-tf',
      type: 'true_false',
      prompt: {
        en: 'The idols of Ibrahim’s people could not hear or help.',
        so: 'Sanamyada dadka Ibraahim ma maqli karin mana caawin karin.',
      },
      choices: TRUE_FALSE_CHOICES,
      correctChoiceId: 'true',
      explanation: {
        en: 'He showed them that idols cannot benefit or harm.',
        so: 'Wuxuu tusay in sanamyadu aanay anfacayn ama dhaawicin.',
      },
    },
    {
      id: 'ibrahim-game-match',
      type: 'match',
      prompt: {
        en: 'Match the lesson: Allah saved Ibrahim from the fire to teach us…',
        so: 'Casharka la xiriir: Alle wuxuu Ibraahim dabka uga badbaadiyay inuu ina baro…',
      },
      choices: [
        choice('trust', 'To trust Allah when people are angry', 'In Alle la tawakkalo marka dadku cadhoodaan'),
        choice('idols', 'To fear idols', 'In sanamyada laga cabsado'),
        choice('hide', 'To hide the truth always', 'In runta mar walba la qariyo'),
      ],
      correctChoiceId: 'trust',
      explanation: {
        en: 'Allah protected him. Trust Allah more than people.',
        so: 'Alle wuu ilaaliyay. Alle ku tawakkal dadka ka badan.',
      },
    },
    {
      id: 'ibrahim-game-friend',
      type: 'multiple_choice',
      prompt: {
        en: 'Ibrahim عليه السلام is called…',
        so: 'Ibraahim عليه السلام waxaa loogu yeedhaa…',
      },
      choices: [
        choice('friend', 'The close friend of Allah', 'Saaxiibka Alle'),
        choice('king', 'The king of the fire', 'Boqorka dabka'),
        choice('idol', 'The keeper of idols', 'Ilaaliyaha sanamyada'),
      ],
      correctChoiceId: 'friend',
      explanation: {
        en: 'The Qur’an says Allah took Ibrahim as a close friend.',
        so: 'Quraanku wuxuu yiri Alle wuxuu Ibraahim ka dhigtay saaxiib.',
      },
    },
  ],
});

export const LUT_STORY: QisasStory = createQisasStory({
  id: 'qisas-story-007',
  prophetKey: 'lut',
  title: {
    en: 'The Story of Prophet Lut عليه السلام',
    so: 'Qisadii Nebi Luud عليه السلام',
  },
  prophetName: { en: 'Lut عليه السلام', so: 'Luud عليه السلام' },
  summary: {
    en: 'Lut عليه السلام called his people to purity and to fear Allah. They refused. Allah saved Lut and his family, except his wife who stayed behind.',
    so: 'Luud عليه السلام wuxuu dadkiisa ugu yeedhay daahirnimo iyo cabsida Alle. Way diideen. Alle wuxuu badbaadiyay Luud iyo reerkiisa, marka laga reebo xaaskiisii ka dambaysay.',
  },
  chapters: [
    {
      id: 'lut-call',
      title: { en: 'A call to purity', so: 'Yeeritaan daahirnimo' },
      body: {
        en: 'Allah sent Prophet Lut عليه السلام to his people. They did shameful things that Allah forbade. Lut told them to fear Allah and to keep themselves pure. They became angry at him.',
        so: 'Alle wuxuu u diray Nebi Luud عليه السلام dadkiisa. Waxay sameeyeen waxyaabo ceeb ah oo Alle reebay. Luud wuxuu ku yiri Alle ka cabsada oo isdaahiriya. Way ku cadhoodeen.',
      },
    },
    {
      id: 'lut-guests',
      title: { en: 'The guests', so: 'Martida' },
      body: {
        en: 'Messengers of Allah came to Lut عليه السلام as guests. His people rushed toward the guests in a wrong way. Lut felt distressed. The messengers told him not to fear: they were sent to save him and to punish the wrongdoers.',
        so: 'Malaa’ig Alle ayaa u yimid Luud عليه السلام sidii marti. Dadkiisu si khaldan ayay ugu soo yaaceen martida. Luud wuu murugooday. Malaa’igtu waxay ku yiraahdeen ha cabsan: waxaa loo soo diray in la badbaadiyo isaga lana ciqaabo xumaan-falayaasha.',
      },
    },
    {
      id: 'lut-saved',
      title: { en: 'Allah saved Lut', so: 'Alle wuxuu badbaadiyay Luud' },
      body: {
        en: 'Allah told Lut عليه السلام to leave at night with his family, and not to look back. His wife stayed behind and was among those who were destroyed. Allah saved Lut and the believers with him. Purity and obedience protect a person; shameful sin destroys a people who refuse to stop.',
        so: 'Alle wuxuu Luud عليه السلام ku yiri inuu habeennimo la baxo reerkiisa, hana eegin dhabarka. Xaaskiisu way ka dambaysay, waxayna ka mid noqotay kuwa la halaagay. Alle wuxuu badbaadiyay Luud iyo rumaystayaashii la jiray. Daahirnimadu qofka way difaacdaa; dembiga ceebta lehna wuxuu halaagaa qawm diida inuu joojiyo.',
      },
    },
  ],
  quranReferences: ['7:80–84', '11:77–83', '15:57–77', '26:160–175', '27:54–58', '66:10'],
  learnQuestions: [
    {
      id: 'lut-learn-1',
      type: 'multiple_choice',
      prompt: {
        en: 'What did Lut عليه السلام call his people to?',
        so: 'Maxuu Luud عليه السلام ugu yeedhay dadkiisa?',
      },
      choices: [
        choice('pure', 'To fear Allah and keep themselves pure', 'Inay Alle ka cabsadaan oo isdaahiriyaan'),
        choice('idols', 'To make more idols', 'Inay sanamyo badan sameeyaan'),
        choice('ark', 'To build an ark', 'Inay doon dhisaan'),
      ],
      correctChoiceId: 'pure',
      explanation: {
        en: 'He called them to purity and to fear Allah.',
        so: 'Wuxuu ugu yeedhay daahirnimo iyo cabsida Alle.',
      },
    },
    {
      id: 'lut-learn-2',
      type: 'true_false',
      prompt: {
        en: 'Lut’s people listened and stopped the shameful things.',
        so: 'Dadka Luud way dhegeysteen wayna joojiyeen waxyaabihii ceebta ahaa.',
      },
      choices: TRUE_FALSE_CHOICES,
      correctChoiceId: 'false',
      explanation: {
        en: 'They refused and became angry at their prophet.',
        so: 'Way diideen, nebiga na way ku cadhoodeen.',
      },
    },
    {
      id: 'lut-learn-3',
      type: 'multiple_choice',
      prompt: {
        en: 'Who came to Lut عليه السلام as guests?',
        so: 'Yaa u yimid Luud عليه السلام sidii marti?',
      },
      choices: [
        choice('messengers', 'Messengers of Allah', 'Malaa’ig / farriimaha Alle'),
        choice('kings', 'Kings of Egypt', 'Boqorrada Masar'),
        choice('traders', 'Traders looking for gold', 'Ganacsatada dahabka'),
      ],
      correctChoiceId: 'messengers',
      explanation: {
        en: 'Allah’s messengers came as guests to save Lut and to punish the wrongdoers.',
        so: 'Malaa’igtii Alle ayaa marti u yimid si Loox loo badbaadiyo xumaan-falayaashana loo ciqaabo.',
      },
    },
    {
      id: 'lut-learn-4',
      type: 'multiple_choice',
      prompt: {
        en: 'Who was not saved with Lut عليه السلام?',
        so: 'Yaase aan la badbaadin Luud عليه السلام?',
      },
      choices: [
        choice('wife', 'His wife, who stayed behind', 'Xaaskiisii ka dambaysay'),
        choice('all-family', 'All of his family were left behind', 'Dhammaan reerkiisa waa laga tegey'),
        choice('guests', 'The guests', 'Martida'),
      ],
      correctChoiceId: 'wife',
      explanation: {
        en: 'His wife stayed behind and was among those who were destroyed.',
        so: 'Xaaskiisu way ka dambaysay, waxayna ka mid noqotay kuwa la halaagay.',
      },
    },
    {
      id: 'lut-learn-5',
      type: 'multiple_choice',
      prompt: {
        en: 'What can we learn from this story?',
        so: 'Maxaan ka baran karnaa sheekadan?',
      },
      choices: [
        choice('obey', 'Obey Allah and stay away from shameful sin', 'Adeec Alle oo ka fogaansho dembiga ceebta leh'),
        choice('copy', 'Copy whatever a town does', 'Ku dayso wax kasta oo magaaladu sameyso'),
        choice('mock', 'Mock guests', 'Ku jeesjees martida'),
      ],
      correctChoiceId: 'obey',
      explanation: {
        en: 'Allah saved those who obeyed and destroyed those who refused to stop.',
        so: 'Alle wuxuu badbaadiyay kuwii adeecay, wuxuuna halaagay kuwii diiday inay joojiyaan.',
      },
    },
  ],
  gameQuestions: [
    {
      id: 'lut-game-order',
      type: 'ordering',
      prompt: {
        en: 'What happened first? Put the events in order.',
        so: 'Maxaa marka hore dhacay? Dhacdooyinka si nidaam ah u dhig.',
      },
      orderItems: [
        choice('call', 'Lut called his people to purity', 'Luud wuxuu dadkiisa ugu yeedhay daahirnimo'),
        choice('refuse', 'They refused', 'Way diideen'),
        choice('guests', 'Allah’s messengers came as guests', 'Malaa’igtii Alle ayaa marti u yimid'),
        choice('saved', 'Allah saved Lut; his wife stayed behind', 'Alle wuxuu badbaadiyay Luud; xaaskiisu way ka dambaysay'),
      ],
      explanation: {
        en: 'He called them, they refused, the guests came, then Allah saved Lut.',
        so: 'Wuu yeedhay, way diideen, martidu timid, Alle na Luud wuu badbaadiyay.',
      },
    },
    rememberProphetQuestion(
      'lut-game-remember',
      'lut',
      [
        choice('lut', 'Lut عليه السلام', 'Luud عليه السلام'),
        choice('shuayb', 'Shu‘ayb عليه السلام', 'Shucayb عليه السلام'),
        choice('idris', 'Idris عليه السلام', 'Idriis عليه السلام'),
      ],
      { en: 'Lut عليه السلام', so: 'Luud عليه السلام' },
    ),
    {
      id: 'lut-game-tf',
      type: 'true_false',
      prompt: {
        en: 'Allah told Lut عليه السلام to leave at night with his family.',
        so: 'Alle wuxuu Luud عليه السلام ku yiri inuu habeennimo la baxo reerkiisa.',
      },
      choices: TRUE_FALSE_CHOICES,
      correctChoiceId: 'true',
      explanation: {
        en: 'He was told to leave by night and not to look back.',
        so: 'Waxaa loo sheegay inuu habeennimo baxo hana eegin dhabarka.',
      },
    },
    {
      id: 'lut-game-match',
      type: 'match',
      prompt: {
        en: 'Match the lesson: this story teaches…',
        so: 'Casharka la xiriir: sheekadani waxay baraysaa…',
      },
      choices: [
        choice('pure', 'To stay pure and obey Allah', 'In la daahiriyo oo Alle la adeeco'),
        choice('follow-crowd', 'To follow a crowd even in sin', 'In dad badan la raaco xitaa dembiga'),
        choice('harm-guests', 'To harm guests', 'In martida la dhaawaco'),
      ],
      correctChoiceId: 'pure',
      explanation: {
        en: 'Lut called to purity. Those who refused were destroyed.',
        so: 'Luud wuxuu ugu yeedhay daahirnimo. Kuwa diiday waa la halaagay.',
      },
    },
    {
      id: 'lut-game-who-saved',
      type: 'multiple_choice',
      prompt: {
        en: 'Who was saved with Lut عليه السلام?',
        so: 'Yaase lala badbaadiyay Luud عليه السلام?',
      },
      choices: [
        choice('believers', 'His family who left with him, except his wife', 'Reerkii la baxay, marka laga reebo xaaskiisa'),
        choice('whole-town', 'The whole town', 'Magaalada oo dhan'),
        choice('no-one', 'No one', 'Cidna'),
      ],
      correctChoiceId: 'believers',
      explanation: {
        en: 'Allah saved Lut and those who left with him, except his wife.',
        so: 'Alle wuxuu badbaadiyay Luud iyo kuwii la baxay, marka laga reebo xaaskiisa.',
      },
    },
  ],
});

export const ISMAIL_STORY: QisasStory = createQisasStory({
  id: 'qisas-story-008',
  prophetKey: 'ismail',
  title: {
    en: 'The Story of Prophet Ismail عليه السلام',
    so: 'Qisadii Nebi Ismaaciil عليه السلام',
  },
  prophetName: { en: 'Ismail عليه السلام', so: 'Ismaaciil عليه السلام' },
  summary: {
    en: 'Ismail عليه السلام was truthful to his promise and patient. He helped Ibrahim raise the House. He submitted when Allah tested Ibrahim with sacrifice, and Allah ransomed him.',
    so: 'Ismaaciil عليه السلام wuxuu ahaa mid ballankiisa oofiya oo samir leh. Wuxuu Ibraahim ka caawiyay dhismaha Guriga. Wuu isdhiibay markii Alle Ibraahim ku imtixaamay allabari, Alle na wuu soo furay.',
  },
  chapters: [
    {
      id: 'ismail-character',
      title: { en: 'True to his promise', so: 'Ballankiisa oofiya' },
      body: {
        en: 'Allah mentioned Prophet Ismail عليه السلام as a messenger and a prophet. He was true to his promise, and he told his family to pray and to give zakah. He was pleasing to his Lord.',
        so: 'Alle wuxuu xusay Nebi Ismaaciil عليه السلام inuu ahaa rasuul iyo nebi. Wuxuu ahaa mid ballankiisa oofiya, wuxuuna reerkiisa ku amri jiray salaadda iyo zakada. Wuxuu ka raalli ahaa Rabbihiisa.',
      },
    },
    {
      id: 'ismail-house',
      title: { en: 'The House with Ibrahim', so: 'Guriga Ibraahim' },
      body: {
        en: 'Ibrahim عليه السلام left part of his family at the uncultivated valley by Allah’s Sacred House. Later, Ibrahim and Ismail raised the foundations of the House and asked Allah to accept their work.',
        so: 'Ibraahim عليه السلام wuxuu qayb ka mid ah reerkiisa uga tegey dooxada aan la beerin ee agteeda Guriga Alle. Kadib, Ibraahim iyo Ismaaciil way dhiseen aasaaska Guriga, waxayna Alle weydiisteen inuu aqbalo.',
      },
    },
    {
      id: 'ismail-sacrifice',
      title: { en: 'He submitted to Allah', so: 'Wuu u hogaansamay Alle' },
      body: {
        en: 'Ibrahim عليه السلام saw in a dream that he should sacrifice his son. He told his son. The son said: do what you are commanded; you will find me, if Allah wills, among the patient. When they had both submitted, Allah called out that the dream was fulfilled, and He ransomed the son with a great sacrifice. After this, Allah gave Ibrahim good news of Ishaq عليه السلام.',
        so: 'Ibraahim عليه السلام wuxuu ku arkay riyo inuu wiilkiisa allabari u bixiyo. Wuxuu u sheegay wiilka. Wiilku wuxuu yiri: samee wixii lagugu amray; waxaad iga heli doontaa, haddii Alle idmo, kuwa samra. Markay labadooduba isdhiibeen, Alle wuxuu ku dhawaaqay in riyadii la oofiyay, wuuna ku soo furtay allabari weyn. Kadib Alle wuxuu Ibraahim u bishaareeyay Isxaaq عليه السلام.',
      },
    },
  ],
  quranReferences: ['2:125–129', '14:37', '19:54–55', '37:100–113'],
  learnQuestions: [
    {
      id: 'ismail-learn-1',
      type: 'multiple_choice',
      prompt: {
        en: 'How does the Qur’an describe Ismail عليه السلام?',
        so: 'Sidee Quraanku u tilmaamay Ismaaciil عليه السلام?',
      },
      choices: [
        choice('promise', 'True to his promise, and he told his family to pray', 'Ballankiisa oofiya, reerkiisana wuxuu ku amri jiray salaadda'),
        choice('angry', 'Always angry', 'Had iyo jeer cadhaysan'),
        choice('silent', 'He never spoke to his family', 'Waligiis reerkiisa lama hadlin'),
      ],
      correctChoiceId: 'promise',
      explanation: {
        en: 'He was true to his promise and commanded his family with prayer and zakah.',
        so: 'Wuxuu ahaa mid ballankiisa oofiya, reerkiisana wuxuu ku amri jiray salaadda iyo zakada.',
      },
    },
    {
      id: 'ismail-learn-2',
      type: 'true_false',
      prompt: {
        en: 'Ismail عليه السلام helped Ibrahim raise the foundations of the House.',
        so: 'Ismaaciil عليه السلام wuxuu Ibraahim ka caawiyay dhismaha aasaaska Guriga.',
      },
      choices: TRUE_FALSE_CHOICES,
      correctChoiceId: 'true',
      explanation: {
        en: 'They raised the foundations together and asked Allah to accept.',
        so: 'Wadajir bay dhiseen aasaaska, Alle na way weydiisteen inuu aqbalo.',
      },
    },
    {
      id: 'ismail-learn-3',
      type: 'multiple_choice',
      prompt: {
        en: 'What did the son say when Ibrahim told him the dream?',
        so: 'Maxuu wiilku yiri markii Ibraahim riyada u sheegay?',
      },
      choices: [
        choice('patient', 'Do what you are commanded; you will find me among the patient', 'Samee wixii lagugu amray; waxaad iga heli doontaa kuwa samra'),
        choice('run', 'I will run away', 'Waan carari'),
        choice('idols', 'Ask an idol instead', 'Sanam weydii'),
      ],
      correctChoiceId: 'patient',
      explanation: {
        en: 'The son submitted and said he would be patient, if Allah willed.',
        so: 'Wiilku wuu isdhiibay wuxuuna yiri wuu samri, haddii Alle idmo.',
      },
    },
    {
      id: 'ismail-learn-4',
      type: 'multiple_choice',
      prompt: {
        en: 'What did Allah do when they both submitted?',
        so: 'Maxaa Alle sameeyay markay labadooduba isdhiibeen?',
      },
      choices: [
        choice('ransom', 'He ransomed the son with a great sacrifice', 'Wuxuu ku soo furtay allabari weyn'),
        choice('leave', 'He left them without a word', 'Wuxuu uga tegey eray la’aan'),
        choice('anger', 'He was angry that they obeyed', 'Wuu cadhooday inay adeeceen'),
      ],
      correctChoiceId: 'ransom',
      explanation: {
        en: 'Allah fulfilled the dream and ransomed him with a great sacrifice.',
        so: 'Alle wuxuu riyadii oofiyay wuuna ku soo furtay allabari weyn.',
      },
    },
    {
      id: 'ismail-learn-5',
      type: 'multiple_choice',
      prompt: {
        en: 'What can we learn from Ismail عليه السلام?',
        so: 'Maxaan ka baran karnaa Ismaaciil عليه السلام?',
      },
      choices: [
        choice('submit', 'Keep promises and submit to Allah with patience', 'Oofi ballan oo Alle ugu hogaansan samir'),
        choice('break', 'Break promises when a test comes', 'Jebi ballanka marka imtixaan yimaado'),
        choice('refuse', 'Refuse a parent who calls to Allah', 'Diid waalidka Alle ugu yeedha'),
      ],
      correctChoiceId: 'submit',
      explanation: {
        en: 'He kept his promise and was patient when Allah tested them.',
        so: 'Wuu oofiyay ballankiisa wuuna samray markii Alle imtixaamay.',
      },
    },
  ],
  gameQuestions: [
    {
      id: 'ismail-game-order',
      type: 'ordering',
      prompt: {
        en: 'What happened first? Put the events in order.',
        so: 'Maxaa marka hore dhacay? Dhacdooyinka si nidaam ah u dhig.',
      },
      orderItems: [
        choice('promise', 'Ismail was true to his promise', 'Ismaaciil wuxuu ahaa mid ballankiisa oofiya'),
        choice('house', 'He helped raise the House', 'Wuxuu ka caawiyay dhismaha Guriga'),
        choice('dream', 'Ibrahim told him the dream of sacrifice', 'Ibraahim wuxuu u sheegay riyadii allabariga'),
        choice('ransom', 'Allah ransomed him with a great sacrifice', 'Alle wuxuu ku soo furtay allabari weyn'),
      ],
      explanation: {
        en: 'He was truthful, he helped with the House, he submitted, then Allah ransomed him.',
        so: 'Wuxuu ahaa run, Guriga wuu caawiyay, wuu isdhiibay, Alle na wuu soo furay.',
      },
    },
    rememberProphetQuestion(
      'ismail-game-remember',
      'ismail',
      [
        choice('ismail', 'Ismail عليه السلام', 'Ismaaciil عليه السلام'),
        choice('yunus', 'Yunus عليه السلام', 'Yuunas عليه السلام'),
        choice('harun', 'Harun عليه السلام', 'Haaruun عليه السلام'),
      ],
      { en: 'Ismail عليه السلام', so: 'Ismaaciil عليه السلام' },
    ),
    {
      id: 'ismail-game-tf',
      type: 'true_false',
      prompt: {
        en: 'The son argued and refused the command.',
        so: 'Wiilku wuu murmay wuuna diiday amarka.',
      },
      choices: TRUE_FALSE_CHOICES,
      correctChoiceId: 'false',
      explanation: {
        en: 'He said: do what you are commanded; you will find me among the patient.',
        so: 'Wuxuu yiri: samee wixii lagugu amray; waxaad iga heli doontaa kuwa samra.',
      },
    },
    {
      id: 'ismail-game-match',
      type: 'match',
      prompt: {
        en: 'Match the lesson: Ismail عليه السلام teaches…',
        so: 'Casharka la xiriir: Ismaaciil عليه السلام wuxuu barayaa…',
      },
      choices: [
        choice('patience', 'Patience and keeping a promise', 'Samir iyo oofinta ballanka'),
        choice('pride', 'Pride over family', 'Kibri qoyska'),
        choice('idols', 'Asking idols for help', 'Sanamyada caawimaad weydiinta'),
      ],
      correctChoiceId: 'patience',
      explanation: {
        en: 'He was truthful and patient when Allah tested them.',
        so: 'Wuxuu ahaa run iyo samir markii Alle imtixaamay.',
      },
    },
    {
      id: 'ismail-game-family',
      type: 'multiple_choice',
      prompt: {
        en: 'What did Ismail عليه السلام tell his family to do?',
        so: 'Maxuu Ismaaciil عليه السلام ku amri jiray reerkiisa?',
      },
      choices: [
        choice('pray', 'To pray and give zakah', 'Inay tukadaan oo ay zakada bixiyaan'),
        choice('idols', 'To serve idols', 'Inay sanamyada u adeegaan'),
        choice('sleep', 'To sleep through the day', 'Inay maalinta oo dhan seexdaan'),
      ],
      correctChoiceId: 'pray',
      explanation: {
        en: 'He used to tell his family to pray and to give zakah.',
        so: 'Wuxuu reerkiisa ku amri jiray salaadda iyo zakada.',
      },
    },
  ],
});

export const ISHAQ_STORY: QisasStory = createQisasStory({
  id: 'qisas-story-009',
  prophetKey: 'ishaq',
  title: {
    en: 'The Story of Prophet Ishaq عليه السلام',
    so: 'Qisadii Nebi Isxaaq عليه السلام',
  },
  prophetName: { en: 'Ishaq عليه السلام', so: 'Isxaaq عليه السلام' },
  summary: {
    en: 'Allah gave Ibrahim and his wife good news of Ishaq عليه السلام in old age. Ishaq was a prophet, and from him came Yaqub عليه السلام.',
    so: 'Alle wuxuu Ibraahim iyo xaaskiisa ugu bishaareeyay Isxaaq عليه السلام da’weyn. Isxaaq wuxuu ahaa nebi, waxaana ka dhashay Yacquub عليه السلام.',
  },
  chapters: [
    {
      id: 'ishaq-news',
      title: { en: 'Good news in old age', so: 'Bishaaro da’da weyn' },
      body: {
        en: 'Messengers of Allah came to Ibrahim عليه السلام with good news. They gave him and his wife good news of a son, Ishaq عليه السلام, and after Ishaq, of Yaqub عليه السلام. His wife was amazed, because they were old. Allah said: do you wonder at the command of Allah?',
        so: 'Malaa’ig Alle ayaa Ibraahim عليه السلام ugu timid bishaaro. Waxay isaga iyo xaaskiisa ugu bishaareeyeen wiil, Isxaaq عليه السلام, iyo Isxaaq kadib Yacquub عليه السلام. Xaaskiisu way yaabtay, maxaa yeelay way da’ weynaayeen. Alle wuxuu yiri: ma ka yaabaysaan amarka Alle?',
      },
    },
    {
      id: 'ishaq-prophet',
      title: { en: 'A prophet from a blessed line', so: 'Nebi farac barako leh' },
      body: {
        en: 'Allah made Ishaq عليه السلام a prophet. Allah blessed him and his father. From Ishaq came Yaqub عليه السلام. This family worshipped Allah alone.',
        so: 'Alle wuxuu Isxaaq عليه السلام ka dhigay nebi. Alle wuu barakeeyay isaga iyo aabbihiis. Isxaaq waxaa ka dhashay Yacquub عليه السلام. Qoyskani Alle keliya ayay caabudi jireen.',
      },
    },
    {
      id: 'ishaq-lesson',
      title: { en: 'What we learn', so: 'Waxa aan baranno' },
      body: {
        en: 'Allah gives gifts when He wills, even when people think it is too late. We thank Allah for children and for guidance. We do not invent extra stories beyond what Allah told.',
        so: 'Alle wuxuu siiyaa hadiyad markuu doono, xitaa marka dadku moodaan in wakhtigu dhaafay. Alle ayaan ugu mahadnaqnaa carruurta iyo hanuunka. Kama abuuridno sheekooyin ka baxsan wixii Alle sheegay.',
      },
    },
  ],
  quranReferences: ['2:133', '11:69–73', '19:49–50', '21:72–73', '37:112–113'],
  learnQuestions: [
    {
      id: 'ishaq-learn-1',
      type: 'multiple_choice',
      prompt: {
        en: 'Who received good news of Ishaq عليه السلام?',
        so: 'Yaa helay bishaaradii Isxaaq عليه السلام?',
      },
      choices: [
        choice('ibrahim', 'Ibrahim عليه السلام and his wife', 'Ibraahim عليه السلام iyo xaaskiisa'),
        choice('nuh', 'Nuh عليه السلام only', 'Nuux عليه السلام keliya'),
        choice('pharaoh', 'Pharaoh', 'Fircoon'),
      ],
      correctChoiceId: 'ibrahim',
      explanation: {
        en: 'The guests gave Ibrahim and his wife good news of Ishaq.',
        so: 'Martidu waxay Ibraahim iyo xaaskiisa ugu bishaareeyeen Isxaaq.',
      },
    },
    {
      id: 'ishaq-learn-2',
      type: 'true_false',
      prompt: {
        en: 'Ibrahim and his wife were already young when they heard the news.',
        so: 'Ibraahim iyo xaaskiisu way dhallinyaraayeen markay bishaarada maqleen.',
      },
      choices: TRUE_FALSE_CHOICES,
      correctChoiceId: 'false',
      explanation: {
        en: 'They were old. His wife was amazed. Allah’s command is not hard for Him.',
        so: 'Way da’ weynaayeen. Xaaskiisu way yaabtay. Amarka Alle kuma adka isaga.',
      },
    },
    {
      id: 'ishaq-learn-3',
      type: 'multiple_choice',
      prompt: {
        en: 'Which prophet came from Ishaq عليه السلام?',
        so: 'Nebikee baa ka dhashay Isxaaq عليه السلام?',
      },
      choices: [
        choice('yaqub', 'Yaqub عليه السلام', 'Yacquub عليه السلام'),
        choice('hud', 'Hud عليه السلام', 'Huud عليه السلام'),
        choice('yunus', 'Yunus عليه السلام', 'Yuunas عليه السلام'),
      ],
      correctChoiceId: 'yaqub',
      explanation: {
        en: 'Allah gave good news of Ishaq, and after Ishaq, of Yaqub.',
        so: 'Alle wuxuu u bishaareeyay Isxaaq, iyo Isxaaq kadib Yacquub.',
      },
    },
    {
      id: 'ishaq-learn-4',
      type: 'multiple_choice',
      prompt: {
        en: 'Was Ishaq عليه السلام a prophet?',
        so: 'Isxaaq عليه السلام ma nebi baa ahaa?',
      },
      choices: [
        choice('yes', 'Yes. Allah made him a prophet.', 'Haa. Alle wuxuu ka dhigay nebi.'),
        choice('no', 'No. He was only a king.', 'Maya. Wuxuu ahaa boqor keliya.'),
        choice('unknown', 'The Qur’an never mentioned him.', 'Quraanku waligiis ma xusin.'),
      ],
      correctChoiceId: 'yes',
      explanation: {
        en: 'Allah blessed him and made him a prophet.',
        so: 'Alle wuu barakeeyay wuuna nebi ka dhigay.',
      },
    },
    {
      id: 'ishaq-learn-5',
      type: 'multiple_choice',
      prompt: {
        en: 'What can we learn from this story?',
        so: 'Maxaan ka baran karnaa sheekadan?',
      },
      choices: [
        choice('gift', 'Allah gives when He wills; thank Him', 'Alle wuxuu siiyaa markuu doono; u mahadnaq'),
        choice('late', 'It is too late for Allah to give', 'Alle siintiisu way daahday'),
        choice('idols', 'Gifts come from idols', 'Hadiyadaha sanamyada ka yimaadaan'),
      ],
      correctChoiceId: 'gift',
      explanation: {
        en: 'They were old, yet Allah gave them Ishaq. Nothing is hard for Allah.',
        so: 'Way da’ weynaayeen, haddana Alle wuxuu siiyay Isxaaq. Wax Alle ku adag ma jiraan.',
      },
    },
  ],
  gameQuestions: [
    {
      id: 'ishaq-game-order',
      type: 'ordering',
      prompt: {
        en: 'What happened first? Put the events in order.',
        so: 'Maxaa marka hore dhacay? Dhacdooyinka si nidaam ah u dhig.',
      },
      orderItems: [
        choice('guests', 'Messengers came to Ibrahim', 'Malaa’ig ayaa Ibraahim u timid'),
        choice('news', 'They gave good news of Ishaq', 'Waxay u bishaareeyeen Isxaaq'),
        choice('wonder', 'His wife wondered, because they were old', 'Xaaskiisu way yaabtay, waayo way da’ weynaayeen'),
        choice('yaqub', 'After Ishaq came Yaqub', 'Isxaaq kadib waxaa yimid Yacquub'),
      ],
      explanation: {
        en: 'The guests came, they announced Ishaq, his wife wondered, then Yaqub was promised after him.',
        so: 'Martidu timid, Isxaaq waa la bishaareeyay, xaaskiisu way yaabtay, Yacquubna waa la ballan qaaday.',
      },
    },
    rememberProphetQuestion(
      'ishaq-game-remember',
      'ishaq',
      [
        choice('ishaq', 'Ishaq عليه السلام', 'Isxaaq عليه السلام'),
        choice('hud', 'Hud عليه السلام', 'Huud عليه السلام'),
        choice('ayyub', 'Ayyub عليه السلام', 'Ayuub عليه السلام'),
      ],
      { en: 'Ishaq عليه السلام', so: 'Isxaaq عليه السلام' },
    ),
    {
      id: 'ishaq-game-tf',
      type: 'true_false',
      prompt: {
        en: 'Allah asked: do you wonder at the command of Allah?',
        so: 'Alle wuxuu yiri: ma ka yaabaysaan amarka Alle?',
      },
      choices: TRUE_FALSE_CHOICES,
      correctChoiceId: 'true',
      explanation: {
        en: 'Nothing Allah wills is strange for Him.',
        so: 'Wax Alle doono kuma yaab ahayn isaga.',
      },
    },
    {
      id: 'ishaq-game-match',
      type: 'match',
      prompt: {
        en: 'Match the lesson: this story teaches…',
        so: 'Casharka la xiriir: sheekadani waxay baraysaa…',
      },
      choices: [
        choice('thanks', 'To thank Allah for gifts He gives', 'In Alle loogu mahadnaqo hadiyadihiisa'),
        choice('despair', 'To despair when we are old', 'In la quusto marka da’ weyn la noqdo'),
        choice('idols', 'That idols give children', 'In sanamyadu carruur siiyaan'),
      ],
      correctChoiceId: 'thanks',
      explanation: {
        en: 'Ishaq was a gift from Allah. We thank Allah for His gifts.',
        so: 'Isxaaq wuxuu ahaa hadiyad Alle. Alle ayaan ugu mahadnaqnaa.',
      },
    },
    {
      id: 'ishaq-game-line',
      type: 'multiple_choice',
      prompt: {
        en: 'Ishaq عليه السلام is the son of…',
        so: 'Isxaaq عليه السلام waa wiilka…',
      },
      choices: [
        choice('ibrahim', 'Ibrahim عليه السلام', 'Ibraahim عليه السلام'),
        choice('nuh', 'Nuh عليه السلام', 'Nuux عليه السلام'),
        choice('musa', 'Musa عليه السلام', 'Muuse عليه السلام'),
      ],
      correctChoiceId: 'ibrahim',
      explanation: {
        en: 'Allah gave Ibrahim good news of Ishaq.',
        so: 'Alle wuxuu Ibraahim ugu bishaareeyay Isxaaq.',
      },
    },
  ],
});

export const YAQUB_STORY: QisasStory = createQisasStory({
  id: 'qisas-story-010',
  prophetKey: 'yaqub',
  title: {
    en: 'The Story of Prophet Yaqub عليه السلام',
    so: 'Qisadii Nebi Yacquub عليه السلام',
  },
  prophetName: { en: 'Yaqub عليه السلام', so: 'Yacquub عليه السلام' },
  summary: {
    en: 'Yaqub عليه السلام worshipped Allah alone and told his children to do the same. He was patient when he missed Yusuf عليه السلام, and he never stopped hoping in Allah.',
    so: 'Yacquub عليه السلام wuxuu caabudi jiray Alle keliya, wuxuuna carruurtiisa ku amray inay sidaas sameeyaan. Wuu samray markuu Yuusuf عليه السلام u xiisooday, waligiisna rajo kama quustin Alle.',
  },
  chapters: [
    {
      id: 'yaqub-tawhid',
      title: { en: 'Worship Allah alone', so: 'Alle keliya caabuda' },
      body: {
        en: 'Yaqub عليه السلام is also called Israel in the Qur’an. When death came to him, he asked his sons: what will you worship after me? They said: we will worship your God, and the God of your fathers Ibrahim, Ismail, and Ishaq — one God.',
        so: 'Yacquub عليه السلام Quraanka waxaa loogu yeedhaa sidoo kale Israa’iil. Markii geeridu u timid, wuxuu wiilashiisa weydiiyay: maxaad caabudi doontaan iga dib? Waxay yiraahdeen: waxaan caabudi doonnaa Ilaahaaga, iyo Ilaaha aabbayaashaaga Ibraahim, Ismaaciil, iyo Isxaaq — Ilaah keliya.',
      },
    },
    {
      id: 'yaqub-yusuf',
      title: { en: 'Patience for Yusuf', so: 'Samirka Yuusuf' },
      body: {
        en: 'Yaqub loved his son Yusuf عليه السلام. When Yusuf was taken, Yaqub was very sad, yet he said: I only complain of my grief to Allah. He told his sons not to despair of Allah’s mercy.',
        so: 'Yacquub wuxuu jeclaa wiilkiisa Yuusuf عليه السلام. Markii Yuusuf la qaatay, Yacquub aad buu u murugooday, haddana wuxuu yiri: murugdayda Alle keliya ayaan u cawdaa. Wuxuu wiilashiisa ku yiri ha ka quusanina naxariista Alle.',
      },
    },
    {
      id: 'yaqub-hope',
      title: { en: 'He never lost hope', so: 'Rajo kama lumin' },
      body: {
        en: 'Allah returned Yusuf to him. Yaqub’s eyes became white from grief, then Allah restored his sight. The story teaches us to worship one God, to be patient, and never to despair of Allah’s mercy.',
        so: 'Alle wuxuu Yuusuf ku soo celiyay. Indhaha Yacquub way caddaadeen murug darteed, kadib Alle wuu soo celiyay araggiisa. Sheekadu waxay ina bartaa inaan Ilaah keliya caabudno, aan samrino, hana ka quusanino naxariista Alle.',
      },
    },
  ],
  quranReferences: ['2:132–133', '12:4–18', '12:83–87', '12:93–98', '21:72–73'],
  learnQuestions: [
    {
      id: 'yaqub-learn-1',
      type: 'multiple_choice',
      prompt: {
        en: 'What did Yaqub عليه السلام ask his sons at the time of death?',
        so: 'Maxuu Yacquub عليه السلام wiilashiisa weydiiyay xilliga geerida?',
      },
      choices: [
        choice('worship', 'What will you worship after me?', 'Maxaad caabudi doontaan iga dib?'),
        choice('gold', 'Who will keep my gold?', 'Yaa dahabkayga ilaalinaya?'),
        choice('land', 'Who will take my land?', 'Yaa dhulkayga qaadanaya?'),
      ],
      correctChoiceId: 'worship',
      explanation: {
        en: 'He asked them what they would worship after him.',
        so: 'Wuxuu weydiiyay waxay caabudi doonaan isaga ka dib.',
      },
    },
    {
      id: 'yaqub-learn-2',
      type: 'multiple_choice',
      prompt: {
        en: 'What did his sons answer?',
        so: 'Maxay wiilashiisu ku jawaabeen?',
      },
      choices: [
        choice('one', 'We will worship one God — the God of Ibrahim, Ismail, and Ishaq', 'Waxaan caabudi doonnaa Ilaah keliya — Ilaaha Ibraahim, Ismaaciil, iyo Isxaaq'),
        choice('many', 'We will worship many gods', 'Waxaan caabudi doonnaa ilaahyo badan'),
        choice('none', 'We will worship no one', 'Cidna ma caabudi doonno'),
      ],
      correctChoiceId: 'one',
      explanation: {
        en: 'They promised to worship one God, the God of their fathers.',
        so: 'Waxay ballan qaadeen inay caabudaan Ilaah keliya, Ilaaha aabbayaashood.',
      },
    },
    {
      id: 'yaqub-learn-3',
      type: 'true_false',
      prompt: {
        en: 'Yaqub عليه السلام told his sons not to despair of Allah’s mercy.',
        so: 'Yacquub عليه السلام wuxuu wiilashiisa ku yiri ha ka quusanina naxariista Alle.',
      },
      choices: TRUE_FALSE_CHOICES,
      correctChoiceId: 'true',
      explanation: {
        en: 'He said no one despairs of Allah’s mercy except people who disbelieve.',
        so: 'Wuxuu yiri naxariista Alle kama quusto qof gaal ah mooyaane.',
      },
    },
    {
      id: 'yaqub-learn-4',
      type: 'multiple_choice',
      prompt: {
        en: 'To whom did Yaqub عليه السلام complain of his grief?',
        so: 'Yuu Yacquub عليه السلام uga cawday murugdiisa?',
      },
      choices: [
        choice('allah', 'Allah', 'Alle'),
        choice('idols', 'Idols', 'Sanamyada'),
        choice('king', 'The king of Egypt', 'Boqorka Masar'),
      ],
      correctChoiceId: 'allah',
      explanation: {
        en: 'He said: I only complain of my grief to Allah.',
        so: 'Wuxuu yiri: murugdayda Alle keliya ayaan u cawdaa.',
      },
    },
    {
      id: 'yaqub-learn-5',
      type: 'multiple_choice',
      prompt: {
        en: 'What can we learn from Yaqub عليه السلام?',
        so: 'Maxaan ka baran karnaa Yacquub عليه السلام?',
      },
      choices: [
        choice('hope', 'Worship one God, be patient, and do not despair', 'Ilaah keliya caabud, samir, hana quusan'),
        choice('despair', 'Despair when a child is missing', 'Quuso marka ilmo maqan yahay'),
        choice('many-gods', 'Worship the gods of every town', 'Caabud ilaahyada magaal kasta'),
      ],
      correctChoiceId: 'hope',
      explanation: {
        en: 'He kept tawhid, patience, and hope in Allah until Yusuf was returned.',
        so: 'Wuxuu haystay tawxiid, samir, iyo rajo Alle ilaa Yuusuf la soo celiyay.',
      },
    },
  ],
  gameQuestions: [
    {
      id: 'yaqub-game-order',
      type: 'ordering',
      prompt: {
        en: 'What happened first? Put the events in order.',
        so: 'Maxaa marka hore dhacay? Dhacdooyinka si nidaam ah u dhig.',
      },
      orderItems: [
        choice('tawhid', 'Yaqub taught his sons to worship one God', 'Yacquub wuxuu wiilashiisa baray inay Ilaah keliya caabudaan'),
        choice('missing', 'Yusuf was taken and Yaqub grieved', 'Yuusuf waa la qaatay Yacquubna wuu murugooday'),
        choice('hope', 'He told them not to despair of Allah’s mercy', 'Wuxuu ku yiri ha ka quusanina naxariista Alle'),
        choice('return', 'Allah returned Yusuf to him', 'Alle wuxuu Yuusuf ku soo celiyay'),
      ],
      explanation: {
        en: 'He taught tawhid, he was patient in grief, he hoped in Allah, then Yusuf returned.',
        so: 'Wuxuu baray tawxiid, wuu samray, Alle ayuu rajaynayay, Yuusufna waa soo noqday.',
      },
    },
    rememberProphetQuestion(
      'yaqub-game-remember',
      'yaqub',
      [
        choice('yaqub', 'Yaqub عليه السلام', 'Yacquub عليه السلام'),
        choice('hud', 'Hud عليه السلام', 'Huud عليه السلام'),
        choice('ilyas', 'Ilyas عليه السلام', 'Ilyaas عليه السلام'),
      ],
      { en: 'Yaqub عليه السلام', so: 'Yacquub عليه السلام' },
    ),
    {
      id: 'yaqub-game-tf',
      type: 'true_false',
      prompt: {
        en: 'Yaqub عليه السلام is also called Israel in the Qur’an.',
        so: 'Yacquub عليه السلام Quraanka waxaa loogu yeedhaa sidoo kale Israa’iil.',
      },
      choices: TRUE_FALSE_CHOICES,
      correctChoiceId: 'true',
      explanation: {
        en: 'The Qur’an uses the name Israel for Yaqub.',
        so: 'Quraanku magaca Israa’iil wuxuu u adeegsadaa Yacquub.',
      },
    },
    {
      id: 'yaqub-game-match',
      type: 'match',
      prompt: {
        en: 'Match the lesson: Yaqub عليه السلام teaches…',
        so: 'Casharka la xiriir: Yacquub عليه السلام wuxuu barayaa…',
      },
      choices: [
        choice('mercy', 'Never despair of Allah’s mercy', 'Ha ka quusanin naxariista Alle'),
        choice('complain-people', 'Complain only to people', 'Dadka keliya u cawod'),
        choice('many', 'Worship many gods if a town does', 'Caabud ilaahyo badan haddii magaaladu sidaas sameyso'),
      ],
      correctChoiceId: 'mercy',
      explanation: {
        en: 'He told his sons not to despair of Allah’s mercy.',
        so: 'Wuxuu wiilashiisa ku yiri ha ka quusanina naxariista Alle.',
      },
    },
    {
      id: 'yaqub-game-son',
      type: 'multiple_choice',
      prompt: {
        en: 'Which son did Yaqub عليه السلام miss with great patience?',
        so: 'Wiilkee buu Yacquub عليه السلام u xiisooday samir weyn?',
      },
      choices: [
        choice('yusuf', 'Yusuf عليه السلام', 'Yuusuf عليه السلام'),
        choice('musa', 'Musa عليه السلام', 'Muuse عليه السلام'),
        choice('isa', 'Isa عليه السلام', 'Ciisa عليه السلام'),
      ],
      correctChoiceId: 'yusuf',
      explanation: {
        en: 'He was patient until Allah returned Yusuf to him.',
        so: 'Wuu samray ilaa Alle Yuusuf ku soo celiyay.',
      },
    },
  ],
});

export const IBRAHIM_FAMILY_STORIES: QisasStory[] = [
  IBRAHIM_STORY,
  LUT_STORY,
  ISMAIL_STORY,
  ISHAQ_STORY,
  YAQUB_STORY,
];
