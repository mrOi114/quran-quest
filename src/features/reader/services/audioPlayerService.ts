import {
  createAudioPlayer,
  requestNotificationPermissionsAsync,
  setAudioModeAsync,
  type AudioMetadata,
  type AudioPlayer,
  type AudioStatus,
} from 'expo-audio';
import { Platform } from 'react-native';

export type VerseAudioMetadata = {
  title?: string;
  artist?: string;
  albumTitle?: string;
  artworkUrl?: string;
};

type PlaybackCallbacks = {
  onEnded?: () => void;
  onError?: (message: string) => void;
  onPlayingChange?: (playing: boolean) => void;
};

let player: AudioPlayer | null = null;
let statusSubscription: { remove: () => void } | null = null;
let configured = false;
let notificationPermissionRequested = false;
let currentUrl: string | null = null;
let currentCallbacks: PlaybackCallbacks = {};
let playGeneration = 0;

async function ensureAudioMode(): Promise<void> {
  if (configured) {
    return;
  }

  await setAudioModeAsync({
    playsInSilentMode: true,
    shouldPlayInBackground: true,
    // Required for lock-screen / Android media foreground service association.
    interruptionMode: 'doNotMix',
  });
  configured = true;
}

async function ensureNotificationPermission(): Promise<void> {
  if (Platform.OS !== 'android' || notificationPermissionRequested) {
    return;
  }
  notificationPermissionRequested = true;
  try {
    await requestNotificationPermissionsAsync();
  } catch {
    // Older Android / missing native binary — playback can still work in-app.
  }
}

function ensurePlayer(): AudioPlayer {
  if (player) {
    return player;
  }

  // keepAudioSessionActive keeps the native session alive across brief gaps
  // (ayah replace / background transitions).
  player = createAudioPlayer(null, {
    updateInterval: 500,
    keepAudioSessionActive: true,
  });

  statusSubscription = player.addListener(
    'playbackStatusUpdate',
    (status: AudioStatus) => {
      currentCallbacks.onPlayingChange?.(Boolean(status.playing));

      if (status.error) {
        currentCallbacks.onError?.('Audio could not play. Try again.');
        return;
      }

      if (status.didJustFinish) {
        currentCallbacks.onEnded?.();
      }
    },
  );

  return player;
}

function toLockScreenMetadata(
  metadata?: VerseAudioMetadata,
): AudioMetadata | undefined {
  if (!metadata) {
    return undefined;
  }
  return {
    title: metadata.title,
    artist: metadata.artist,
    albumTitle: metadata.albumTitle,
    artworkUrl: metadata.artworkUrl,
  };
}

function activateLockScreen(activePlayer: AudioPlayer, metadata?: VerseAudioMetadata) {
  try {
    activePlayer.setActiveForLockScreen(true, toLockScreenMetadata(metadata), {
      showSeekForward: false,
      showSeekBackward: false,
    });
  } catch {
    // Web / Expo Go without native media session support.
  }
}

function clearLockScreen(activePlayer: AudioPlayer) {
  try {
    activePlayer.clearLockScreenControls();
  } catch {
    // Ignore missing native support.
  }
}

export function isVerseAudioPlaying(): boolean {
  return Boolean(player?.playing);
}

export function getVerseAudioUrl(): string | null {
  return currentUrl;
}

export async function stopVerseAudio(): Promise<void> {
  playGeneration += 1;
  currentCallbacks = {};
  currentUrl = null;

  if (!player) {
    return;
  }

  try {
    player.pause();
  } catch {
    // Ignore pause races while tearing down.
  }

  clearLockScreen(player);
}

export async function playVerseAudio(
  url: string,
  callbacks: PlaybackCallbacks = {},
  metadata?: VerseAudioMetadata,
): Promise<void> {
  await ensureAudioMode();
  await ensureNotificationPermission();

  const activePlayer = ensurePlayer();
  const generation = ++playGeneration;
  currentCallbacks = callbacks;

  try {
    const sameSourcePaused =
      currentUrl === url && activePlayer.isLoaded && !activePlayer.playing;

    if (sameSourcePaused) {
      activateLockScreen(activePlayer, metadata);
      activePlayer.play();
      currentCallbacks.onPlayingChange?.(true);
      return;
    }

    currentUrl = url;
    activePlayer.loop = false;
    activePlayer.replace({ uri: url });
    activateLockScreen(activePlayer, metadata);
    activePlayer.play();
    currentCallbacks.onPlayingChange?.(true);

    if (generation !== playGeneration) {
      return;
    }
  } catch {
    currentCallbacks.onError?.('Audio could not play. Try again.');
    throw new Error('Audio could not play. Try again.');
  }
}

export async function pauseVerseAudio(): Promise<void> {
  if (!player) {
    return;
  }
  try {
    player.pause();
    currentCallbacks.onPlayingChange?.(false);
  } catch {
    // Ignore pause race conditions.
  }
}

export async function resumeVerseAudio(
  metadata?: VerseAudioMetadata,
): Promise<boolean> {
  if (!player || !currentUrl || !player.isLoaded) {
    return false;
  }

  try {
    if (!player.playing) {
      await ensureAudioMode();
      activateLockScreen(player, metadata);
      player.play();
      currentCallbacks.onPlayingChange?.(true);
    }
    return true;
  } catch {
    return false;
  }
}

export async function replayVerseAudio(
  url: string,
  callbacks: PlaybackCallbacks = {},
  metadata?: VerseAudioMetadata,
): Promise<void> {
  currentUrl = null;
  await playVerseAudio(url, callbacks, metadata);
}

export function syncVerseAudioPlayingState(): boolean {
  return isVerseAudioPlaying();
}
