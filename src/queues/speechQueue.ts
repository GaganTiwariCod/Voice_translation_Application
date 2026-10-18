export interface SpeechItem {
  sequence: number;
  text: string;
  language: string;
  timestamp: number;
}

export type PlaybackSpeaker = (item: SpeechItem) => Promise<void>;

export class SpeechQueue {
  private queue: SpeechItem[] = [];
  private maxCapacity: number;
  private isPlaying: boolean = false;
  private speaker: PlaybackSpeaker | null = null;
  private processedSequences: Set<number> = new Set();
  private lastPlayedSequence: number = 0;

  constructor(maxCapacity: number = 50, speaker: PlaybackSpeaker | null = null) {
    this.maxCapacity = maxCapacity;
    this.speaker = speaker;
  }

  public setSpeaker(speaker: PlaybackSpeaker) {
    this.speaker = speaker;
  }

  public enqueue(item: SpeechItem): boolean {
    // 1. Duplicate prevention
    if (this.processedSequences.has(item.sequence)) {
      return false;
    }

    // 2. Out-of-order check: if segment is older than what we already finalized
    if (item.sequence <= this.lastPlayedSequence && this.lastPlayedSequence > 0) {
      return false;
    }

    this.processedSequences.add(item.sequence);

    // Keep processed set bounded to prevent memory growth
    if (this.processedSequences.size > 500) {
      const arr = Array.from(this.processedSequences);
      this.processedSequences = new Set(arr.slice(arr.length - 250));
    }

    // 3. Bound capacity check (drop oldest unplayed if exceeded)
    if (this.queue.length >= this.maxCapacity) {
      this.queue.shift(); // Drop oldest to avoid lag accumulation
    }

    // 4. Insert in sorted sequence order
    let insertIdx = this.queue.length;
    for (let i = 0; i < this.queue.length; i++) {
      if (item.sequence < this.queue[i].sequence) {
        insertIdx = i;
        break;
      }
    }
    this.queue.splice(insertIdx, 0, item);

    // Trigger processing
    this.processQueue();
    return true;
  }

  private async processQueue() {
    if (this.isPlaying || this.queue.length === 0 || !this.speaker) {
      return;
    }

    this.isPlaying = true;

    while (this.queue.length > 0) {
      const nextItem = this.queue.shift();
      if (!nextItem) break;

      this.lastPlayedSequence = nextItem.sequence;

      try {
        await this.speaker(nextItem);
      } catch (err) {
        // Log speech error, continue to next segment
        console.warn('Playback error for sequence:', nextItem.sequence, err);
      }
    }

    this.isPlaying = false;
  }

  public clear(): void {
    this.queue = [];
    this.isPlaying = false;
  }

  public reset(): void {
    this.clear();
    this.processedSequences.clear();
    this.lastPlayedSequence = 0;
  }

  public getQueueLength(): number {
    return this.queue.length;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}
