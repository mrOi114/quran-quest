import { choice, createQisasStory, rememberProphetQuestion, TRUE_FALSE_CHOICES } from './storyFactory';
import type { QisasStory } from '../types';

export const YUSUF_STORY: QisasStory = createQisasStory({
  id: 'qisas-story-011',
  prophetKey: 'yusuf',
  title: {
    en: 'The Story of Prophet Yusuf عليه السلام',
    so: 'Qisadii Nebi Yuusuf عليه السلام',
  },
  prophetName: { en: 'Yusuf عليه السلام', so: 'Yuusuf عليه السلام' },
  summary: {
    en: 'Yusuf عليه السلام saw a dream, was patient through hardship, stayed pure, and Allah raised him in Egypt. He forgave his brothers.',
    so: 'Yuusuf عليه السلام riyo buu arkay, wuu samray dhibaato, wuu isdaahiriyay, Alle na wuxuu kor u qaaday Masar. Wuxuu cafiyay walaalihiis.',
  },
  chapters: [
    {
      id: 'yusuf-dream',
      title: { en: 'The dream', so: 'Riyadii' },
      body: {
        en: 'Yusuf عليه السلام told his father Yaqub عليه السلام a dream: eleven stars, the sun, and the moon were prostrating to him. Yaqub told him not to tell his brothers, so they would not plot against him. Allah would teach Yusuf the meaning of dreams and complete His favour upon him.',
        so: 'Yuusuf عليه السلام wuxuu aabbihiis Yacquub عليه السلام u sheegay riyo: kow iyo toban xiddigood, qorraxda, iyo dayaxa ayaa u sujuuday. Yacquub wuxuu ku yiri ha u sheegin walaalihiis, si ayan u dhagax-dhigin. Alle wuxuu Yuusuf bari lahaa macnaha riyooyinka oo uu dhammaystiri lahaa nicmadiisa.',
      },
    },
    {
      id: 'yusuf-well',
      title: { en: 'The well and Egypt', so: 'Ceelka iyo Masar' },
      body: {
        en: 'His brothers were jealous. They put him in a well. Travellers found him and sold him in Egypt. The man who bought him told his wife to honour him. Later she tried to make him do a wrong thing. Yusuf عليه السلام refused, because he feared Allah. He was put in prison, though he had done no wrong.',
        so: 'Walaalihiis way ka hinaaseen. Waxay ku rideen ceel. Socotada ayaa helay, waxayna ka iibiyeen Masar. Ninkii iibsaday wuxuu xaaskiisa ku yiri sharafee. Kadib iyadu waxay isku dayday inay ku sameyso wax khaldan. Yuusuf عليه السلام wuu diiday, maxaa yeelay Alle ayuu ka cabsaday. Xabsi ayaa la galiyay, in kasta oo uusan wax khalad ah samayn.',
      },
    },
    {
      id: 'yusuf-raised',
      title: { en: 'Allah raised him', so: 'Alle wuu kor u qaaday' },
      body: {
        en: 'In prison he told the truth about dreams by Allah’s permission. The king of Egypt had a dream. Yusuf explained it: years of plenty, then years of hardship. The king brought him out. Allah placed him in a trusted position to store food and help people.',
        so: 'Xabsiga wuxuu run ka sheegay riyooyinka idanka Alle. Boqorkii Masar riyo buu arkay. Yuusuf wuu fasiray: sano barwaaqo, kadib sano adag. Boqorku wuu soo saaray. Alle wuxuu geliyay jagada la aamino si cunto loo kaydiyo dadkana loo caawiyo.',
      },
    },
    {
      id: 'yusuf-forgive',
      title: { en: 'He forgave his brothers', so: 'Wuxuu cafiyay walaalihiis' },
      body: {
        en: 'Years later his brothers came to Egypt for food. They did not know him. Yusuf was kind. He revealed himself and said: there is no blame on you today. Allah has forgiven you. He asked them to bring his father. Allah made the dream come true. The story teaches patience, purity, and forgiveness.',
        so: 'Sannado kadib walaalihiis waxay cunto ugu yimaadeen Masar. Iyagu ma aqoonin. Yuusuf wuu naxariistay. Wuu ismuujiyay wuxuuna yiri: maanta eed idinkuma jirto. Alle wuu idin cafiyay. Wuxuu weydiistay inay aabbihiis keenaan. Alle riyadii wuu oofiyay. Sheekadu waxay baraysaa samir, daahirnimo, iyo cafis.',
      },
    },
  ],
  quranReferences: ['12:4–101'],
  learnQuestions: [
    {
      id: 'yusuf-learn-1',
      type: 'multiple_choice',
      prompt: {
        en: 'What did Yusuf عليه السلام see in his dream?',
        so: 'Maxuu Yuusuf عليه السلام ku arkay riyadiisa?',
      },
      choices: [
        choice('stars', 'Eleven stars, the sun, and the moon prostrating to him', 'Kow iyo toban xiddigood, qorraxda, iyo dayaxa oo u sujuudaya'),
        choice('ark', 'An ark on the sea', 'Doon badda saaran'),
        choice('fire', 'A fire that was cool', 'Dab qabow'),
      ],
      correctChoiceId: 'stars',
      explanation: {
        en: 'He saw eleven stars, the sun, and the moon prostrating to him.',
        so: 'Wuxuu arkay kow iyo toban xiddigood, qorraxda, iyo dayaxa oo u sujuudaya.',
      },
    },
    {
      id: 'yusuf-learn-2',
      type: 'multiple_choice',
      prompt: {
        en: 'What did Yusuf عليه السلام do when he was told to do something wrong?',
        so: 'Maxuu Yuusuf عليه السلام sameeyay markii loo sheegay inuu sameeyo wax khaldan?',
      },
      choices: [
        choice('refused', 'He refused, because he feared Allah', 'Wuu diiday, maxaa yeelay Alle ayuu ka cabsaday'),
        choice('obeyed-wrong', 'He obeyed the wrong command', 'Wuu adeecay amarka khaldan'),
        choice('idols', 'He asked an idol', 'Sanam buu weydiiyay'),
      ],
      correctChoiceId: 'refused',
      explanation: {
        en: 'He stayed pure and feared Allah, even when it was hard.',
        so: 'Wuu isdaahiriyay oo Alle ka cabsaday, xitaa markay adkayd.',
      },
    },
    {
      id: 'yusuf-learn-3',
      type: 'true_false',
      prompt: {
        en: 'Yusuf عليه السلام was put in prison even though he had done no wrong.',
        so: 'Yuusuf عليه السلام xabsi ayaa la galiyay in kasta oo uusan wax khalad ah samayn.',
      },
      choices: TRUE_FALSE_CHOICES,
      correctChoiceId: 'true',
      explanation: {
        en: 'He was imprisoned unjustly. Allah later raised him.',
        so: 'Si xaqdarro ah ayaa loo xiray. Alle markii dambe wuu kor u qaaday.',
      },
    },
    {
      id: 'yusuf-learn-4',
      type: 'multiple_choice',
      prompt: {
        en: 'How did Yusuf عليه السلام treat his brothers when they came to Egypt?',
        so: 'Sidee Yuusuf عليه السلام ula dhaqmay walaalihiis markay Masar yimaadeen?',
      },
      choices: [
        choice('forgave', 'He was kind and forgave them', 'Wuu naxariistay wuuna cafiyay'),
        choice('hurt', 'He harmed them at once', 'Si degdeg ah ayuu u dhaawacay'),
        choice('hide-food', 'He hid all the food', 'Cuntada oo dhan wuu qariyay'),
      ],
      correctChoiceId: 'forgave',
      explanation: {
        en: 'He said there is no blame on you today. Allah has forgiven you.',
        so: 'Wuxuu yiri maanta eed idinkuma jirto. Alle wuu idin cafiyay.',
      },
    },
    {
      id: 'yusuf-learn-5',
      type: 'multiple_choice',
      prompt: {
        en: 'What can we learn from Yusuf عليه السلام?',
        so: 'Maxaan ka baran karnaa Yuusuf عليه السلام?',
      },
      choices: [
        choice('values', 'Patience, purity, and forgiveness', 'Samir, daahirnimo, iyo cafis'),
        choice('jealousy', 'Jealousy is good', 'Hinaasadu waa wanaagsan tahay'),
        choice('lie', 'Lying to family is fine', 'Been u sheegista qoyska waa sax'),
      ],
      correctChoiceId: 'values',
      explanation: {
        en: 'He was patient, he stayed pure, and he forgave.',
        so: 'Wuu samray, wuu isdaahiriyay, wuuna cafiyay.',
      },
    },
  ],
  gameQuestions: [
    {
      id: 'yusuf-game-order',
      type: 'ordering',
      prompt: {
        en: 'What happened first? Put the events in order.',
        so: 'Maxaa marka hore dhacay? Dhacdooyinka si nidaam ah u dhig.',
      },
      orderItems: [
        choice('dream', 'Yusuf told his father a dream', 'Yuusuf wuxuu aabbihiis u sheegay riyo'),
        choice('well', 'His brothers put him in a well', 'Walaalihiis waxay ku rideen ceel'),
        choice('prison', 'He stayed pure and was put in prison', 'Wuu isdaahiriyay xabsina waa la galiyay'),
        choice('forgive', 'Allah raised him and he forgave his brothers', 'Alle wuu kor u qaaday wuuna cafiyay walaalihiis'),
      ],
      explanation: {
        en: 'Dream, well, prison, then honour and forgiveness.',
        so: 'Riyo, ceel, xabsi, kadib sharaf iyo cafis.',
      },
    },
    rememberProphetQuestion(
      'yusuf-game-remember',
      'yusuf',
      [
        choice('yusuf', 'Yusuf عليه السلام', 'Yuusuf عليه السلام'),
        choice('yunus', 'Yunus عليه السلام', 'Yuunas عليه السلام'),
        choice('hud', 'Hud عليه السلام', 'Huud عليه السلام'),
      ],
      { en: 'Yusuf عليه السلام', so: 'Yuusuf عليه السلام' },
    ),
    {
      id: 'yusuf-game-tf',
      type: 'true_false',
      prompt: {
        en: 'Yusuf عليه السلام explained the king’s dream by Allah’s permission.',
        so: 'Yuusuf عليه السلام wuxuu fasiray riyadii boqorka idanka Alle.',
      },
      choices: TRUE_FALSE_CHOICES,
      correctChoiceId: 'true',
      explanation: {
        en: 'Allah taught him the meaning of dreams.',
        so: 'Alle ayaa baray macnaha riyooyinka.',
      },
    },
    {
      id: 'yusuf-game-match',
      type: 'match',
      prompt: {
        en: 'Match the lesson: when Yusuf’s brothers came, he taught us…',
        so: 'Casharka la xiriir: markii walaalihiis yimaadeen, wuxuu ina baray…',
      },
      choices: [
        choice('forgive', 'To forgive', 'In la cafiyo'),
        choice('revenge', 'To take revenge at once', 'In si degdeg ah loo aarguto'),
        choice('hide', 'To hide from family forever', 'In qoyska weligeed laga dhuunto'),
      ],
      correctChoiceId: 'forgive',
      explanation: {
        en: 'He said there is no blame on you today.',
        so: 'Wuxuu yiri maanta eed idinkuma jirto.',
      },
    },
    {
      id: 'yusuf-game-father',
      type: 'multiple_choice',
      prompt: {
        en: 'Who was the father of Yusuf عليه السلام?',
        so: 'Yuu ahaa aabbihii Yuusuf عليه السلام?',
      },
      choices: [
        choice('yaqub', 'Yaqub عليه السلام', 'Yacquub عليه السلام'),
        choice('nuh', 'Nuh عليه السلام', 'Nuux عليه السلام'),
        choice('musa', 'Musa عليه السلام', 'Muuse عليه السلام'),
      ],
      correctChoiceId: 'yaqub',
      explanation: {
        en: 'Yusuf told his dream to his father Yaqub عليه السلام.',
        so: 'Yuusuf wuxuu riyadiisa u sheegay aabbihiis Yacquub عليه السلام.',
      },
    },
  ],
});

export const SHUAYB_STORY: QisasStory = createQisasStory({
  id: 'qisas-story-012',
  prophetKey: 'shuayb',
  title: {
    en: 'The Story of Prophet Shu‘ayb عليه السلام',
    so: 'Qisadii Nebi Shucayb عليه السلام',
  },
  prophetName: { en: 'Shu‘ayb عليه السلام', so: 'Shucayb عليه السلام' },
  summary: {
    en: 'Shu‘ayb عليه السلام called Madyan to worship Allah and to be honest in buying and selling. Those who denied were destroyed.',
    so: 'Shucayb عليه السلام wuxuu Madyan ugu yeedhay inay caabudaan Alle oo ay daacad ka noqdaan iibka iyo iibsiga. Kuwii beeniyay waa la halaagay.',
  },
  chapters: [
    {
      id: 'shuayb-madyan',
      title: { en: 'The people of Madyan', so: 'Dadka Madyan' },
      body: {
        en: 'Allah sent Prophet Shu‘ayb عليه السلام to Madyan. He said: worship Allah. You have no god other than Him. Give full measure and weight, and do not cheat people of their things.',
        so: 'Alle wuxuu u diray Nebi Shucayb عليه السلام Madyan. Wuxuu yiri: Alle caabuda. Ilaah kale ma lihidin. Miisaanka iyo miisaanka buuxa siiya, hana dhagar gelinina dadka alaabtooda.',
      },
    },
    {
      id: 'shuayb-honest',
      title: { en: 'Be honest', so: 'Noqda daacad' },
      body: {
        en: 'His people cheated in trade. They took more than they should and gave less than they should. Shu‘ayb عليه السلام told them not to spread corruption in the land after it had been set right.',
        so: 'Dadkiisu waxay khiyaameeyeen ganacsiga. Waxay qaadan jireen in ka badan intii ay xaq u lahaayeen, waxayna siin jireen in ka yar. Shucayb عليه السلام wuxuu ku yiri ha fidinina fasaadka dhulka kadib markii la hagaajiyay.',
      },
    },
    {
      id: 'shuayb-end',
      title: { en: 'Those who denied were destroyed', so: 'Kuwii beeniyay waa la halaagay' },
      body: {
        en: 'They mocked him and told him to leave his religion or they would drive him out. An earthquake, or a blast, seized those who denied. Shu‘ayb عليه السلام and the believers were saved. Honesty in trade is part of worshipping Allah.',
        so: 'Way ku jeesjeeseen, waxayna ku yiraahdeen ka tag diinta ama waan kaa eryi doonnaa. Dhulgariir ama qaylo ayaa qabatay kuwii beeniyay. Shucayb عليه السلام iyo rumaystayaasha waa la badbaadiyay. Daacadnimada ganacsigu waa qayb ka mid ah cibaadada Alle.',
      },
    },
  ],
  quranReferences: ['7:85–93', '11:84–95', '26:176–191', '29:36–37'],
  learnQuestions: [
    {
      id: 'shuayb-learn-1',
      type: 'multiple_choice',
      prompt: {
        en: 'To which people was Shu‘ayb عليه السلام sent?',
        so: 'Dadkee baa loo diray Shucayb عليه السلام?',
      },
      choices: [
        choice('madyan', 'Madyan', 'Madyan'),
        choice('ad', '‘Ad', 'Caad'),
        choice('thamud', 'Thamud', 'Thamuud'),
      ],
      correctChoiceId: 'madyan',
      explanation: {
        en: 'Shu‘ayb عليه السلام was sent to Madyan.',
        so: 'Shucayb عليه السلام waxaa loo diray Madyan.',
      },
    },
    {
      id: 'shuayb-learn-2',
      type: 'multiple_choice',
      prompt: {
        en: 'What did he tell them about buying and selling?',
        so: 'Maxuu kaga yiri iibka iyo iibsiga?',
      },
      choices: [
        choice('full', 'Give full measure and weight; do not cheat', 'Miisaanka buuxa siiya; ha dhagartina'),
        choice('cheat', 'Cheat if you can', 'Dhagar haddii aad kari karto'),
        choice('idols', 'Sell idols only', 'Sanamyo keliya iibiya'),
      ],
      correctChoiceId: 'full',
      explanation: {
        en: 'He commanded fair measure and forbade cheating.',
        so: 'Wuxuu amray miisaan cadaalad ah wuxuuna reebay dhagarta.',
      },
    },
    {
      id: 'shuayb-learn-3',
      type: 'true_false',
      prompt: {
        en: 'Honesty in trade is part of worshipping Allah in this story.',
        so: 'Daacadnimada ganacsigu waa qayb ka mid ah cibaadada Alle sheekadan.',
      },
      choices: TRUE_FALSE_CHOICES,
      correctChoiceId: 'true',
      explanation: {
        en: 'He joined worship of Allah with fair dealing.',
        so: 'Wuxuu isku daray cibaadada Alle iyo macaamil cadaalad ah.',
      },
    },
    {
      id: 'shuayb-learn-4',
      type: 'multiple_choice',
      prompt: {
        en: 'What happened to those who denied Shu‘ayb عليه السلام?',
        so: 'Maxaa ku dhacay kuwii beeniyay Shucayb عليه السلام?',
      },
      choices: [
        choice('destroyed', 'They were destroyed', 'Waa la halaagay'),
        choice('rewarded', 'They were given more wealth', 'Hanti dheeraad ah ayaa la siiyay'),
        choice('ignored', 'Nothing happened', 'Waxba ma dhicin'),
      ],
      correctChoiceId: 'destroyed',
      explanation: {
        en: 'A punishment seized those who denied. The believers were saved.',
        so: 'Ciqaab ayaa qabatay kuwii beeniyay. Rumaystayaasha waa la badbaadiyay.',
      },
    },
    {
      id: 'shuayb-learn-5',
      type: 'multiple_choice',
      prompt: {
        en: 'What can we learn from Shu‘ayb عليه السلام?',
        so: 'Maxaan ka baran karnaa Shucayb عليه السلام?',
      },
      choices: [
        choice('honest', 'Be honest and do not cheat', 'Noqo daacad hana dhagar gelin'),
        choice('cheat', 'Cheat in the market', 'Suuqa ku dhagar'),
        choice('mock', 'Mock the messengers', 'Ku jeesjees rasuullada'),
      ],
      correctChoiceId: 'honest',
      explanation: {
        en: 'Fair measure is part of obeying Allah.',
        so: 'Miisaanka cadaaladda waa qayb ka mid ah adeecidda Alle.',
      },
    },
  ],
  gameQuestions: [
    {
      id: 'shuayb-game-order',
      type: 'ordering',
      prompt: {
        en: 'What happened first? Put the events in order.',
        so: 'Maxaa marka hore dhacay? Dhacdooyinka si nidaam ah u dhig.',
      },
      orderItems: [
        choice('sent', 'Allah sent Shu‘ayb to Madyan', 'Alle wuxuu Shucayb u diray Madyan'),
        choice('honest', 'He told them to be honest in trade', 'Wuxuu ku yiri ganacsiga daacad ka noqda'),
        choice('deny', 'They cheated and denied him', 'Way dhagartay wayna beeniyeen'),
        choice('end', 'Those who denied were destroyed', 'Kuwii beeniyay waa la halaagay'),
      ],
      explanation: {
        en: 'He was sent, he called to honesty, they denied, then punishment came.',
        so: 'Waa la diray, daacad buu ugu yeedhay, way beeniyeen, ciqaabtu timid.',
      },
    },
    rememberProphetQuestion(
      'shuayb-game-remember',
      'shuayb',
      [
        choice('shuayb', 'Shu‘ayb عليه السلام', 'Shucayb عليه السلام'),
        choice('hud', 'Hud عليه السلام', 'Huud عليه السلام'),
        choice('ilyas', 'Ilyas عليه السلام', 'Ilyaas عليه السلام'),
      ],
      { en: 'Shu‘ayb عليه السلام', so: 'Shucayb عليه السلام' },
    ),
    {
      id: 'shuayb-game-tf',
      type: 'true_false',
      prompt: {
        en: 'Shu‘ayb عليه السلام told them not to spread corruption in the land.',
        so: 'Shucayb عليه السلام wuxuu ku yiri ha fidinina fasaadka dhulka.',
      },
      choices: TRUE_FALSE_CHOICES,
      correctChoiceId: 'true',
      explanation: {
        en: 'He forbade corruption after the land had been set right.',
        so: 'Wuxuu reebay fasaadka kadib markii dhulka la hagaajiyay.',
      },
    },
    {
      id: 'shuayb-game-match',
      type: 'match',
      prompt: {
        en: 'Match the lesson: cheating in trade is…',
        so: 'Casharka la xiriir: dhagarta ganacsigu waa…',
      },
      choices: [
        choice('wrong', 'Disobeying Allah', 'In Alle la caasiyo'),
        choice('clever', 'Always clever and good', 'Had iyo jeer caqli iyo wanaag'),
        choice('small', 'Too small for Allah to care', 'Aad u yar oo Alle dan ka gelin'),
      ],
      correctChoiceId: 'wrong',
      explanation: {
        en: 'Allah sent a prophet to stop cheating. Honesty is worship.',
        so: 'Alle wuxuu soo diray nebi si dhagarta loo joojiyo. Daacadnimadu waa cibaado.',
      },
    },
    {
      id: 'shuayb-game-measure',
      type: 'multiple_choice',
      prompt: {
        en: 'What is “full measure” in this story?',
        so: 'Waa maxay “miisaanka buuxa” sheekadan?',
      },
      choices: [
        choice('fair', 'Giving people what is fair and complete', 'In dadka la siiyo wax cadaalad ah oo dhammaystiran'),
        choice('less', 'Giving less on purpose', 'In si ula kac ah wax yar la siiyo'),
        choice('hide', 'Hiding the scales', 'In miisaanka la qariyo'),
      ],
      correctChoiceId: 'fair',
      explanation: {
        en: 'Full measure means do not cheat people of their things.',
        so: 'Miisaanka buuxa wuxuu ka dhigan yahay inaan dadka laga dhagar gelin alaabtooda.',
      },
    },
  ],
});

export const AYYUB_STORY: QisasStory = createQisasStory({
  id: 'qisas-story-013',
  prophetKey: 'ayyub',
  title: {
    en: 'The Story of Prophet Ayyub عليه السلام',
    so: 'Qisadii Nebi Ayuub عليه السلام',
  },
  prophetName: { en: 'Ayyub عليه السلام', so: 'Ayuub عليه السلام' },
  summary: {
    en: 'Ayyub عليه السلام was patient in hardship. He called upon Allah, and Allah answered him with mercy.',
    so: 'Ayuub عليه السلام wuu samray dhibaatada. Alle ayuu u yeedhay, Alle na naxariis buu ugu jawaabay.',
  },
  chapters: [
    {
      id: 'ayyub-patient',
      title: { en: 'A patient servant', so: 'Addoon samir leh' },
      body: {
        en: 'Allah mentioned Prophet Ayyub عليه السلام as a patient servant. Harm had touched him. He did not turn away from Allah.',
        so: 'Alle wuxuu xusay Nebi Ayuub عليه السلام inuu ahaa addoon samir leh. Dhib ayaa taabatay. Alle kama jeesan.',
      },
    },
    {
      id: 'ayyub-dua',
      title: { en: 'He called upon Allah', so: 'Alle ayuu u yeedhay' },
      body: {
        en: 'Ayyub عليه السلام called out: harm has touched me, and You are the Most Merciful of those who show mercy. He asked his Lord with humility.',
        so: 'Ayuub عليه السلام wuu qayliyay: dhib ayaa i taabatay, Adiguna waxaad tahay Kan ugu naxariista badan kuwa naxariista. Wuxuu Rabbihiisa u baryay is-hoosaysiin.',
      },
    },
    {
      id: 'ayyub-mercy',
      title: { en: 'Allah answered him', so: 'Alle wuu u jawaabay' },
      body: {
        en: 'Allah answered him. Allah removed the harm that was upon him, and gave him his family and the like of them with them, as a mercy from Him. The story teaches us to be patient and to call upon Allah when we are hurting.',
        so: 'Alle wuu u jawaabay. Alle wuxuu ka qaaday dhibkii saarnaa, wuxuuna siiyay reerkiisa iyo kuwa la mid ah iyaga, naxariis Dartiis. Sheekadu waxay ina bartaa inaan samrino oo aan Alle u yeedhno markaan xanuunsano.',
      },
    },
  ],
  quranReferences: ['21:83–84', '38:41–44'],
  learnQuestions: [
    {
      id: 'ayyub-learn-1',
      type: 'multiple_choice',
      prompt: {
        en: 'How does the Qur’an describe Ayyub عليه السلام?',
        so: 'Sidee Quraanku u tilmaamay Ayuub عليه السلام?',
      },
      choices: [
        choice('patient', 'A patient servant', 'Addoon samir leh'),
        choice('angry', 'A man who never prayed', 'Nin waligiis tukin'),
        choice('king', 'A king who never suffered', 'Boqor waligiis dhibin'),
      ],
      correctChoiceId: 'patient',
      explanation: {
        en: 'Allah mentioned him among the patient.',
        so: 'Alle wuxuu ku daray kuwa samra.',
      },
    },
    {
      id: 'ayyub-learn-2',
      type: 'multiple_choice',
      prompt: {
        en: 'What did Ayyub عليه السلام say to Allah?',
        so: 'Maxuu Ayuub عليه السلام ku yiri Alle?',
      },
      choices: [
        choice('mercy', 'Harm has touched me, and You are the Most Merciful', 'Dhib ayaa i taabatay, Adiguna waxaad tahay Kan ugu naxariista badan'),
        choice('leave', 'I will leave You', 'Waan kaa tegi'),
        choice('idols', 'I will ask idols', 'Sanamyada ayaan weydiinayaa'),
      ],
      correctChoiceId: 'mercy',
      explanation: {
        en: 'He called upon Allah with humility and hope.',
        so: 'Wuxuu Alle ugu yeedhay is-hoosaysiin iyo rajo.',
      },
    },
    {
      id: 'ayyub-learn-3',
      type: 'true_false',
      prompt: {
        en: 'Allah answered Ayyub عليه السلام and removed the harm.',
        so: 'Alle wuu u jawaabay Ayuub عليه السلام wuuna qaaday dhibkii.',
      },
      choices: TRUE_FALSE_CHOICES,
      correctChoiceId: 'true',
      explanation: {
        en: 'Allah removed the harm and gave him mercy.',
        so: 'Alle wuxuu qaaday dhibkii wuuna naxariistay.',
      },
    },
    {
      id: 'ayyub-learn-4',
      type: 'multiple_choice',
      prompt: {
        en: 'What extra mercy did Allah give him?',
        so: 'Waa maxay naxariista dheeraadka ah ee Alle siiyay?',
      },
      choices: [
        choice('family', 'His family, and the like of them with them', 'Reerkiisa, iyo kuwa la mid ah iyaga'),
        choice('idols', 'New idols', 'Sanamyo cusub'),
        choice('none', 'Nothing at all', 'Waxba'),
      ],
      correctChoiceId: 'family',
      explanation: {
        en: 'Allah gave him his family and the like of them, as a mercy.',
        so: 'Alle wuxuu siiyay reerkiisa iyo kuwa la mid ah, naxariis ahaan.',
      },
    },
    {
      id: 'ayyub-learn-5',
      type: 'multiple_choice',
      prompt: {
        en: 'What can we learn from Ayyub عليه السلام?',
        so: 'Maxaan ka baran karnaa Ayuub عليه السلام?',
      },
      choices: [
        choice('patience', 'Be patient and call upon Allah', 'Samir oo Alle u yeedh'),
        choice('complain-idols', 'Leave Allah when you hurt', 'Ka tag Alle markaad xanuunsato'),
        choice('angry', 'Be angry at everyone', 'Qof walba kaga cadhoow'),
      ],
      correctChoiceId: 'patience',
      explanation: {
        en: 'He was patient and asked Allah. Allah answered him.',
        so: 'Wuu samray oo Alle weydiiyay. Alle wuu u jawaabay.',
      },
    },
  ],
  gameQuestions: [
    {
      id: 'ayyub-game-order',
      type: 'ordering',
      prompt: {
        en: 'What happened first? Put the events in order.',
        so: 'Maxaa marka hore dhacay? Dhacdooyinka si nidaam ah u dhig.',
      },
      orderItems: [
        choice('harm', 'Harm touched Ayyub', 'Dhib ayaa taabatay Ayuub'),
        choice('patient', 'He stayed a patient servant', 'Wuxuu ahaanayay addoon samir leh'),
        choice('dua', 'He called upon Allah', 'Alle ayuu u yeedhay'),
        choice('answer', 'Allah answered and showed mercy', 'Alle wuu jawaabay wuuna naxariistay'),
      ],
      explanation: {
        en: 'Harm came, he was patient, he made du‘a, then Allah answered.',
        so: 'Dhibkii yimid, wuu samray, wuu ducaystay, Alle na wuu jawaabay.',
      },
    },
    rememberProphetQuestion(
      'ayyub-game-remember',
      'ayyub',
      [
        choice('ayyub', 'Ayyub عليه السلام', 'Ayuub عليه السلام'),
        choice('yunus', 'Yunus عليه السلام', 'Yuunas عليه السلام'),
        choice('hud', 'Hud عليه السلام', 'Huud عليه السلام'),
      ],
      { en: 'Ayyub عليه السلام', so: 'Ayuub عليه السلام' },
    ),
    {
      id: 'ayyub-game-tf',
      type: 'true_false',
      prompt: {
        en: 'Ayyub عليه السلام turned away from Allah when harm touched him.',
        so: 'Ayuub عليه السلام Alle wuu ka jeestay markii dhibku taabtay.',
      },
      choices: TRUE_FALSE_CHOICES,
      correctChoiceId: 'false',
      explanation: {
        en: 'He stayed a patient servant and called upon Allah.',
        so: 'Wuxuu ahaanayay addoon samir leh oo Alle u yeedha.',
      },
    },
    {
      id: 'ayyub-game-match',
      type: 'match',
      prompt: {
        en: 'Match the lesson: when we hurt, this story teaches…',
        so: 'Casharka la xiriir: markaan xanuunsanno, sheekadani waxay baraysaa…',
      },
      choices: [
        choice('dua', 'To call upon Allah with patience', 'In Alle loogu yeedho samir'),
        choice('quit', 'To stop worship', 'In cibaadada la joojiyo'),
        choice('blame', 'To blame every person', 'In qof walba la eedeeyo'),
      ],
      correctChoiceId: 'dua',
      explanation: {
        en: 'Ayyub called upon the Most Merciful, and Allah answered.',
        so: 'Ayuub wuxuu u yeedhay Kan ugu naxariista badan, Alle na wuu jawaabay.',
      },
    },
    {
      id: 'ayyub-game-who',
      type: 'multiple_choice',
      prompt: {
        en: 'Who answered Ayyub عليه السلام?',
        so: 'Yaa u jawaabay Ayuub عليه السلام?',
      },
      choices: [
        choice('allah', 'Allah', 'Alle'),
        choice('idols', 'Idols', 'Sanamyada'),
        choice('kings', 'Kings', 'Boqorrada'),
      ],
      correctChoiceId: 'allah',
      explanation: {
        en: 'Allah answered him and showed him mercy.',
        so: 'Alle wuu u jawaabay wuuna u naxariistay.',
      },
    },
  ],
});

export const DHUL_KIFL_STORY: QisasStory = createQisasStory({
  id: 'qisas-story-014',
  prophetKey: 'dhul-kifl',
  title: {
    en: 'The Story of Prophet Dhul-Kifl عليه السلام',
    so: 'Qisadii Nebi Dhul-Kifli عليه السلام',
  },
  prophetName: { en: 'Dhul-Kifl عليه السلام', so: 'Dhul-Kifli عليه السلام' },
  summary: {
    en: 'Allah named Dhul-Kifl عليه السلام among the patient and the righteous. The Qur’an does not tell a long story about him, so we keep to what Allah said.',
    so: 'Alle wuxuu Dhul-Kifli عليه السلام ku daray kuwa samra iyo kuwa suubban. Quraanku sheeko dheer kama sheegin, sidaas darteed waxaan ku ekaanaynaa wixii Alle yiri.',
  },
  chapters: [
    {
      id: 'dhulkifl-named',
      title: { en: 'Named with the patient', so: 'Lagu daray kuwa samra' },
      body: {
        en: 'Allah mentioned Dhul-Kifl عليه السلام with Ismail and Idris. Allah said they were all among the patient. Patience is a great quality of the prophets.',
        so: 'Alle wuxuu Dhul-Kifli عليه السلام kula xusay Ismaaciil iyo Idriis. Alle wuxuu yiri dhammaantood waxay ka mid ahaayeen kuwa samra. Samirku waa sifo weyn oo nebiyada.',
      },
    },
    {
      id: 'dhulkifl-righteous',
      title: { en: 'Among the righteous', so: 'Kuwa suubban dhexdooda' },
      body: {
        en: 'Allah admitted them into His mercy. They were among the righteous. The Qur’an does not add extra names, dates, or long adventures for Dhul-Kifl. We do not invent them.',
        so: 'Alle wuxuu geliyay naxariistiisa. Waxay ka mid ahaayeen kuwa suubban. Quraanku magacyo dheeraad ah, taariikho, ama sheekooyin dhaadheer kama darin Dhul-Kifli. Ma abuurnayno.',
      },
    },
    {
      id: 'dhulkifl-lesson',
      title: { en: 'What we learn', so: 'Waxa aan baranno' },
      body: {
        en: 'Even a short mention in the Qur’an is enough. We honour Dhul-Kifl عليه السلام as a patient, righteous servant of Allah. We try to be patient and righteous too.',
        so: 'Xitaa xus gaaban oo Quraanka ku jira waa ku filan yahay. Waxaan sharafeeynaa Dhul-Kifli عليه السلام inuu ahaa addoon samir leh oo suubban. Annaguna waa inaan samrino oo suubbano.',
      },
    },
  ],
  quranReferences: ['21:85–86', '38:48'],
  learnQuestions: [
    {
      id: 'dhulkifl-learn-1',
      type: 'multiple_choice',
      prompt: {
        en: 'With which prophets is Dhul-Kifl عليه السلام mentioned?',
        so: 'Nebyadee baa lala xusay Dhul-Kifli عليه السلام?',
      },
      choices: [
        choice('ismail-idris', 'Ismail and Idris عليهما السلام', 'Ismaaciil iyo Idriis عليهما السلام'),
        choice('nuh-hud', 'Nuh and Hud only', 'Nuux iyo Huud keliya'),
        choice('none', 'He is not in the Qur’an', 'Quraanka kuma jiro'),
      ],
      correctChoiceId: 'ismail-idris',
      explanation: {
        en: 'Allah mentioned Ismail, Idris, and Dhul-Kifl together.',
        so: 'Alle wuxuu wada xusay Ismaaciil, Idriis, iyo Dhul-Kifli.',
      },
    },
    {
      id: 'dhulkifl-learn-2',
      type: 'multiple_choice',
      prompt: {
        en: 'What quality does the Qur’an give him?',
        so: 'Waa maxay sifada Quraanku siiyay?',
      },
      choices: [
        choice('patient', 'He was among the patient and the righteous', 'Wuxuu ka mid ahaa kuwa samra iyo kuwa suubban'),
        choice('proud', 'He was proud', 'Wuu kibray'),
        choice('silent-never', 'He never worshipped Allah', 'Waligiis Alle ma caabudin'),
      ],
      correctChoiceId: 'patient',
      explanation: {
        en: 'Allah said they were among the patient, and among the righteous.',
        so: 'Alle wuxuu yiri waxay ka mid ahaayeen kuwa samra iyo kuwa suubban.',
      },
    },
    {
      id: 'dhulkifl-learn-3',
      type: 'true_false',
      prompt: {
        en: 'The Qur’an tells a very long adventure story about Dhul-Kifl عليه السلام.',
        so: 'Quraanku wuxuu sheegay sheeko aad u dheer oo ku saabsan Dhul-Kifli عليه السلام.',
      },
      choices: TRUE_FALSE_CHOICES,
      correctChoiceId: 'false',
      explanation: {
        en: 'The Qur’an mentions him briefly. We do not invent extra details.',
        so: 'Quraanku si kooban ayuu u xusay. Faahfaahin dheeraad ah ma abuurnayno.',
      },
    },
    {
      id: 'dhulkifl-learn-4',
      type: 'multiple_choice',
      prompt: {
        en: 'What did Allah do for them?',
        so: 'Maxaa Alle u sameeyay?',
      },
      choices: [
        choice('mercy', 'He admitted them into His mercy', 'Wuxuu geliyay naxariistiisa'),
        choice('forget', 'He forgot them', 'Wuu illooway'),
        choice('idols', 'He told them to serve idols', 'Wuxuu ku yiri sanamyada u adeega'),
      ],
      correctChoiceId: 'mercy',
      explanation: {
        en: 'Allah admitted them into His mercy.',
        so: 'Alle wuxuu geliyay naxariistiisa.',
      },
    },
    {
      id: 'dhulkifl-learn-5',
      type: 'multiple_choice',
      prompt: {
        en: 'What can we learn from this short story?',
        so: 'Maxaan ka baran karnaa sheekadan gaaban?',
      },
      choices: [
        choice('patient', 'To be patient and righteous', 'Inaan samrino oo suubbano'),
        choice('invent', 'To invent extra miracles', 'Inaan mucjisooyin abuurno'),
        choice('skip', 'To skip prophets with short mentions', 'Inaan ka boodno nebiyada si kooban loo xusay'),
      ],
      correctChoiceId: 'patient',
      explanation: {
        en: 'A short mention still teaches patience and righteousness.',
        so: 'Xus gaaban xitaa wuxuu barayaa samir iyo suubbanimo.',
      },
    },
  ],
  gameQuestions: [
    {
      id: 'dhulkifl-game-order',
      type: 'ordering',
      prompt: {
        en: 'What happened first? Put the events in order.',
        so: 'Maxaa marka hore dhacay? Dhacdooyinka si nidaam ah u dhig.',
      },
      orderItems: [
        choice('named', 'Allah named Dhul-Kifl in the Qur’an', 'Alle wuxuu Dhul-Kifli ku magacaabay Quraanka'),
        choice('patient', 'He was among the patient', 'Wuxuu ka mid ahaa kuwa samra'),
        choice('righteous', 'He was among the righteous', 'Wuxuu ka mid ahaa kuwa suubban'),
        choice('mercy', 'Allah admitted him into His mercy', 'Alle wuxuu geliyay naxariistiisa'),
      ],
      explanation: {
        en: 'Allah named him, he was patient and righteous, and Allah showed him mercy.',
        so: 'Alle wuu magacaabay, wuxuu ahaa samir iyo suubban, Alle na naxariis buu u fidiyay.',
      },
    },
    rememberProphetQuestion(
      'dhulkifl-game-remember',
      'dhulkifl',
      [
        choice('dhulkifl', 'Dhul-Kifl عليه السلام', 'Dhul-Kifli عليه السلام'),
        choice('hud', 'Hud عليه السلام', 'Huud عليه السلام'),
        choice('yunus', 'Yunus عليه السلام', 'Yuunas عليه السلام'),
      ],
      { en: 'Dhul-Kifl عليه السلام', so: 'Dhul-Kifli عليه السلام' },
    ),
    {
      id: 'dhulkifl-game-tf',
      type: 'true_false',
      prompt: {
        en: 'We should invent extra stories about Dhul-Kifl عليه السلام to make the lesson longer.',
        so: 'Waa inaan abuurnaa sheekooyin dheeraad ah oo ku saabsan Dhul-Kifli عليه السلام si casharka loo dheereeyo.',
      },
      choices: TRUE_FALSE_CHOICES,
      correctChoiceId: 'false',
      explanation: {
        en: 'If the Qur’an is brief, we stay brief. We do not invent.',
        so: 'Haddii Quraanku kooban yahay, waa inaan koobnaanno. Ma abuurnayno.',
      },
    },
    {
      id: 'dhulkifl-game-match',
      type: 'match',
      prompt: {
        en: 'Match the lesson: Dhul-Kifl عليه السلام is honoured for…',
        so: 'Casharka la xiriir: Dhul-Kifli عليه السلام waxaa loo sharafeeyay…',
      },
      choices: [
        choice('patience', 'Patience and righteousness', 'Samir iyo suubbanimo'),
        choice('pride', 'Pride', 'Kibri'),
        choice('jokes', 'Jokes about prophets', 'Kaftan nebiyada ku saabsan'),
      ],
      correctChoiceId: 'patience',
      explanation: {
        en: 'Allah named him among the patient and the righteous.',
        so: 'Alle wuxuu ku daray kuwa samra iyo kuwa suubban.',
      },
    },
    {
      id: 'dhulkifl-game-enough',
      type: 'multiple_choice',
      prompt: {
        en: 'Is a short Qur’an mention enough to honour a prophet?',
        so: 'Xus gaaban oo Quraanka ah ma ku filan yahay in nebi lagu sharafeeyo?',
      },
      choices: [
        choice('yes', 'Yes. What Allah said is enough.', 'Haa. Wixii Alle yiri waa ku filan yahay.'),
        choice('no', 'No. We must invent more.', 'Maya. Waa inaan wax kale abuurno.'),
        choice('skip', 'Skip him in the library.', 'Ka bood maktabadda.'),
      ],
      correctChoiceId: 'yes',
      explanation: {
        en: 'We honour him with what Allah revealed, not with guesses.',
        so: 'Waxaan ku sharafeeynaa wixii Alle waxyiyay, ma aha male-awaal.',
      },
    },
  ],
});

export const EGYPT_PATIENCE_STORIES: QisasStory[] = [
  YUSUF_STORY,
  SHUAYB_STORY,
  AYYUB_STORY,
  DHUL_KIFL_STORY,
];
