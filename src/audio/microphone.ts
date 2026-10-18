import { PermissionsAndroid, Platform, NativeModules, DeviceEventEmitter, EmitterSubscription } from 'react-native';
import { AudioCaptureConfig, DEFAULT_AUDIO_CONFIG, AudioDataCallback, AudioErrorCallback } from './audioTypes';

const { NativeAudioRecorder } = NativeModules;

function base64ToBytes(base64: string): Uint8Array {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const lookup = new Uint8Array(256);
  for (let i = 0; i < chars.length; i++) {
    lookup[chars.charCodeAt(i)] = i;
  }
  let bufferLength = base64.length * 0.75;
  if (base64[base64.length - 1] === '=') {
    bufferLength--;
    if (base64[base64.length - 2] === '=') bufferLength--;
  }
  const bytes = new Uint8Array(bufferLength);
  let p = 0;
  for (let i = 0; i < base64.length; i += 4) {
    const encoded1 = lookup[base64.charCodeAt(i)];
    const encoded2 = lookup[base64.charCodeAt(i + 1)];
    const encoded3 = lookup[base64.charCodeAt(i + 2)];
    const encoded4 = lookup[base64.charCodeAt(i + 3)];

    bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
    if (p < bufferLength) bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
    if (p < bufferLength) bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
  }
  return bytes;
}

export class MicrophoneService {
  private isCapturing: boolean = false;
  private config: AudioCaptureConfig;
  private onDataCallback: AudioDataCallback | null = null;
  private onErrorCallback: AudioErrorCallback | null = null;
  private eventSubscription: EmitterSubscription | null = null;

  constructor(config: AudioCaptureConfig = DEFAULT_AUDIO_CONFIG) {
    this.config = config;
  }

  public async requestPermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        const alreadyGranted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
        if (alreadyGranted) {
          return true;
        }

        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'Live Translator requires microphone access to translate your speech in real-time.',
            buttonPositive: 'Grant Permission',
            buttonNegative: 'Deny',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err: any) {
        this.onErrorCallback?.(err);
        return false;
      }
    }
    return true;
  }

  public async start(onData: AudioDataCallback, onError: AudioErrorCallback): Promise<void> {
    if (this.isCapturing) return;

    this.onDataCallback = onData;
    this.onErrorCallback = onError;

    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      throw new Error('Microphone permission was denied.');
    }

    this.isCapturing = true;

    if (NativeAudioRecorder) {
      this.eventSubscription = DeviceEventEmitter.addListener('onAudioChunk', (base64: string) => {
        if (!this.isCapturing) return;
        try {
          const bytes = base64ToBytes(base64);
          this.onDataCallback?.(bytes);
        } catch (e: any) {
          this.onErrorCallback?.(e);
        }
      });

      await NativeAudioRecorder.start(
        this.config.sampleRate,
        this.config.channels,
        this.config.bitsPerSample
      );
    } else {
      this.onErrorCallback?.(new Error('NativeAudioRecorder module is not linked.'));
    }
  }

  public stop(): void {
    if (!this.isCapturing) return;
    this.isCapturing = false;

    if (this.eventSubscription) {
      this.eventSubscription.remove();
      this.eventSubscription = null;
    }

    if (NativeAudioRecorder) {
      NativeAudioRecorder.stop().catch(() => {});
    }

    this.onDataCallback = null;
    this.onErrorCallback = null;
  }

  public isActive(): boolean {
    return this.isCapturing;
  }
}

