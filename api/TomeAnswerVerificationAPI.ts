import { TotoAPI } from "./TotoAPI";

/**
 * Client for the AI translation answer-verification capability
 * (tome-ms-language F13 — Translation Answer Verification).
 *
 * Used by the "Check with AI" action on a wrong Translation answer in both
 * Practice (F10) and the Module Test (F11). The backend re-judges the learner's
 * translation against the meaning and, on acceptance, overturns the wrong
 * verdict server-side (mastery, score, retry-queue / attempt isCorrect).
 */
export class TomeAnswerVerificationAPI {

    /**
     * Asks the backend to re-verify a learner's Danish translation with AI.
     *
     * Business rules enforced server-side (mirrored here only by error handling):
     * - One verification per (sessionId, exerciseId); a repeat call returns 409.
     * - Only translation_active exercises can be verified; others return 400.
     *
     * @param {VerifyAnswerInput} input - The exercise, the learner's answer, the
     *        owning session (practice session id or module-test attempt id), the
     *        learner's CEFR level, and an optional abort signal.
     *
     * @returns {Promise<VerifyAnswerResponse>} The verdict and, when not accepted,
     *          the AI explanation.
     */
    async verifyAnswer(input: VerifyAnswerInput): Promise<VerifyAnswerResponse> {

        const response = await new TotoAPI().fetch(
            'tome-ms-language',
            `/exercises/${input.exerciseId}/verifyAnswer`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userAnswer: input.userAnswer, sessionId: input.sessionId, cefrLevel: input.cefrLevel }),
                signal: input.signal,
            }
        );

        if (!response.ok) throw new VerifyAnswerError(`Failed to verify answer (${response.status})`, response.status);

        return response.json();
    }
}

/** Error thrown when answer verification fails, carrying the HTTP status so callers can branch (e.g. 409 already-verified). */
export class VerifyAnswerError extends Error {

    /** The HTTP status returned by the backend (e.g. 409 already verified, 400 non-translation exercise). */
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = 'VerifyAnswerError';
        this.status = status;
    }
}

// ─── Types ──────────────────────────────────────────────────────────────────────

export interface VerifyAnswerInput {
    exerciseId: string;     // The id of the translation exercise being verified.
    userAnswer: string;     // The learner's raw typed translation.
    sessionId: string;      // The practice session id (F10) or module-test attempt id (F11) the exercise belongs to.
    cefrLevel: string;      // The learner's CEFR level, e.g. "A1".
    signal?: AbortSignal;   // Optional abort signal so an in-flight verification can be cancelled.
}

export interface VerifyAnswerResponse {
    valid: boolean;          // True when the AI accepts the translation; the wrong verdict is overturned.
    explanation?: string;    // Present only when valid is false — why the translation is not accepted.
}
