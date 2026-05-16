export interface SentencePracticeSentence {
  id: string;
  sentence: string;
  translation: string;
  failedAttempts: number;
  alternativeTranslations: Array<{ id: string; translation: string }>;
}

export interface SentencePracticeSession {
  sessionId: string;
  sentences: SentencePracticeSentence[];  // full original list
  pendingQueue: string[];                 // ordered sentence IDs not yet correctly answered
  masteredIds: string[];                  // sentence IDs answered correctly
  deferredIds: string[];                  // sentence IDs answered wrong (waiting retry)
  firstAttemptCorrectIds: string[];       // sentence IDs answered right on first attempt
  totalSentences: number;
}

export interface SentenceSessionSummary {
  totalSentences: number;
  firstAttemptCorrect: number;
  accuracy: number;
  sentenceResults: { sentenceId: string; sentence: string; translation: string; failedAttempts: number }[];
}
