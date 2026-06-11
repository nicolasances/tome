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
 * Reconstructs the client-side presentation state from a resumed PracticeSession
 * by replaying the authoritative `answers` log through the exact same state machine
 * the live page uses in `handleContinue`.
 *
 * Why replay instead of using `currentPosition` / `retryQueue`:
 *   The backend (`SubmitPracticeAnswer.do`) writes `appendAnswer`, `addToRetryQueue`,
 *   and `advancePosition` as THREE separate, non-atomic `updateOne` calls. As a result
 *   `currentPosition` (a monotonic answer counter) and `retryQueue` (a grow-only list
 *   that is never compacted when a retry is answered correctly) can be transiently
 *   inconsistent, and neither is a reliable index of "what's left". The `answers` array,
 *   however, is the single append-only source of truth for what the user has done.
 *   Replaying it yields the exact live state and is immune to those two fields.
 *
 * State machine (mirrors handleContinue):
 *   - Primary phase: present `exercises` in order. A wrong answer records the id into
 *     `pendingRetry`; the head is always consumed. When the primary queue empties and
 *     `pendingRetry` is non-empty, switch to the retry phase with `queue = pendingRetry`.
 *   - Retry phase: a correct answer consumes the head; a wrong answer moves the head to
 *     the tail (re-queued for another attempt).
 *
 * Derived counters:
 *   - masteredCount  = answers.filter(isCorrect).length  (all correct, including retries)
 *   - exerciseNumber = min(answers.length + 1, primaryLength)
 *
 * NOTE: A reconstructed empty queue means "no more work was recorded in the log". The
 * caller MUST NOT infer session completion from this — completion is decided only by the
 * live flow (`handleContinue` → `/complete`) or by `session.completedAt` being set.
 */
export function reconstructSessionState(session: PracticeSession): ReconstructedSessionState {

    const primaryLength = session.exercises.length;
    const primaryIds    = session.exercises.map(e => e.id);

    let queue: string[]        = [...primaryIds];
    let pendingRetry: string[] = [];
    let isRetryPhase           = false;

    for (const answer of session.answers) {

        // Defensive: nothing left to apply the answer to.
        if (queue.length === 0) break;

        const headId = queue[0];

        if (!isRetryPhase) {
            // Primary pass
            if (!answer.isCorrect) pendingRetry.push(headId);
            queue = queue.slice(1);

            if (queue.length === 0 && pendingRetry.length > 0) {
                queue = pendingRetry;
                pendingRetry = [];
                isRetryPhase = true;
            }
        } else {
            // Retry pass
            queue = answer.isCorrect
                ? queue.slice(1)
                : [...queue.slice(1), headId];
        }
    }

    const masteredCount  = session.answers.filter(a => a.isCorrect).length;
    const exerciseNumber = Math.min(session.answers.length + 1, primaryLength);

    return {
        queue,
        pendingRetry,
        isRetryPhase,
        masteredCount,
        exerciseNumber,
    };
}
