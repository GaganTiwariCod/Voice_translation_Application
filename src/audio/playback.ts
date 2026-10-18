import { NativeModules } from 'react-native';
import { SpeechItem } from '../queues/speechQueue';

const { NativeTextToSpeech } = NativeModules;

const LOCALE_MAP: Record<string, string> = {
  en: 'en-US',
  hi: 'hi-IN',
  mr: 'mr-IN',
  gu: 'gu-IN',
  bn: 'bn-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
};

export class PlaybackService {
  public async speak(item: SpeechItem): Promise<void> {
    if (!item.text || item.text.trim().length === 0) {
      return;
    }

    if (NativeTextToSpeech) {
      try {
        const langKey = item.language.toLowerCase().trim();
        const langCode = langKey.includes('-')
          ? langKey
          : LOCALE_MAP[langKey] || langKey;

        // Adaptive timeout so the speech queue never blocks if an engine callback lags
        const wordCount = item.text.trim().split(/\s+/).length;
        const maxDurationMs = Math.min(Math.max(wordCount * 220 + 1200, 2000), 7000);

        const speakPromise = NativeTextToSpeech.speak(item.text, langCode);
        const timeoutPromise = new Promise((resolve) => {
          setTimeout(() => resolve(false), maxDurationMs);
        });

        await Promise.race([speakPromise, timeoutPromise]);
      } catch (err) {
        console.warn('NativeTextToSpeech speak error:', err);
      }
    }
  }

  public stop(): void {
    if (NativeTextToSpeech) {
      try {
        NativeTextToSpeech.stop().catch(() => {});
      } catch (_) {}
    }
  }
}
