import { IVocabularyPracticeAPI } from './IVocabularyPracticeAPI';
import { VocabPracticeSession, VocabPracticeWord, SessionSummary } from '@/model/VocabularyPractice';

const ACTIVE_SESSION_KEY = 'vocab-active-session';

const HARDCODED_WORDS: Omit<VocabPracticeWord, 'failedAttempts'>[] = [
  { id: 'w1',  english: 'dog',      translation: 'hund',    alternativeTranslations: [] },
  { id: 'w2',  english: 'cat',      translation: 'kat',     alternativeTranslations: [] },
  { id: 'w3',  english: 'house',    translation: 'hus',     alternativeTranslations: [] },
  { id: 'w4',  english: 'car',      translation: 'bil',     alternativeTranslations: [] },
  { id: 'w5',  english: 'water',    translation: 'vand',    alternativeTranslations: [] },
  { id: 'w6',  english: 'book',     translation: 'bog',     alternativeTranslations: [] },
  { id: 'w7',  english: 'chair',    translation: 'stol',    alternativeTranslations: [] },
  { id: 'w8',  english: 'table',    translation: 'bord',    alternativeTranslations: [] },
  { id: 'w9',  english: 'window',   translation: 'vindue',  alternativeTranslations: [] },
  { id: 'w10', english: 'door',     translation: 'dør',     alternativeTranslations: [] },
];

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

interface QueueState {
  sessionId: string;
  pendingQueue: string[];
  masteredIds: string[];
  deferredIds: string[];
  firstAttemptCorrectIds: string[];
  wordFailedAttempts: Record<string, number>;
}

interface SessionMetadata {
  sessionId: string;
  words: VocabPracticeWord[];
  totalWords: number;
}

function queueStateKey(sessionId: string): string {
  return `vocab-queue-${sessionId}`;
}

export class MockVocabularyPracticeAPI implements IVocabularyPracticeAPI {

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async startSession(_language: string): Promise<VocabPracticeSession> {
    const words: VocabPracticeWord[] = HARDCODED_WORDS.map((w) => ({ ...w, failedAttempts: 0 }));
    const sessionId = generateUUID();

    const metadata: SessionMetadata = { sessionId, words, totalWords: words.length };
    localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(metadata));

    const initialQueue: QueueState = {
      sessionId,
      pendingQueue: words.map((w) => w.id),
      masteredIds: [],
      deferredIds: [],
      firstAttemptCorrectIds: [],
      wordFailedAttempts: Object.fromEntries(words.map((w) => [w.id, 0])),
    };
    localStorage.setItem(queueStateKey(sessionId), JSON.stringify(initialQueue));

    return {
      sessionId,
      words,
      pendingQueue: initialQueue.pendingQueue,
      masteredIds: [],
      deferredIds: [],
      firstAttemptCorrectIds: [],
      totalWords: words.length,
    };
  }

  async getActiveSession(): Promise<VocabPracticeSession | null> {
    const rawMeta = localStorage.getItem(ACTIVE_SESSION_KEY);
    if (!rawMeta) return null;

    let metadata: SessionMetadata;
    try {
      metadata = JSON.parse(rawMeta);
    } catch {
      return null;
    }

    const { sessionId, words, totalWords } = metadata;

    // Restore or initialise queue state
    const rawQueue = localStorage.getItem(queueStateKey(sessionId));
    let queue: QueueState | null = null;
    if (rawQueue) {
      try {
        queue = JSON.parse(rawQueue);
      } catch {
        queue = null;
      }
    }

    if (!queue) {
      queue = {
        sessionId,
        pendingQueue: words.map((w) => w.id),
        masteredIds: [],
        deferredIds: [],
        firstAttemptCorrectIds: [],
        wordFailedAttempts: Object.fromEntries(words.map((w) => [w.id, 0])),
      };
    }

    const restoredWords = words.map((w) => ({
      ...w,
      failedAttempts: queue!.wordFailedAttempts[w.id] ?? 0,
    }));

    return {
      sessionId,
      words: restoredWords,
      pendingQueue: queue.pendingQueue,
      masteredIds: queue.masteredIds,
      deferredIds: queue.deferredIds,
      firstAttemptCorrectIds: queue.firstAttemptCorrectIds,
      totalWords,
    };
  }

  // Queue state is managed by the page component — this is a no-op.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async submitAnswer(_sessionId: string, _wordId: string, _isCorrect: boolean): Promise<void> {
    // No-op: the page persists queue state to localStorage after each answer.
  }

  async completeSession(sessionId: string): Promise<SessionSummary> {
    const rawQueue = localStorage.getItem(queueStateKey(sessionId));
    if (!rawQueue) throw new Error('No queue state found for session');

    let queue: QueueState;
    try {
      queue = JSON.parse(rawQueue);
    } catch {
      throw new Error('Failed to parse queue state');
    }

    const rawMeta = localStorage.getItem(ACTIVE_SESSION_KEY);
    if (!rawMeta) throw new Error('No active session found');
    const metadata: SessionMetadata = JSON.parse(rawMeta);

    const firstAttemptCorrect = queue.firstAttemptCorrectIds.length;
    const accuracy = Math.round((firstAttemptCorrect / metadata.totalWords) * 100);

    const summary: SessionSummary = {
      totalWords: metadata.totalWords,
      firstAttemptCorrect,
      accuracy,
      wordResults: metadata.words.map((w) => ({
        wordId: w.id,
        english: w.english,
        translation: w.translation,
        failedAttempts: queue.wordFailedAttempts[w.id] ?? 0,
      })),
    };

    localStorage.removeItem(ACTIVE_SESSION_KEY);
    localStorage.removeItem(queueStateKey(sessionId));

    return summary;
  }
}
