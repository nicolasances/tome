export interface VocabPracticeWord {
  id: string;
  english: string;
  translation: string;
  failedAttempts: number;
}

export interface VocabPracticeSession {
  sessionId: string;
  words: VocabPracticeWord[];        // full original list
  pendingQueue: string[];            // ordered word IDs not yet correctly answered
  masteredIds: string[];             // word IDs answered correctly
  deferredIds: string[];             // word IDs answered wrong (waiting retry)
  firstAttemptCorrectIds: string[];  // word IDs answered right on first attempt
  totalWords: number;
}

export interface SessionSummary {
  totalWords: number;
  firstAttemptCorrect: number;
  accuracy: number;                  // percentage, rounded to nearest whole
  wordResults: { wordId: string; english: string; translation: string; failedAttempts: number }[];
}
