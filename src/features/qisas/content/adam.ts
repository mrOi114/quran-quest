import { QISAS_NARRATORS } from './narrators';
import type { QisasAudioSlot, QisasStory } from '../types';

function emptyLicensedSlot(
  narratorId: keyof typeof QISAS_NARRATORS,
): QisasAudioSlot {
  const narrator = QISAS_NARRATORS[narratorId];
  return {
    narratorId,
    permissionStatus: 'PERMISSION_REQUIRED',
    audioUrl: null,
    license: narrator.license,
    attribution: narrator.attribution,
    sourceLabel: narrator.audioSourceLabel,
    catalogUrl: narrator.catalogUrl,
    offlineCacheAllowed: narrator.offlineCacheAllowed,
  };
}

/**
 * Child-facing text stays with clear Qur’anic points only.
 * It does not name the fruit, invent dialogue, or present weak reports as fact.
 */
export const ADAM_STORY: QisasStory = {
  id: 'qisas-story-001',
  prophetKey: 'adam',
  title: {
    en: 'The Story of Prophet Adam عليه السلام',
    so: 'Qisadii Nebi Aadam عليه السلام',
  },
  prophetName: {
    en: 'Adam عليه السلام',
    so: 'Aadam عليه السلام',
  },
  summary: {
    en: 'Allah created Adam عليه السلام, taught him, accepted his repentance, and sent him to live on the earth.',
    so: 'Alle wuxuu abuuray Aadam عليه السلام, wuu baray, toobadiisa wuu aqbalay, wuuna u diray inuu ku noolaado dhulka.',
  },
  chapters: [
    {
      id: 'adam-created',
      title: {
        en: 'Allah created Adam',
        so: 'Alle wuxuu abuuray Aadam',
      },
      body: {
        en: 'Allah created Prophet Adam عليه السلام as the first human. Allah created him from clay, then gave him life. Allah taught Adam the names of things. This showed the honour Allah gave him.',
        so: 'Alle wuxuu abuuray Nebi Aadam عليه السلام, isagoo ah bini’aadamkii ugu horreeyay. Alle wuxuu ka abuuray dhoobo, ka dibna wuxuu siiyay nolosha. Alle wuxuu Aadam baray magacyada waxyaabaha. Taasina waxay muujisay sharafta Alle siiyay.',
      },
    },
    {
      id: 'adam-iblis',
      title: {
        en: 'The angels and Iblis',
        so: 'Malaa’igta iyo Ibliis',
      },
      body: {
        en: 'Allah commanded the angels to bow to Adam as a sign of respect. The angels obeyed. Iblis refused. He was proud, and he disobeyed Allah.',
        so: 'Alle wuxuu malaa’igta ku amray inay u sujuudaan Aadam si sharaf ah. Malaa’igtu way adeeceen. Ibliis wuu diiday. Wuu kibray, wuuna caasiyay Alle.',
      },
    },
    {
      id: 'adam-garden',
      title: {
        en: 'The Garden',
        so: 'Jannada',
      },
      body: {
        en: 'Allah placed Adam and his wife in a Garden. They could enjoy what was there, but they must not go near one tree. Shaytan whispered to them. They forgot, and they ate from that tree.',
        so: 'Alle wuxuu Aadam iyo xaaskiisa gelay Janno. Waxay ku raaxaysan karaan waxa ku jira, laakiin waa inayan u dhowaan geed. Shaydaan ayaa u waswaasay. Way illoobeen, wayna cuno geedkii laga reebay.',
      },
    },
    {
      id: 'adam-repentance',
      title: {
        en: 'Allah forgives and sends them to the earth',
        so: 'Alle wuu cafiyay oo wuxuu u diray dhulka',
      },
      body: {
        en: 'Adam and his wife felt sorry. They asked Allah to forgive them. They said: “Our Lord, we have wronged ourselves. If You do not forgive us and have mercy on us, we will surely be among the losers.” Allah accepted their repentance, because He is Most Forgiving. Then Allah sent them to live on the earth — to live, learn, and worship Him. Allah promised that whoever follows His guidance will not go astray.',
        so: 'Aadam iyo xaaskiisu way ka qoomameeyeen. Waxay Alle weydiisteen danbi dhaaf. Waxay yiraahdeen: “Rabbigeennow, nafteena ayaannu dulmi nay. Haddii Aad noo danbi dhaafin weydid oo aad noo naxariisan weydid, waxaan ka mid noqonaynaa khasaarayaasha.” Alle wuu aqbalay toobadooda, maxaa yeelay isagu waa Kan ugu danbi dhaafida badan. Markaas Alle wuxuu u diray inay ku noolaadaan dhulka — inay ku noolaadaan, wax ku bartaan, una caabudaan. Alle wuxuu ballan qaaday in qofkii raaca hanuunkiisa uusan lumin doonin.',
      },
    },
  ],
  englishAudio: emptyLicensedSlot('mufti-ismail-menk'),
  somaliAudio: emptyLicensedSlot('sh-cabdulkadir-sh-maxamed'),
  quranReferences: [
    '2:30–39',
    '3:33',
    '7:11–25',
    '7:23',
    '15:26–33',
    '20:115–123',
    '38:71–76',
  ],
  hadithReferences: [],
  historyReferences: [],
  sourceNotes: {
    en: 'This child text uses clear points from the Qur’an. It does not name the fruit. It does not add weak or disputed reports as established facts.',
    so: 'Qoraalkan carruurtu wuxuu ku salaysan yahay qodobbada cad ee Quraanka. Magaca midhaha lama sheegin. Warbixin daciif ah ama lagu muransan yahay looma soo bandhigin xaqiiqo dhammaystiran.',
  },
  contentReviewStatus: 'approved',
  learnQuestions: [
    {
      id: 'adam-learn-1',
      type: 'multiple_choice',
      prompt: {
        en: 'Who was the first human Allah created in this story?',
        so: 'Yuu ahaa bini’aadamkii ugu horreeyay ee Alle abuuray sheekadan?',
      },
      choices: [
        { id: 'adam', label: { en: 'Adam عليه السلام', so: 'Aadam عليه السلام' } },
        { id: 'nuh', label: { en: 'Nuh عليه السلام', so: 'Nuux عليه السلام' } },
        { id: 'musa', label: { en: 'Musa عليه السلام', so: 'Muuse عليه السلام' } },
      ],
      correctChoiceId: 'adam',
      explanation: {
        en: 'The story tells us Allah created Adam عليه السلام as the first human.',
        so: 'Sheekadu waxay sheegaysaa in Alle abuuray Aadam عليه السلام isagoo ah bini’aadamkii ugu horreeyay.',
      },
      hint: {
        en: 'Look at the first part of the story.',
        so: 'Eeg qaybta hore ee sheekada.',
      },
    },
    {
      id: 'adam-learn-2',
      type: 'multiple_choice',
      prompt: {
        en: 'Why did Iblis refuse Allah’s command?',
        so: 'Maxaa Ibliis ugu diiday amarka Alle?',
      },
      choices: [
        { id: 'proud', label: { en: 'He was proud', so: 'Wuu kibray' } },
        { id: 'hungry', label: { en: 'He was hungry', so: 'Wuu gaajoonayay' } },
        { id: 'unheard', label: { en: 'He did not hear', so: 'Ma maqal' } },
      ],
      correctChoiceId: 'proud',
      explanation: {
        en: 'Iblis refused because he was proud, and he disobeyed Allah.',
        so: 'Ibliis wuu diiday maxaa yeelay wuu kibray, wuuna caasiyay Alle.',
      },
      hint: {
        en: 'The story says he was proud.',
        so: 'Sheekadu waxay tiri wuu kibray.',
      },
    },
    {
      id: 'adam-learn-3',
      type: 'multiple_choice',
      prompt: {
        en: 'After they made a mistake, what did Adam and his wife do?',
        so: 'Kadib qaladkii, maxay sameeyeen Aadam iyo xaaskiisu?',
      },
      choices: [
        {
          id: 'forgive',
          label: {
            en: 'They asked Allah to forgive them',
            so: 'Waxay Alle weydiisteen danbi dhaaf',
          },
        },
        {
          id: 'angels',
          label: {
            en: 'They blamed the angels',
            so: 'Waxay eedeeyeen malaa’igta',
          },
        },
        {
          id: 'hide',
          label: {
            en: 'They hid the tree',
            so: 'Waxay qariyeen geedka',
          },
        },
      ],
      correctChoiceId: 'forgive',
      explanation: {
        en: 'They felt sorry and asked Allah to forgive them. Allah accepted their repentance.',
        so: 'Way ka qoomameeyeen oo Alle ayay weydiisteen danbi dhaaf. Alle wuu aqbalay toobadooda.',
      },
      hint: {
        en: 'They spoke to Allah and asked for mercy.',
        so: 'Alle ayay la hadleen oo naxariis weydiisteen.',
      },
    },
    {
      id: 'adam-learn-4',
      type: 'true_false',
      prompt: {
        en: 'Allah forgave Adam عليه السلام.',
        so: 'Alle wuu cafiyay Aadam عليه السلام.',
      },
      choices: [
        { id: 'true', label: { en: 'True', so: 'Run' } },
        { id: 'false', label: { en: 'False', so: 'Been' } },
      ],
      correctChoiceId: 'true',
      explanation: {
        en: 'Allah accepted their repentance because He is Most Forgiving.',
        so: 'Alle wuu aqbalay toobadooda maxaa yeelay isagu waa Kan ugu danbi dhaafida badan.',
      },
    },
    {
      id: 'adam-learn-5',
      type: 'multiple_choice',
      prompt: {
        en: 'After the Garden, where did Allah send them to live?',
        so: 'Kadib Jannada, xaggee Alle u diray inay ku noolaadaan?',
      },
      choices: [
        { id: 'earth', label: { en: 'The earth', so: 'Dhulka' } },
        { id: 'sea', label: { en: 'The sea', so: 'Badda' } },
        { id: 'sky', label: { en: 'The sky', so: 'Cirka' } },
      ],
      correctChoiceId: 'earth',
      explanation: {
        en: 'Allah sent them to live on the earth — to live, learn, and worship Him.',
        so: 'Alle wuxuu u diray inay ku noolaadaan dhulka — inay ku noolaadaan, wax ku bartaan, una caabudaan.',
      },
      hint: {
        en: 'The last part of the story names the place.',
        so: 'Qaybta ugu dambaysa ayaa magacaabaysa meesha.',
      },
    },
  ],
  gameQuestions: [
    {
      id: 'adam-game-order',
      type: 'ordering',
      prompt: {
        en: 'What happened first? Put the events in order.',
        so: 'Maxaa marka hore dhacay? Dhacdooyinka si nidaam ah u dhig.',
      },
      orderItems: [
        {
          id: 'created',
          label: {
            en: 'Allah created Adam عليه السلام',
            so: 'Alle wuxuu abuuray Aadam عليه السلام',
          },
        },
        {
          id: 'iblis',
          label: {
            en: 'Iblis refused out of pride',
            so: 'Ibliis wuu diiday kibri darteed',
          },
        },
        {
          id: 'tree',
          label: {
            en: 'They ate from the tree they were told not to go near',
            so: 'Waxay cuno geedkii laga reebay',
          },
        },
        {
          id: 'repent',
          label: {
            en: 'They asked Allah to forgive them',
            so: 'Waxay Alle weydiisteen danbi dhaaf',
          },
        },
      ],
      explanation: {
        en: 'First Allah created Adam. Then Iblis refused. Then they ate from the tree. Then they asked Allah to forgive them.',
        so: 'Marka hore Alle wuxuu abuuray Aadam. Kadib Ibliis wuu diiday. Kadib geedka ayay cuno. Kadib Alle ayay danbi dhaaf weydiisteen.',
      },
      hint: {
        en: 'Start with how Allah created Adam.',
        so: 'Ka bilow sidii Alle u abuuray Aadam.',
      },
    },
    {
      id: 'adam-game-remember',
      type: 'multiple_choice',
      prompt: {
        en: 'Remember the Prophet: who is this story about?',
        so: 'Xusuusnow Nebiga: yuu ku saabsan yahay sheekadani?',
      },
      choices: [
        { id: 'adam', label: { en: 'Adam عليه السلام', so: 'Aadam عليه السلام' } },
        { id: 'yusuf', label: { en: 'Yusuf عليه السلام', so: 'Yuusuf عليه السلام' } },
        { id: 'yunus', label: { en: 'Yunus عليه السلام', so: 'Yuunas عليه السلام' } },
      ],
      correctChoiceId: 'adam',
      explanation: {
        en: 'This is the story of Prophet Adam عليه السلام.',
        so: 'Tani waa qisadii Nebi Aadam عليه السلام.',
      },
    },
    {
      id: 'adam-game-truefalse',
      type: 'true_false',
      prompt: {
        en: 'Iblis refused Allah’s command because he was proud.',
        so: 'Ibliis wuxuu diiday amarka Alle kibri dartiis.',
      },
      choices: [
        { id: 'true', label: { en: 'True', so: 'Run' } },
        { id: 'false', label: { en: 'False', so: 'Been' } },
      ],
      correctChoiceId: 'true',
      explanation: {
        en: 'The story teaches that pride led Iblis to disobey Allah.',
        so: 'Sheekadu waxay baraysaa in kibrigu Ibliis u horseeday inuu caasiyo Alle.',
      },
    },
    {
      id: 'adam-game-match',
      type: 'match',
      prompt: {
        en: 'Match the lesson to its meaning: pride in this story led to…',
        so: 'Casharka la xiriir macnihiisa: kibriga sheekadan wuxuu horseeday…',
      },
      choices: [
        {
          id: 'disobey',
          label: { en: 'Disobeying Allah', so: 'In Alle la caasiyo' },
        },
        {
          id: 'help',
          label: { en: 'Helping Adam', so: 'In Aadam la caawiyo' },
        },
        {
          id: 'plant',
          label: { en: 'Planting a tree', so: 'In geed la beero' },
        },
      ],
      correctChoiceId: 'disobey',
      explanation: {
        en: 'Iblis’s pride led him to disobey Allah. The story teaches us to stay humble.',
        so: 'Kibriga Ibliis wuxuu u horseeday inuu caasiyo Alle. Sheekadu waxay ina bartaa inaan is-hoosaysiino.',
      },
      hint: {
        en: 'Think about why Iblis refused.',
        so: 'Ka fikir sababta Ibliis u diiday.',
      },
    },
    {
      id: 'adam-game-taught',
      type: 'multiple_choice',
      prompt: {
        en: 'Who taught Adam the names of things?',
        so: 'Yaa Aadam baray magacyada waxyaabaha?',
      },
      choices: [
        { id: 'allah', label: { en: 'Allah', so: 'Alle' } },
        { id: 'iblis', label: { en: 'Iblis', so: 'Ibliis' } },
        { id: 'angels', label: { en: 'The angels', so: 'Malaa’igta' } },
      ],
      correctChoiceId: 'allah',
      explanation: {
        en: 'Allah taught Adam the names of things. That was an honour from Allah.',
        so: 'Alle ayaa Aadam baray magacyada waxyaabaha. Taasi waxay ahayd sharaf Alle ka timid.',
      },
    },
  ],
};
