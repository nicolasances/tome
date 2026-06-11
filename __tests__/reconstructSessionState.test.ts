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
 * Builds a minimal PracticeSession for use in tests.
 * exercises defaults to e1–e5 (5 primary-pass exercises).
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

describe('reconstructSessionState', () => {

    // ── Fresh session (no answers, position 0) ────────────────────────────────

    it('fresh session: queue is the full primary exercise list', () => {
        const session = makeSession();
        const state = reconstructSessionState(session);

        expect(state.queue).toEqual(['e1', 'e2', 'e3', 'e4', 'e5']);
    });

    it('fresh session: pendingRetry is empty', () => {
        const session = makeSession();
        const state = reconstructSessionState(session);

        expect(state.pendingRetry).toEqual([]);
    });

    it('fresh session: isRetryPhase is false', () => {
        const session = makeSession();
        const state = reconstructSessionState(session);

        expect(state.isRetryPhase).toBe(false);
    });

    it('fresh session: masteredCount is 0', () => {
        const session = makeSession();
        const state = reconstructSessionState(session);

        expect(state.masteredCount).toBe(0);
    });

    it('fresh session: exerciseNumber is 1', () => {
        const session = makeSession();
        const state = reconstructSessionState(session);

        expect(state.exerciseNumber).toBe(1);
    });

    // ── Mid-primary pass (2 answered correctly, 1 wrong) ─────────────────────
    // Session: e1✓ e2✗ e3(current), retryQueue=[e2], currentPosition=2

    it('mid-primary pass: queue contains remaining primary exercises', () => {
        const session = makeSession({
            answers:         [makeAnswer('e1', true), makeAnswer('e2', false)],
            currentPosition: 2,
            retryQueue:      ['e2'],
        });
        const state = reconstructSessionState(session);

        expect(state.queue).toEqual(['e3', 'e4', 'e5']);
    });

    it('mid-primary pass: pendingRetry holds exercises answered wrong so far', () => {
        const session = makeSession({
            answers:         [makeAnswer('e1', true), makeAnswer('e2', false)],
            currentPosition: 2,
            retryQueue:      ['e2'],
        });
        const state = reconstructSessionState(session);

        expect(state.pendingRetry).toEqual(['e2']);
    });

    it('mid-primary pass: isRetryPhase is false', () => {
        const session = makeSession({
            answers:         [makeAnswer('e1', true), makeAnswer('e2', false)],
            currentPosition: 2,
            retryQueue:      ['e2'],
        });
        const state = reconstructSessionState(session);

        expect(state.isRetryPhase).toBe(false);
    });

    it('mid-primary pass: masteredCount equals number of correct answers', () => {
        const session = makeSession({
            answers:         [makeAnswer('e1', true), makeAnswer('e2', false)],
            currentPosition: 2,
            retryQueue:      ['e2'],
        });
        const state = reconstructSessionState(session);

        expect(state.masteredCount).toBe(1);
    });

    it('mid-primary pass: exerciseNumber is answers.length + 1', () => {
        const session = makeSession({
            answers:         [makeAnswer('e1', true), makeAnswer('e2', false)],
            currentPosition: 2,
            retryQueue:      ['e2'],
        });
        const state = reconstructSessionState(session);

        expect(state.exerciseNumber).toBe(3);
    });

    // ── Primary pass finished, retry queue pending ────────────────────────────
    // Session: e1✓ e2✗ e3✓ e4✗ e5✓, retryQueue=[e2,e4], currentPosition=5 (=exerciseIds.length)

    it('primary done with retries: queue equals retryQueue', () => {
        const session = makeSession({
            answers: [
                makeAnswer('e1', true),
                makeAnswer('e2', false),
                makeAnswer('e3', true),
                makeAnswer('e4', false),
                makeAnswer('e5', true),
            ],
            currentPosition: 5,
            retryQueue:      ['e2', 'e4'],
        });
        const state = reconstructSessionState(session);

        expect(state.queue).toEqual(['e2', 'e4']);
    });

    it('primary done with retries: pendingRetry is empty (now in retry phase)', () => {
        const session = makeSession({
            answers: [
                makeAnswer('e1', true),
                makeAnswer('e2', false),
                makeAnswer('e3', true),
                makeAnswer('e4', false),
                makeAnswer('e5', true),
            ],
            currentPosition: 5,
            retryQueue:      ['e2', 'e4'],
        });
        const state = reconstructSessionState(session);

        expect(state.pendingRetry).toEqual([]);
    });

    it('primary done with retries: isRetryPhase is true', () => {
        const session = makeSession({
            answers: [
                makeAnswer('e1', true),
                makeAnswer('e2', false),
                makeAnswer('e3', true),
                makeAnswer('e4', false),
                makeAnswer('e5', true),
            ],
            currentPosition: 5,
            retryQueue:      ['e2', 'e4'],
        });
        const state = reconstructSessionState(session);

        expect(state.isRetryPhase).toBe(true);
    });

    it('primary done with retries: masteredCount counts all correct answers including retry pass', () => {
        const session = makeSession({
            answers: [
                makeAnswer('e1', true),
                makeAnswer('e2', false),
                makeAnswer('e3', true),
                makeAnswer('e4', false),
                makeAnswer('e5', true),
            ],
            currentPosition: 5,
            retryQueue:      ['e2', 'e4'],
        });
        const state = reconstructSessionState(session);

        expect(state.masteredCount).toBe(3);
    });

    it('primary done with retries: exerciseNumber is capped at totalExercises', () => {
        const session = makeSession({
            answers: [
                makeAnswer('e1', true),
                makeAnswer('e2', false),
                makeAnswer('e3', true),
                makeAnswer('e4', false),
                makeAnswer('e5', true),
            ],
            currentPosition: 5,
            retryQueue:      ['e2', 'e4'],
        });
        const state = reconstructSessionState(session);

        // 5 answers + 1 = 6, but capped at totalExercises (5)
        expect(state.exerciseNumber).toBe(5);
    });

    // ── Mid-retry pass ────────────────────────────────────────────────────────
    // Session: primary all done (e1✓ e2✗ e3✓ e4✗ e5✓), retry: e2✓ already done,
    // currentPosition = 5 (primary) + 1 (one retry answered) = 6, retryQueue=[e2,e4]

    it('mid-retry pass: queue is the remaining slice of retryQueue', () => {
        const session = makeSession({
            answers: [
                makeAnswer('e1', true),
                makeAnswer('e2', false),
                makeAnswer('e3', true),
                makeAnswer('e4', false),
                makeAnswer('e5', true),
                makeAnswer('e2', true), // retry answer for e2
            ],
            currentPosition: 6,
            retryQueue:      ['e2', 'e4'],
        });
        const state = reconstructSessionState(session);

        expect(state.queue).toEqual(['e4']);
    });

    it('mid-retry pass: pendingRetry is empty', () => {
        const session = makeSession({
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
        });
        const state = reconstructSessionState(session);

        expect(state.pendingRetry).toEqual([]);
    });

    it('mid-retry pass: isRetryPhase is true', () => {
        const session = makeSession({
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
        });
        const state = reconstructSessionState(session);

        expect(state.isRetryPhase).toBe(true);
    });

    it('mid-retry pass: masteredCount includes correct retry answers', () => {
        const session = makeSession({
            answers: [
                makeAnswer('e1', true),
                makeAnswer('e2', false),
                makeAnswer('e3', true),
                makeAnswer('e4', false),
                makeAnswer('e5', true),
                makeAnswer('e2', true), // correct retry
            ],
            currentPosition: 6,
            retryQueue:      ['e2', 'e4'],
        });
        const state = reconstructSessionState(session);

        // 3 correct (e1,e3,e5) + 1 correct retry (e2) = 4
        expect(state.masteredCount).toBe(4);
    });

    // ── All correct, no retries (session should complete) ─────────────────────
    // currentPosition = exerciseIds.length, retryQueue = []

    it('all-correct primary pass: queue is empty', () => {
        const session = makeSession({
            answers: [
                makeAnswer('e1', true),
                makeAnswer('e2', true),
                makeAnswer('e3', true),
                makeAnswer('e4', true),
                makeAnswer('e5', true),
            ],
            currentPosition: 5,
            retryQueue:      [],
        });
        const state = reconstructSessionState(session);

        expect(state.queue).toEqual([]);
    });

    it('all-correct primary pass: isRetryPhase is true (primary done, entered retry phase with empty queue)', () => {
        const session = makeSession({
            answers: [
                makeAnswer('e1', true),
                makeAnswer('e2', true),
                makeAnswer('e3', true),
                makeAnswer('e4', true),
                makeAnswer('e5', true),
            ],
            currentPosition: 5,
            retryQueue:      [],
        });
        const state = reconstructSessionState(session);

        // currentPosition >= exercises.length means we're past the primary pass
        expect(state.isRetryPhase).toBe(true);
    });

    it('all-correct primary pass: masteredCount is 5', () => {
        const session = makeSession({
            answers: [
                makeAnswer('e1', true),
                makeAnswer('e2', true),
                makeAnswer('e3', true),
                makeAnswer('e4', true),
                makeAnswer('e5', true),
            ],
            currentPosition: 5,
            retryQueue:      [],
        });
        const state = reconstructSessionState(session);

        expect(state.masteredCount).toBe(5);
    });

    // ── Completed session ─────────────────────────────────────────────────────

    it('completed session: queue is empty', () => {
        const session = makeSession({
            answers: [
                makeAnswer('e1', true),
                makeAnswer('e2', true),
                makeAnswer('e3', true),
                makeAnswer('e4', true),
                makeAnswer('e5', true),
            ],
            currentPosition: 5,
            retryQueue:      [],
            completedAt:     '2026-06-11T01:00:00Z',
        });
        const state = reconstructSessionState(session);

        expect(state.queue).toEqual([]);
    });

    // ── Out-of-range / defensive clamping ─────────────────────────────────────

    it('currentPosition beyond retryQueue length: queue is empty', () => {
        const session = makeSession({
            answers: [
                makeAnswer('e1', true),
                makeAnswer('e2', false),
                makeAnswer('e3', true),
                makeAnswer('e4', false),
                makeAnswer('e5', true),
                makeAnswer('e2', true),
                makeAnswer('e4', true),
            ],
            currentPosition: 99, // way beyond
            retryQueue:      ['e2', 'e4'],
        });
        const state = reconstructSessionState(session);

        expect(state.queue).toEqual([]);
    });
});
