import type {
  QisasAudioSlot,
  QisasContentReviewStatus,
  QisasLanguage,
  QisasMode,
  QisasPermissionStatus,
} from './schemas';

export type LocalizedText = {
  en: string;
  so: string;
};

export type QisasNarratorId = 'mufti-ismail-menk' | 'sh-cabdulkadir-sh-maxamed';

export type QisasNarrator = {
  id: QisasNarratorId;
  name: string;
  language: QisasLanguage;
  targetSeries: string;
  officialWebsite: string;
  contactUrl: string;
  catalogUrl: string;
  permissionStatus: QisasPermissionStatus;
  license: string;
  rightsHolderNote: string;
  attribution: string;
  audioSourceLabel: string;
  offlineCacheAllowed: boolean | null;
};

export type QisasChapter = {
  id: string;
  title: LocalizedText;
  body: LocalizedText;
};

export type QisasQuestionType =
  | 'multiple_choice'
  | 'ordering'
  | 'true_false'
  | 'match';

export type QisasChoice = {
  id: string;
  label: LocalizedText;
};

export type QisasQuestion = {
  id: string;
  type: QisasQuestionType;
  prompt: LocalizedText;
  choices?: QisasChoice[];
  correctChoiceId?: string;
  orderItems?: QisasChoice[];
  explanation: LocalizedText;
  hint?: LocalizedText;
};

export type QisasStory = {
  id: string;
  prophetKey: string;
  title: LocalizedText;
  prophetName: LocalizedText;
  summary: LocalizedText;
  chapters: QisasChapter[];
  englishAudio: QisasAudioSlot;
  somaliAudio: QisasAudioSlot;
  quranReferences: string[];
  hadithReferences: string[];
  historyReferences: string[];
  sourceNotes: LocalizedText;
  contentReviewStatus: QisasContentReviewStatus;
  learnQuestions: QisasQuestion[];
  gameQuestions: QisasQuestion[];
};

export type QisasSeries = {
  id: string;
  title: LocalizedText;
  subtitle: LocalizedText;
  storyIds: string[];
};

export type { QisasAudioSlot, QisasLanguage, QisasMode, QisasPermissionStatus };
