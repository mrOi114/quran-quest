import { ADAM_STORY } from './adam';
import { EARLY_PROPHET_STORIES } from './earlyProphets';
import { EGYPT_PATIENCE_STORIES } from './egyptPatience';
import { IBRAHIM_FAMILY_STORIES } from './ibrahimFamily';
import { LATER_PROPHET_STORIES } from './laterProphets';
import { MUHAMMAD_STORY } from './muhammad';
import { MUSA_DAWUD_STORIES } from './musaDawud';
import { QISAS_SERIES_ID } from '../constants';
import type { QisasSeries, QisasStory } from '../types';

export const ALL_QISAS_STORIES: QisasStory[] = [
  ADAM_STORY,
  ...EARLY_PROPHET_STORIES,
  ...IBRAHIM_FAMILY_STORIES,
  ...EGYPT_PATIENCE_STORIES,
  ...MUSA_DAWUD_STORIES,
  ...LATER_PROPHET_STORIES,
  MUHAMMAD_STORY,
];

export const QISAS_SERIES: QisasSeries = {
  id: QISAS_SERIES_ID,
  title: {
    en: 'Qisas al-Anbiya',
    so: 'Qisasul Anbiyaa',
  },
  subtitle: {
    en: 'Stories of the Prophets',
    so: 'Qisooyinkii Nebiyada',
  },
  storyIds: ALL_QISAS_STORIES.map((story) => story.id),
};

const STORIES: Record<string, QisasStory> = Object.fromEntries(
  ALL_QISAS_STORIES.map((story) => [story.id, story]),
);

export function getQisasSeries(): QisasSeries {
  return QISAS_SERIES;
}

export function listQisasStories(): QisasStory[] {
  return QISAS_SERIES.storyIds
    .map((id) => STORIES[id])
    .filter((story): story is QisasStory => Boolean(story));
}

export function getQisasStory(storyId: string): QisasStory | null {
  return STORIES[storyId] ?? null;
}

export { ADAM_STORY } from './adam';
export { QISAS_NARRATORS, getNarrator } from './narrators';
