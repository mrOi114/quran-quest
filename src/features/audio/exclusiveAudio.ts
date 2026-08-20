type AudioChannel = 'quran' | 'tafsir';

const pauseFns: Partial<Record<AudioChannel, () => Promise<void>>> = {};

export function registerExclusivePause(
  channel: AudioChannel,
  pause: () => Promise<void>,
): void {
  pauseFns[channel] = pause;
}

/** Pause the other channel so Qur’an recitation and tafsir never mix. */
export async function exclusiveAcquire(channel: AudioChannel): Promise<void> {
  const other: AudioChannel = channel === 'quran' ? 'tafsir' : 'quran';
  const pauseOther = pauseFns[other];
  if (pauseOther) {
    await pauseOther();
  }
}
