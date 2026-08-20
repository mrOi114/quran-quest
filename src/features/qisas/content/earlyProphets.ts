import { choice, createQisasStory, rememberProphetQuestion, TRUE_FALSE_CHOICES } from './storyFactory';
import type { QisasStory } from '../types';

export const IDRIS_STORY: QisasStory = createQisasStory({
  id: 'qisas-story-002',
  prophetKey: 'idris',
  title: {
    en: 'The Story of Prophet Idris عليه السلام',
    so: 'Qisadii Nebi Idriis عليه السلام',
  },
  prophetName: { en: 'Idris عليه السلام', so: 'Idriis عليه السلام' },
  summary: {
    en: 'Allah named Idris عليه السلام as a truthful prophet and raised him to a high place.',
    so: 'Alle wuxuu Idriis عليه السلام ugu magacaabay nebi run sheegaya, wuuna u qaaday meel sare.',
  },
  chapters: [
    {
      id: 'idris-truthful',
      title: { en: 'A truthful prophet', so: 'Nebi run sheegaya' },
      body: {
        en: 'Allah mentioned Prophet Idris عليه السلام in the Qur’an. Allah said he was a man of truth and a prophet. He called people to worship Allah.',
        so: 'Alle wuxuu Quraanka ku xusay Nebi Idriis عليه السلام. Alle wuxuu yiri wuxuu ahaa nin run ah iyo nebi. Wuxuu dadka ugu yeedhay inay caabudaan Alle.',
      },
    },
    {
      id: 'idris-raised',
      title: { en: 'Raised to a high place', so: 'Loo qaaday meel sare' },
      body: {
        en: 'Allah raised Idris عليه السلام to a high place. The Qur’an does not tell us every detail of his life. What we know is enough: he was truthful, and Allah honoured him.',
        so: 'Alle wuxuu Idriis عليه السلام u qaaday meel sare. Quraanku nolosha oo dhan nooma sheegin. Waxa aan ognahay waa ku filan yahay: wuxuu ahaa run sheege, Alle na wuu sharafeeyay.',
      },
    },
    {
      id: 'idris-lesson',
      title: { en: 'What we learn', so: 'Waxa aan baranno' },
      body: {
        en: 'This story teaches us to speak the truth and to follow the prophets Allah sent. We do not add extra stories that the Qur’an did not tell.',
        so: 'Sheekadani waxay ina bartaa inaan run sheegno oo aan raacno nebiyadii Alle soo diray. Kama darin sheekooyin dheeraad ah oo Quraanku sheegin.',
      },
    },
  ],
  quranReferences: ['19:56–57', '21:85'],
  learnQuestions: [
    {
      id: 'idris-learn-1',
      type: 'multiple_choice',
      prompt: {
        en: 'How does the Qur’an describe Idris عليه السلام?',
        so: 'Sidee Quraanku u tilmaamay Idriis عليه السلام?',
      },
      choices: [
        choice('truth', 'A man of truth and a prophet', 'Nin run ah iyo nebi'),
        choice('king', 'A king of Egypt', 'Boqor Masar ah'),
        choice('sailor', 'A sailor', 'Badmareen'),
      ],
      correctChoiceId: 'truth',
      explanation: {
        en: 'Allah said Idris عليه السلام was a man of truth and a prophet.',
        so: 'Alle wuxuu yiri Idriis عليه السلام wuxuu ahaa nin run ah iyo nebi.',
      },
    },
    {
      id: 'idris-learn-2',
      type: 'multiple_choice',
      prompt: {
        en: 'What honour did Allah give Idris عليه السلام?',
        so: 'Waa maxay sharafta Alle siiyay Idriis عليه السلام?',
      },
      choices: [
        choice('high', 'Allah raised him to a high place', 'Alle wuxuu u qaaday meel sare'),
        choice('ship', 'Allah gave him a ship', 'Alle wuxuu siiyay markab'),
        choice('palace', 'Allah built him a palace', 'Alle wuxuu u dhisay qasri'),
      ],
      correctChoiceId: 'high',
      explanation: {
        en: 'The Qur’an says Allah raised Idris عليه السلام to a high place.',
        so: 'Quraanku wuxuu yiri Alle wuxuu Idriis عليه السلام u qaaday meel sare.',
      },
    },
    {
      id: 'idris-learn-3',
      type: 'true_false',
      prompt: {
        en: 'The Qur’an tells every small detail of the life of Idris عليه السلام.',
        so: 'Quraanku wuxuu sheegay dhammaan faahfaahinta nolosha Idriis عليه السلام.',
      },
      choices: TRUE_FALSE_CHOICES,
      correctChoiceId: 'false',
      explanation: {
        en: 'The Qur’an tells us he was truthful and was raised high. Extra details are not in this story.',
        so: 'Quraanku wuxuu noo sheegay inuu run ahaa oo loo qaaday meel sare. Faahfaahin kale sheekadan kuma jirto.',
      },
    },
    {
      id: 'idris-learn-4',
      type: 'multiple_choice',
      prompt: {
        en: 'What can we learn from Idris عليه السلام?',
        so: 'Maxaan ka baran karnaa Idriis عليه السلام?',
      },
      choices: [
        choice('truth', 'To be truthful', 'Inaan run sheegno'),
        choice('joke', 'To invent extra stories', 'Inaan been abuurno'),
        choice('pride', 'To be proud', 'Inaan kibrino'),
      ],
      correctChoiceId: 'truth',
      explanation: {
        en: 'Idris عليه السلام was a man of truth. We should tell the truth too.',
        so: 'Idriis عليه السلام wuxuu ahaa nin run ah. Annaguna waa inaan run sheegno.',
      },
    },
    {
      id: 'idris-learn-5',
      type: 'multiple_choice',
      prompt: {
        en: 'Who sent Idris عليه السلام?',
        so: 'Yaa soo diray Idriis عليه السلام?',
      },
      choices: [
        choice('allah', 'Allah', 'Alle'),
        choice('people', 'His people', 'Dadkiisa'),
        choice('angels-only', 'The people of the town', 'Dadka magaalada'),
      ],
      correctChoiceId: 'allah',
      explanation: {
        en: 'Every prophet is sent by Allah.',
        so: 'Nebi kasta Alle ayaa soo dira.',
      },
    },
  ],
  gameQuestions: [
    {
      id: 'idris-game-order',
      type: 'ordering',
      prompt: {
        en: 'What happened first? Put the events in order.',
        so: 'Maxaa marka hore dhacay? Dhacdooyinka si nidaam ah u dhig.',
      },
      orderItems: [
        choice('named', 'Allah named Idris as a prophet', 'Alle wuxuu Idriis ugu magacaabay nebi'),
        choice('truth', 'He was a man of truth', 'Wuxuu ahaa nin run ah'),
        choice('raised', 'Allah raised him to a high place', 'Alle wuxuu u qaaday meel sare'),
        choice('learn', 'We learn to be truthful', 'Waxaan baranna inaan run sheegno'),
      ],
      explanation: {
        en: 'Allah named him, he was truthful, Allah raised him, and we learn truthfulness.',
        so: 'Alle wuu magacaabay, wuxuu ahaa run, Alle wuu qaaday, annaguna runta ayaan baranna.',
      },
    },
    rememberProphetQuestion(
      'idris-game-remember',
      'idris',
      [
        choice('idris', 'Idris عليه السلام', 'Idriis عليه السلام'),
        choice('yunus', 'Yunus عليه السلام', 'Yuunas عليه السلام'),
        choice('hud', 'Hud عليه السلام', 'Huud عليه السلام'),
      ],
      { en: 'Idris عليه السلام', so: 'Idriis عليه السلام' },
    ),
    {
      id: 'idris-game-tf',
      type: 'true_false',
      prompt: {
        en: 'Idris عليه السلام was a prophet of Allah.',
        so: 'Idriis عليه السلام wuxuu ahaa nebi Alle soo diray.',
      },
      choices: TRUE_FALSE_CHOICES,
      correctChoiceId: 'true',
      explanation: {
        en: 'The Qur’an calls him a prophet.',
        so: 'Quraanku wuxuu ugu yeedhay nebi.',
      },
    },
    {
      id: 'idris-game-match',
      type: 'match',
      prompt: {
        en: 'Match the lesson: Idris عليه السلام teaches us…',
        so: 'Casharka la xiriir: Idriis عليه السلام wuxuu ina barayaa…',
      },
      choices: [
        choice('truth', 'To be truthful', 'Inaan run sheegno'),
        choice('lie', 'To hide the truth', 'Inaan runta qarino'),
        choice('invent', 'To invent extra miracles', 'Inaan mucjisooyin abuurno'),
      ],
      correctChoiceId: 'truth',
      explanation: {
        en: 'His honour in the Qur’an is that he was truthful.',
        so: 'Sharaftiisa Quraanka waa inuu run ahaa.',
      },
    },
    {
      id: 'idris-game-place',
      type: 'multiple_choice',
      prompt: {
        en: 'Allah raised Idris عليه السلام to…',
        so: 'Alle wuxuu Idriis عليه السلام u qaaday…',
      },
      choices: [
        choice('high', 'A high place', 'Meel sare'),
        choice('sea', 'The bottom of the sea', 'Saldhigga badda'),
        choice('cave', 'A dark cave only', 'God mugdi ah oo keliya'),
      ],
      correctChoiceId: 'high',
      explanation: {
        en: 'The Qur’an says Allah raised him to a high place.',
        so: 'Quraanku wuxuu yiri Alle wuxuu u qaaday meel sare.',
      },
    },
  ],
});

export const NUH_STORY: QisasStory = createQisasStory({
  id: 'qisas-story-003',
  prophetKey: 'nuh',
  title: {
    en: 'The Story of Prophet Nuh عليه السلام',
    so: 'Qisadii Nebi Nuux عليه السلام',
  },
  prophetName: { en: 'Nuh عليه السلام', so: 'Nuux عليه السلام' },
  summary: {
    en: 'Nuh عليه السلام called his people to Allah for a very long time. Allah saved him and the believers in the Ark.',
    so: 'Nuux عليه السلام wuxuu dadkiisa ugu yeedhay Alle wakhti aad u dheer. Alle wuxuu ku badbaadiyay isaga iyo rumaystayaasha doonnida.',
  },
  chapters: [
    {
      id: 'nuh-call',
      title: { en: 'A long, patient call', so: 'Yeeritaan dheer oo samir leh' },
      body: {
        en: 'Allah sent Prophet Nuh عليه السلام to his people. He told them: worship Allah alone. He stayed with them a very long time — nine hundred and fifty years — calling them with patience. Many still refused.',
        so: 'Alle wuxuu u diray Nebi Nuux عليه السلام dadkiisa. Wuxuu ku yiri: Alle keliya caabuda. Wuxuu la joogay wakhti aad u dheer — sagaal boqol iyo konton sano — isagoo samir ku yeedhaya. Qaar badan weli way diideen.',
      },
    },
    {
      id: 'nuh-ark',
      title: { en: 'The Ark', so: 'Doontii' },
      body: {
        en: 'Allah told Nuh عليه السلام to build the Ark. He built it by Allah’s command. Allah told him to take the believers, and pairs of animals, on board.',
        so: 'Alle wuxuu Nuux عليه السلام ku yiri inuu dhiso doon. Wuxuu ku dhisay amarka Alle. Alle wuxuu ku yiri inuu qaado rumaystayaasha iyo xayawaan lammaane ah.',
      },
    },
    {
      id: 'nuh-flood',
      title: { en: 'The flood', so: 'Daadkii' },
      body: {
        en: 'The flood came by Allah’s command. Those who denied were drowned. One of Nuh’s sons refused to board and was among those who drowned. Nuh عليه السلام asked about him, and Allah taught him that salvation is for those who believe and do right.',
        so: 'Daadkii wuxuu yimid amarka Alle. Kuwa beeniyay way liqeen. Wiil ka mid ah wiilasha Nuux wuu diiday inuu fuulo, wuxuuna ka mid noqday kuwa liqay. Nuux عليه السلام wuu weydiiyay, Alle na wuxuu baray in badbaadadu tahay rumaystayaasha fal fican.',
      },
    },
    {
      id: 'nuh-saved',
      title: { en: 'Allah saved the believers', so: 'Alle wuxuu badbaadiyay rumaystayaasha' },
      body: {
        en: 'Allah saved Nuh عليه السلام and those who believed with him. The story teaches patience, calling to Allah, and that we cannot save someone who refuses guidance.',
        so: 'Alle wuxuu badbaadiyay Nuux عليه السلام iyo kuwii rumeeyay. Sheekadu waxay baraysaa samir, u yeedhidda Alle, iyo inaan qof diida hanuunka badbaadin karin.',
      },
    },
  ],
  quranReferences: ['7:59–64', '11:25–48', '23:23–30', '26:105–122', '29:14', '71:1–28'],
  learnQuestions: [
    {
      id: 'nuh-learn-1',
      type: 'multiple_choice',
      prompt: {
        en: 'What did Nuh عليه السلام tell his people?',
        so: 'Maxuu Nuux عليه السلام ku yiri dadkiisa?',
      },
      choices: [
        choice('worship', 'Worship Allah alone', 'Alle keliya caabuda'),
        choice('gold', 'Collect gold', 'Dahab urursada'),
        choice('leave', 'Leave the land at once without a message', 'Dalka ka taga fariin la’aan'),
      ],
      correctChoiceId: 'worship',
      explanation: {
        en: 'He called them to worship Allah alone.',
        so: 'Wuxuu ugu yeedhay inay Alle keliya caabudaan.',
      },
    },
    {
      id: 'nuh-learn-2',
      type: 'multiple_choice',
      prompt: {
        en: 'How long did Nuh عليه السلام stay among his people?',
        so: 'Intee buu Nuux عليه السلام dadkiisa dhex joogay?',
      },
      choices: [
        choice('950', 'Nine hundred and fifty years', 'Sagaal boqol iyo konton sano'),
        choice('40', 'Forty days only', 'Afartan maalmood oo keliya'),
        choice('7', 'Seven years', 'Toddoba sano'),
      ],
      correctChoiceId: '950',
      explanation: {
        en: 'The Qur’an says he remained among them a thousand years minus fifty years.',
        so: 'Quraanku wuxuu yiri wuxuu ku dhex jiray kun sano oo konton laga jaray.',
      },
    },
    {
      id: 'nuh-learn-3',
      type: 'multiple_choice',
      prompt: {
        en: 'What did Allah command Nuh عليه السلام to build?',
        so: 'Maxaa Alle ku amray Nuux عليه السلام inuu dhiso?',
      },
      choices: [
        choice('ark', 'The Ark', 'Doonta'),
        choice('palace', 'A palace', 'Qasri'),
        choice('tower', 'A tower of brick', 'Munaarad leben ah'),
      ],
      correctChoiceId: 'ark',
      explanation: {
        en: 'Allah commanded him to build the Ark.',
        so: 'Alle wuxuu ku amray inuu dhiso doonta.',
      },
    },
    {
      id: 'nuh-learn-4',
      type: 'true_false',
      prompt: {
        en: 'Everyone in Nuh’s family boarded the Ark.',
        so: 'Dhammaan reerka Nuux way fuuleen doonta.',
      },
      choices: TRUE_FALSE_CHOICES,
      correctChoiceId: 'false',
      explanation: {
        en: 'One of his sons refused and was among those who drowned.',
        so: 'Wiil ka mid ah wuu diiday, wuxuuna ka mid noqday kuwa liqay.',
      },
    },
    {
      id: 'nuh-learn-5',
      type: 'multiple_choice',
      prompt: {
        en: 'Who was saved with Nuh عليه السلام?',
        so: 'Yaase lala badbaadiyay Nuux عليه السلام?',
      },
      choices: [
        choice('believers', 'Those who believed', 'Kuwii rumeeyay'),
        choice('all', 'All of his people', 'Dhammaan dadkiisa'),
        choice('none', 'No one at all', 'Cidna'),
      ],
      correctChoiceId: 'believers',
      explanation: {
        en: 'Allah saved Nuh and the believers with him.',
        so: 'Alle wuxuu badbaadiyay Nuux iyo rumaystayaashii la jiray.',
      },
    },
  ],
  gameQuestions: [
    {
      id: 'nuh-game-order',
      type: 'ordering',
      prompt: {
        en: 'What happened first? Put the events in order.',
        so: 'Maxaa marka hore dhacay? Dhacdooyinka si nidaam ah u dhig.',
      },
      orderItems: [
        choice('call', 'Nuh called his people to Allah', 'Nuux wuxuu dadkiisa ugu yeedhay Alle'),
        choice('ark', 'Allah told him to build the Ark', 'Alle wuxuu ku yiri inuu dhiso doonta'),
        choice('flood', 'The flood came', 'Daadkii waa yimid'),
        choice('saved', 'Allah saved the believers', 'Alle wuxuu badbaadiyay rumaystayaasha'),
      ],
      explanation: {
        en: 'First he called, then he built the Ark, then the flood came, then the believers were saved.',
        so: 'Marka hore yeedhid, kadib doonta, kadib daadka, kadib badbaadinta.',
      },
    },
    rememberProphetQuestion(
      'nuh-game-remember',
      'nuh',
      [
        choice('nuh', 'Nuh عليه السلام', 'Nuux عليه السلام'),
        choice('musa', 'Musa عليه السلام', 'Muuse عليه السلام'),
        choice('isa', 'Isa عليه السلام', 'Ciisa عليه السلام'),
      ],
      { en: 'Nuh عليه السلام', so: 'Nuux عليه السلام' },
    ),
    {
      id: 'nuh-game-tf',
      type: 'true_false',
      prompt: {
        en: 'Nuh عليه السلام called his people with patience for a very long time.',
        so: 'Nuux عليه السلام wuxuu dadkiisa ugu yeedhay samir wakhti dheer.',
      },
      choices: TRUE_FALSE_CHOICES,
      correctChoiceId: 'true',
      explanation: {
        en: 'The Qur’an tells us he remained among them for a very long time.',
        so: 'Quraanku wuxuu sheegay inuu wakhti dheer dhex joogay.',
      },
    },
    {
      id: 'nuh-game-match',
      type: 'match',
      prompt: {
        en: 'Match the lesson: Nuh عليه السلام teaches us…',
        so: 'Casharka la xiriir: Nuux عليه السلام wuxuu ina barayaa…',
      },
      choices: [
        choice('patience', 'Patience when calling to Allah', 'Samir marka Alle loogu yeedho'),
        choice('anger', 'To give up at once', 'In si degdeg ah loo quusto'),
        choice('force', 'To force people to believe', 'In dadka lagu qasbo rumayn'),
      ],
      correctChoiceId: 'patience',
      explanation: {
        en: 'He called for a very long time and trusted Allah.',
        so: 'Wuxuu yeedhay wakhti dheer, Alle na wuu tawakkalay.',
      },
    },
    {
      id: 'nuh-game-son',
      type: 'multiple_choice',
      prompt: {
        en: 'Why was one of Nuh’s sons not saved?',
        so: 'Maxaa wiil ka mid ah wiilasha Nuux loo badbaadin waayay?',
      },
      choices: [
        choice('refused', 'He refused to board and did not believe', 'Wuu diiday inuu fuulo, mana rumeeynin'),
        choice('late', 'The Ark was too small', 'Doontu aad bay u yaraatay'),
        choice('sleep', 'He was asleep', 'Wuu seexday'),
      ],
      correctChoiceId: 'refused',
      explanation: {
        en: 'He refused to come on board and was among those who drowned.',
        so: 'Wuu diiday inuu fuulo, wuxuuna ka mid noqday kuwa liqay.',
      },
    },
  ],
});

export const HUD_STORY: QisasStory = createQisasStory({
  id: 'qisas-story-004',
  prophetKey: 'hud',
  title: {
    en: 'The Story of Prophet Hud عليه السلام',
    so: 'Qisadii Nebi Huud عليه السلام',
  },
  prophetName: { en: 'Hud عليه السلام', so: 'Huud عليه السلام' },
  summary: {
    en: 'Hud عليه السلام called the people of ‘Ad to worship Allah. They were proud of their strength, and a fierce wind destroyed those who denied.',
    so: 'Huud عليه السلام wuxuu ugu yeedhay dadka Caad inay caabudaan Alle. Way ku kibreen xooggooda, dabayl xoog leh ayaa halaagtay kuwii beeniyay.',
  },
  chapters: [
    {
      id: 'hud-ad',
      title: { en: 'The people of ‘Ad', so: 'Dadka Caad' },
      body: {
        en: 'Allah sent Prophet Hud عليه السلام to the people of ‘Ad. They were strong and built tall buildings. Hud told them: worship Allah. You have no god other than Him.',
        so: 'Alle wuxuu u diray Nebi Huud عليه السلام dadka Caad. Waxay ahaayeen kuwo xoog leh, dhismayaal dhaadheerna way dhiseen. Huud wuxuu ku yiri: Alle caabuda. Ilaah kale ma lihidin.',
      },
    },
    {
      id: 'hud-pride',
      title: { en: 'Pride in strength', so: 'Kibri xoog' },
      body: {
        en: 'They were proud of their power. They asked: who is stronger than us? Hud عليه السلام reminded them that Allah created them and gave them their strength.',
        so: 'Way ku kibreen awooddooda. Waxay weydiiyeen: yaa innaga xoog badan? Huud عليه السلام wuxuu xasuusiyay in Alle abuuray oo siiyay xoogga.',
      },
    },
    {
      id: 'hud-wind',
      title: { en: 'The wind', so: 'Dabaysha' },
      body: {
        en: 'They denied their messenger. Allah sent a furious wind upon them. Hud عليه السلام and those who believed were saved. Strength does not protect a people who reject Allah.',
        so: 'Way beeniyeen rasuulkoodii. Alle wuxuu ku soo diray dabayl cadho leh. Huud عليه السلام iyo kuwii rumeeyay waa la badbaadiyay. Xooggu ma difaaco qawm diida Alle.',
      },
    },
  ],
  quranReferences: ['7:65–72', '11:50–60', '26:123–140', '41:15–16', '46:21–25', '69:6–8'],
  learnQuestions: [
    {
      id: 'hud-learn-1',
      type: 'multiple_choice',
      prompt: {
        en: 'To which people was Hud عليه السلام sent?',
        so: 'Dadkee baa loo diray Huud عليه السلام?',
      },
      choices: [
        choice('ad', 'The people of ‘Ad', 'Dadka Caad'),
        choice('thamud', 'The people of Thamud', 'Dadka Thamuud'),
        choice('madyan', 'The people of Madyan', 'Dadka Madyan'),
      ],
      correctChoiceId: 'ad',
      explanation: {
        en: 'Hud عليه السلام was sent to ‘Ad.',
        so: 'Huud عليه السلام waxaa loo diray Caad.',
      },
    },
    {
      id: 'hud-learn-2',
      type: 'multiple_choice',
      prompt: {
        en: 'What did Hud عليه السلام tell them?',
        so: 'Maxuu Huud عليه السلام ku yiri?',
      },
      choices: [
        choice('worship', 'Worship Allah; you have no god other than Him', 'Alle caabuda; ilaah kale ma lihidin'),
        choice('fight', 'Fight every neighbour', 'La dagaallama deriska'),
        choice('leave-god', 'Leave Allah’s worship', 'Ka taga cibaadada Alle'),
      ],
      correctChoiceId: 'worship',
      explanation: {
        en: 'He called them to worship Allah alone.',
        so: 'Wuxuu ugu yeedhay inay Alle keliya caabudaan.',
      },
    },
    {
      id: 'hud-learn-3',
      type: 'true_false',
      prompt: {
        en: 'The people of ‘Ad were proud of their strength.',
        so: 'Dadka Caad way ku kibreen xooggooda.',
      },
      choices: TRUE_FALSE_CHOICES,
      correctChoiceId: 'true',
      explanation: {
        en: 'They thought no one was stronger than they were.',
        so: 'Waxay moodayeen inaan cid iyaga ka xoog badnayn.',
      },
    },
    {
      id: 'hud-learn-4',
      type: 'multiple_choice',
      prompt: {
        en: 'How were those who denied punished?',
        so: 'Sidee loogu ciqaabay kuwii beeniyay?',
      },
      choices: [
        choice('wind', 'A furious wind', 'Dabayl cadho leh'),
        choice('flood', 'A flood like Nuh’s people', 'Daad sidii dadkii Nuux'),
        choice('camel', 'A she-camel', 'Nacil'),
      ],
      correctChoiceId: 'wind',
      explanation: {
        en: 'Allah sent a furious wind upon them.',
        so: 'Alle wuxuu ku soo diray dabayl cadho leh.',
      },
    },
    {
      id: 'hud-learn-5',
      type: 'multiple_choice',
      prompt: {
        en: 'What can we learn from this story?',
        so: 'Maxaan ka baran karnaa sheekadan?',
      },
      choices: [
        choice('humble', 'Do not be proud; strength is from Allah', 'Ha kibrin; xoogga Alle ka yimid'),
        choice('boast', 'Boast about buildings', 'Ku faan dhismayaasha'),
        choice('deny', 'Deny the messengers', 'Beeniso rasuullada'),
      ],
      correctChoiceId: 'humble',
      explanation: {
        en: 'Pride in strength did not save ‘Ad. Allah is stronger than all.',
        so: 'Kibriga xoogga ma badbaadin Caad. Alle waa kan ugu xoogga badan.',
      },
    },
  ],
  gameQuestions: [
    {
      id: 'hud-game-order',
      type: 'ordering',
      prompt: {
        en: 'What happened first? Put the events in order.',
        so: 'Maxaa marka hore dhacay? Dhacdooyinka si nidaam ah u dhig.',
      },
      orderItems: [
        choice('sent', 'Allah sent Hud to ‘Ad', 'Alle wuxuu Huud u diray Caad'),
        choice('call', 'He called them to worship Allah', 'Wuxuu ugu yeedhay inay Alle caabudaan'),
        choice('pride', 'They were proud and denied', 'Way kibreen wayna beeniyeen'),
        choice('wind', 'A furious wind destroyed the deniers', 'Dabayl ayaa halaagtay diidayaasha'),
      ],
      explanation: {
        en: 'Hud was sent, he called them, they were proud, then the wind came.',
        so: 'Huud waa la diray, wuu yeedhay, way kibreen, dabayshu way timid.',
      },
    },
    rememberProphetQuestion(
      'hud-game-remember',
      'hud',
      [
        choice('hud', 'Hud عليه السلام', 'Huud عليه السلام'),
        choice('salih', 'Salih عليه السلام', 'Saalax عليه السلام'),
        choice('shuayb', 'Shu‘ayb عليه السلام', 'Shucayb عليه السلام'),
      ],
      { en: 'Hud عليه السلام', so: 'Huud عليه السلام' },
    ),
    {
      id: 'hud-game-tf',
      type: 'true_false',
      prompt: {
        en: 'Hud عليه السلام and the believers were saved.',
        so: 'Huud عليه السلام iyo rumaystayaasha waa la badbaadiyay.',
      },
      choices: TRUE_FALSE_CHOICES,
      correctChoiceId: 'true',
      explanation: {
        en: 'Allah saved His messenger and those who believed.',
        so: 'Alle wuxuu badbaadiyay rasuulkiisa iyo kuwii rumeeyay.',
      },
    },
    {
      id: 'hud-game-match',
      type: 'match',
      prompt: {
        en: 'Match the lesson: the people of ‘Ad were destroyed because of…',
        so: 'Casharka la xiriir: dadka Caad waxaa loo halaagay…',
      },
      choices: [
        choice('pride', 'Pride and denying the messenger', 'Kibri iyo beeninta rasuulka'),
        choice('weak', 'Being too weak', 'Inay aad u itaal darnaayeen'),
        choice('rain', 'Asking for rain', 'Inay roob weydiisteen'),
      ],
      correctChoiceId: 'pride',
      explanation: {
        en: 'They were proud of strength and denied Hud عليه السلام.',
        so: 'Way ku kibreen xoog, wayna beeniyeen Huud عليه السلام.',
      },
    },
    {
      id: 'hud-game-who',
      type: 'multiple_choice',
      prompt: {
        en: 'Who is stronger than the people of ‘Ad?',
        so: 'Yaa ka xoog badan dadka Caad?',
      },
      choices: [
        choice('allah', 'Allah', 'Alle'),
        choice('wind-only', 'Only the wind, not Allah', 'Dabaysha keliya, ma aha Alle'),
        choice('none', 'No one', 'Cidna'),
      ],
      correctChoiceId: 'allah',
      explanation: {
        en: 'Allah created them and is stronger than they were.',
        so: 'Alle ayaa abuuray, wuuna ka xoog badan yahay.',
      },
    },
  ],
});

export const SALIH_STORY: QisasStory = createQisasStory({
  id: 'qisas-story-005',
  prophetKey: 'salih',
  title: {
    en: 'The Story of Prophet Salih عليه السلام',
    so: 'Qisadii Nebi Saalax عليه السلام',
  },
  prophetName: { en: 'Salih عليه السلام', so: 'Saalax عليه السلام' },
  summary: {
    en: 'Salih عليه السلام called Thamud to Allah. Allah gave them the she-camel as a clear sign. They hamstrung it and were destroyed.',
    so: 'Saalax عليه السلام wuxuu Thamuud ugu yeedhay Alle. Alle wuxuu u siiyay nacil calaamad cad. Way jarteen, wayna halaageen.',
  },
  chapters: [
    {
      id: 'salih-thamud',
      title: { en: 'The people of Thamud', so: 'Dadka Thamuud' },
      body: {
        en: 'Allah sent Prophet Salih عليه السلام to Thamud. He told them: worship Allah. You have no god other than Him. He reminded them of the blessings Allah gave them in the land.',
        so: 'Alle wuxuu u diray Nebi Saalax عليه السلام Thamuud. Wuxuu ku yiri: Alle caabuda. Ilaah kale ma lihidin. Wuxuu xasuusiyay necmooyinkii Alle ka siiyay dhulka.',
      },
    },
    {
      id: 'salih-camel',
      title: { en: 'The she-camel', so: 'Nacishii' },
      body: {
        en: 'They asked for a sign. Allah brought out a she-camel as a clear sign. Salih عليه السلام told them to let her drink and not to harm her.',
        so: 'Waxay weydiisteen calaamad. Alle wuxuu soo saaray nacil calaamad cad ah. Saalax عليه السلام wuxuu ku yiri ha siiyaan inay cabto, hana yeelin dhaawac.',
      },
    },
    {
      id: 'salih-harm',
      title: { en: 'They harmed the sign', so: 'Calaamaddii way dhaawaceen' },
      body: {
        en: 'They hamstrung the she-camel. They disobeyed their prophet. Allah destroyed those who denied, and Salih عليه السلام and the believers were saved. A sign from Allah must be respected.',
        so: 'Way jarteen nacishii. Way caasiyeen nebiga. Alle wuxuu halaagay kuwii beeniyay, Saalax عليه السلام iyo rumaystayaashana waa la badbaadiyay. Calaamadda Alle waa in la ixtiraamo.',
      },
    },
  ],
  quranReferences: ['7:73–79', '11:61–68', '26:141–159', '27:45–53', '54:23–31', '91:11–15'],
  learnQuestions: [
    {
      id: 'salih-learn-1',
      type: 'multiple_choice',
      prompt: {
        en: 'To which people was Salih عليه السلام sent?',
        so: 'Dadkee baa loo diray Saalax عليه السلام?',
      },
      choices: [
        choice('thamud', 'Thamud', 'Thamuud'),
        choice('ad', '‘Ad', 'Caad'),
        choice('madyan', 'Madyan', 'Madyan'),
      ],
      correctChoiceId: 'thamud',
      explanation: {
        en: 'Salih عليه السلام was sent to Thamud.',
        so: 'Saalax عليه السلام waxaa loo diray Thamuud.',
      },
    },
    {
      id: 'salih-learn-2',
      type: 'multiple_choice',
      prompt: {
        en: 'What sign did Allah give them?',
        so: 'Waa maxay calaamada Alle siiyay?',
      },
      choices: [
        choice('camel', 'A she-camel', 'Nacil'),
        choice('staff', 'A staff that became a snake', 'Uso mas noqotay'),
        choice('ark', 'An ark', 'Doon'),
      ],
      correctChoiceId: 'camel',
      explanation: {
        en: 'Allah brought out a she-camel as a clear sign.',
        so: 'Alle wuxuu soo saaray nacil calaamad cad ah.',
      },
    },
    {
      id: 'salih-learn-3',
      type: 'true_false',
      prompt: {
        en: 'Salih عليه السلام told them not to harm the she-camel.',
        so: 'Saalax عليه السلام wuxuu ku yiri ha dhaawicina nacisha.',
      },
      choices: TRUE_FALSE_CHOICES,
      correctChoiceId: 'true',
      explanation: {
        en: 'He warned them to let her drink and not to harm her.',
        so: 'Wuxuu uga digeeray inay siiyaan cabbitaan hana dhaawicin.',
      },
    },
    {
      id: 'salih-learn-4',
      type: 'multiple_choice',
      prompt: {
        en: 'What did they do to the she-camel?',
        so: 'Maxay ku sameeyeen nacisha?',
      },
      choices: [
        choice('hamstrung', 'They hamstrung her', 'Way jarteen'),
        choice('fed', 'They cared for her always', 'Had iyo jeer way daryeeleen'),
        choice('hid', 'They hid her in a cave', 'Waxay ku qariyeen god'),
      ],
      correctChoiceId: 'hamstrung',
      explanation: {
        en: 'They hamstrung the she-camel and disobeyed Allah.',
        so: 'Way jarteen nacisha, wayna caasiyeen Alle.',
      },
    },
    {
      id: 'salih-learn-5',
      type: 'multiple_choice',
      prompt: {
        en: 'What can we learn from Salih عليه السلام?',
        so: 'Maxaan ka baran karnaa Saalax عليه السلام?',
      },
      choices: [
        choice('respect', 'Respect Allah’s signs and obey the prophet', 'Ixtiraam calaamadaha Alle oo adeec nebiga'),
        choice('harm', 'Harm what Allah made a sign', 'Dhaawac waxa Alle calaamad ka dhigay'),
        choice('mock', 'Mock the messengers', 'Ku jeesjees rasuullada'),
      ],
      correctChoiceId: 'respect',
      explanation: {
        en: 'They were destroyed after they harmed the sign Allah gave them.',
        so: 'Waa la halaagay kadib markay dhaawaceen calaamada Alle.',
      },
    },
  ],
  gameQuestions: [
    {
      id: 'salih-game-order',
      type: 'ordering',
      prompt: {
        en: 'What happened first? Put the events in order.',
        so: 'Maxaa marka hore dhacay? Dhacdooyinka si nidaam ah u dhig.',
      },
      orderItems: [
        choice('sent', 'Allah sent Salih to Thamud', 'Alle wuxuu Saalax u diray Thamuud'),
        choice('sign', 'Allah gave the she-camel as a sign', 'Alle wuxuu nacisha u dhiibay calaamad ahaan'),
        choice('harm', 'They hamstrung the she-camel', 'Way jarteen nacisha'),
        choice('end', 'Those who denied were destroyed', 'Kuwii beeniyay waa la halaagay'),
      ],
      explanation: {
        en: 'Salih was sent, the sign came, they harmed it, then punishment came.',
        so: 'Saalax waa la diray, calaamaddu timid, way dhaawaceen, ciqaabtu timid.',
      },
    },
    rememberProphetQuestion(
      'salih-game-remember',
      'salih',
      [
        choice('salih', 'Salih عليه السلام', 'Saalax عليه السلام'),
        choice('hud', 'Hud عليه السلام', 'Huud عليه السلام'),
        choice('nuh', 'Nuh عليه السلام', 'Nuux عليه السلام'),
      ],
      { en: 'Salih عليه السلام', so: 'Saalax عليه السلام' },
    ),
    {
      id: 'salih-game-tf',
      type: 'true_false',
      prompt: {
        en: 'The she-camel was a sign from Allah.',
        so: 'Nacishu waxay ahayd calaamad Alle ka timid.',
      },
      choices: TRUE_FALSE_CHOICES,
      correctChoiceId: 'true',
      explanation: {
        en: 'Allah made her a clear sign for Thamud.',
        so: 'Alle wuxuu uga dhigay calaamad cad Thamuud.',
      },
    },
    {
      id: 'salih-game-match',
      type: 'match',
      prompt: {
        en: 'Match the lesson: harming Allah’s sign led to…',
        so: 'Casharka la xiriir: dhaawaca calaamada Alle wuxuu horseeday…',
      },
      choices: [
        choice('punish', 'Punishment for those who denied', 'Ciqaab kuwa beeniyay'),
        choice('gift', 'More gifts', 'Hadiyado dheeraad ah'),
        choice('joke', 'A joke that did not matter', 'Kaftan aan muhiim ahayn'),
      ],
      correctChoiceId: 'punish',
      explanation: {
        en: 'They were destroyed after they hamstrung the she-camel.',
        so: 'Waa la halaagay kadib markay jarteen nacisha.',
      },
    },
    {
      id: 'salih-game-drink',
      type: 'multiple_choice',
      prompt: {
        en: 'What did Salih عليه السلام tell them to do for the she-camel?',
        so: 'Maxuu Saalax عليه السلام ku yiri inay u sameeyaan nacisha?',
      },
      choices: [
        choice('drink', 'Let her drink and do not harm her', 'Ha siiyaan inay cabto hana dhaawicina'),
        choice('sell', 'Sell her at the market', 'Suuqa ka iibiya'),
        choice('hide', 'Hide her from people', 'Dadka ka qariya'),
      ],
      correctChoiceId: 'drink',
      explanation: {
        en: 'They were told to share the water and not to harm her.',
        so: 'Waxaa loo sheegay inay biyaha wadaagaan hana dhaawicin.',
      },
    },
  ],
});

export const EARLY_PROPHET_STORIES: QisasStory[] = [
  IDRIS_STORY,
  NUH_STORY,
  HUD_STORY,
  SALIH_STORY,
];
