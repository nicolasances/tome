import { TotoAPI } from "./TotoAPI";

/**
 * Client for Words Practice (tome-ms-language F26 — Words Practice Session,
 * F27 — Word Answer Verification).
 *
 * Paths are relative to the tome-ms-language basepath, which lives in Config.
 */
export class TomeWordsPracticeAPI {

    /**
     * Starts a Words Practice session, or points at the user's open one.
     *
     * Endpoint: POST /users/:userId/wordsPracticeSessions
     * - 201 → the new session.
     * - 409 → a session is already open; its id is in the error body, so `resumed` is true.
     * - 400 emptyPool → no completed module yet; throws a WordsPracticeError with reason 'emptyPool'.
     *
     * @param {string} userId - The authenticated user's id.
     *
     * @returns {Promise<StartWordsPracticeResult>} The id of the session to navigate to.
     */
    async startSession(userId: string): Promise<StartWordsPracticeResult> {

        const response = await new TotoAPI().fetch(
            'tome-ms-language',
            `/users/${userId}/wordsPracticeSessions`,
            { method: 'POST', headers: { 'Content-Type': 'application/json' } }
        );

        if (response.status === 409) {
            const body: { sessionId?: string } = await response.json();
            if (!body.sessionId) throw new WordsPracticeError('Open session reported without a sessionId', 409);
            return { sessionId: body.sessionId, resumed: true };
        }

        if (response.status === 400) {
            const body: { reason?: string } = await response.json().catch(() => ({}));
            throw new WordsPracticeError('Failed to start Words Practice (400)', 400, { reason: body.reason });
        }

        if (!response.ok) throw new WordsPracticeError(`Failed to start Words Practice (${response.status})`, response.status);

        const session: WordsPracticeSession = await response.json();
        return { sessionId: session.id, resumed: false };
    }

    /**
     * Loads a session — used to resume an open session and to render the results.
     * Returns null when the session does not exist or belongs to another user (404).
     *
     * Endpoint: GET /users/:userId/wordsPracticeSessions/:sessionId
     */
    async getSession(userId: string, sessionId: string): Promise<WordsPracticeSession | null> {

        const response = await new TotoAPI().fetch('tome-ms-language', `/users/${userId}/wordsPracticeSessions/${sessionId}`);

        if (response.status === 404) return null;
        if (!response.ok) throw new WordsPracticeError(`Failed to fetch Words Practice session (${response.status})`, response.status);

        return response.json();
    }

    /**
     * Submits the typed answer for one word. Judging happens server-side.
     *
     * Endpoint: POST /users/:userId/wordsPracticeSessions/:sessionId/answers
     */
    async submitAnswer(userId: string, sessionId: string, wordKey: string, userAnswer: string): Promise<SubmitWordAnswerResponse> {

        const response = await new TotoAPI().fetch(
            'tome-ms-language',
            `/users/${userId}/wordsPracticeSessions/${sessionId}/answers`,
            { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ wordKey, userAnswer }) }
        );

        if (!response.ok) throw new WordsPracticeError(`Failed to submit answer (${response.status})`, response.status);

        return response.json();
    }

    /**
     * Asks the AI whether the answer just given (wrong) is valid Danish for the prompt.
     * The answer itself is not sent: the backend reads it from the stored attempt.
     *
     * Endpoint: POST /users/:userId/wordsPracticeSessions/:sessionId/answers/verify
     * - 409 if that answer was already checked; 400 if it is not the most recent answer.
     */
    async verifyAnswer(userId: string, sessionId: string, input: VerifyWordInput, signal?: AbortSignal): Promise<VerifyWordResponse> {

        const response = await new TotoAPI().fetch(
            'tome-ms-language',
            `/users/${userId}/wordsPracticeSessions/${sessionId}/answers/verify`,
            { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ wordKey: input.wordKey, cefrLevel: input.cefrLevel }), signal }
        );

        if (!response.ok) throw new WordsPracticeError(`Failed to verify answer (${response.status})`, response.status);

        return response.json();
    }

    /**
     * Closes the session once every word was answered correctly.
     * A 400 carries `outstandingWordKeys` when client and server disagree on what is left.
     *
     * Endpoint: POST /users/:userId/wordsPracticeSessions/:sessionId/complete
     */
    async completeSession(userId: string, sessionId: string): Promise<WordsPracticeSession> {

        const response = await new TotoAPI().fetch(
            'tome-ms-language',
            `/users/${userId}/wordsPracticeSessions/${sessionId}/complete`,
            { method: 'POST', headers: { 'Content-Type': 'application/json' } }
        );

        if (response.status === 400) {
            const body: { outstandingWordKeys?: string[] } = await response.json().catch(() => ({}));
            throw new WordsPracticeError('Session still has outstanding words (400)', 400, { outstandingWordKeys: body.outstandingWordKeys });
        }

        if (!response.ok) throw new WordsPracticeError(`Failed to complete session (${response.status})`, response.status);

        return response.json();
    }

    /**
     * Pool size and open-session id of the authenticated user — drives the Home entry point.
     *
     * Endpoint: GET /me/wordsPractice/summary
     */
    async getSummary(): Promise<WordsPracticeSummary> {

        const response = await new TotoAPI().fetch('tome-ms-language', '/me/wordsPractice/summary');

        if (!response.ok) throw new WordsPracticeError(`Failed to fetch Words Practice summary (${response.status})`, response.status);

        return response.json();
    }
}

/** Error thrown by the Words Practice API, carrying the HTTP status and the backend's reason / outstanding words when present. */
export class WordsPracticeError extends Error {

    status: number;                     // HTTP status returned by the backend.
    reason?: string;                    // Backend reason code on a 400 (e.g. 'emptyPool').
    outstandingWordKeys?: string[];     // On complete: the words still not answered correctly.

    constructor(message: string, status: number, extra?: { reason?: string, outstandingWordKeys?: string[] }) {
        super(message);
        this.name = 'WordsPracticeError';
        this.status = status;
        this.reason = extra?.reason;
        this.outstandingWordKeys = extra?.outstandingWordKeys;
    }
}

// ─── Types ──────────────────────────────────────────────────────────────────────

export interface WordsPracticeAttempt {
    userAnswer: string;
    isCorrect: boolean;
    isFirstAttempt: boolean;
    aiChecked: boolean;
    timestamp: string;
}

export interface WordsPracticeWord {
    wordKey: string;                        // Normalized Danish form; the identity of the word in the session.
    english: string;                        // The prompt, possibly with slash variants ("to live / to reside").
    type: string;                           // Word type: noun, verb, connector …
    context: string | null;                 // Disambiguating note, when the word has one.
    danish: string;                         // The canonical answer.
    attempts: WordsPracticeAttempt[];
    firstAttemptCorrect: boolean | null;    // null until the word has been answered.
    correct: boolean;                       // True once answered correctly (or accepted by the AI).
}

export interface WordsPracticeSession {
    id: string;
    status: 'in_progress' | 'completed';
    startedAt: string;
    completedAt: string | null;
    words: WordsPracticeWord[];             // In presentation order.
}

export interface StartWordsPracticeResult {
    sessionId: string;
    resumed: boolean;                       // True when a session was already open and is being resumed.
}

export interface SubmitWordAnswerResponse {
    isCorrect: boolean;
    correctAnswer: string;
    isFirstAttempt: boolean;
}

export interface VerifyWordInput {
    wordKey: string;
    cefrLevel: string;
}

export interface VerifyWordResponse {
    valid: boolean;
    explanation?: string;
}

export interface WordsPracticeSummary {
    poolSize: number;                       // Distinct practice words available; 0 with no completed module.
    openSessionId: string | null;
}
