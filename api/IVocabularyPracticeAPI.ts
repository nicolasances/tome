import { VocabPracticeSession, SessionSummary } from '@/model/VocabularyPractice';

export interface IVocabularyPracticeAPI {
  startSession(): Promise<VocabPracticeSession>;
  getActiveSession(): Promise<VocabPracticeSession | null>;
  submitAnswer(sessionId: string, wordId: string, isCorrect: boolean): Promise<void>;
  completeSession(sessionId: string): Promise<SessionSummary>;
}
