export const PROTOCOL_VERSION = 1;

export type AudioEncoding = 'pcm_s16le';

export interface AudioFormatConfig {
  encoding: AudioEncoding;
  sampleRate: number; // e.g. 16000
  channels: number; // 1 (mono)
}

export interface SessionStartPayload {
  type: 'session.start';
  protocolVersion: number;
  sourceLanguage: string;
  targetLanguage: string;
  audioFormat: AudioFormatConfig;
}

export interface SessionStopPayload {
  type: 'session.stop';
}

export interface SessionReadyMessage {
  type: 'session.ready';
  sessionId: string;
  protocolVersion: number;
}

export interface SessionEndedMessage {
  type: 'session.ended';
  sessionId: string;
  reason: string;
}

export interface TranscriptPartialMessage {
  type: 'transcript.partial';
  sequence: number;
  text: string;
}

export interface TranscriptFinalMessage {
  type: 'transcript.final';
  sequence: number;
  text: string;
}

export interface LatencyMetrics {
  sttLatencyMs: number;
  translationLatencyMs: number;
  totalServerLatencyMs: number;
  audioCaptureAt?: number;
  clientReceivedAt?: number;
  roundTripLatencyMs?: number;
}

export interface TranslationFinalMessage {
  type: 'translation.final';
  sequence: number;
  sourceText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  latencyMetrics?: LatencyMetrics;
}

export interface ErrorMessage {
  type: 'error';
  code: string;
  message: string;
}

export interface MetricsMessage {
  type: 'metrics';
  metrics: {
    sessionId: string;
    uptimeMs: number;
    audioFramesReceived: number;
    totalAudioBytes: number;
    translationCount: number;
    averageSttLatencyMs: number;
    averageTranslationLatencyMs: number;
    averageServerLatencyMs: number;
  };
}

export type ServerMessage =
  | SessionReadyMessage
  | SessionEndedMessage
  | TranscriptPartialMessage
  | TranscriptFinalMessage
  | TranslationFinalMessage
  | ErrorMessage
  | MetricsMessage;

export interface TranscriptItem {
  id: string;
  sequence: number;
  sourceText: string;
  translatedText?: string;
  sourceLanguage: string;
  targetLanguage: string;
  isPartial: boolean;
  timestamp: number;
  latencyMetrics?: LatencyMetrics;
}
