export type AudioChannel = 'quran' | 'tafsir' | 'meaning' | 'qisas';

const pauseFns: Partial<Record<AudioChannel, () => Promise<void>>> = {};

export function registerExclusivePause(
  channel: AudioChannel,
  pause: () => Promise<void>,
): void {
  pauseFns[channel] = pause;
}

/** Pause every other channel so recitation, meaning audio, and tafsir never mix. */
export async function exclusiveAcquire(channel: AudioChannel): Promise<void> {
  const others = (Object.keys(pauseFns) as AudioChannel[]).filter((item) => item !== channel);
  for (const other of others) {
    const pauseOther = pauseFns[other];
    if (pauseOther) {
      await pauseOther();
    }
  }
}
