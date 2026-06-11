import { PracticeSession } from '../api/TomePracticeSessionAPI';

// ─── Output type ──────────────────────────────────────────────────────────────

export interface ReconstructedSessionState {
    /** Ordered exercise ids still to present in the current pass. */
    queue: string[];
    /** Wrong-answer exercise ids accumulated during the primary pass, waiting for the retry phase. */
    pendingRetry: string[];
    /** True when the primary pass is exhausted and we are inside the retry queue. */
    isRetryPhase: boolean;
    /** Number of correct answers submitted so far (primary + retry passes). */
    masteredCount: number;
    /**
     * 1-based index of the next exercise to present, capped at the total
     * number of primary-pass exercises. Mirrors the live exerciseNumber state.
     */
    exerciseNumber: number;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

/**
 * Reconstructs the client-side presentation state from a resumed PracticeSession.
 *
 * The backend uses a flat `currentPosition` that advances across the combined
 * sequence [primaryPass (exerciseIds), retryQueue]. The client's two-phase model
 * (queue / pendingRetry / isRetryPhase) is derived as follows:
 *
 *   primaryLength = session.exercises.length
 *
 *   if currentPosition < primaryLength        → primary pass still in progress
 *     queue        = exercises[currentPosition..] (remaining primary ids)
 *     pendingRetry = retryQueue (wrong answers collected so far, not yet retried)
 *     isRetryPhase = false
 *
 *   if currentPosition >= primaryLength       → retry phase (or fully done)
 *     retryIndex   = currentPosition - primaryLength
 *     queue        = retryQueue[retryIndex..] (remaining retry items, clamped to [])
 *     pendingRetry = []
 *     isRetryPhase = true
 *
 *   masteredCount  = answers.filter(isCorrect).length   (all correct, including retries)
 *   exerciseNumber = Math.min(answers.length + 1, primaryLength)
 */
export function reconstructSessionState(session: PracticeSession): ReconstructedSessionState {

    const primaryLength = session.exercises.length;
    const primaryIds    = session.exercises.map(e => e.id);

    const masteredCount  = session.answers.filter(a => a.isCorrect).length;
    const exerciseNumber = Math.min(session.answers.length + 1, primaryLength);

    if (session.currentPosition < primaryLength) {
        // Still in the primary pass
        return {
            queue:        primaryIds.slice(session.currentPosition),
            pendingRetry: session.retryQueue,
            isRetryPhase: false,
            masteredCount,
            exerciseNumber,
        };
    }

    // Retry phase (or fully exhausted)
    const retryIndex = session.currentPosition - primaryLength;
    const queue      = retryIndex < session.retryQueue.length
        ? session.retryQueue.slice(retryIndex)
        : [];

    return {
        queue,
        pendingRetry: [],
        isRetryPhase: true,
        masteredCount,
        exerciseNumber,
    };
}
