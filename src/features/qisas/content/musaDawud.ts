import { choice, createQisasStory, rememberProphetQuestion, TRUE_FALSE_CHOICES } from './storyFactory';
import type { QisasStory } from '../types';

export const MUSA_STORY: QisasStory = createQisasStory({
  id: 'qisas-story-015',
  prophetKey: 'musa',
  title: {
    en: 'The Story of Prophet Musa عليه السلام',
    so: 'Qisadii Nebi Muuse عليه السلام',
  },
  prophetName: { en: 'Musa عليه السلام', so: 'Muuse عليه السلام' },
  summary: {
    en: 'Allah saved Musa عليه السلام as a baby, spoke to him, sent him to Pharaoh, split the sea, and gave him the Scripture.',
    so: 'Alle wuxuu badbaadiyay Muuse عليه السلام markuu ilmo yaraa, wuu la hadlay, Fircoon buu u diray, badda wuu kala jeexay, Kitaabkana wuu siiyay.',
  },
  chapters: [
    {
      id: 'musa-baby',
      title: { en: 'Allah saved him as a baby', so: 'Alle wuu badbaadiyay markuu yaraa' },
      body: {
        en: 'Pharaoh was killing the baby boys of the Children of Israel. Allah inspired the mother of Musa عليه السلام to nurse him, then to put him in the river. Pharaoh’s family found him. Allah made Musa beloved, and his sister helped him return to his mother to be nursed — without Pharaoh knowing the plan of Allah.',
        so: 'Fircoon wuxuu dilayay wiilasha yaryar ee Banu Israa’iil. Alle wuxuu hooyadii Muuse عليه السلام u waxyiyay inay nuujiso, kadibna webiga geliso. Reer Fircoon ayaa helay. Alle wuxuu Muuse ka dhigay mid la jecel yahay, walaashiisna way ka caawisay inuu hooyadiis ku noqdo si loo nuujiyo — iyadoo Fircoon aanu ogayn qorshaha Alle.',
      },
    },
    {
      id: 'musa-sent',
      title: { en: 'Allah spoke to him', so: 'Alle wuu la hadlay' },
      body: {
        en: 'When Musa عليه السلام grew, Allah spoke to him at the sacred valley. Allah told him to go to Pharaoh, who had gone beyond limits. Musa asked Allah to send his brother Harun عليه السلام with him, because Harun spoke clearly. Allah granted that. Musa’s staff became a snake by Allah’s permission, as a sign.',
        so: 'Markii Muuse عليه السلام koray, Alle wuxuu kula hadlay dooxada xurmada leh. Alle wuxuu ku yiri u tag Fircoon, oo xadka dhaafay. Muuse wuxuu Alle weydiistay inuu walaalkiis Haaruun عليه السلام u diro, maxaa yeelay Haaruun si cad ayuu u hadlaa. Alle wuu oggolaaday. Uskiisa wuxuu noqday mas idanka Alle, calaamad ahaan.',
      },
    },
    {
      id: 'musa-sea',
      title: { en: 'The sea', so: 'Baddii' },
      body: {
        en: 'Musa عليه السلام called Pharaoh to Allah. Pharaoh was proud and refused. Allah saved the Children of Israel. When they reached the sea, Allah inspired Musa to strike it with his staff. The sea parted. They crossed. Pharaoh and his army followed and were drowned.',
        so: 'Muuse عليه السلام wuxuu Fircoon ugu yeedhay Alle. Fircoon wuu kibray wuuna diiday. Alle wuxuu badbaadiyay Banu Israa’iil. Markay badda gaadheen, Alle wuxuu Muuse u waxyiyay inuu uskiisa ku dhufto. Baddii way kala jabtay. Way gudbeen. Fircoon iyo ciidankiisii way raaceen wayna liqeen.',
      },
    },
    {
      id: 'musa-scripture',
      title: { en: 'The Scripture and a hard test', so: 'Kitaabka iyo imtixaan adag' },
      body: {
        en: 'Allah gave Musa عليه السلام the Scripture and a clear criterion. When Musa went to the mountain to receive Allah’s appointment, some of his people took a calf as a god. Musa returned angry and sad. He called them back to Allah. The story teaches us that Allah is the true Lord, and that pride like Pharaoh’s leads to ruin.',
        so: 'Alle wuxuu Muuse عليه السلام siiyay Kitaabka iyo kala-sooc cad. Markii Muuse buurta u tegey si uu u helo ballanta Alle, qaar ka mid ah dadkiisa waxay qaateen weyl ilaah ahaan. Muuse wuu soo noqday isagoo cadhaysan oo murugaysan. Wuxuu ku celiyay Alle. Sheekadu waxay ina bartaa in Alle yahay Rabbiga dhabta ah, iyo in kibriga sidii Fircoon u horseedo halaag.',
      },
    },
  ],
  quranReferences: [
    '20:9–98',
    '26:10–68',
    '28:3–43',
    '7:103–156',
    '2:49–93',
    '10:75–92',
  ],
  learnQuestions: [
    {
      id: 'musa-learn-1',
      type: 'multiple_choice',
      prompt: {
        en: 'How did Allah save Musa عليه السلام as a baby?',
        so: 'Sidee Alle u badbaadiyay Muuse عليه السلام markuu ilmo yaraa?',
      },
      choices: [
        choice('river', 'His mother put him in the river by Allah’s inspiration', 'Hooyadiis waxay gelisay webiga waxyiga Alle'),
        choice('ark', 'He built an ark as a baby', 'Wuxuu dhisay doon isagoo ilmo ah'),
        choice('hid-cave', 'He hid in a cave alone', 'Keligiis ayuu god isku qariyay'),
      ],
      correctChoiceId: 'river',
      explanation: {
        en: 'Allah inspired his mother to put him in the river. Pharaoh’s family found him.',
        so: 'Alle wuxuu hooyadiis u waxyiyay inay webiga geliso. Reer Fircoon ayaa helay.',
      },
    },
    {
      id: 'musa-learn-2',
      type: 'multiple_choice',
      prompt: {
        en: 'Whom did Allah send Musa عليه السلام to?',
        so: 'Yuu Alle u diray Muuse عليه السلام?',
      },
      choices: [
        choice('pharaoh', 'Pharaoh', 'Fircoon'),
        choice('ad', 'The people of ‘Ad only', 'Dadka Caad keliya'),
        choice('saba', 'The queen of Saba only', 'Boqoraddii Saba keliya'),
      ],
      correctChoiceId: 'pharaoh',
      explanation: {
        en: 'Allah told him to go to Pharaoh, who had gone beyond limits.',
        so: 'Alle wuxuu ku yiri u tag Fircoon, oo xadka dhaafay.',
      },
    },
    {
      id: 'musa-learn-3',
      type: 'true_false',
      prompt: {
        en: 'Allah made the sea part for Musa عليه السلام and his people.',
        so: 'Alle wuxuu badda u kala jeexay Muuse عليه السلام iyo dadkiisa.',
      },
      choices: TRUE_FALSE_CHOICES,
      correctChoiceId: 'true',
      explanation: {
        en: 'Musa struck the sea with his staff by Allah’s command, and they crossed.',
        so: 'Muuse wuxuu badda ku dhuftay uskiisa amarka Alle, wayna gudbeen.',
      },
    },
    {
      id: 'musa-learn-4',
      type: 'multiple_choice',
      prompt: {
        en: 'What happened to Pharaoh and his army?',
        so: 'Maxaa ku dhacay Fircoon iyo ciidankiisa?',
      },
      choices: [
        choice('drowned', 'They were drowned', 'Waa la liqay'),
        choice('won', 'They won forever', 'Weligeed way guulaysteen'),
        choice('believed-all', 'All of them believed at once and were honoured as rulers', 'Dhammaantood si degdeg ah ayay u rumeeyeen oo madax laga dhigay'),
      ],
      correctChoiceId: 'drowned',
      explanation: {
        en: 'They followed into the sea and were drowned.',
        so: 'Badda ayay raaceen wayna liqeen.',
      },
    },
    {
      id: 'musa-learn-5',
      type: 'multiple_choice',
      prompt: {
        en: 'What can we learn from Musa عليه السلام?',
        so: 'Maxaan ka baran karnaa Muuse عليه السلام?',
      },
      choices: [
        choice('allah', 'Allah is the true Lord; pride like Pharaoh’s leads to ruin', 'Alle waa Rabbiga dhabta ah; kibriga sidii Fircoon wuxuu horseedaa halaag'),
        choice('pharaoh', 'Copy Pharaoh’s pride', 'Ku dayso kibriga Fircoon'),
        choice('calf', 'Worship a calf if people do', 'Weyl caabud haddii dadku sameeyaan'),
      ],
      correctChoiceId: 'allah',
      explanation: {
        en: 'Musa called to Allah. Pharaoh’s pride destroyed him.',
        so: 'Muuse wuxuu ugu yeedhay Alle. Kibriga Fircoon ayaa halaagay.',
      },
    },
  ],
  gameQuestions: [
    {
      id: 'musa-game-order',
      type: 'ordering',
      prompt: {
        en: 'What happened first? Put the events in order.',
        so: 'Maxaa marka hore dhacay? Dhacdooyinka si nidaam ah u dhig.',
      },
      orderItems: [
        choice('baby', 'Allah saved Musa as a baby in the river', 'Alle wuxuu Muuse ku badbaadiyay webiga isagoo ilmo ah'),
        choice('speak', 'Allah spoke to him and sent him to Pharaoh', 'Alle wuu la hadlay wuuna u diray Fircoon'),
        choice('sea', 'The sea parted and they crossed', 'Baddii way kala jabtay wayna gudbeen'),
        choice('drown', 'Pharaoh’s army was drowned', 'Ciidankii Fircoon waa la liqay'),
      ],
      explanation: {
        en: 'Saved as a baby, sent to Pharaoh, sea parted, then Pharaoh drowned.',
        so: 'Ilmo ahaan waa la badbaadiyay, Fircoon ayaa loo diray, baddii way jabtay, Fircoon na waa la liqay.',
      },
    },
    rememberProphetQuestion(
      'musa-game-remember',
      'musa',
      [
        choice('musa', 'Musa عليه السلام', 'Muuse عليه السلام'),
        choice('yunus', 'Yunus عليه السلام', 'Yuunas عليه السلام'),
        choice('idris', 'Idris عليه السلام', 'Idriis عليه السلام'),
      ],
      { en: 'Musa عليه السلام', so: 'Muuse عليه السلام' },
    ),
    {
      id: 'musa-game-tf',
      type: 'true_false',
      prompt: {
        en: 'Musa عليه السلام asked Allah to send Harun عليه السلام with him.',
        so: 'Muuse عليه السلام wuxuu Alle weydiistay inuu Haaruun عليه السلام u diro.',
      },
      choices: TRUE_FALSE_CHOICES,
      correctChoiceId: 'true',
      explanation: {
        en: 'He asked for his brother because Harun spoke clearly. Allah granted that.',
        so: 'Wuxuu weydiistay walaalkiis maxaa yeelay Haaruun si cad ayuu u hadlaa. Alle wuu oggolaaday.',
      },
    },
    {
      id: 'musa-game-match',
      type: 'match',
      prompt: {
        en: 'Match the lesson: Pharaoh’s pride led to…',
        so: 'Casharka la xiriir: kibriga Fircoon wuxuu horseeday…',
      },
      choices: [
        choice('ruin', 'Ruin', 'Halaag'),
        choice('honour', 'Lasting honour with Allah', 'Sharaf joogto ah oo Alle la leh'),
        choice('scripture', 'Receiving the Scripture', 'Helitaanka Kitaabka'),
      ],
      correctChoiceId: 'ruin',
      explanation: {
        en: 'Pharaoh went beyond limits and was drowned.',
        so: 'Fircoon wuxuu xadka dhaafay waa la liqay.',
      },
    },
    {
      id: 'musa-game-staff',
      type: 'multiple_choice',
      prompt: {
        en: 'What happened to Musa’s staff by Allah’s permission?',
        so: 'Maxaa ku dhacay uska Muuse idanka Alle?',
      },
      choices: [
        choice('snake', 'It became a snake, as a sign', 'Wuxuu noqday mas, calaamad ahaan'),
        choice('gold', 'It turned to gold', 'Wuxuu noqday dahab'),
        choice('broke', 'It broke and was useless', 'Wuu jabay mana tarin'),
      ],
      correctChoiceId: 'snake',
      explanation: {
        en: 'Allah made the staff a sign for Pharaoh.',
        so: 'Alle wuxuu uska uga dhigay calaamad Fircoon.',
      },
    },
  ],
});

export const HARUN_STORY: QisasStory = createQisasStory({
  id: 'qisas-story-016',
  prophetKey: 'harun',
  title: {
    en: 'The Story of Prophet Harun عليه السلام',
    so: 'Qisadii Nebi Haaruun عليه السلام',
  },
  prophetName: { en: 'Harun عليه السلام', so: 'Haaruun عليه السلام' },
  summary: {
    en: 'Harun عليه السلام was the brother of Musa. Allah made him a prophet and a helper. He tried to stop his people from worshipping the calf.',
    so: 'Haaruun عليه السلام wuxuu ahaa walaalkii Muuse. Alle wuxuu ka dhigay nebi iyo caawiye. Wuxuu isku dayay inuu joojiyo dadkiisa inay weyl caabudaan.',
  },
  chapters: [
    {
      id: 'harun-helper',
      title: { en: 'A helper to Musa', so: 'Caawiye Muuse' },
      body: {
        en: 'Musa عليه السلام asked Allah to make Harun عليه السلام his helper and to share the mission with him. Allah said: We will strengthen your arm with your brother. Harun was a prophet. He spoke clearly.',
        so: 'Muuse عليه السلام wuxuu Alle weydiistay inuu Haaruun عليه السلام ka dhigo caawiye oo uu la qaybsado howsha. Alle wuxuu yiri: waxaan ku xoojin doonnaa gacantaada walaalkaa. Haaruun wuxuu ahaa nebi. Si cad ayuu u hadli jiray.',
      },
    },
    {
      id: 'harun-pharaoh',
      title: { en: 'Together before Pharaoh', so: 'Wadajir Fircoon hortiisa' },
      body: {
        en: 'Allah sent Musa and Harun together to Pharaoh. They said: we are messengers of the Lord of the worlds. Let the Children of Israel go with us. Pharaoh was proud and refused.',
        so: 'Alle wuxuu u diray Muuse iyo Haaruun wadajir Fircoon. Waxay yiraahdeen: waxaan nahay rasuullo Rabbiga caalamka. Banu Israa’iil nala sii daa. Fircoon wuu kibray wuuna diiday.',
      },
    },
    {
      id: 'harun-calf',
      title: { en: 'He tried to stop the calf', so: 'Wuxuu isku dayay inuu joojiyo weylsha' },
      body: {
        en: 'When Musa went to the mountain, Harun عليه السلام stayed with the people. Some of them took a calf as a god. Harun told them: you are only being tested; your Lord is the Most Merciful; follow me and obey my command. They did not listen until Musa returned. The story teaches that we help one another upon truth, and we do not worship anything besides Allah.',
        so: 'Markii Muuse buurta tegey, Haaruun عليه السلام wuxuu la joogay dadka. Qaar ka mid ah waxay qaateen weyl ilaah ahaan. Haaruun wuxuu ku yiri: waa laydin imtixaamayaa; Rabbigiinnu waa Kan ugu naxariista badan; i raaca oo amarkayga adeeca. Ma dhegeysan ilaa Muuse soo noqday. Sheekadu waxay ina bartaa inaan iscaawinno xaqa, hana caabudin wax Alle ka mid ah mooyaane.',
      },
    },
  ],
  quranReferences: ['19:53', '20:29–36', '20:90–94', '26:13–17', '7:142', '25:35'],
  learnQuestions: [
    {
      id: 'harun-learn-1',
      type: 'multiple_choice',
      prompt: {
        en: 'Who is Harun عليه السلام?',
        so: 'Waa kuma Haaruun عليه السلام?',
      },
      choices: [
        choice('brother', 'The brother of Musa عليه السلام, and a prophet', 'Walaalkii Muuse عليه السلام, iyo nebi'),
        choice('pharaoh', 'Pharaoh’s helper', 'Caawiyaha Fircoon'),
        choice('king', 'The king of Egypt', 'Boqorka Masar'),
      ],
      correctChoiceId: 'brother',
      explanation: {
        en: 'Allah made Harun a prophet and a helper to Musa.',
        so: 'Alle wuxuu Haaruun ka dhigay nebi iyo caawiye Muuse.',
      },
    },
    {
      id: 'harun-learn-2',
      type: 'true_false',
      prompt: {
        en: 'Musa عليه السلام asked Allah to send Harun with him because Harun spoke clearly.',
        so: 'Muuse عليه السلام wuxuu Alle weydiistay inuu Haaruun u diro maxaa yeelay Haaruun si cad ayuu u hadlaa.',
      },
      choices: TRUE_FALSE_CHOICES,
      correctChoiceId: 'true',
      explanation: {
        en: 'Allah granted that and strengthened Musa with his brother.',
        so: 'Alle wuu oggolaaday wuuna ku xoojiyay Muuse walaalkiis.',
      },
    },
    {
      id: 'harun-learn-3',
      type: 'multiple_choice',
      prompt: {
        en: 'What did Harun عليه السلام tell the people about the calf?',
        so: 'Maxuu Haaruun عليه السلام kaga yiri dadka weylsha?',
      },
      choices: [
        choice('test', 'You are only being tested; follow me and obey', 'Waa laydin imtixaamayaa; i raaca oo adeeca'),
        choice('worship', 'Worship the calf', 'Weylsha caabuda'),
        choice('leave-allah', 'Leave Allah', 'Alle ka taga'),
      ],
      correctChoiceId: 'test',
      explanation: {
        en: 'He warned them and told them to follow him, not the calf.',
        so: 'Wuu u digooyay wuxuuna ku yiri isaga raaca, ma aha weylsha.',
      },
    },
    {
      id: 'harun-learn-4',
      type: 'multiple_choice',
      prompt: {
        en: 'Did the people listen to Harun عليه السلام at once?',
        so: 'Dadku ma degdeg ayay u dhegeysteen Haaruun عليه السلام?',
      },
      choices: [
        choice('no', 'No. They did not listen until Musa returned.', 'Maya. Ma dhegeysan ilaa Muuse soo noqday.'),
        choice('yes', 'Yes. They all stopped at once.', 'Haa. Si degdeg ah ayay u joojiyeen.'),
        choice('never-told', 'He never spoke to them.', 'Waligiis kama hadlin.'),
      ],
      correctChoiceId: 'no',
      explanation: {
        en: 'They did not listen until Musa returned angry and sad.',
        so: 'Ma dhegeysan ilaa Muuse soo noqday isagoo cadhaysan.',
      },
    },
    {
      id: 'harun-learn-5',
      type: 'multiple_choice',
      prompt: {
        en: 'What can we learn from Harun عليه السلام?',
        so: 'Maxaan ka baran karnaa Haaruun عليه السلام?',
      },
      choices: [
        choice('help', 'Help one another upon truth; worship Allah alone', 'Iscaawinta xaqa; Alle keliya caabuda'),
        choice('calf', 'Worship a calf if a crowd does', 'Weyl caabud haddii dad badan sameeyaan'),
        choice('silent', 'Stay silent when people do wrong', 'Aamus marka dadku xumaan sameeyaan'),
      ],
      correctChoiceId: 'help',
      explanation: {
        en: 'He helped Musa and tried to stop a wrong act.',
        so: 'Wuxuu caawiyay Muuse wuxuuna isku dayay inuu joojiyo fal khaldan.',
      },
    },
  ],
  gameQuestions: [
    {
      id: 'harun-game-order',
      type: 'ordering',
      prompt: {
        en: 'What happened first? Put the events in order.',
        so: 'Maxaa marka hore dhacay? Dhacdooyinka si nidaam ah u dhig.',
      },
      orderItems: [
        choice('ask', 'Musa asked Allah to send Harun', 'Muuse wuxuu Alle weydiistay inuu Haaruun diro'),
        choice('sent', 'They went together to Pharaoh', 'Wadajir bay u tageen Fircoon'),
        choice('mountain', 'Musa went to the mountain; Harun stayed with the people', 'Muuse buurta tegey; Haaruun dadka la joogay'),
        choice('warn', 'Harun warned them not to worship the calf', 'Haaruun wuxuu uga digeeray inayan weyl caabudin'),
      ],
      explanation: {
        en: 'Harun was granted, they faced Pharaoh, then Harun warned about the calf.',
        so: 'Haaruun waa la oggolaaday, Fircoon bay la kulmeen, kadib Haaruun wuxuu uga digeeray weylsha.',
      },
    },
    rememberProphetQuestion(
      'harun-game-remember',
      'harun',
      [
        choice('harun', 'Harun عليه السلام', 'Haaruun عليه السلام'),
        choice('yunus', 'Yunus عليه السلام', 'Yuunas عليه السلام'),
        choice('hud', 'Hud عليه السلام', 'Huud عليه السلام'),
      ],
      { en: 'Harun عليه السلام', so: 'Haaruun عليه السلام' },
    ),
    {
      id: 'harun-game-tf',
      type: 'true_false',
      prompt: {
        en: 'Harun عليه السلام told the people that the calf was their true Lord.',
        so: 'Haaruun عليه السلام wuxuu dadka ku yiri weylshu waa Rabbigooda dhabta ah.',
      },
      choices: TRUE_FALSE_CHOICES,
      correctChoiceId: 'false',
      explanation: {
        en: 'He told them they were being tested and to follow him, not the calf.',
        so: 'Wuxuu ku yiri waa laydin imtixaamayaa, aniga raaca ma aha weylsha.',
      },
    },
    {
      id: 'harun-game-match',
      type: 'match',
      prompt: {
        en: 'Match the lesson: a helper upon truth should…',
        so: 'Casharka la xiriir: caawiyaha xaqa waa inuu…',
      },
      choices: [
        choice('speak', 'Speak the truth even if people refuse', 'Runta sheego xitaa haddii dadku diidaan'),
        choice('join-wrong', 'Join whatever the crowd does', 'Ku biro wax kasta oo dadku sameeyo'),
        choice('leave-brother', 'Leave his brother alone always', 'Walaalkiis weligiis keligiis uga tago'),
      ],
      correctChoiceId: 'speak',
      explanation: {
        en: 'Harun spoke the truth about the calf even when they would not listen.',
        so: 'Haaruun run buu ka sheegay weylsha xitaa markayan dhegeysan.',
      },
    },
    {
      id: 'harun-game-who',
      type: 'multiple_choice',
      prompt: {
        en: 'Who sent Musa and Harun together?',
        so: 'Yaa wada diray Muuse iyo Haaruun?',
      },
      choices: [
        choice('allah', 'Allah', 'Alle'),
        choice('pharaoh', 'Pharaoh', 'Fircoon'),
        choice('people', 'The people of ‘Ad', 'Dadka Caad'),
      ],
      correctChoiceId: 'allah',
      explanation: {
        en: 'Allah sent them both as messengers.',
        so: 'Alle ayaa labadoodaba rasuul ahaan u diray.',
      },
    },
  ],
});

export const DAWUD_STORY: QisasStory = createQisasStory({
  id: 'qisas-story-017',
  prophetKey: 'dawud',
  title: {
    en: 'The Story of Prophet Dawud عليه السلام',
    so: 'Qisadii Nebi Daawuud عليه السلام',
  },
  prophetName: { en: 'Dawud عليه السلام', so: 'Daawuud عليه السلام' },
  summary: {
    en: 'Allah gave Dawud عليه السلام kingship, wisdom, and the Zabur. He killed Jalut. Mountains and birds glorified Allah with him. He judged with justice.',
    so: 'Alle wuxuu Daawuud عليه السلام siiyay boqornimo, xigmad, iyo Zabuur. Wuxuu dilay Jaaluut. Buuraha iyo shimbiraha Alle ayay kula tasbiixsan jireen. Cadaalad buu ku xukumi jiray.',
  },
  chapters: [
    {
      id: 'dawud-jalut',
      title: { en: 'Jalut and kingship', so: 'Jaaluut iyo boqornimada' },
      body: {
        en: 'By Allah’s permission, Dawud عليه السلام killed Jalut. Allah gave him kingship and wisdom, and taught him what He willed. If Allah did not hold people back by means of others, the earth would be corrupted. Allah is Full of bounty to the worlds.',
        so: 'Idanka Alle, Daawuud عليه السلام wuxuu dilay Jaaluut. Alle wuxuu siiyay boqornimo iyo xigmad, wuxuuna baray wuxuu doonayay. Haddii Alle dadka isku celin waayo dad kale, dhulku wuu fasaadi lahaa. Alle waa Kan nicmada badan caalamka.',
      },
    },
    {
      id: 'dawud-praise',
      title: { en: 'Mountains and birds', so: 'Buuraha iyo shimbiraha' },
      body: {
        en: 'Allah told the mountains and the birds to repeat praises with Dawud عليه السلام. Allah made iron soft for him, so he could make coats of armour and do good work. Allah gave him the Zabur.',
        so: 'Alle wuxuu buuraha iyo shimbiraha ku yiri Daawuud عليه السلام kula tasbiixsada. Alle wuxuu birta u jilciyay, si uu u sameeyo gaashaammo oo uu shaqo wanaagsan u qabto. Alle wuxuu siiyay Zabuur.',
      },
    },
    {
      id: 'dawud-justice',
      title: { en: 'Judge with justice', so: 'Ku xukun cadaalad' },
      body: {
        en: 'Two men came to Dawud عليه السلام as a test. Allah reminded him to judge between people with truth and not to follow desire. Dawud sought forgiveness. The story teaches that power is a trust, and a ruler must be just.',
        so: 'Laba nin ayaa u yimid Daawuud عليه السلام imtixaan ahaan. Alle wuxuu xasuusiyay inuu dadka ku kala xukumo xaqa hana raacin nafta. Daawuud wuxuu raadsaday danbi dhaaf. Sheekadu waxay baraysaa in awooddu tahay amaano, madaxuna waa inuu cadaalad noqdo.',
      },
    },
  ],
  quranReferences: ['2:249–251', '4:163', '17:55', '21:78–80', '34:10–11', '38:17–26'],
  learnQuestions: [
    {
      id: 'dawud-learn-1',
      type: 'multiple_choice',
      prompt: {
        en: 'Whom did Dawud عليه السلام kill by Allah’s permission?',
        so: 'Yuu Daawuud عليه السلام dilay idanka Alle?',
      },
      choices: [
        choice('jalut', 'Jalut', 'Jaaluut'),
        choice('pharaoh', 'Pharaoh', 'Fircoon'),
        choice('nuh-son', 'The son of Nuh', 'Wiilkii Nuux'),
      ],
      correctChoiceId: 'jalut',
      explanation: {
        en: 'Dawud killed Jalut, and Allah gave him kingship and wisdom.',
        so: 'Daawuud wuxuu dilay Jaaluut, Alle na wuxuu siiyay boqornimo iyo xigmad.',
      },
    },
    {
      id: 'dawud-learn-2',
      type: 'true_false',
      prompt: {
        en: 'Mountains and birds glorified Allah with Dawud عليه السلام.',
        so: 'Buuraha iyo shimbiraha Alle ayay kula tasbiixsan jireen Daawuud عليه السلام.',
      },
      choices: TRUE_FALSE_CHOICES,
      correctChoiceId: 'true',
      explanation: {
        en: 'Allah commanded the mountains and the birds to repeat praises with him.',
        so: 'Alle wuxuu buuraha iyo shimbiraha ku amray inay kula tasbiixsadaan.',
      },
    },
    {
      id: 'dawud-learn-3',
      type: 'multiple_choice',
      prompt: {
        en: 'What Scripture did Allah give Dawud عليه السلام?',
        so: 'Kitaabkee baa Alle siiyay Daawuud عليه السلام?',
      },
      choices: [
        choice('zabur', 'The Zabur', 'Zabuur'),
        choice('quran', 'The Qur’an', 'Quraanka'),
        choice('none', 'No Scripture', 'Kitaab ma jirin'),
      ],
      correctChoiceId: 'zabur',
      explanation: {
        en: 'Allah gave Dawud the Zabur.',
        so: 'Alle wuxuu Daawuud siiyay Zabuur.',
      },
    },
    {
      id: 'dawud-learn-4',
      type: 'multiple_choice',
      prompt: {
        en: 'How should Dawud عليه السلام judge?',
        so: 'Sidee Daawuud عليه السلام u xukumi karaa?',
      },
      choices: [
        choice('truth', 'With truth, not following desire', 'Xaq, isagoon raacin nafta'),
        choice('desire', 'However he wished', 'Sida uu doono'),
        choice('fear', 'Only to please the strong', 'Kaliya in xoogga leh la farxo'),
      ],
      correctChoiceId: 'truth',
      explanation: {
        en: 'Allah told him to judge with truth and not to follow desire.',
        so: 'Alle wuxuu ku yiri ku xukun xaqa hana raacin nafta.',
      },
    },
    {
      id: 'dawud-learn-5',
      type: 'multiple_choice',
      prompt: {
        en: 'What can we learn from Dawud عليه السلام?',
        so: 'Maxaan ka baran karnaa Daawuud عليه السلام?',
      },
      choices: [
        choice('justice', 'Power is a trust; be just and remember Allah', 'Awooddu waa amaano; cadaalad noqo oo Alle xusuusnow'),
        choice('pride', 'Be proud if you win a battle', 'Kibri haddii dagaal la guuleysto'),
        choice('desire', 'Follow desire when judging', 'Raac nafta marka la xukumayo'),
      ],
      correctChoiceId: 'justice',
      explanation: {
        en: 'Allah gave him power and reminded him to judge with truth.',
        so: 'Alle wuxuu siiyay awood wuxuuna xasuusiyay inuu xaq ku xukumo.',
      },
    },
  ],
  gameQuestions: [
    {
      id: 'dawud-game-order',
      type: 'ordering',
      prompt: {
        en: 'What happened first? Put the events in order.',
        so: 'Maxaa marka hore dhacay? Dhacdooyinka si nidaam ah u dhig.',
      },
      orderItems: [
        choice('jalut', 'Dawud killed Jalut by Allah’s permission', 'Daawuud wuxuu dilay Jaaluut idanka Alle'),
        choice('king', 'Allah gave him kingship and wisdom', 'Alle wuxuu siiyay boqornimo iyo xigmad'),
        choice('praise', 'Mountains and birds praised with him', 'Buuraha iyo shimbiraha way kula tasbiixsadeen'),
        choice('judge', 'He was told to judge with truth', 'Waxaa loo sheegay inuu xaq ku xukumo'),
      ],
      explanation: {
        en: 'Victory, kingship, praise with creation, then a reminder of justice.',
        so: 'Guul, boqornimo, tasbiix abuurista, kadib xusuusin cadaalad.',
      },
    },
    rememberProphetQuestion(
      'dawud-game-remember',
      'dawud',
      [
        choice('dawud', 'Dawud عليه السلام', 'Daawuud عليه السلام'),
        choice('hud', 'Hud عليه السلام', 'Huud عليه السلام'),
        choice('shuayb', 'Shu‘ayb عليه السلام', 'Shucayb عليه السلام'),
      ],
      { en: 'Dawud عليه السلام', so: 'Daawuud عليه السلام' },
    ),
    {
      id: 'dawud-game-tf',
      type: 'true_false',
      prompt: {
        en: 'Allah made iron soft for Dawud عليه السلام.',
        so: 'Alle wuxuu birta u jilciyay Daawuud عليه السلام.',
      },
      choices: TRUE_FALSE_CHOICES,
      correctChoiceId: 'true',
      explanation: {
        en: 'He could make coats of armour and do good work.',
        so: 'Wuxuu samayn kari jiray gaashaammo iyo shaqo wanaagsan.',
      },
    },
    {
      id: 'dawud-game-match',
      type: 'match',
      prompt: {
        en: 'Match the lesson: a leader must…',
        so: 'Casharka la xiriir: hoggaamiyuhu waa inuu…',
      },
      choices: [
        choice('just', 'Judge with truth, not desire', 'Ku xukumo xaqa, ma aha nafta'),
        choice('desire', 'Follow desire always', 'Had iyo jeer nafta raaco'),
        choice('forget', 'Forget Allah after winning', 'Alle illoowo kadib guusha'),
      ],
      correctChoiceId: 'just',
      explanation: {
        en: 'Allah reminded Dawud not to follow desire when judging.',
        so: 'Alle wuxuu Daawuud xasuusiyay inuusan nafta raacin marka uu xukumayo.',
      },
    },
    {
      id: 'dawud-game-son',
      type: 'multiple_choice',
      prompt: {
        en: 'Which prophet was the son of Dawud عليه السلام?',
        so: 'Nebikee baa ahaa wiilka Daawuud عليه السلام?',
      },
      choices: [
        choice('sulayman', 'Sulayman عليه السلام', 'Sulaymaan عليه السلام'),
        choice('yunus', 'Yunus عليه السلام', 'Yuunas عليه السلام'),
        choice('nuh', 'Nuh عليه السلام', 'Nuux عليه السلام'),
      ],
      correctChoiceId: 'sulayman',
      explanation: {
        en: 'Allah gave Dawud Sulayman as a son, a prophet and a king.',
        so: 'Alle wuxuu Daawuud siiyay Sulaymaan wiil, nebi iyo boqor.',
      },
    },
  ],
});

export const SULAYMAN_STORY: QisasStory = createQisasStory({
  id: 'qisas-story-018',
  prophetKey: 'sulayman',
  title: {
    en: 'The Story of Prophet Sulayman عليه السلام',
    so: 'Qisadii Nebi Sulaymaan عليه السلام',
  },
  prophetName: { en: 'Sulayman عليه السلام', so: 'Sulaymaan عليه السلام' },
  summary: {
    en: 'Allah taught Sulayman عليه السلام the speech of birds, subjected the wind and the jinn to him, and he called the queen of Saba to Allah.',
    so: 'Alle wuxuu Sulaymaan عليه السلام baray hadalka shimbiraha, dabaysha iyo jinka wuu u hor mariyay, wuxuuna ugu yeedhay boqoraddii Saba Alle.',
  },
  chapters: [
    {
      id: 'sulayman-gift',
      title: { en: 'Gifts from Allah', so: 'Hadiyado Alle ka yimid' },
      body: {
        en: 'Sulayman عليه السلام was the son of Dawud عليه السلام. Allah said they were given knowledge. Sulayman said: we have been taught the speech of birds, and we have been given of all things. That is a clear bounty of Allah. The wind was subjected to him, and the jinn worked by Allah’s permission.',
        so: 'Sulaymaan عليه السلام wuxuu ahaa wiilkii Daawuud عليه السلام. Alle wuxuu yiri aqoon baa la siiyay. Sulaymaan wuxuu yiri: waxaa nala baray hadalka shimbiraha, wax kastaana waa nala siiyay. Taasi waa nicmo cad oo Alle ah. Dabaysha waa loo hor mariyay, jinkuna wuxuu shaqaynayay idanka Alle.',
      },
    },
    {
      id: 'sulayman-ant',
      title: { en: 'The ant and the hoopoe', so: 'Qudhaacdii iyo hudhudkii' },
      body: {
        en: 'Sulayman عليه السلام smiled at the words of an ant that warned other ants to enter their homes so they would not be crushed. He thanked Allah. The hoopoe brought him news of a queen in Saba whose people worshipped the sun besides Allah.',
        so: 'Sulaymaan عليه السلام wuu dhoolla caddeeyay erayadii qudhaacad uga digtay qudhaacyada kale inay guryahooda galaan si aan loo tuntin. Alle ayuu u mahadnaqay. Hudhudkii wuxuu u keenay war ku saabsan boqorad Saba joogta oo dadkeedu qorraxda caabudaan Alle ka sokow.',
      },
    },
    {
      id: 'sulayman-saba',
      title: { en: 'He called Saba to Allah', so: 'Saba wuxuu ugu yeedhay Alle' },
      body: {
        en: 'Sulayman عليه السلام sent a letter: do not be too proud, and come to me in submission. The queen came. She saw a court of glass and thought it was water. She realised the truth and said: I submit with Sulayman to Allah, Lord of the worlds. When Sulayman died, the jinn did not know until a creature of the earth ate his staff. No one knows the unseen except Allah.',
        so: 'Sulaymaan عليه السلام wuxuu warqad u diray: ha kibrina, ii kaalaya idinkoo hogaansan. Boqoraddii way timid. Waxay aragtay barxad dhalo ah, waxayna moodday inay biyo tahay. Xaqa way garatay waxayna tidhi: waxaan la hogaansamay Sulaymaan Alle, Rabbiga caalamka. Markii Sulaymaan dhintay, jinku ma ogaan ilaa xayawaan dhulka ka mid ah uskiisa cuno. Cidna ma oga ghaibka Alle mooyaane.',
      },
    },
  ],
  quranReferences: ['21:81–82', '27:15–44', '34:12–14', '38:30–40'],
  learnQuestions: [
    {
      id: 'sulayman-learn-1',
      type: 'multiple_choice',
      prompt: {
        en: 'Who was the father of Sulayman عليه السلام?',
        so: 'Yuu ahaa aabbihii Sulaymaan عليه السلام?',
      },
      choices: [
        choice('dawud', 'Dawud عليه السلام', 'Daawuud عليه السلام'),
        choice('nuh', 'Nuh عليه السلام', 'Nuux عليه السلام'),
        choice('musa', 'Musa عليه السلام', 'Muuse عليه السلام'),
      ],
      correctChoiceId: 'dawud',
      explanation: {
        en: 'Sulayman was the son of Dawud. Allah gave them knowledge.',
        so: 'Sulaymaan wuxuu ahaa wiilkii Daawuud. Alle aqoon buu siiyay.',
      },
    },
    {
      id: 'sulayman-learn-2',
      type: 'true_false',
      prompt: {
        en: 'Allah taught Sulayman عليه السلام the speech of birds.',
        so: 'Alle wuxuu Sulaymaan عليه السلام baray hadalka shimbiraha.',
      },
      choices: TRUE_FALSE_CHOICES,
      correctChoiceId: 'true',
      explanation: {
        en: 'He said: we have been taught the speech of birds. That is Allah’s bounty.',
        so: 'Wuxuu yiri: waxaa nala baray hadalka shimbiraha. Taasi waa nicmada Alle.',
      },
    },
    {
      id: 'sulayman-learn-3',
      type: 'multiple_choice',
      prompt: {
        en: 'What news did the hoopoe bring?',
        so: 'Waa maxay warkii hudhudku keenay?',
      },
      choices: [
        choice('saba', 'A queen in Saba whose people worshipped the sun', 'Boqorad Saba joogta oo dadkeedu qorraxda caabudaan'),
        choice('flood', 'A flood like Nuh’s people', 'Daad sidii dadkii Nuux'),
        choice('calf', 'A golden calf in Egypt', 'Weyl dahab ah oo Masar'),
      ],
      correctChoiceId: 'saba',
      explanation: {
        en: 'The hoopoe found a people who worshipped the sun besides Allah.',
        so: 'Hudhudku wuxuu helay dad qorraxda caabuda Alle ka sokow.',
      },
    },
    {
      id: 'sulayman-learn-4',
      type: 'multiple_choice',
      prompt: {
        en: 'What did the queen of Saba finally say?',
        so: 'Maxay boqoraddii Saba ugu dambayntii tidhi?',
      },
      choices: [
        choice('submit', 'I submit with Sulayman to Allah, Lord of the worlds', 'Waxaan la hogaansamay Sulaymaan Alle, Rabbiga caalamka'),
        choice('sun', 'I will keep worshipping the sun', 'Weli qorraxda ayaan caabudi'),
        choice('fight', 'I will never visit him', 'Waligay ma booqan doono'),
      ],
      correctChoiceId: 'submit',
      explanation: {
        en: 'She submitted to Allah with Sulayman.',
        so: 'Waxay Alle ula hogaansantay Sulaymaan.',
      },
    },
    {
      id: 'sulayman-learn-5',
      type: 'multiple_choice',
      prompt: {
        en: 'What can we learn from Sulayman عليه السلام?',
        so: 'Maxaan ka baran karnaa Sulaymaan عليه السلام?',
      },
      choices: [
        choice('thanks', 'Thank Allah for gifts, and call others to Allah', 'Alle ugu mahadnaq hadiyadaha, dadkalena Alle ugu yeedh'),
        choice('pride', 'Be proud of power and hide it from Allah', 'Ku faan awoodda oo Alle ka qari'),
        choice('sun', 'Worship the sun if a queen does', 'Qorraxda caabud haddii boqorad sameyso'),
      ],
      correctChoiceId: 'thanks',
      explanation: {
        en: 'He thanked Allah and invited Saba to the Lord of the worlds.',
        so: 'Alle ayuu u mahadnaqay wuxuuna Saba ugu yeedhay Rabbiga caalamka.',
      },
    },
  ],
  gameQuestions: [
    {
      id: 'sulayman-game-order',
      type: 'ordering',
      prompt: {
        en: 'What happened first? Put the events in order.',
        so: 'Maxaa marka hore dhacay? Dhacdooyinka si nidaam ah u dhig.',
      },
      orderItems: [
        choice('gift', 'Allah taught him the speech of birds', 'Alle wuxuu baray hadalka shimbiraha'),
        choice('ant', 'He smiled at the ant and thanked Allah', 'Wuu dhoolla caddeeyay qudhaacda Alle na wuu u mahadnaqay'),
        choice('hoopoe', 'The hoopoe brought news of Saba', 'Hudhudku wuxuu keenay warka Saba'),
        choice('submit', 'The queen submitted to Allah', 'Boqoraddii waxay Alle u hogaansantay'),
      ],
      explanation: {
        en: 'Gifts, thanks, the hoopoe’s news, then the queen submitted.',
        so: 'Hadiyado, mahadnaq, warka hudhudka, kadib boqoraddii way hogaansantay.',
      },
    },
    rememberProphetQuestion(
      'sulayman-game-remember',
      'sulayman',
      [
        choice('sulayman', 'Sulayman عليه السلام', 'Sulaymaan عليه السلام'),
        choice('yunus', 'Yunus عليه السلام', 'Yuunas عليه السلام'),
        choice('idris', 'Idris عليه السلام', 'Idriis عليه السلام'),
      ],
      { en: 'Sulayman عليه السلام', so: 'Sulaymaan عليه السلام' },
    ),
    {
      id: 'sulayman-game-tf',
      type: 'true_false',
      prompt: {
        en: 'The jinn knew the unseen and knew at once when Sulayman عليه السلام died.',
        so: 'Jinku wuu ogaa ghaibka wuuna ogaa isla markiiba markii Sulaymaan عليه السلام dhintay.',
      },
      choices: TRUE_FALSE_CHOICES,
      correctChoiceId: 'false',
      explanation: {
        en: 'They did not know until a creature ate his staff. No one knows the unseen except Allah.',
        so: 'Ma ogaan ilaa xayawaan uskiisa cuno. Cidna ma oga ghaibka Alle mooyaane.',
      },
    },
    {
      id: 'sulayman-game-match',
      type: 'match',
      prompt: {
        en: 'Match the lesson: Sulayman’s power was…',
        so: 'Casharka la xiriir: awoodda Sulaymaan waxay ahayd…',
      },
      choices: [
        choice('bounty', 'A bounty from Allah, so thank Him', 'Nicmo Alle ka timid, u mahadnaq'),
        choice('self', 'Something he made without Allah', 'Wax uu isagu sameeyay Alle la’aan'),
        choice('sun', 'A gift from the sun', 'Hadiyad qorraxda ka timid'),
      ],
      correctChoiceId: 'bounty',
      explanation: {
        en: 'He said that is a clear bounty. He thanked Allah.',
        so: 'Wuxuu yiri taasi waa nicmo cad. Alle ayuu u mahadnaqay.',
      },
    },
    {
      id: 'sulayman-game-letter',
      type: 'multiple_choice',
      prompt: {
        en: 'What did Sulayman’s letter tell the queen?',
        so: 'Maxay warqaddii Sulaymaan u sheegtay boqoradda?',
      },
      choices: [
        choice('submit', 'Do not be too proud, and come in submission', 'Ha kibrin, oo kaalay hogaansasho'),
        choice('gold', 'Send gold only', 'Dahab keliya soo dir'),
        choice('sun', 'Keep the sun as a god', 'Qorraxda ilaah ahaan u hayso'),
      ],
      correctChoiceId: 'submit',
      explanation: {
        en: 'He invited her to come without pride, in submission to Allah.',
        so: 'Wuxuu ku casuumay inay timaado kibri la’aan, Alle u hogaansan.',
      },
    },
  ],
});

export const MUSA_DAWUD_STORIES: QisasStory[] = [
  MUSA_STORY,
  HARUN_STORY,
  DAWUD_STORY,
  SULAYMAN_STORY,
];
