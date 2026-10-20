import { useState, useEffect, useRef, useCallback } from 'react';
import { TranslatorSocket, ConnectionState } from '../services/translatorSocket';
import { MicrophoneService } from '../audio/microphone';
import { PlaybackService } from '../audio/playback';
import { SpeechQueue, SpeechItem } from '../queues/speechQueue';
import { TranscriptItem, TranslationFinalMessage, TranscriptPartialMessage, TranscriptFinalMessage, ErrorMessage } from '../types/protocol';

import { historyStorage, HistoryExchange } from '../services/historyStorage';
import { ENV, normalizeWsUrl } from '../config/env';

interface UseTranslationSessionOptions {
  serverUrl?: string;
  defaultSourceLanguage?: string;
  defaultTargetLanguage?: string;
}

export function useTranslationSession({
  serverUrl: initialServerUrl = ENV.DEFAULT_SERVER_URL,
  defaultSourceLanguage = ENV.DEFAULT_SOURCE_LANGUAGE,
  defaultTargetLanguage = ENV.DEFAULT_TARGET_LANGUAGE,
}: UseTranslationSessionOptions = {}) {
  const [serverUrl, setServerUrlState] = useState<string>(normalizeWsUrl(initialServerUrl));
  const setServerUrl = useCallback((url: string) => {
    setServerUrlState(normalizeWsUrl(url));
  }, []);
  const [sourceLanguage, setSourceLanguage] = useState<string>(defaultSourceLanguage);
  const [targetLanguage, setTargetLanguage] = useState<string>(defaultTargetLanguage);
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const [currentPartialSource, setCurrentPartialSource] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [historyItems, setHistoryItems] = useState<HistoryExchange[]>([]);
  const [isSaveHistoryEnabled, setIsSaveHistoryEnabled] = useState<boolean>(true);

  useEffect(() => {
    historyStorage.getHistory().then((items) => {
      setHistoryItems(items);
      setIsSaveHistoryEnabled(historyStorage.getIsSaveEnabledSync());
    });
  }, []);

  const toggleSaveHistory = useCallback(async () => {
    setIsSaveHistoryEnabled((prev) => {
      const next = !prev;
      historyStorage.setIsSaveEnabled(next).catch(() => {});
      return next;
    });
  }, []);

  const clearChatHistory = useCallback(async () => {
    await historyStorage.clearHistory();
    setHistoryItems([]);
  }, []);

  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true);
  const isAudioEnabledRef = useRef<boolean>(true);

  useEffect(() => {
    isAudioEnabledRef.current = isAudioEnabled;
  }, [isAudioEnabled]);

  const toggleAudio = useCallback(() => {
    setIsAudioEnabled((prev) => {
      const next = !prev;
      if (!next) {
        playbackRef.current.stop();
        queueRef.current.clear();
      }
      return next;
    });
  }, []);

  const socketRef = useRef<TranslatorSocket | null>(null);
  const micRef = useRef<MicrophoneService>(new MicrophoneService());
  const playbackRef = useRef<PlaybackService>(new PlaybackService());
  const queueRef = useRef<SpeechQueue>(new SpeechQueue());

  // Setup queue speaker
  useEffect(() => {
    const queue = queueRef.current;
    const playback = playbackRef.current;

    queue.setSpeaker(async (item: SpeechItem) => {
      if (!isAudioEnabledRef.current) return;
      setIsPlayingAudio(true);
      try {
        await playback.speak(item);
      } finally {
        setIsPlayingAudio(queue.getIsPlaying());
      }
    });

    return () => {
      queue.clear();
      playback.stop();
    };
  }, []);

  // Initialize socket client
  useEffect(() => {
    const socket = new TranslatorSocket(serverUrl, {
      onConnectionStateChange: (state) => {
        setConnectionState(state);
      },
      onSessionReady: () => {
        setErrorMessage(null);
        // Start streaming microphone frames continuously
        micRef.current.start(
          (frame) => {
            socketRef.current?.sendAudioChunk(frame);
          },
          (err) => {
            setErrorMessage(`Microphone error: ${err.message}`);
            stopListening();
          }
        ).catch((err) => {
          setErrorMessage(`Failed to start microphone: ${err.message}`);
          stopListening();
        });
      },
      onPartialTranscript: (msg: TranscriptPartialMessage) => {
        setCurrentPartialSource(msg.text);
      },
      onFinalTranscript: (msg: TranscriptFinalMessage) => {
        setCurrentPartialSource('');
      },
      onFinalTranslation: (msg: TranslationFinalMessage) => {
        setCurrentPartialSource('');
        const newItem: TranscriptItem = {
          id: `item-${msg.sequence}-${Date.now()}`,
          sequence: msg.sequence,
          sourceText: msg.sourceText,
          translatedText: msg.translatedText,
          sourceLanguage: msg.sourceLanguage,
          targetLanguage: msg.targetLanguage,
          isPartial: false,
          timestamp: Date.now(),
          latencyMetrics: msg.latencyMetrics,
        };

        setTranscripts((prev) => [newItem, ...prev.slice(0, 99)]); // keep max 100 items

        // Non-blocking 2-chat persistent memory save (zero latency impact)
        historyStorage
          .saveExchange({
            sequence: msg.sequence,
            sourceText: msg.sourceText,
            translatedText: msg.translatedText,
            sourceLanguage: msg.sourceLanguage,
            targetLanguage: msg.targetLanguage,
          })
          .then(() => {
            setHistoryItems(historyStorage.getHistorySync());
          })
          .catch(() => {});

        // Enqueue translated phrase for continuous spoken output if audio enabled
        if (isAudioEnabledRef.current) {
          queueRef.current.enqueue({
            sequence: msg.sequence,
            text: msg.translatedText,
            language: msg.targetLanguage,
            timestamp: Date.now(),
          });
        }
      },
      onError: (err: ErrorMessage) => {
        setErrorMessage(`${err.code}: ${err.message}`);
      },
      onSessionEnded: () => {
        setIsListening(false);
        micRef.current.stop();
      },
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      micRef.current.stop();
      queueRef.current.reset();
    };
  }, [serverUrl]);

  const startListening = useCallback(async () => {
    if (isListening) return;
    setErrorMessage(null);

    try {
      setIsListening(true);
      const socket = socketRef.current;
      if (!socket) throw new Error('Socket not initialized');

      await socket.startSession(sourceLanguage, targetLanguage);
    } catch (err: any) {
      setIsListening(false);
      setErrorMessage(err.message || 'Failed to start translation session');
    }
  }, [isListening, sourceLanguage, targetLanguage]);

  const stopListening = useCallback(() => {
    setIsListening(false);
    micRef.current.stop();
    socketRef.current?.stopSession();
    setCurrentPartialSource('');
  }, []);

  const clearErrorMessage = useCallback(() => {
    setErrorMessage(null);
  }, []);

  const retryConnection = useCallback(async () => {
    setErrorMessage(null);
    try {
      const socket = socketRef.current;
      if (socket) {
        socket.disconnect();
        await socket.connect();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to connect to server');
    }
  }, []);

  return {
    sourceLanguage,
    targetLanguage,
    connectionState,
    isListening,
    isPlayingAudio,
    isAudioEnabled,
    setIsAudioEnabled,
    toggleAudio,
    transcripts,
    currentPartialSource,
    errorMessage,
    clearErrorMessage,
    retryConnection,
    historyItems,
    isSaveHistoryEnabled,
    toggleSaveHistory,
    clearChatHistory,
    setSourceLanguage,
    setTargetLanguage,
    serverUrl,
    setServerUrl,
    startListening,
    stopListening,
  };
}
