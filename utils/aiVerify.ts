import { VerifyAnswerResponse } from '@/api/TomeAnswerVerificationAPI';

/** The fixed line shown in the accepted state when the AI returns no explanation. */
export const DEFAULT_ACCEPTED_NOTE = 'Your translation works too — counting it as correct.';

export interface VerificationOutcome {
    phase: 'valid' | 'invalid';     // Which AIVerifyTray verdict phase to render.
    explanation: string;           // The AI explanation, for both verdicts. Empty when the backend sends none.
}

/**
 * Maps the backend verification verdict to the tray phase and the explanation to show.
 *
 * The explanation is kept for both verdicts: on a rejection it says why, on an
 * acceptance it can point at the exercise's expected phrasing (e.g. the target word).
 *
 * @param {VerifyAnswerResponse} result - The verdict returned by POST /exercises/:exerciseId/verifyAnswer.
 *
 * @returns {VerificationOutcome} The tray phase and the explanation ('' when absent).
 */
export function toVerificationOutcome(result: VerifyAnswerResponse): VerificationOutcome {

    return { phase: result.valid ? 'valid' : 'invalid', explanation: result.explanation ?? '' };
}

/**
 * Returns the note shown in the accepted state of the AIVerifyTray.
 *
 * @param {string} explanation - The AI explanation returned with valid: true ('' when absent).
 *
 * @returns {string} The explanation, or the fixed fallback line when it is empty.
 */
export function acceptedNote(explanation: string): string {

    return explanation.trim() ? explanation : DEFAULT_ACCEPTED_NOTE;
}
