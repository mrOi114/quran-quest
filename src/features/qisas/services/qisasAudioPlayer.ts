import {
  createBackgroundAudioSession,
  exclusiveAcquire,
  registerExclusivePause,
  type BackgroundAudioCallbacks,
  type BackgroundAudioMetadata,
  type BackgroundAudioStatus,
  type PlayBackgroundAudioOptions,
} from '@/features/audio';

export type QisasAudioMetadata = BackgroundAudioMetadata;
export type QisasAudioStatus = BackgroundAudioStatus;

const qisasSession = createBackgroundAudioSession({
  defaultTitle: 'Qisas al-Anbiya',
  defaultArtist: 'QuranFamily',
  defaultAlbum: 'QuranFamily Qisas',
});

registerExclusivePause('qisas', () => qisasSession.pause());

export function maintainQisasBackgroundPlayback(): void {
  qisasSession.maintainBackground();
}

export function isQisasAudioPlaying(): boolean {
  return qisasSession.isPlaying();
}

export function getQisasAudioUrl(): string | null {
  return qisasSession.getUrl();
}

export function getQisasAudioStatus(): QisasAudioStatus {
  return qisasSession.getStatus();
}

export async function seekQisasAudio(seconds: number): Promise<void> {
  await qisasSession.seekTo(seconds);
}

export async function stopQisasAudio(): Promise<void> {
  await qisasSession.stop();
}

export async function pauseQisasAudio(): Promise<void> {
  await qisasSession.pause();
}

export async function playQisasAudio(
  url: string,
  callbacks: BackgroundAudioCallbacks = {},
  metadata?: QisasAudioMetadata,
  options?: PlayBackgroundAudioOptions,
): Promise<void> {
  await exclusiveAcquire('qisas');
  await qisasSession.play(url, callbacks, metadata, options);
}

export async function resumeQisasAudio(
  metadata?: QisasAudioMetadata,
): Promise<boolean> {
  await exclusiveAcquire('qisas');
  return qisasSession.resume(metadata);
}
