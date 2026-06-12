import { TotoAPI } from "./TotoAPI";
import { Exercise } from "./TomePracticeSessionAPI";

export class TomeModuleTestAPI {

    /**
     * Checks whether the user may start (or resume) the module test.
     * Returns the lock expiry time, any in-progress attempt id, and the
     * retry-available time after a failed attempt.
     *
     * Endpoint: GET /users/:userId/modules/:moduleId/testEligibility
     */
    async getTestEligibility(userId: string, moduleId: string): Promise<TestEligibilityResponse> {
        const response = await new TotoAPI().fetch(
            'tome-ms-language',
            `/users/${userId}/modules/${moduleId}/testEligibility`
        );
        if (!response.ok) throw new Error(`Failed to fetch test eligibility (${response.status})`);
        return response.json();
    }

    /**
     * Starts a new scored test attempt.
     * Server runs mastery-aware selection (no coverage override) and returns
     * the attempt id plus the full ordered exercise list.
     *
     * Endpoint: POST /users/:userId/modules/:moduleId/tests
     */
    async startTest(userId: string, moduleId: string): Promise<StartTestResponse | TestAttempt> {
        const response = await new TotoAPI().fetch(
            'tome-ms-language',
            `/users/${userId}/modules/${moduleId}/tests`,
            { method: 'POST', headers: { 'Content-Type': 'application/json' } }
        );
        if (response.status === 409) {
            const { attemptId } = await response.json();
            return this.getTestAttempt(userId, attemptId);
        }
        if (!response.ok) throw new Error(`Failed to start test (${response.status})`);
        return response.json();
    }

    /**
     * Fetches the full state of an in-progress attempt — used to resume after
     * the app is closed or the page is reloaded.
     *
     * Endpoint: GET /users/:userId/moduleTests/:attemptId
     */
    async getTestAttempt(userId: string, attemptId: string): Promise<TestAttempt> {
        const response = await new TotoAPI().fetch(
            'tome-ms-language',
            `/users/${userId}/moduleTests/${attemptId}`
        );
        if (!response.ok) throw new Error(`Failed to fetch test attempt (${response.status})`);
        return response.json();
    }

    /**
     * Submits the user's raw answer for one exercise.
     * Server evaluates correctness and returns the verdict + canonical answer.
     * Does NOT re-queue wrong answers — single-pass only.
     *
     * Endpoint: POST /users/:userId/moduleTests/:attemptId/answers
     */
    async submitAnswer(userId: string, attemptId: string, exerciseId: string, userAnswer: string): Promise<SubmitTestAnswerResponse> {
        const response = await new TotoAPI().fetch(
            'tome-ms-language',
            `/users/${userId}/moduleTests/${attemptId}/answers`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ exerciseId, userAnswer }),
            }
        );
        if (!response.ok) throw new Error(`Failed to submit test answer (${response.status})`);
        return response.json();
    }

    /**
     * Finalises and scores the attempt.
     * Server runs SRS mastery updates, sets module status to `completed` on pass,
     * and records the retry-available time on fail.
     *
     * Endpoint: POST /users/:userId/moduleTests/:attemptId/submit
     */
    async submitTest(userId: string, attemptId: string): Promise<SubmitTestResponse> {
        const response = await new TotoAPI().fetch(
            'tome-ms-language',
            `/users/${userId}/moduleTests/${attemptId}/submit`,
            { method: 'POST', headers: { 'Content-Type': 'application/json' } }
        );
        if (!response.ok) throw new Error(`Failed to submit test (${response.status})`);
        return response.json();
    }

    /**
     * Fetches the per-question review for the Review screen: every question
     * with the user's answer vs. the correct answer.
     *
     * Endpoint: GET /users/:userId/moduleTests/:attemptId/review
     */
    async getReview(userId: string, attemptId: string): Promise<TestReviewResponse> {
        const response = await new TotoAPI().fetch(
            'tome-ms-language',
            `/users/${userId}/moduleTests/${attemptId}/review`
        );
        if (!response.ok) throw new Error(`Failed to fetch test review (${response.status})`);
        return response.json();
    }
}

// ─── Response types ───────────────────────────────────────────────────────────

/**
 * Returned by GET /testEligibility.
 * Drives phase resolution on route entry: locked → ready → in-progress.
 */
export interface TestEligibilityResponse {
    eligible: boolean;
    testUnlocksAt?: string;
    testRetryAvailableAt?: string;
    remainingMs?: number;
}

/** Returned by POST /tests (fresh start). */
export interface StartTestResponse {
    attemptId: string;
    moduleId: string;
    /** Complete ordered exercise list for this attempt. */
    exercises: Exercise[];
    startedAt: string;
}

/** One submitted answer record as returned inside TestAttempt. */
export interface TestAnswer {
    exerciseId: string;
    isCorrect: boolean;
    userAnswer: string;
    answeredAt: string;
}

/**
 * Full attempt state returned by GET /moduleTests/:attemptId.
 * Used to reconstruct phase/position on resume.
 */
export interface TestAttempt {
    attemptId: string;
    moduleId: string;
    exercises: Exercise[];
    answers: TestAnswer[];
    currentPosition: number;
    startedAt: string;
    takenAt: string | null;
}

/** Returned by POST /answers for immediate per-question feedback. */
export interface SubmitTestAnswerResponse {
    isCorrect: boolean;
    /** Canonical correct answer — used to populate ResultSheet and AnswerBox. */
    correctAnswer: string;
}

/** Returned by POST /submit after scoring. Drives the Result phase. */
export interface SubmitTestResponse {
    /** Score as a percentage 0–100. */
    score: number;
    /** True when score ≥ testPassThreshold. */
    passed: boolean;
}

/** One entry in the Review list. */
export interface TestReviewItem {
    exerciseId: string;
    prompt: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
}

/** Returned by GET /review. */
export interface TestReviewResponse {
    questions: TestReviewItem[];
}
