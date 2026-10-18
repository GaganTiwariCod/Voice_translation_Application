import {
  PROTOCOL_VERSION,
  ServerMessage,
  SessionStartPayload,
  SessionStopPayload,
  TranscriptPartialMessage,
  TranscriptFinalMessage,
  TranslationFinalMessage,
  ErrorMessage,
  SessionReadyMessage,
  AudioFormatConfig,
} from '../types/protocol';

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'session_active' | 'error';

export interface TranslatorSocketCallbacks {
  onConnectionStateChange?: (state: ConnectionState) => void;
  onSessionReady?: (msg: SessionReadyMessage) => void;
  onSessionEnded?: (reason: string) => void;
  onPartialTranscript?: (msg: TranscriptPartialMessage) => void;
  onFinalTranscript?: (msg: TranscriptFinalMessage) => void;
  onFinalTranslation?: (msg: TranslationFinalMessage) => void;
  onError?: (err: ErrorMessage) => void;
}

export class TranslatorSocket {
  private ws: WebSocket | null = null;
  private url: string;
  private callbacks: TranslatorSocketCallbacks;
  private state: ConnectionState = 'disconnected';
  private activeSessionId: string | null = null;
  private pingInterval: any = null;

  constructor(serverUrl: string, callbacks: TranslatorSocketCallbacks = {}) {
    this.url = serverUrl;
    this.callbacks = callbacks;
  }

  public getState(): ConnectionState {
    return this.state;
  }

  public getSessionId(): string | null {
    return this.activeSessionId;
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        try {
          this.ws.send(JSON.stringify({ type: 'ping' }));
        } catch (_) {}
      }
    }, 15000);
  }

  private stopHeartbeat() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private setState(newState: ConnectionState) {
    if (this.state !== newState) {
      this.state = newState;
      this.callbacks.onConnectionStateChange?.(newState);
    }
  }

  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
        return resolve();
      }

      this.setState('connecting');

      try {
        this.ws = new WebSocket(this.url);
        // Ensure binary frames are received/handled as ArrayBuffer
        (this.ws as any).binaryType = 'arraybuffer';

        this.ws.onopen = () => {
          this.setState('connected');
          this.startHeartbeat();
          resolve();
        };

        this.ws.onmessage = (event: WebSocketMessageEvent) => {
          this.handleIncomingMessage(event.data);
        };

        this.ws.onerror = (event: any) => {
          this.stopHeartbeat();
          this.setState('error');
          this.callbacks.onError?.({
            type: 'error',
            code: 'SOCKET_ERROR',
            message: event.message || 'WebSocket connection error',
          });
          reject(new Error(event.message || 'WebSocket error'));
        };

        this.ws.onclose = (event: WebSocketCloseEvent) => {
          this.stopHeartbeat();
          this.activeSessionId = null;
          this.setState('disconnected');
          this.callbacks.onSessionEnded?.(event.reason || 'Socket closed');
        };
      } catch (err: any) {
        this.stopHeartbeat();
        this.setState('error');
        reject(err);
      }
    });
  }

  public async startSession(
    sourceLanguage: string,
    targetLanguage: string,
    audioFormat: AudioFormatConfig = {
      encoding: 'pcm_s16le',
      sampleRate: 16000,
      channels: 1,
    }
  ): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      await this.connect();
    }

    const payload: SessionStartPayload = {
      type: 'session.start',
      protocolVersion: PROTOCOL_VERSION,
      sourceLanguage,
      targetLanguage,
      audioFormat,
    };

    this.ws?.send(JSON.stringify(payload));
  }

  public sendAudioChunk(chunk: ArrayBuffer | Uint8Array): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || this.state !== 'session_active') {
      return;
    }
    // Continuous binary frame streaming
    if (chunk instanceof Uint8Array) {
      this.ws.send(chunk.buffer.slice(chunk.byteOffset, chunk.byteOffset + chunk.byteLength) as ArrayBuffer);
    } else {
      this.ws.send(chunk);
    }
  }

  public stopSession(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN && this.state === 'session_active') {
      const payload: SessionStopPayload = {
        type: 'session.stop',
      };
      this.ws.send(JSON.stringify(payload));
      this.activeSessionId = null;
      this.setState('connected');
    }
  }

  public disconnect(): void {
    if (this.ws) {
      this.stopSession();
      this.ws.close();
      this.ws = null;
    }
    this.activeSessionId = null;
    this.setState('disconnected');
  }

  private handleIncomingMessage(raw: any) {
    if (typeof raw !== 'string') {
      return;
    }

    try {
      const msg: ServerMessage = JSON.parse(raw);
      switch (msg.type) {
        case 'session.ready':
          this.activeSessionId = msg.sessionId;
          this.setState('session_active');
          this.callbacks.onSessionReady?.(msg);
          break;

        case 'session.ended':
          this.activeSessionId = null;
          this.setState('connected');
          this.callbacks.onSessionEnded?.(msg.reason);
          break;

        case 'transcript.partial':
          this.callbacks.onPartialTranscript?.(msg);
          break;

        case 'transcript.final':
          this.callbacks.onFinalTranscript?.(msg);
          break;

        case 'translation.final':
          this.callbacks.onFinalTranslation?.(msg);
          break;

        case 'error':
          this.callbacks.onError?.(msg);
          break;

        default:
          break;
      }
    } catch (err) {
      // Ignore malformed text packets
    }
  }
}
