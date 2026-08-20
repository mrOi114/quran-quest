import {
  createBackgroundAudioSession,
  exclusiveAcquire,
  registerExclusivePause,
  type BackgroundAudioCallbacks,
  type BackgroundAudioMetadata,
  type BackgroundAudioStatus,
  type PlayBackgroundAudioOptions,
} from '@/features/audio';

export type TafsirAudioMetadata = BackgroundAudioMetadata;
export type TafsirAudioStatus = BackgroundAudioStatus;

const tafsirSession = createBackgroundAudioSession({
  defaultTitle: 'Somali Tafsir',
  defaultArtist: 'QuranFamily',
  defaultAlbum: 'QuranFamily Tafsir',
});

registerExclusivePause('tafsir', () => tafsirSession.pause());

export function maintainTafsirBackgroundPlayback(): void {
  tafsirSession.maintainBackground();
}

export function isTafsirAudioPlaying(): boolean {
  return tafsirSession.isPlaying();
}

export function getTafsirAudioUrl(): string | null {
  return tafsirSession.getUrl();
}

export function getTafsirAudioStatus(): TafsirAudioStatus {
  return tafsirSession.getStatus();
}

export async function seekTafsirAudio(seconds: number): Promise<void> {
  await tafsirSession.seekTo(seconds);
}

export async function stopTafsirAudio(): Promise<void> {
  await tafsirSession.stop();
}

export async function pauseTafsirAudio(): Promise<void> {
  await tafsirSession.pause();
}

export async function playTafsirAudio(
  url: string,
  callbacks: BackgroundAudioCallbacks = {},
  metadata?: TafsirAudioMetadata,
  options?: PlayBackgroundAudioOptions,
): Promise<void> {
  await exclusiveAcquire('tafsir');
  await tafsirSession.play(url, callbacks, metadata, options);
}

export async function resumeTafsirAudio(
  metadata?: TafsirAudioMetadata,
): Promise<boolean> {
  await exclusiveAcquire('tafsir');
  return tafsirSession.resume(metadata);
}
