export interface AudioCaptureConfig {
  sampleRate: number; // 16000
  channels: number; // 1 (mono)
  bitsPerSample: number; // 16
  bufferSize: number; // Frame duration / size (e.g. 2048 bytes ~ 64ms)
}

export const DEFAULT_AUDIO_CONFIG: AudioCaptureConfig = {
  sampleRate: 16000,
  channels: 1,
  bitsPerSample: 16,
  bufferSize: 2048,
};

export type AudioDataCallback = (data: Uint8Array) => void;
export type AudioErrorCallback = (error: Error) => void;
