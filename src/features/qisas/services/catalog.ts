import { getQisasStory } from '../content';
import type { QisasAudioSlot, QisasLanguage, QisasStory } from '../types';

import { isLicensedAudioSlot, licensedAudioUrl } from './permission';

export function audioSlotForLanguage(
  story: QisasStory,
  language: QisasLanguage,
): QisasAudioSlot {
  return language === 'so' ? story.somaliAudio : story.englishAudio;
}

export function getLicensedStoryAudioUrl(
  storyId: string,
  language: QisasLanguage,
): string | null {
  const story = getQisasStory(storyId);
  if (!story) {
    return null;
  }
  return licensedAudioUrl(audioSlotForLanguage(story, language));
}

export function hasLicensedStoryAudio(
  storyId: string,
  language: QisasLanguage,
): boolean {
  const story = getQisasStory(storyId);
  if (!story) {
    return false;
  }
  return isLicensedAudioSlot(audioSlotForLanguage(story, language));
}
