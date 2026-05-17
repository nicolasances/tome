import { ISentencePracticeAPI } from './ISentencePracticeAPI';
import { SentencePracticeSession, SentencePracticeSentence, SentenceSessionSummary } from '@/model/SentencePractice';

const ACTIVE_SESSION_KEY = 'sentence-active-session';

const HARDCODED_SENTENCES: Omit<SentencePracticeSentence, 'failedAttempts'>[] = [
  { id: 's1', sentence: 'Jeg spiser morgenmad hver dag.', translation: 'I eat breakfast every day.', alternativeTranslations: [] },
  { id: 's2', sentence: 'Hun læser en interessant bog.', translation: 'She is reading an interesting book.', alternativeTranslations: [] },
  { id: 's3', sentence: 'Vi går en tur i parken om eftermiddagen.', translation: 'We take a walk in the park in the afternoon.', alternativeTranslations: [] },
  { id: 's4', sentence: 'Han arbejder på et stort projekt.', translation: 'He is working on a big project.', alternativeTranslations: [] },
  { id: 's5', sentence: 'De bor i en lille by ved havet.', translation: 'They live in a small town by the sea.', alternativeTranslations: [] },
  { id: 's6', sentence: 'Jeg kan godt lide at lytte til musik.', translation: 'I like to listen to music.', alternativeTranslations: [] },
  { id: 's7', sentence: 'Børnene leger i haven efter skole.', translation: 'The children play in the garden after school.', alternativeTranslations: [] },
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
  sentenceFailedAttempts: Record<string, number>;
}

interface SessionMetadata {
  sessionId: string;
  sentences: SentencePracticeSentence[];
  totalSentences: number;
}

function queueStateKey(sessionId: string): string {
  return `sentence-queue-${sessionId}`;
}

export class MockSentencePracticeAPI implements ISentencePracticeAPI {

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async startSession(_language: string): Promise<SentencePracticeSession> {
    const sentences: SentencePracticeSentence[] = HARDCODED_SENTENCES.map((s) => ({ ...s, failedAttempts: 0 }));
    const sessionId = generateUUID();

    const metadata: SessionMetadata = { sessionId, sentences, totalSentences: sentences.length };
    localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(metadata));

    const initialQueue: QueueState = {
      sessionId,
      pendingQueue: sentences.map((s) => s.id),
      masteredIds: [],
      deferredIds: [],
      firstAttemptCorrectIds: [],
      sentenceFailedAttempts: Object.fromEntries(sentences.map((s) => [s.id, 0])),
    };
    localStorage.setItem(queueStateKey(sessionId), JSON.stringify(initialQueue));

    return {
      sessionId,
      sentences,
      pendingQueue: initialQueue.pendingQueue,
      masteredIds: [],
      deferredIds: [],
      firstAttemptCorrectIds: [],
      totalSentences: sentences.length,
    };
  }

  async getActiveSession(): Promise<SentencePracticeSession | null> {
    const rawMeta = localStorage.getItem(ACTIVE_SESSION_KEY);
    if (!rawMeta) return null;

    let metadata: SessionMetadata;
    try {
      metadata = JSON.parse(rawMeta);
    } catch {
      return null;
    }

    const { sessionId, sentences, totalSentences } = metadata;

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
        pendingQueue: sentences.map((s) => s.id),
        masteredIds: [],
        deferredIds: [],
        firstAttemptCorrectIds: [],
        sentenceFailedAttempts: Object.fromEntries(sentences.map((s) => [s.id, 0])),
      };
    }

    const restoredSentences = sentences.map((s) => ({
      ...s,
      failedAttempts: queue!.sentenceFailedAttempts[s.id] ?? 0,
    }));

    return {
      sessionId,
      sentences: restoredSentences,
      pendingQueue: queue.pendingQueue,
      masteredIds: queue.masteredIds,
      deferredIds: queue.deferredIds,
      firstAttemptCorrectIds: queue.firstAttemptCorrectIds,
      totalSentences,
    };
  }

  // Queue state is managed by the page component — this is a no-op.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async submitAnswer(_sessionId: string, _sentenceId: string, _isCorrect: boolean): Promise<void> {
    // No-op: the page persists queue state to localStorage after each answer.
  }

  async completeSession(sessionId: string): Promise<SentenceSessionSummary> {
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
    const accuracy = Math.round((firstAttemptCorrect / metadata.totalSentences) * 100);

    const summary: SentenceSessionSummary = {
      totalSentences: metadata.totalSentences,
      firstAttemptCorrect,
      accuracy,
      sentenceResults: metadata.sentences.map((s) => ({
        sentenceId: s.id,
        sentence: s.sentence,
        translation: s.translation,
        failedAttempts: queue.sentenceFailedAttempts[s.id] ?? 0,
      })),
    };

    localStorage.removeItem(ACTIVE_SESSION_KEY);
    localStorage.removeItem(queueStateKey(sessionId));

    return summary;
  }
}
