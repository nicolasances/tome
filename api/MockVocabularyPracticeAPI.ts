import { IVocabularyPracticeAPI } from './IVocabularyPracticeAPI';
import { VocabPracticeSession, VocabPracticeWord, SessionSummary } from '@/model/VocabularyPractice';

const STORAGE_KEY = 'vocab-practice-session';

const HARDCODED_WORDS: Omit<VocabPracticeWord, 'failedAttempts'>[] = [
  { id: 'w1',  english: 'dog',      translation: 'hund'     },
  { id: 'w2',  english: 'cat',      translation: 'kat'      },
  { id: 'w3',  english: 'house',    translation: 'hus'      },
  { id: 'w4',  english: 'car',      translation: 'bil'      },
  { id: 'w5',  english: 'water',    translation: 'vand'     },
  { id: 'w6',  english: 'book',     translation: 'bog'      },
  { id: 'w7',  english: 'chair',    translation: 'stol'     },
  { id: 'w8',  english: 'table',    translation: 'bord'     },
  { id: 'w9',  english: 'window',   translation: 'vindue'   },
  { id: 'w10', english: 'door',     translation: 'dør'      },
];

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export class MockVocabularyPracticeAPI implements IVocabularyPracticeAPI {

  async startSession(): Promise<VocabPracticeSession> {
    const words: VocabPracticeWord[] = HARDCODED_WORDS.map((w) => ({ ...w, failedAttempts: 0 }));
    const session: VocabPracticeSession = {
      sessionId: generateUUID(),
      words,
      pendingQueue: words.map((w) => w.id),
      masteredIds: [],
      deferredIds: [],
      firstAttemptCorrectIds: [],
      totalWords: words.length,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    return session;
  }

  async getActiveSession(): Promise<VocabPracticeSession | null> {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      const session: VocabPracticeSession = JSON.parse(raw);
      return session;
    } catch {
      return null;
    }
  }

  async submitAnswer(sessionId: string, wordId: string, isCorrect: boolean): Promise<void> {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const session: VocabPracticeSession = JSON.parse(raw);
    if (session.sessionId !== sessionId) return;

    if (!isCorrect) {
      const word = session.words.find((w) => w.id === wordId);
      if (word) {
        word.failedAttempts += 1;
      }
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }

  async completeSession(sessionId: string): Promise<SessionSummary> {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) throw new Error('No active session found');
    const session: VocabPracticeSession = JSON.parse(raw);
    if (session.sessionId !== sessionId) throw new Error('Session ID mismatch');

    const firstAttemptCorrect = session.firstAttemptCorrectIds.length;
    const accuracy = Math.round((firstAttemptCorrect / session.totalWords) * 100);

    const summary: SessionSummary = {
      totalWords: session.totalWords,
      firstAttemptCorrect,
      accuracy,
      wordResults: session.words.map((w) => ({
        wordId: w.id,
        english: w.english,
        translation: w.translation,
        failedAttempts: w.failedAttempts,
      })),
    };

    localStorage.removeItem(STORAGE_KEY);
    return summary;
  }
}
