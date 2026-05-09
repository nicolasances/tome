import { SentencePracticeSession, SentenceSessionSummary } from '@/model/SentencePractice';

export interface ISentencePracticeAPI {
  startSession(language: string): Promise<SentencePracticeSession>;
  getActiveSession(): Promise<SentencePracticeSession | null>;
  submitAnswer(sessionId: string, sentenceId: string, isCorrect: boolean): Promise<void>;
  completeSession(sessionId: string): Promise<SentenceSessionSummary>;
}
