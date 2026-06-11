import { reconstructSessionState } from '../utils/reconstructSessionState';
import { PracticeSession, Exercise, PracticeAnswer } from '../api/TomePracticeSessionAPI';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeExercise(id: string): Exercise {
    return {
        id,
        moduleId: 'mod-1',
        type: 'multiple_choice',
        prompt: `Prompt for ${id}`,
        promptTranslation: null,
        answer: 'answer',
        alternativeAnswers: [],
        words: null,
        distractors: [],
        vocabularyItemId: null,
        grammarConceptId: null,
    };
}

function makeAnswer(exerciseId: string, isCorrect: boolean): PracticeAnswer {
    return { exerciseId, isCorrect, userAnswer: 'x', answeredAt: '2026-06-11T00:00:00Z' };
}

/**
 * Builds a minimal PracticeSession. exercises defaults to e1–e5 (5 primary-pass exercises).
 *
 * Note on backend fields: `currentPosition` is a monotonic answer counter and
 * `retryQueue` is grow-only (duplicates, never compacted). The reconstruction
 * replays `answers` and must NOT rely on those two fields, so the tests set them
 * to backend-realistic values to prove they are not used for the queue.
 */
function makeSession(overrides: Partial<PracticeSession> = {}): PracticeSession {
    const exercises = overrides.exercises ?? [
        makeExercise('e1'),
        makeExercise('e2'),
        makeExercise('e3'),
        makeExercise('e4'),
        makeExercise('e5'),
    ];
    return {
        sessionId:       'sess-1',
        userId:          'user-1',
        moduleId:        'mod-1',
        exercises,
        answers:         [],
        currentPosition: 0,
        retryQueue:      [],
        startedAt:       '2026-06-11T00:00:00Z',
        completedAt:     null,
        ...overrides,
    };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('reconstructSessionState (answer-log replay)', () => {

    // ── Fresh session (no answers) ────────────────────────────────────────────

    it('fresh session: queue is the full primary exercise list', () => {
        const state = reconstructSessionState(makeSession());
        expect(state.queue).toEqual(['e1', 'e2', 'e3', 'e4', 'e5']);
    });

    it('fresh session: pendingRetry is empty', () => {
        const state = reconstructSessionState(makeSession());
        expect(state.pendingRetry).toEqual([]);
    });

    it('fresh session: isRetryPhase is false', () => {
        const state = reconstructSessionState(makeSession());
        expect(state.isRetryPhase).toBe(false);
    });

    it('fresh session: masteredCount is 0', () => {
        const state = reconstructSessionState(makeSession());
        expect(state.masteredCount).toBe(0);
    });

    it('fresh session: exerciseNumber is 1', () => {
        const state = reconstructSessionState(makeSession());
        expect(state.exerciseNumber).toBe(1);
    });

    // ── Mid-primary pass: e1✓ e2✗, currently on e3 ───────────────────────────

    it('mid-primary pass: queue contains remaining primary exercises', () => {
        const state = reconstructSessionState(makeSession({
            answers:         [makeAnswer('e1', true), makeAnswer('e2', false)],
            currentPosition: 2,
            retryQueue:      ['e2'],
        }));
        expect(state.queue).toEqual(['e3', 'e4', 'e5']);
    });

    it('mid-primary pass: pendingRetry holds exercises answered wrong so far', () => {
        const state = reconstructSessionState(makeSession({
            answers:         [makeAnswer('e1', true), makeAnswer('e2', false)],
            currentPosition: 2,
            retryQueue:      ['e2'],
        }));
        expect(state.pendingRetry).toEqual(['e2']);
    });

    it('mid-primary pass: isRetryPhase is false', () => {
        const state = reconstructSessionState(makeSession({
            answers:         [makeAnswer('e1', true), makeAnswer('e2', false)],
            currentPosition: 2,
            retryQueue:      ['e2'],
        }));
        expect(state.isRetryPhase).toBe(false);
    });

    it('mid-primary pass: masteredCount equals number of correct answers', () => {
        const state = reconstructSessionState(makeSession({
            answers:         [makeAnswer('e1', true), makeAnswer('e2', false)],
            currentPosition: 2,
            retryQueue:      ['e2'],
        }));
        expect(state.masteredCount).toBe(1);
    });

    it('mid-primary pass: exerciseNumber is answers.length + 1', () => {
        const state = reconstructSessionState(makeSession({
            answers:         [makeAnswer('e1', true), makeAnswer('e2', false)],
            currentPosition: 2,
            retryQueue:      ['e2'],
        }));
        expect(state.exerciseNumber).toBe(3);
    });

    // ── Primary pass finished, two wrong → enters retry phase ─────────────────
    // e1✓ e2✗ e3✓ e4✗ e5✓  → retry queue [e2, e4], user has not answered any retry yet

    it('primary done with retries: queue is the retry items in order', () => {
        const state = reconstructSessionState(makeSession({
            answers: [
                makeAnswer('e1', true),
                makeAnswer('e2', false),
                makeAnswer('e3', true),
                makeAnswer('e4', false),
                makeAnswer('e5', true),
            ],
            currentPosition: 5,
            retryQueue:      ['e2', 'e4'],
        }));
        expect(state.queue).toEqual(['e2', 'e4']);
    });

    it('primary done with retries: pendingRetry is empty (now in retry phase)', () => {
        const state = reconstructSessionState(makeSession({
            answers: [
                makeAnswer('e1', true),
                makeAnswer('e2', false),
                makeAnswer('e3', true),
                makeAnswer('e4', false),
                makeAnswer('e5', true),
            ],
            currentPosition: 5,
            retryQueue:      ['e2', 'e4'],
        }));
        expect(state.pendingRetry).toEqual([]);
    });

    it('primary done with retries: isRetryPhase is true', () => {
        const state = reconstructSessionState(makeSession({
            answers: [
                makeAnswer('e1', true),
                makeAnswer('e2', false),
                makeAnswer('e3', true),
                makeAnswer('e4', false),
                makeAnswer('e5', true),
            ],
            currentPosition: 5,
            retryQueue:      ['e2', 'e4'],
        }));
        expect(state.isRetryPhase).toBe(true);
    });

    it('primary done with retries: exerciseNumber is capped at totalExercises', () => {
        const state = reconstructSessionState(makeSession({
            answers: [
                makeAnswer('e1', true),
                makeAnswer('e2', false),
                makeAnswer('e3', true),
                makeAnswer('e4', false),
                makeAnswer('e5', true),
            ],
            currentPosition: 5,
            retryQueue:      ['e2', 'e4'],
        }));
        expect(state.exerciseNumber).toBe(5);
    });

    // ── REGRESSION: single wrong, refresh mid-retry (the reported bug) ────────
    // Primary: e1✓ e2✓ e3✓ e4✓ e5✗  → retry queue [e5].
    // User then answers the retry e5 WRONG AGAIN. Backend: currentPosition=6,
    // retryQueue grows to [e5, e5] (grow-only, duplicate). The queue MUST still
    // contain e5 — it must NOT be empty (which previously triggered destructive completion).

    it('REGRESSION mid-retry wrong-again: queue still contains the unresolved exercise', () => {
        const state = reconstructSessionState(makeSession({
            answers: [
                makeAnswer('e1', true),
                makeAnswer('e2', true),
                makeAnswer('e3', true),
                makeAnswer('e4', true),
                makeAnswer('e5', false), // primary wrong
                makeAnswer('e5', false), // retry wrong again
            ],
            currentPosition: 6,            // monotonic counter
            retryQueue:      ['e5', 'e5'], // grow-only with duplicate
        }));
        expect(state.queue).toEqual(['e5']);
    });

    it('REGRESSION mid-retry wrong-again: queue is never empty while work remains', () => {
        const state = reconstructSessionState(makeSession({
            answers: [
                makeAnswer('e1', true),
                makeAnswer('e2', true),
                makeAnswer('e3', true),
                makeAnswer('e4', true),
                makeAnswer('e5', false),
                makeAnswer('e5', false),
            ],
            currentPosition: 6,
            retryQueue:      ['e5', 'e5'],
        }));
        expect(state.queue.length).toBeGreaterThan(0);
    });

    it('REGRESSION mid-retry wrong-again: isRetryPhase is true', () => {
        const state = reconstructSessionState(makeSession({
            answers: [
                makeAnswer('e1', true),
                makeAnswer('e2', true),
                makeAnswer('e3', true),
                makeAnswer('e4', true),
                makeAnswer('e5', false),
                makeAnswer('e5', false),
            ],
            currentPosition: 6,
            retryQueue:      ['e5', 'e5'],
        }));
        expect(state.isRetryPhase).toBe(true);
    });

    // ── Mid-retry with multiple items, one resolved correctly ─────────────────
    // Primary: e1✓ e2✗ e3✓ e4✗ e5✓ → retry [e2, e4]. Retry: e2✓ (resolved).
    // Backend: currentPosition=6, retryQueue stays [e2, e4] (correct does not remove).
    // Remaining queue must be [e4].

    it('mid-retry one resolved: queue is the remaining unresolved retry item', () => {
        const state = reconstructSessionState(makeSession({
            answers: [
                makeAnswer('e1', true),
                makeAnswer('e2', false),
                makeAnswer('e3', true),
                makeAnswer('e4', false),
                makeAnswer('e5', true),
                makeAnswer('e2', true), // retry e2 correct → resolved
            ],
            currentPosition: 6,
            retryQueue:      ['e2', 'e4'],
        }));
        expect(state.queue).toEqual(['e4']);
    });

    it('mid-retry one resolved: masteredCount counts all correct answers including retries', () => {
        const state = reconstructSessionState(makeSession({
            answers: [
                makeAnswer('e1', true),
                makeAnswer('e2', false),
                makeAnswer('e3', true),
                makeAnswer('e4', false),
                makeAnswer('e5', true),
                makeAnswer('e2', true),
            ],
            currentPosition: 6,
            retryQueue:      ['e2', 'e4'],
        }));
        // correct: e1, e3, e5, e2(retry) = 4
        expect(state.masteredCount).toBe(4);
    });

    // ── Mid-retry: wrong-again re-queues to the tail (order preserved) ────────
    // Primary: e1✓ e2✗ e3✓ e4✗ e5✓ → retry [e2, e4].
    // Retry: e2✗ (wrong again, re-queues e2 behind e4). Remaining queue must be [e4, e2].

    it('mid-retry wrong-again re-queues the item to the tail behind other pending retries', () => {
        const state = reconstructSessionState(makeSession({
            answers: [
                makeAnswer('e1', true),
                makeAnswer('e2', false),
                makeAnswer('e3', true),
                makeAnswer('e4', false),
                makeAnswer('e5', true),
                makeAnswer('e2', false), // retry e2 wrong again
            ],
            currentPosition: 6,
            retryQueue:      ['e2', 'e4', 'e2'], // grow-only
        }));
        expect(state.queue).toEqual(['e4', 'e2']);
    });

    // ── All correct primary pass, no retries → queue empty, NOT retry phase ───

    it('all-correct primary pass: queue is empty', () => {
        const state = reconstructSessionState(makeSession({
            answers: [
                makeAnswer('e1', true),
                makeAnswer('e2', true),
                makeAnswer('e3', true),
                makeAnswer('e4', true),
                makeAnswer('e5', true),
            ],
            currentPosition: 5,
            retryQueue:      [],
        }));
        expect(state.queue).toEqual([]);
    });

    it('all-correct primary pass: masteredCount is 5', () => {
        const state = reconstructSessionState(makeSession({
            answers: [
                makeAnswer('e1', true),
                makeAnswer('e2', true),
                makeAnswer('e3', true),
                makeAnswer('e4', true),
                makeAnswer('e5', true),
            ],
            currentPosition: 5,
            retryQueue:      [],
        }));
        expect(state.masteredCount).toBe(5);
    });

    // ── Fully resolved retry → queue empty ────────────────────────────────────
    // Primary: e1✓ e2✗ e3✓ e4✓ e5✓ → retry [e2]. Retry: e2✓. All done → queue empty.

    it('fully resolved retry: queue is empty', () => {
        const state = reconstructSessionState(makeSession({
            answers: [
                makeAnswer('e1', true),
                makeAnswer('e2', false),
                makeAnswer('e3', true),
                makeAnswer('e4', true),
                makeAnswer('e5', true),
                makeAnswer('e2', true), // retry resolved
            ],
            currentPosition: 6,
            retryQueue:      ['e2'],
        }));
        expect(state.queue).toEqual([]);
    });

    // ── Independence from currentPosition / retryQueue ────────────────────────
    // The backend writes appendAnswer, addToRetryQueue, and advancePosition as THREE
    // separate non-atomic updateOne calls (SubmitPracticeAnswer.do). currentPosition and
    // retryQueue can therefore be transiently inconsistent. Reconstruction must derive the
    // queue purely from the authoritative `answers` log, ignoring currentPosition/retryQueue.

    it('ignores a stale retryQueue: last primary answer wrong with retryQueue not yet committed', () => {
        // Backend race: advancePosition committed (currentPosition=5) but addToRetryQueue
        // for the wrong e5 not yet persisted (retryQueue=[]). The wrong e5 is still in `answers`.
        const state = reconstructSessionState(makeSession({
            answers: [
                makeAnswer('e1', true),
                makeAnswer('e2', true),
                makeAnswer('e3', true),
                makeAnswer('e4', true),
                makeAnswer('e5', false),
            ],
            currentPosition: 5,
            retryQueue:      [], // stale / not yet written
        }));
        // Must NOT be empty — the wrong e5 must be queued for retry.
        expect(state.queue).toEqual(['e5']);
        expect(state.isRetryPhase).toBe(true);
    });

    it('ignores an inflated currentPosition that overshoots the real progress', () => {
        // currentPosition is wildly ahead of the answer log; queue must follow `answers` only.
        const state = reconstructSessionState(makeSession({
            answers: [
                makeAnswer('e1', true),
                makeAnswer('e2', false),
            ],
            currentPosition: 999, // bogus
            retryQueue:      ['e2', 'e2', 'e2'],
        }));
        // Only e1,e2 answered in primary → still on e3 in the primary pass.
        expect(state.queue).toEqual(['e3', 'e4', 'e5']);
        expect(state.isRetryPhase).toBe(false);
        expect(state.pendingRetry).toEqual(['e2']);
    });

    it('derives the same queue regardless of retryQueue contents (driven only by answers)', () => {
        const answers = [
            makeAnswer('e1', true),
            makeAnswer('e2', false),
            makeAnswer('e3', true),
            makeAnswer('e4', false),
            makeAnswer('e5', true),
        ];
        const withRealQueue = reconstructSessionState(makeSession({
            answers, currentPosition: 5, retryQueue: ['e2', 'e4'],
        }));
        const withGarbageQueue = reconstructSessionState(makeSession({
            answers, currentPosition: 0, retryQueue: ['zzz', 'qqq', 'xxx', 'yyy'],
        }));
        expect(withRealQueue.queue).toEqual(withGarbageQueue.queue);
        expect(withRealQueue.queue).toEqual(['e2', 'e4']);
    });
});
