import {
  createAudioPlayer,
  requestNotificationPermissionsAsync,
  setAudioModeAsync,
  type AudioMetadata,
  type AudioPlayer,
  type AudioStatus,
} from 'expo-audio';
import { AppState, Platform } from 'react-native';

export type BackgroundAudioMetadata = {
  title?: string;
  artist?: string;
  albumTitle?: string;
  artworkUrl?: string;
};

export type BackgroundAudioStatus = {
  playing: boolean;
  currentTime: number;
  duration: number;
  url: string | null;
};

export type BackgroundAudioCallbacks = {
  /** Return true when the next track was started immediately (keep session alive). */
  onEnded?: () => boolean | void;
  onError?: (message: string) => void;
  onPlayingChange?: (playing: boolean) => void;
  onStatus?: (status: BackgroundAudioStatus) => void;
};

export type PlayBackgroundAudioOptions = {
  startAt?: number;
};

/**
 * Auto Listen remounts the ayah UI and re-calls play() on the track that
 * playImmediate already started. Clearing the ended-ready flag in that case
 * makes the next `ended` a no-op, so playback stops after two ayahs.
 */
export function shouldResetEndedGuard(alreadyPlayingSameTrack: boolean): boolean {
  return !alreadyPlayingSameTrack;
}

/**
 * Known-good playback (expo-av createAsync) waited until the MP3 was loaded
 * before play. Auto-resuming a pause that happened while swapping src plays a
 * half-decoded buffer and makes consecutive ayahs sound unclear.
 */
export function shouldAutoResumeWebPause(options: {
  wantsPlayback: boolean;
  readyForFinish: boolean;
  replacingSource: boolean;
  ended: boolean;
  finishedCurrentTrack: boolean;
}): boolean {
  return (
    options.wantsPlayback &&
    options.readyForFinish &&
    !options.replacingSource &&
    !options.ended &&
    !options.finishedCurrentTrack
  );
}

export type BackgroundAudioSession = {
  play: (
    url: string,
    callbacks?: BackgroundAudioCallbacks,
    metadata?: BackgroundAudioMetadata,
    options?: PlayBackgroundAudioOptions,
  ) => Promise<void>;
  pause: () => Promise<void>;
  stop: () => Promise<void>;
  resume: (metadata?: BackgroundAudioMetadata) => Promise<boolean>;
  replay: (
    url: string,
    callbacks?: BackgroundAudioCallbacks,
    metadata?: BackgroundAudioMetadata,
  ) => Promise<void>;
  seekTo: (seconds: number) => Promise<void>;
  getStatus: () => BackgroundAudioStatus;
  isPlaying: () => boolean;
  getUrl: () => string | null;
  maintainBackground: () => void;
  wantsPlayback: () => boolean;
  playImmediate: (
    url: string,
    callbacks?: BackgroundAudioCallbacks,
    metadata?: BackgroundAudioMetadata,
  ) => void;
};

type SessionOptions = {
  defaultTitle: string;
  defaultArtist: string;
  defaultAlbum: string;
};

let notificationPermissionRequested = false;

function isWeb(): boolean {
  return Platform.OS === 'web';
}

async function ensureAudioMode(): Promise<void> {
  await setAudioModeAsync({
    playsInSilentMode: true,
    shouldPlayInBackground: true,
    allowsRecording: false,
    allowsBackgroundRecording: false,
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

/**
 * Shared lock-screen / background playback engine used by Qur’an recitation
 * and Somali tafsir. Each caller must use its own session instance.
 */
export function createBackgroundAudioSession(
  options: SessionOptions,
): BackgroundAudioSession {
  let player: AudioPlayer | null = null;
  let currentUrl: string | null = null;
  let currentCallbacks: BackgroundAudioCallbacks = {};
  let lastMetadata: BackgroundAudioMetadata | undefined;
  let playGeneration = 0;
  let userWantsPlayback = false;
  let appStateWired = false;
  let webAudio: HTMLAudioElement | null = null;
  let webListenersBound = false;
  let webResumeInFlight = false;
  let replacingWebSource = false;
  let lastTime = 0;
  let lastDuration = 0;
  let readyForFinish = false;
  let finishedCurrentTrack = false;

  const session: BackgroundAudioSession = {
    play: playNow,
    pause: pauseNow,
    stop: stopNow,
    resume: resumeNow,
    replay: replayNow,
    seekTo,
    getStatus,
    isPlaying,
    getUrl: () => currentUrl,
    maintainBackground,
    wantsPlayback: () => userWantsPlayback,
    playImmediate: playImmediateNow,
  };

  function emitStatus(playing: boolean) {
    const status = getStatus();
    currentCallbacks.onPlayingChange?.(playing);
    currentCallbacks.onStatus?.({ ...status, playing });
  }

  function toLockScreenMetadata(
    metadata?: BackgroundAudioMetadata,
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

  function activateLockScreen(
    activePlayer: AudioPlayer,
    metadata?: BackgroundAudioMetadata,
  ) {
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

  function applyWebMediaSession(metadata?: BackgroundAudioMetadata) {
    if (typeof navigator === 'undefined' || !navigator.mediaSession) {
      return;
    }

    navigator.mediaSession.metadata = new MediaMetadata({
      title: metadata?.title ?? options.defaultTitle,
      artist: metadata?.artist ?? options.defaultArtist,
      album: metadata?.albumTitle ?? options.defaultAlbum,
      artwork: metadata?.artworkUrl ? [{ src: metadata.artworkUrl }] : [],
    });
    navigator.mediaSession.playbackState = userWantsPlayback ? 'playing' : 'paused';

    navigator.mediaSession.setActionHandler('play', () => {
      void resumeNow(lastMetadata);
    });
    navigator.mediaSession.setActionHandler('pause', () => {
      void pauseNow();
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

    el.addEventListener('timeupdate', () => {
      lastTime = el.currentTime || 0;
      lastDuration = Number.isFinite(el.duration) ? el.duration : lastDuration;
      currentCallbacks.onStatus?.(getStatus());
    });

    el.addEventListener('play', () => {
      readyForFinish = true;
      emitStatus(true);
      if (typeof navigator !== 'undefined' && navigator.mediaSession) {
        navigator.mediaSession.playbackState = 'playing';
      }
    });

    el.addEventListener('pause', () => {
      emitStatus(false);
      if (typeof navigator !== 'undefined' && navigator.mediaSession) {
        navigator.mediaSession.playbackState = userWantsPlayback ? 'playing' : 'paused';
      }
      if (
        !webResumeInFlight &&
        shouldAutoResumeWebPause({
          wantsPlayback: userWantsPlayback,
          readyForFinish,
          replacingSource: replacingWebSource,
          ended: el.ended,
          finishedCurrentTrack,
        })
      ) {
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
      if (!readyForFinish) {
        return;
      }
      readyForFinish = false;
      finishedCurrentTrack = true;
      const continued = currentCallbacks.onEnded?.() === true;
      if (!continued) {
        userWantsPlayback = false;
        emitStatus(false);
      }
    });

    el.addEventListener('error', () => {
      userWantsPlayback = false;
      currentCallbacks.onError?.('Audio could not play. Try again.');
      emitStatus(false);
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

  function assignWebSource(el: HTMLAudioElement, url: string): Promise<void> {
    replacingWebSource = true;
    return new Promise((resolve, reject) => {
      const cleanup = () => {
        el.removeEventListener('canplay', onReady);
        el.removeEventListener('error', onError);
        replacingWebSource = false;
      };
      const onReady = () => {
        cleanup();
        resolve();
      };
      const onError = () => {
        cleanup();
        reject(new Error('Audio could not play. Try again.'));
      };
      el.addEventListener('canplay', onReady, { once: true });
      el.addEventListener('error', onError, { once: true });
      el.src = url;
      el.load();
    });
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
      if (next === 'inactive') {
        holdLockScreen();
        return;
      }
      if (next === 'background') {
        holdLockScreen();
        resumeNativeIfWanted();
        return;
      }
      if (next === 'active' && userWantsPlayback && !finishedCurrentTrack) {
        void resumeNow(lastMetadata);
      }
    });

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          maintainBackground();
        }
      });
      window.addEventListener('pagehide', () => {
        maintainBackground();
      });
    }
  }

  function ensurePlayer(): AudioPlayer {
    if (player) {
      return player;
    }

    player = createAudioPlayer(null, {
      updateInterval: 500,
      keepAudioSessionActive: true,
    });

    player.addListener('playbackStatusUpdate', (status: AudioStatus) => {
      lastTime = status.currentTime || 0;
      lastDuration = status.duration || lastDuration;
      if (status.playing) {
        readyForFinish = true;
      }
      emitStatus(Boolean(status.playing));

      if (status.error) {
        userWantsPlayback = false;
        readyForFinish = false;
        currentCallbacks.onError?.('Audio could not play. Try again.');
        return;
      }

      if (status.didJustFinish) {
        if (!readyForFinish) {
          return;
        }
        readyForFinish = false;
        finishedCurrentTrack = true;
        const continued = currentCallbacks.onEnded?.() === true;
        if (!continued) {
          userWantsPlayback = false;
        }
      }
    });

    return player;
  }

  function getStatus(): BackgroundAudioStatus {
    if (isWeb() && webAudio) {
      lastTime = webAudio.currentTime || lastTime;
      lastDuration = Number.isFinite(webAudio.duration) ? webAudio.duration : lastDuration;
      return {
        playing: Boolean(userWantsPlayback && !webAudio.paused),
        currentTime: lastTime,
        duration: lastDuration,
        url: currentUrl,
      };
    }
    if (player) {
      lastTime = player.currentTime || lastTime;
      lastDuration = player.duration || lastDuration;
      return {
        playing: Boolean(player.playing),
        currentTime: lastTime,
        duration: lastDuration,
        url: currentUrl,
      };
    }
    return {
      playing: false,
      currentTime: lastTime,
      duration: lastDuration,
      url: currentUrl,
    };
  }

  function isPlaying(): boolean {
    return getStatus().playing;
  }

  function holdLockScreen(): void {
    if (!userWantsPlayback || !currentUrl) {
      return;
    }
    void ensureAudioMode();
    if (isWeb()) {
      applyWebMediaSession(lastMetadata);
      return;
    }
    if (player) {
      activateLockScreen(player, lastMetadata);
    }
  }

  function resumeNativeIfWanted(): void {
    if (!userWantsPlayback || !currentUrl || finishedCurrentTrack || isWeb()) {
      return;
    }
    if (player && !player.playing) {
      try {
        player.play();
      } catch {
        // Native session may still be starting.
      }
    }
  }

  function maintainBackground(): void {
    holdLockScreen();
    if (isWeb() && !finishedCurrentTrack) {
      resumeWebIfWanted();
    }
  }

  async function seekTo(seconds: number): Promise<void> {
    const next = Math.max(0, seconds);
    lastTime = next;
    if (isWeb()) {
      if (webAudio) {
        webAudio.currentTime = next;
      }
      currentCallbacks.onStatus?.(getStatus());
      return;
    }
    if (player) {
      await player.seekTo(next);
      currentCallbacks.onStatus?.(getStatus());
    }
  }

  async function stopNow(): Promise<void> {
    playGeneration += 1;
    userWantsPlayback = false;
    finishedCurrentTrack = false;
    currentCallbacks = {};
    currentUrl = null;
    lastTime = 0;

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

  async function pauseNow(): Promise<void> {
    userWantsPlayback = false;

    if (isWeb()) {
      webAudio?.pause();
      if (typeof navigator !== 'undefined' && navigator.mediaSession) {
        navigator.mediaSession.playbackState = 'paused';
      }
      emitStatus(false);
      return;
    }

    if (!player) {
      return;
    }
    try {
      player.pause();
      emitStatus(false);
    } catch {
      // Ignore pause race conditions.
    }
  }

  async function playNow(
    url: string,
    callbacks: BackgroundAudioCallbacks = {},
    metadata?: BackgroundAudioMetadata,
    playOptions?: PlayBackgroundAudioOptions,
  ): Promise<void> {
    wireAppLifecycle();
    await ensureAudioMode();
    await ensureNotificationPermission();

    const generation = ++playGeneration;
    currentCallbacks = callbacks;
    lastMetadata = metadata;
    userWantsPlayback = true;
    const startAt = playOptions?.startAt;

    try {
      if (isWeb()) {
        const el = ensureWebAudioElement();
        const alreadyThisTrack =
          currentUrl === url && Boolean(el.src) && !el.ended && !el.paused;
        const sameSourcePaused =
          currentUrl === url && Boolean(el.src) && el.paused && !el.ended;

        if (alreadyThisTrack) {
          applyWebMediaSession(metadata);
          emitStatus(true);
          return;
        }

        readyForFinish = false;
        const restartFinishedTrack =
          finishedCurrentTrack && !(typeof startAt === 'number' && startAt > 0);
        finishedCurrentTrack = false;
        currentUrl = url;
        applyWebMediaSession(metadata);

        if (!sameSourcePaused) {
          await assignWebSource(el, url);
          if (generation !== playGeneration) {
            return;
          }
        }
        if (typeof startAt === 'number' && startAt > 0) {
          el.currentTime = startAt;
          lastTime = startAt;
        } else if (restartFinishedTrack || el.ended) {
          el.currentTime = 0;
          lastTime = 0;
        }

        await el.play();
        if (generation !== playGeneration) {
          return;
        }
        emitStatus(true);
        return;
      }

      const activePlayer = ensurePlayer();
      const alreadyThisTrack =
        currentUrl === url && activePlayer.isLoaded && activePlayer.playing;
      const sameSourcePaused =
        currentUrl === url && activePlayer.isLoaded && !activePlayer.playing;

      if (alreadyThisTrack) {
        activateLockScreen(activePlayer, metadata);
        emitStatus(true);
        return;
      }

      readyForFinish = false;
      const restartFinishedTrack =
        finishedCurrentTrack && !(typeof startAt === 'number' && startAt > 0);
      finishedCurrentTrack = false;

      if (sameSourcePaused) {
        activateLockScreen(activePlayer, metadata);
        if (typeof startAt === 'number' && startAt > 0) {
          await activePlayer.seekTo(startAt);
          lastTime = startAt;
        } else if (restartFinishedTrack) {
          await activePlayer.seekTo(0);
          lastTime = 0;
        }
        activePlayer.play();
        emitStatus(true);
        return;
      }

      currentUrl = url;
      activePlayer.loop = false;
      activePlayer.replace({ uri: url });
      activateLockScreen(activePlayer, metadata);
      if (typeof startAt === 'number' && startAt > 0) {
        await activePlayer.seekTo(startAt);
        lastTime = startAt;
      }
      activePlayer.play();
      emitStatus(true);

      if (generation !== playGeneration) {
        return;
      }
    } catch {
      userWantsPlayback = false;
      currentCallbacks.onError?.('Audio could not play. Try again.');
      throw new Error('Audio could not play. Try again.');
    }
  }

  function playImmediateNow(
    url: string,
    callbacks: BackgroundAudioCallbacks = {},
    metadata?: BackgroundAudioMetadata,
  ): void {
    wireAppLifecycle();
    void ensureAudioMode();
    playGeneration += 1;
    currentCallbacks = callbacks;
    lastMetadata = metadata;
    userWantsPlayback = true;
    readyForFinish = false;
    finishedCurrentTrack = false;
    currentUrl = url;
    lastTime = 0;

    if (isWeb()) {
      const el = ensureWebAudioElement();
      applyWebMediaSession(metadata);
      const generation = playGeneration;
      void assignWebSource(el, url)
        .then(async () => {
          if (generation !== playGeneration) {
            return;
          }
          await el.play();
          emitStatus(true);
        })
        .catch(() => {
          if (generation !== playGeneration) {
            return;
          }
          userWantsPlayback = false;
          currentCallbacks.onError?.('Audio could not play. Try again.');
        });
      return;
    }

    const activePlayer = ensurePlayer();
    activePlayer.loop = false;
    activePlayer.replace({ uri: url });
    activateLockScreen(activePlayer, metadata);
    activePlayer.play();
    emitStatus(true);
  }

  async function resumeNow(metadata?: BackgroundAudioMetadata): Promise<boolean> {
    if (!currentUrl) {
      return false;
    }

    lastMetadata = metadata ?? lastMetadata;
    userWantsPlayback = true;
    finishedCurrentTrack = false;
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
        emitStatus(true);
        return true;
      }

      if (!player || !player.isLoaded) {
        userWantsPlayback = false;
        return false;
      }

      if (!player.playing) {
        activateLockScreen(player, lastMetadata);
        player.play();
        emitStatus(true);
      }
      return true;
    } catch {
      userWantsPlayback = false;
      return false;
    }
  }

  async function replayNow(
    url: string,
    callbacks: BackgroundAudioCallbacks = {},
    metadata?: BackgroundAudioMetadata,
  ): Promise<void> {
    currentUrl = null;
    lastTime = 0;
    await playNow(url, callbacks, metadata);
  }

  return session;
}
