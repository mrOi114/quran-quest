import {
  createAudioPlayer,
  requestNotificationPermissionsAsync,
  setAudioModeAsync,
  type AudioMetadata,
  type AudioPlayer,
  type AudioStatus,
} from 'expo-audio';
import { AppState, Platform } from 'react-native';

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
let notificationPermissionRequested = false;
let currentUrl: string | null = null;
let currentCallbacks: PlaybackCallbacks = {};
let lastMetadata: VerseAudioMetadata | undefined;
let playGeneration = 0;
/** True only after an explicit play/resume; false after pause, stop, or natural end. */
let userWantsPlayback = false;
let appStateWired = false;
let webAudio: HTMLAudioElement | null = null;
let webListenersBound = false;
let webResumeInFlight = false;

function isWeb(): boolean {
  return Platform.OS === 'web';
}

async function ensureAudioMode(): Promise<void> {
  await setAudioModeAsync({
    playsInSilentMode: true,
    shouldPlayInBackground: true,
    allowsRecording: false,
    allowsBackgroundRecording: false,
    // Required for lock-screen / Android media foreground service association.
    interruptionMode: 'doNotMix',
  });
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

function applyWebMediaSession(metadata?: VerseAudioMetadata) {
  if (typeof navigator === 'undefined' || !navigator.mediaSession) {
    return;
  }

  navigator.mediaSession.metadata = new MediaMetadata({
    title: metadata?.title ?? 'Qur’an',
    artist: metadata?.artist ?? 'Mahmoud Khalil Al-Husary',
    album: metadata?.albumTitle ?? 'QuranFamily',
    artwork: metadata?.artworkUrl ? [{ src: metadata.artworkUrl }] : [],
  });
  navigator.mediaSession.playbackState = userWantsPlayback ? 'playing' : 'paused';

  navigator.mediaSession.setActionHandler('play', () => {
    void resumeVerseAudio(lastMetadata);
  });
  navigator.mediaSession.setActionHandler('pause', () => {
    void pauseVerseAudio();
  });
}

function clearWebMediaSession() {
  if (typeof navigator === 'undefined' || !navigator.mediaSession) {
    return;
  }
  navigator.mediaSession.playbackState = 'none';
  navigator.mediaSession.metadata = null;
  navigator.mediaSession.setActionHandler('play', null);
  navigator.mediaSession.setActionHandler('pause', null);
}

function bindWebAudioElement(el: HTMLAudioElement) {
  if (webListenersBound) {
    return;
  }
  webListenersBound = true;

  el.addEventListener('play', () => {
    currentCallbacks.onPlayingChange?.(true);
    if (typeof navigator !== 'undefined' && navigator.mediaSession) {
      navigator.mediaSession.playbackState = 'playing';
    }
  });

  el.addEventListener('pause', () => {
    currentCallbacks.onPlayingChange?.(false);
    if (typeof navigator !== 'undefined' && navigator.mediaSession) {
      navigator.mediaSession.playbackState = userWantsPlayback ? 'playing' : 'paused';
    }
    // Browser may pause on hide/lock; resume only if the user did not pause/stop.
    if (userWantsPlayback && !el.ended && !webResumeInFlight) {
      webResumeInFlight = true;
      void el
        .play()
        .catch(() => undefined)
        .finally(() => {
          webResumeInFlight = false;
        });
    }
  });

  el.addEventListener('ended', () => {
    userWantsPlayback = false;
    currentCallbacks.onPlayingChange?.(false);
    currentCallbacks.onEnded?.();
  });

  el.addEventListener('error', () => {
    userWantsPlayback = false;
    currentCallbacks.onError?.('Audio could not play. Try again.');
    currentCallbacks.onPlayingChange?.(false);
  });
}

function ensureWebAudioElement(): HTMLAudioElement {
  if (webAudio) {
    return webAudio;
  }

  const el = document.createElement('audio');
  el.setAttribute('playsinline', 'true');
  el.setAttribute('webkit-playsinline', 'true');
  el.preload = 'auto';
  // display:none can stop iOS/Android background playback; keep it in the tree.
  el.style.position = 'absolute';
  el.style.width = '1px';
  el.style.height = '1px';
  el.style.opacity = '0';
  el.style.pointerEvents = 'none';
  document.body.appendChild(el);
  bindWebAudioElement(el);
  webAudio = el;
  return el;
}

function resumeWebIfWanted() {
  if (!userWantsPlayback || !webAudio || webAudio.ended) {
    return;
  }
  if (webAudio.paused) {
    void webAudio.play().catch(() => undefined);
  }
}

function wireAppLifecycle() {
  if (appStateWired) {
    return;
  }
  appStateWired = true;

  AppState.addEventListener('change', (next) => {
    if (next === 'background' || next === 'inactive') {
      maintainBackgroundPlayback();
    }
  });

  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        maintainBackgroundPlayback();
      }
    });
    window.addEventListener('pagehide', () => {
      maintainBackgroundPlayback();
    });
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
        userWantsPlayback = false;
        currentCallbacks.onError?.('Audio could not play. Try again.');
        return;
      }

      if (status.didJustFinish) {
        userWantsPlayback = false;
        currentCallbacks.onEnded?.();
      }
    },
  );

  return player;
}

export function maintainBackgroundPlayback(): void {
  if (!userWantsPlayback || !currentUrl) {
    return;
  }

  // Re-assert the playback session. Do not force native play() here — lock-screen
  // pause and audio-focus loss must stay paused until the user resumes.
  void ensureAudioMode();

  if (isWeb()) {
    resumeWebIfWanted();
    applyWebMediaSession(lastMetadata);
  }
}

export function isVerseAudioPlaying(): boolean {
  if (isWeb()) {
    return Boolean(userWantsPlayback && webAudio && !webAudio.paused);
  }
  return Boolean(player?.playing);
}

export function getVerseAudioUrl(): string | null {
  return currentUrl;
}

export async function stopVerseAudio(): Promise<void> {
  playGeneration += 1;
  userWantsPlayback = false;
  currentCallbacks = {};
  currentUrl = null;

  if (isWeb()) {
    if (webAudio) {
      webAudio.pause();
      webAudio.currentTime = 0;
    }
    clearWebMediaSession();
    return;
  }

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
  wireAppLifecycle();
  await ensureAudioMode();
  await ensureNotificationPermission();

  const generation = ++playGeneration;
  currentCallbacks = callbacks;
  lastMetadata = metadata;
  userWantsPlayback = true;

  try {
    if (isWeb()) {
      const el = ensureWebAudioElement();
      const sameSourcePaused =
        currentUrl === url && Boolean(el.src) && el.paused && !el.ended;

      currentUrl = url;
      applyWebMediaSession(metadata);

      if (!sameSourcePaused) {
        el.src = url;
        el.load();
      }

      await el.play();
      if (generation !== playGeneration) {
        return;
      }
      currentCallbacks.onPlayingChange?.(true);
      return;
    }

    const activePlayer = ensurePlayer();
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
    userWantsPlayback = false;
    currentCallbacks.onError?.('Audio could not play. Try again.');
    throw new Error('Audio could not play. Try again.');
  }
}

export async function pauseVerseAudio(): Promise<void> {
  userWantsPlayback = false;

  if (isWeb()) {
    webAudio?.pause();
    if (typeof navigator !== 'undefined' && navigator.mediaSession) {
      navigator.mediaSession.playbackState = 'paused';
    }
    currentCallbacks.onPlayingChange?.(false);
    return;
  }

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
  if (!currentUrl) {
    return false;
  }

  lastMetadata = metadata ?? lastMetadata;
  userWantsPlayback = true;
  wireAppLifecycle();

  try {
    await ensureAudioMode();

    if (isWeb()) {
      if (!webAudio) {
        userWantsPlayback = false;
        return false;
      }
      applyWebMediaSession(lastMetadata);
      await webAudio.play();
      currentCallbacks.onPlayingChange?.(true);
      return true;
    }

    if (!player || !player.isLoaded) {
      userWantsPlayback = false;
      return false;
    }

    if (!player.playing) {
      activateLockScreen(player, lastMetadata);
      player.play();
      currentCallbacks.onPlayingChange?.(true);
    }
    return true;
  } catch {
    userWantsPlayback = false;
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
