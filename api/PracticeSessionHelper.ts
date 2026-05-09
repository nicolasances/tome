import { TotoAPI } from './TotoAPI';

const VOCAB_ACTIVE_SESSION_KEY = 'vocab-active-session';
const SENTENCE_ACTIVE_SESSION_KEY = 'sentence-active-session';

export interface ActiveSessionInfo {
  sessionId: string;
  practiceType: string;
}

/**
 * Returns info about any active session (vocabulary or sentences), or null if none exists.
 * In mock mode, checks the appropriate localStorage keys.
 * In real mode, makes a single call to GET /sessions/active.
 */
export async function getAnyActiveSession(): Promise<ActiveSessionInfo | null> {
  const isVocabMock = process.env.NEXT_PUBLIC_VOCAB_PRACTICE_MOCK === 'true';
  const isSentenceMock = process.env.NEXT_PUBLIC_SENTENCE_PRACTICE_MOCK === 'true';

  if (isVocabMock || isSentenceMock) {
    if (isVocabMock) {
      const raw = localStorage.getItem(VOCAB_ACTIVE_SESSION_KEY);
      if (raw) {
        try {
          const data = JSON.parse(raw);
          if (data?.sessionId) return { sessionId: data.sessionId, practiceType: 'vocabulary' };
        } catch { /* ignore */ }
      }
    }
    if (isSentenceMock) {
      const raw = localStorage.getItem(SENTENCE_ACTIVE_SESSION_KEY);
      if (raw) {
        try {
          const data = JSON.parse(raw);
          if (data?.sessionId) return { sessionId: data.sessionId, practiceType: 'sentences' };
        } catch { /* ignore */ }
      }
    }
    return null;
  }

  // Real API: single call
  const api = new TotoAPI();
  const response = await api.fetch('tome-ms-language', '/sessions/active');
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Failed to fetch active session (${response.status})`);

  const data = await response.json();
  return { sessionId: data.sessionId, practiceType: data.practiceType };
}
