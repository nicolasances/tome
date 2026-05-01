import { IVocabularyPracticeAPI } from './IVocabularyPracticeAPI';
import { VocabPracticeSession, SessionSummary } from '@/model/VocabularyPractice';

export class TomeVocabularyPracticeAPI implements IVocabularyPracticeAPI {

  async startSession(): Promise<VocabPracticeSession> {
    throw new Error('Not implemented — backend API contract pending');
  }

  async getActiveSession(): Promise<VocabPracticeSession | null> {
    throw new Error('Not implemented — backend API contract pending');
  }

  async submitAnswer(_sessionId: string, _wordId: string, _isCorrect: boolean): Promise<void> {
    throw new Error('Not implemented — backend API contract pending');
  }

  async completeSession(_sessionId: string): Promise<SessionSummary> {
    throw new Error('Not implemented — backend API contract pending');
  }
}
