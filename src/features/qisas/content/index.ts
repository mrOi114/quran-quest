import { ADAM_STORY } from './adam';
import { QISAS_SERIES_ID } from '../constants';
import type { QisasSeries, QisasStory } from '../types';

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
  storyIds: [ADAM_STORY.id],
};

const STORIES: Record<string, QisasStory> = {
  [ADAM_STORY.id]: ADAM_STORY,
};

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
