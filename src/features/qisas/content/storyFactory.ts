import { QISAS_NARRATORS } from './narrators';
import type {
  LocalizedText,
  QisasAudioSlot,
  QisasChoice,
  QisasQuestion,
  QisasStory,
} from '../types';

export function emptyLicensedSlot(
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

export const QURAN_SOURCE_NOTE: LocalizedText = {
  en: 'This child text uses clear points from the Qur’an. It does not add weak or disputed reports as established facts.',
  so: 'Qoraalkan carruurtu wuxuu ku salaysan yahay qodobbada cad ee Quraanka. Warbixin daciif ah ama lagu muransan yahay looma soo bandhigin xaqiiqo dhammaystiran.',
};

export const TRUE_FALSE_CHOICES: QisasChoice[] = [
  { id: 'true', label: { en: 'True', so: 'Run' } },
  { id: 'false', label: { en: 'False', so: 'Been' } },
];

type StoryDraft = Omit<
  QisasStory,
  | 'englishAudio'
  | 'somaliAudio'
  | 'contentReviewStatus'
  | 'hadithReferences'
  | 'historyReferences'
  | 'sourceNotes'
> & {
  hadithReferences?: string[];
  historyReferences?: string[];
  sourceNotes?: LocalizedText;
};

/** Fills shared narrator slots. Audio URLs stay empty until permission is written. */
export function createQisasStory(draft: StoryDraft): QisasStory {
  return {
    ...draft,
    englishAudio: emptyLicensedSlot('mufti-ismail-menk'),
    somaliAudio: emptyLicensedSlot('sh-cabdulkadir-sh-maxamed'),
    hadithReferences: draft.hadithReferences ?? [],
    historyReferences: draft.historyReferences ?? [],
    sourceNotes: draft.sourceNotes ?? QURAN_SOURCE_NOTE,
    contentReviewStatus: 'approved',
  };
}

export function choice(id: string, en: string, so: string): QisasChoice {
  return { id, label: { en, so } };
}

export function rememberProphetQuestion(
  id: string,
  correctId: string,
  options: [QisasChoice, QisasChoice, QisasChoice],
  name: LocalizedText,
): QisasQuestion {
  return {
    id,
    type: 'multiple_choice',
    prompt: {
      en: 'Remember the Prophet: who is this story about?',
      so: 'Xusuusnow Nebiga: yuu ku saabsan yahay sheekadani?',
    },
    choices: options,
    correctChoiceId: correctId,
    explanation: {
      en: `This is the story of Prophet ${name.en}.`,
      so: `Tani waa qisadii Nebi ${name.so}.`,
    },
  };
}
