import * as Speech from 'expo-speech';

const CHILD_FRIENDLY_RATE = 0.85;
const CHILD_FRIENDLY_PITCH = 1.05;

export async function stopQuestionSpeech(): Promise<void> {
  await Speech.stop();
}

/**
 * Reads the English competition prompt with device/web TTS.
 * Tap-to-play only — callers must not invoke this on mount.
 */
export async function speakEnglishQuestion(
  text: string,
  callbacks?: { onStart?: () => void; onDone?: () => void },
): Promise<void> {
  const spoken = text.trim();
  if (!spoken) {
    return;
  }

  await Speech.stop();

  Speech.speak(spoken, {
    language: 'en-US',
    rate: CHILD_FRIENDLY_RATE,
    pitch: CHILD_FRIENDLY_PITCH,
    onStart: callbacks?.onStart,
    onDone: callbacks?.onDone,
    onStopped: callbacks?.onDone,
    onError: () => {
      callbacks?.onDone?.();
    },
  });
}
