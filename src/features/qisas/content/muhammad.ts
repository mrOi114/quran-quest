import { choice, createQisasStory, rememberProphetQuestion, TRUE_FALSE_CHOICES } from './storyFactory';
import type { QisasStory } from '../types';

export const MUHAMMAD_STORY: QisasStory = createQisasStory({
  id: 'qisas-story-025',
  prophetKey: 'muhammad',
  title: {
    en: 'The Story of Prophet Muhammad ﷺ',
    so: 'Qisadii Nebi Muxammad ﷺ',
  },
  prophetName: { en: 'Muhammad ﷺ', so: 'Muxammad ﷺ' },
  summary: {
    en: 'Muhammad ﷺ is the Messenger of Allah and the Seal of the Prophets. Allah cared for him as an orphan, taught him to Read, sent him as a mercy, and protected him.',
    so: 'Muxammad ﷺ waa Rasuulka Alle iyo Khatamka Nebiyada. Alle wuu daryeelay isagoo agoonta ah, wuxuu baray Akhri, wuxuu u diray naxariis ahaan, wuuna ilaaliyay.',
  },
  chapters: [
    {
      id: 'muhammad-orphan',
      title: { en: 'Allah cared for the orphan', so: 'Alle wuxuu daryeelay agoonteedii' },
      body: {
        en: 'Allah reminded Muhammad ﷺ of His care. Did He not find you an orphan and give you refuge? Did He not find you unaware and guide you? Did He not find you in need and enrich you? So do not treat the orphan harshly, and do not repel the one who asks. Proclaim the blessing of your Lord.',
        so: 'Alle wuxuu Muxammad ﷺ xasuusiyay daryeelkiisa. Miyaanu kugu helin agoon oo uu ku magangeliyay? Miyaanu kugu helin mid aan ogayn oo uu ku hanuuniyay? Miyaanu kugu helin baahan oo uu ku hodmiyay? Sidaas darteed ha ku adkayn agoonteed, kana celiin weydiistaha. Nicmada Rabbigaaga sheeg.',
      },
    },
    {
      id: 'muhammad-read',
      title: { en: 'Read', so: 'Akhri' },
      body: {
        en: 'The first words Allah sent down were: Read in the name of your Lord who created — created man from a clinging clot. Read, and your Lord is the Most Generous, who taught by the pen, taught man what he did not know. Authentic hadith tells that this came in the cave of Hira, when the angel came and told him to read. Muhammad ﷺ is not a poet inventing words. This is revelation from Allah.',
        so: 'Erayadii ugu horreeyay ee Alle soo dejiyay waxay ahaayeen: Akhri magaca Rabbigaaga ee abuuray — dadka ka abuuray xinjir ku dheggan. Akhri, Rabbigaaguna waa Kan ugu deeqsi san, ee qalinka wax ku baray, dadkana baray wuxuu aan aqoon. Xadiis sax ah ayaa sheegaya inay ku soo degtay godka Xiraa, markii malaggu u yimid oo ku yiri akhri. Muxammad ﷺ ma aha gabyaa erayo hindisaya. Tani waa waxyiga Alle.',
      },
    },
    {
      id: 'muhammad-seal',
      title: { en: 'A mercy and the Seal of the Prophets', so: 'Naxariis iyo Khatamka Nebiyada' },
      body: {
        en: 'Allah sent Muhammad ﷺ as a mercy to the worlds. He is the Messenger of Allah and the Seal of the Prophets — the last prophet. No prophet comes after him. His message is for all people: worship Allah alone, and follow what Allah sent down.',
        so: 'Alle wuxuu Muxammad ﷺ u diray naxariis caalamka. Waa Rasuulka Alle iyo Khatamka Nebiyada — nebiga ugu dambeeya. Nebi kama dambeeyo. Farriintiisu waa dadka oo dhan: Alle keliya caabuda, raacna wixii Alle soo dejiyay.',
      },
    },
    {
      id: 'muhammad-protected',
      title: { en: 'Allah protected him', so: 'Alle wuu ilaaliyay' },
      body: {
        en: 'Allah took His servant by night from the Sacred Mosque to the Farthest Mosque, whose surroundings Allah blessed, to show him of His signs. Allah is the All-Hearing, the All-Seeing. When those who disbelieved drove him out, he was the second of two in the cave. He said to his companion: do not grieve; Allah is with us. Allah sent down His calmness and supported them. The story teaches us that Allah cares for the orphan, teaches us, and is with those who trust Him.',
        so: 'Alle wuxuu addoonkiisa habeennimo uga qaaday Masjidka Xaramka ilaa Masjidka ugu fog, oo Alle barakeeyay hareerihiisa, si uu ugu tusho calaamadihiisa. Alle waa Kan maqla, Kan arka. Markii kuwa gaaloobay eryeen, wuxuu ahaa labadii godka joogay. Wuxuu saaxiibkiis ku yiri: ha murugoon; Alle waa nala jiraa. Alle wuxuu soo dejiyay xasilloonidiisa wuuna taageeray. Sheekadu waxay ina bartaa in Alle daryeelo agoonteed, inuu ina baro, iyo inuu la jiro kuwa isaga tala saara.',
      },
    },
  ],
  quranReferences: ['93:6–11', '96:1–5', '21:107', '33:40', '17:1', '9:40'],
  hadithReferences: ['Sahih al-Bukhari 3'],
  learnQuestions: [
    {
      id: 'muhammad-learn-1',
      type: 'multiple_choice',
      prompt: {
        en: 'How did Allah care for Muhammad ﷺ as a child?',
        so: 'Sidee Alle u daryeelay Muxammad ﷺ markuu yaraa?',
      },
      choices: [
        choice('orphan', 'He found him an orphan and gave him refuge', 'Wuxuu ku helay agoon wuuna magangeliyay'),
        choice('palace', 'He was born in a palace as a king', 'Wuxuu ku dhashay qasri isagoo boqor ah'),
        choice('no-care', 'Allah did not mention this', 'Alle arrintan ma xusin'),
      ],
      correctChoiceId: 'orphan',
      explanation: {
        en: 'Allah also guided him and enriched him, then told him not to treat the orphan harshly.',
        so: 'Alle wuu hanuuniyay wuuna hodmiyay, kadibna wuxuu ku yiri ha ku adkayn agoonteed.',
      },
    },
    {
      id: 'muhammad-learn-2',
      type: 'multiple_choice',
      prompt: {
        en: 'What were the first words Allah sent down?',
        so: 'Waa maxay erayadii ugu horreeyay ee Alle soo dejiyay?',
      },
      choices: [
        choice('read', 'Read in the name of your Lord who created', 'Akhri magaca Rabbigaaga ee abuuray'),
        choice('sail', 'Build a ship', 'Doon dhis'),
        choice('staff', 'Throw your staff', 'Uskaaga tuur'),
      ],
      correctChoiceId: 'read',
      explanation: {
        en: 'The first revelation was Iqra — Read. Authentic hadith says this came in the cave of Hira.',
        so: 'Waxyigii ugu horreeyay wuxuu ahaa Akhri. Xadiis sax ah wuxuu sheegayaa inay ku soo degtay godka Xiraa.',
      },
    },
    {
      id: 'muhammad-learn-3',
      type: 'true_false',
      prompt: {
        en: 'Muhammad ﷺ is the Seal of the Prophets — the last prophet.',
        so: 'Muxammad ﷺ waa Khatamka Nebiyada — nebiga ugu dambeeya.',
      },
      choices: TRUE_FALSE_CHOICES,
      correctChoiceId: 'true',
      explanation: {
        en: 'He is the Messenger of Allah and the Seal of the Prophets. No prophet comes after him.',
        so: 'Waa Rasuulka Alle iyo Khatamka Nebiyada. Nebi kama dambeeyo.',
      },
    },
    {
      id: 'muhammad-learn-4',
      type: 'multiple_choice',
      prompt: {
        en: 'Why did Allah send Muhammad ﷺ?',
        so: 'Maxaa Alle u diray Muxammad ﷺ?',
      },
      choices: [
        choice('mercy', 'As a mercy to the worlds', 'Naxariis caalamka'),
        choice('one-town', 'Only for one small town forever', 'Kaliya hal magaalo yar weligeed'),
        choice('poetry', 'To invent poems', 'Si uu gabayo u hindiso'),
      ],
      correctChoiceId: 'mercy',
      explanation: {
        en: 'Allah said: We have not sent you except as a mercy to the worlds.',
        so: 'Alle wuxuu yiri: kumaannu dirin adiga mooyaane naxariis caalamka.',
      },
    },
    {
      id: 'muhammad-learn-5',
      type: 'multiple_choice',
      prompt: {
        en: 'What can we learn from Muhammad ﷺ?',
        so: 'Maxaan ka baran karnaa Muxammad ﷺ?',
      },
      choices: [
        choice('follow', 'Follow the last prophet, worship Allah, and be kind to the orphan', 'Raac nebiga ugu dambeeya, Alle caabud, agoonteedna u naxariiso'),
        choice('harsh', 'Treat the orphan harshly', 'Agoonteed si adag u dhaqan'),
        choice('new-prophet', 'Wait for another prophet after him', 'Sugo nebi kale oo ka dambeeya'),
      ],
      correctChoiceId: 'follow',
      explanation: {
        en: 'Allah cared for him as an orphan and sent him as a mercy and the Seal of the Prophets.',
        so: 'Alle wuu daryeelay isagoo agoonta ah, wuxuuna u diray naxariis iyo Khatamka Nebiyada.',
      },
    },
  ],
  gameQuestions: [
    {
      id: 'muhammad-game-order',
      type: 'ordering',
      prompt: {
        en: 'What happened first? Put the events in order.',
        so: 'Maxaa marka hore dhacay? Dhacdooyinka si nidaam ah u dhig.',
      },
      orderItems: [
        choice('orphan', 'Allah gave refuge to him as an orphan', 'Alle wuxuu u magangeliyay isagoo agoonta ah'),
        choice('read', 'Allah sent down: Read in the name of your Lord', 'Alle wuxuu soo dejiyay: Akhri magaca Rabbigaaga'),
        choice('mercy', 'He was sent as a mercy and the Seal of the Prophets', 'Waxaa loo diray naxariis iyo Khatamka Nebiyada'),
        choice('cave', 'In the cave he told his companion: Allah is with us', 'Godka dhexdiisa wuxuu saaxiibkiis ku yiri: Alle waa nala jiraa'),
      ],
      explanation: {
        en: 'Allah cared for the orphan, sent Read, made him the last prophet, and protected him in the cave.',
        so: 'Alle wuxuu daryeelay agoonteed, Akhri buu soo dejiyay, nebiga ugu dambeeya buu ka dhigay, godkana wuu ku ilaaliyay.',
      },
    },
    rememberProphetQuestion(
      'muhammad-game-remember',
      'muhammad',
      [
        choice('muhammad', 'Muhammad ﷺ', 'Muxammad ﷺ'),
        choice('yunus', 'Yunus عليه السلام', 'Yuunas عليه السلام'),
        choice('hud', 'Hud عليه السلام', 'Huud عليه السلام'),
      ],
      { en: 'Muhammad ﷺ', so: 'Muxammad ﷺ' },
    ),
    {
      id: 'muhammad-game-tf',
      type: 'true_false',
      prompt: {
        en: 'A prophet will come after Muhammad ﷺ.',
        so: 'Nebi ayaa imanaya Muxammad ﷺ ka dib.',
      },
      choices: TRUE_FALSE_CHOICES,
      correctChoiceId: 'false',
      explanation: {
        en: 'He is the Seal of the Prophets. No prophet comes after him.',
        so: 'Waa Khatamka Nebiyada. Nebi kama dambeeyo.',
      },
    },
    {
      id: 'muhammad-game-match',
      type: 'match',
      prompt: {
        en: 'Match the lesson: when they were in the cave, he said…',
        so: 'Casharka la xiriir: markay godka joogeen, wuxuu yiri…',
      },
      choices: [
        choice('with', 'Do not grieve; Allah is with us', 'Ha murugoon; Alle waa nala jiraa'),
        choice('alone', 'We are alone and forgotten', 'Keligaygaannu nahay oo waa nala illooway'),
        choice('give-up', 'Give up the message', 'Farriinta ka tag'),
      ],
      correctChoiceId: 'with',
      explanation: {
        en: 'Allah sent down His calmness and supported them.',
        so: 'Alle wuxuu soo dejiyay xasilloonidiisa wuuna taageeray.',
      },
    },
    {
      id: 'muhammad-game-isra',
      type: 'multiple_choice',
      prompt: {
        en: 'Where did Allah take His servant by night?',
        so: 'Xaggee Alle addoonkiisa habeennimo uga qaaday?',
      },
      choices: [
        choice('aqsa', 'From the Sacred Mosque to the Farthest Mosque', 'Masjidka Xaramka ilaa Masjidka ugu fog'),
        choice('egypt', 'From Egypt across the sea', 'Masar ilaa badda dhaafka'),
        choice('fish', 'Into the belly of a fish', 'Calooshii kalluun'),
      ],
      correctChoiceId: 'aqsa',
      explanation: {
        en: 'Allah took him from the Sacred Mosque to the Farthest Mosque to show him of His signs.',
        so: 'Alle wuxuu ka qaaday Masjidka Xaramka ilaa Masjidka ugu fog si uu ugu tusho calaamadihiisa.',
      },
    },
  ],
});
