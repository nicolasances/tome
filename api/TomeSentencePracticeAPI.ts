import { ISentencePracticeAPI } from './ISentencePracticeAPI';
import { SentencePracticeSession, SentencePracticeSentence, SentenceSessionSummary } from '@/model/SentencePractice';
import { TotoAPI } from './TotoAPI';

const api = new TotoAPI();

function queueStateKey(sessionId: string): string {
  return `sentence-queue-${sessionId}`;
}

interface QueueState {
  sessionId: string;
  pendingQueue: string[];
  masteredIds: string[];
  deferredIds: string[];
  firstAttemptCorrectIds: string[];
  sentenceFailedAttempts: Record<string, number>;
}

interface BackendSentence {
  sentenceId: string;
  sentence: string;
  translation: string;
}

interface BackendSessionResponse {
  sessionId: string;
  practiceType: string;
  payload: {
    sentences: BackendSentence[];
    totalSentences: number;
  };
}

interface BackendSummaryResponse {
  totalSentences: number;
  firstAttemptCorrect: number;
  accuracy: number;
  sentenceResults: Array<{
    sentenceId: string;
    sentence: string;
    translation: string;
    failedAttempts: number;
  }>;
}

function mapBackendSentences(backendSentences: BackendSentence[]): SentencePracticeSentence[] {
  return backendSentences.map((s) => ({
    id: s.sentenceId,
    sentence: s.sentence,
    translation: s.translation,
    failedAttempts: 0,
  }));
}

function buildSessionFromBackend(
  data: BackendSessionResponse,
  queue: QueueState
): SentencePracticeSession {
  const sentences = mapBackendSentences(data.payload.sentences).map((s) => ({
    ...s,
    failedAttempts: queue.sentenceFailedAttempts[s.id] ?? 0,
  }));
  return {
    sessionId: data.sessionId,
    sentences,
    pendingQueue: queue.pendingQueue,
    masteredIds: queue.masteredIds,
    deferredIds: queue.deferredIds,
    firstAttemptCorrectIds: queue.firstAttemptCorrectIds,
    totalSentences: data.payload.totalSentences,
  };
}

function initialQueueState(sessionId: string, sentences: SentencePracticeSentence[]): QueueState {
  return {
    sessionId,
    pendingQueue: sentences.map((s) => s.id),
    masteredIds: [],
    deferredIds: [],
    firstAttemptCorrectIds: [],
    sentenceFailedAttempts: Object.fromEntries(sentences.map((s) => [s.id, 0])),
  };
}

export class TomeSentencePracticeAPI implements ISentencePracticeAPI {

  async startSession(language: string): Promise<SentencePracticeSession> {
    const response = await api.fetch(
      'tome-ms-language',
      `/languages/${language}/sessions`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ practiceType: 'sentences' }),
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
    const sentences = mapBackendSentences(data.payload.sentences);
    const queue = initialQueueState(data.sessionId, sentences);

    localStorage.setItem(queueStateKey(data.sessionId), JSON.stringify(queue));

    return buildSessionFromBackend(data, queue);
  }

  async getActiveSession(): Promise<SentencePracticeSession | null> {
    const response = await api.fetch('tome-ms-language', '/sessions/active');

    if (response.status === 404) return null;
    if (!response.ok) {
      throw new Error(`Failed to fetch active session (${response.status})`);
    }

    const data = await response.json();

    // Only claim the session if it belongs to sentence practice
    if (data.practiceType !== 'sentences') return null;

    const typedData = data as BackendSessionResponse;
    const sentences = mapBackendSentences(typedData.payload.sentences);

    const rawQueue = localStorage.getItem(queueStateKey(typedData.sessionId));
    let queue: QueueState | null = null;
    if (rawQueue) {
      try {
        queue = JSON.parse(rawQueue);
      } catch {
        queue = null;
      }
    }
    if (!queue) {
      queue = initialQueueState(typedData.sessionId, sentences);
      localStorage.setItem(queueStateKey(typedData.sessionId), JSON.stringify(queue));
    }

    return buildSessionFromBackend(typedData, queue);
  }

  async submitAnswer(sessionId: string, sentenceId: string, isCorrect: boolean): Promise<void> {
    const response = await api.fetch(
      'tome-ms-language',
      `/sessions/${sessionId}/answers`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityId: sentenceId, isCorrect }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to submit answer (${response.status})`);
    }
  }

  async completeSession(sessionId: string): Promise<SentenceSessionSummary> {
    const response = await api.fetch(
      'tome-ms-language',
      `/sessions/${sessionId}/completion`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' } }
    );

    if (!response.ok) {
      throw new Error(`Failed to complete session (${response.status})`);
    }

    const data: BackendSummaryResponse = await response.json();

    localStorage.removeItem(queueStateKey(sessionId));

    return {
      totalSentences: data.totalSentences,
      firstAttemptCorrect: data.firstAttemptCorrect,
      accuracy: data.accuracy,
      sentenceResults: data.sentenceResults,
    };
  }
}
