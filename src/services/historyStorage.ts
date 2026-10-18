import { NativeModules } from 'react-native';

const { NativeLocalStorage } = NativeModules;

export interface HistoryExchange {
  id: string;
  sequence: number;
  sourceText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  timestamp: string;
}

const STORAGE_KEY = '@live_translator_history_v1';
const TOGGLE_KEY = '@live_translator_save_enabled_v1';
const MAX_HISTORY_ITEMS = 200; // Store the full session conversation (up to 200 exchanges)

class HistoryStorageService {
  private inMemoryCache: HistoryExchange[] = [];
  private isSaveEnabled: boolean = true;
  private isLoaded: boolean = false;

  constructor() {
    this.init().catch(() => {});
  }

  private async init(): Promise<void> {
    if (this.isLoaded) return;
    try {
      if (NativeLocalStorage) {
        const toggleVal = await NativeLocalStorage.getItem(TOGGLE_KEY);
        if (toggleVal !== null) {
          this.isSaveEnabled = toggleVal === 'true';
        }

        const data = await NativeLocalStorage.getItem(STORAGE_KEY);
        if (data) {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed)) {
            this.inMemoryCache = parsed.slice(0, MAX_HISTORY_ITEMS);
          }
        }
      }
    } catch (e) {
      // Fallback silently without disrupting caller
    } finally {
      this.isLoaded = true;
    }
  }

  public async getHistory(): Promise<HistoryExchange[]> {
    if (!this.isLoaded) {
      await this.init();
    }
    return [...this.inMemoryCache];
  }

  public getHistorySync(): HistoryExchange[] {
    return [...this.inMemoryCache];
  }

  public getIsSaveEnabledSync(): boolean {
    return this.isSaveEnabled;
  }

  public async setIsSaveEnabled(enabled: boolean): Promise<void> {
    this.isSaveEnabled = enabled;
    try {
      if (NativeLocalStorage) {
        await NativeLocalStorage.setItem(TOGGLE_KEY, enabled ? 'true' : 'false');
      }
    } catch (_) {}
  }

  public async saveExchange(item: {
    sequence: number;
    sourceText: string;
    translatedText: string;
    sourceLanguage: string;
    targetLanguage: string;
  }): Promise<void> {
    if (!this.isSaveEnabled) return;
    if (!item.sourceText || !item.translatedText) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newEntry: HistoryExchange = {
      id: `hist_${item.sequence}_${Date.now()}`,
      sequence: item.sequence,
      sourceText: item.sourceText.trim(),
      translatedText: item.translatedText.trim(),
      sourceLanguage: item.sourceLanguage,
      targetLanguage: item.targetLanguage,
      timestamp: timeStr,
    };

    // Keep only the latest 2 exchanges (newest first)
    const updated = [newEntry, ...this.inMemoryCache.filter((c) => c.sequence !== item.sequence)].slice(
      0,
      MAX_HISTORY_ITEMS
    );

    this.inMemoryCache = updated;

    // Asynchronous non-blocking disk flush (zero latency on audio pipeline)
    setTimeout(() => {
      if (NativeLocalStorage) {
        NativeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(() => {});
      }
    }, 0);
  }

  public async clearHistory(): Promise<void> {
    this.inMemoryCache = [];
    if (NativeLocalStorage) {
      try {
        await NativeLocalStorage.removeItem(STORAGE_KEY);
      } catch (_) {}
    }
  }
}

export const historyStorage = new HistoryStorageService();
