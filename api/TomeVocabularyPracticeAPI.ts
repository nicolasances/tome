import { IVocabularyPracticeAPI } from './IVocabularyPracticeAPI';
import { VocabPracticeSession, VocabPracticeWord, SessionSummary } from '@/model/VocabularyPractice';
import { TotoAPI } from './TotoAPI';

const api = new TotoAPI();

function queueStateKey(sessionId: string): string {
  return `vocab-queue-${sessionId}`;
}

interface QueueState {
  sessionId: string;
  pendingQueue: string[];
  masteredIds: string[];
  deferredIds: string[];
  firstAttemptCorrectIds: string[];
  wordFailedAttempts: Record<string, number>;
}

interface BackendWord {
  wordId: string;
  english: string;
  translation: string;
  alternativeTranslations?: Array<{ id: string; translation: string }>;
}

interface BackendSessionResponse {
  sessionId: string;
  payload: {
    words: BackendWord[];
    totalWords: number;
  };
}

function mapBackendWords(backendWords: BackendWord[]): VocabPracticeWord[] {
  return backendWords.map((w) => ({
    id: w.wordId,
    english: w.english,
    translation: w.translation,
    failedAttempts: 0,
    alternativeTranslations: w.alternativeTranslations ?? [],
  }));
}

function buildSessionFromBackend(
  data: BackendSessionResponse,
  queue: QueueState
): VocabPracticeSession {
  const words = mapBackendWords(data.payload.words).map((w) => ({
    ...w,
    failedAttempts: queue.wordFailedAttempts[w.id] ?? 0,
  }));
  return {
    sessionId: data.sessionId,
    words,
    pendingQueue: queue.pendingQueue,
    masteredIds: queue.masteredIds,
    deferredIds: queue.deferredIds,
    firstAttemptCorrectIds: queue.firstAttemptCorrectIds,
    totalWords: data.payload.totalWords,
  };
}

function initialQueueState(sessionId: string, words: VocabPracticeWord[]): QueueState {
  return {
    sessionId,
    pendingQueue: words.map((w) => w.id),
    masteredIds: [],
    deferredIds: [],
    firstAttemptCorrectIds: [],
    wordFailedAttempts: Object.fromEntries(words.map((w) => [w.id, 0])),
  };
}

export class TomeVocabularyPracticeAPI implements IVocabularyPracticeAPI {

  async startSession(language: string): Promise<VocabPracticeSession> {
    const response = await api.fetch(
      'tome-ms-language',
      `/languages/${language}/sessions`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ practiceType: 'vocabulary' }),
      }
    );

    if (response.status === 409) {
      const existing = await this.getActiveSession();
      if (existing) return existing;
      throw new Error('An active session already exists but could not be retrieved.');
    }
    if (!response.ok) {
      throw new Error(`Failed to start session (${response.status})`);
    }

    const data: BackendSessionResponse = await response.json();
    const words = mapBackendWords(data.payload.words);
    const queue = initialQueueState(data.sessionId, words);

    localStorage.setItem(queueStateKey(data.sessionId), JSON.stringify(queue));

    return buildSessionFromBackend(data, queue);
  }

  async getActiveSession(): Promise<VocabPracticeSession | null> {
    const response = await api.fetch('tome-ms-language', '/sessions/active');

    if (response.status === 404) return null;
    if (!response.ok) {
      throw new Error(`Failed to fetch active session (${response.status})`);
    }

    const data: BackendSessionResponse = await response.json();
    const words = mapBackendWords(data.payload.words);

    // Restore queue state from localStorage, falling back to fresh initialisation
    const rawQueue = localStorage.getItem(queueStateKey(data.sessionId));
    let queue: QueueState | null = null;
    if (rawQueue) {
      try {
        queue = JSON.parse(rawQueue);
      } catch {
        queue = null;
      }
    }
    if (!queue) {
      queue = initialQueueState(data.sessionId, words);
      localStorage.setItem(queueStateKey(data.sessionId), JSON.stringify(queue));
    }

    return buildSessionFromBackend(data, queue);
  }

  async submitAnswer(sessionId: string, wordId: string, isCorrect: boolean): Promise<void> {
    const response = await api.fetch(
      'tome-ms-language',
      `/sessions/${sessionId}/answers`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityId: wordId, isCorrect }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to submit answer (${response.status})`);
    }
  }

  async completeSession(sessionId: string): Promise<SessionSummary> {
    const response = await api.fetch(
      'tome-ms-language',
      `/sessions/${sessionId}/completion`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' } }
    );

    if (!response.ok) {
      throw new Error(`Failed to complete session (${response.status})`);
    }

    const summary: SessionSummary = await response.json();

    localStorage.removeItem(queueStateKey(sessionId));

    return summary;
  }
}
