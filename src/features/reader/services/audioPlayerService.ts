import { Audio, type AVPlaybackStatus } from 'expo-av';

type PlaybackCallbacks = {
  onEnded?: () => void;
  onError?: (message: string) => void;
};

let currentSound: Audio.Sound | null = null;
let configured = false;

async function ensureAudioMode(): Promise<void> {
  if (configured) {
    return;
  }
  await Audio.setAudioModeAsync({
    playsInSilentModeIOS: true,
    staysActiveInBackground: false,
    shouldDuckAndroid: true,
  });
  configured = true;
}

function isLoaded(status: AVPlaybackStatus): status is AVPlaybackStatus & {
  isLoaded: true;
  didJustFinish: boolean;
} {
  return status.isLoaded;
}

export async function stopVerseAudio(): Promise<void> {
  if (!currentSound) {
    return;
  }
  const sound = currentSound;
  currentSound = null;
  try {
    sound.setOnPlaybackStatusUpdate(null);
    await sound.stopAsync();
  } catch {
    // Ignore stop errors while tearing down.
  }
  try {
    await sound.unloadAsync();
  } catch {
    // Ignore unload errors while tearing down.
  }
}

export async function playVerseAudio(
  url: string,
  callbacks: PlaybackCallbacks = {},
): Promise<void> {
  await stopVerseAudio();
  await ensureAudioMode();

  try {
    const { sound } = await Audio.Sound.createAsync(
      { uri: url },
      { shouldPlay: true },
      (status) => {
        if (!isLoaded(status)) {
          if ('error' in status && status.error) {
            callbacks.onError?.('Audio could not play. Try again.');
          }
          return;
        }
        if (status.didJustFinish) {
          callbacks.onEnded?.();
        }
      },
    );
    currentSound = sound;
  } catch {
    callbacks.onError?.('Audio could not play. Try again.');
    throw new Error('Audio could not play. Try again.');
  }
}

export async function pauseVerseAudio(): Promise<void> {
  if (!currentSound) {
    return;
  }
  try {
    const status = await currentSound.getStatusAsync();
    if (status.isLoaded && status.isPlaying) {
      await currentSound.pauseAsync();
    }
  } catch {
    // Ignore pause race conditions.
  }
}

export async function resumeVerseAudio(): Promise<void> {
  if (!currentSound) {
    return;
  }
  try {
    const status = await currentSound.getStatusAsync();
    if (status.isLoaded && !status.isPlaying) {
      await currentSound.playAsync();
    }
  } catch {
    // Ignore resume race conditions.
  }
}

export async function replayVerseAudio(
  url: string,
  callbacks: PlaybackCallbacks = {},
): Promise<void> {
  await playVerseAudio(url, callbacks);
}
