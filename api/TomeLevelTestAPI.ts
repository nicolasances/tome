import { TotoAPI } from "./TotoAPI";
import { Exercise } from "./TomePracticeSessionAPI";

export class TomeLevelTestAPI {

    /**
     * Checks whether the user may start (or resume) the Level Test at their
     * current CEFR level. Returns the active attempt id to resume, or a
     * retry-available time if a previous failed attempt is still cooling down.
     *
     * Endpoint: GET /users/:userId/levelTest/eligibility
     */
    async getLevelTestEligibility(userId: string): Promise<LevelTestEligibilityResponse> {
        const response = await new TotoAPI().fetch(
            'tome-ms-language',
            `/users/${userId}/levelTest/eligibility`
        );
        if (!response.ok) throw new Error(`Failed to fetch level test eligibility (${response.status})`);
        return response.json();
    }

    /**
     * Starts a new scored Level Test attempt.
     * Server draws 40 exercises from the level-wide bank using mastery-aware
     * selection and returns the attempt id plus the full ordered exercise list.
     *
     * Endpoint: POST /users/:userId/levelTests
     */
    async startLevelTest(userId: string): Promise<StartLevelTestResponse | LevelTestAttempt> {
        const response = await new TotoAPI().fetch(
            'tome-ms-language',
            `/users/${userId}/levelTests`,
            { method: 'POST', headers: { 'Content-Type': 'application/json' } }
        );
        if (response.status === 409) {
            const { attemptId } = await response.json();
            return this.getLevelTest(userId, attemptId);
        }
        if (!response.ok) throw new Error(`Failed to start level test (${response.status})`);
        return response.json();
    }

    /**
     * Fetches the full state of an in-progress attempt — used to resume after
     * the app is closed or the page is reloaded.
     *
     * Endpoint: GET /users/:userId/levelTests/:attemptId
     */
    async getLevelTest(userId: string, attemptId: string): Promise<LevelTestAttempt> {
        const response = await new TotoAPI().fetch(
            'tome-ms-language',
            `/users/${userId}/levelTests/${attemptId}`
        );
        if (!response.ok) throw new Error(`Failed to fetch level test attempt (${response.status})`);
        return response.json();
    }

    /**
     * Submits the user's raw answer for one exercise.
     * Server evaluates correctness and returns the verdict + canonical answer.
     * Does NOT re-queue wrong answers — single-pass only.
     *
     * Endpoint: POST /users/:userId/levelTests/:attemptId/answers
     */
    async submitLevelTestAnswer(userId: string, attemptId: string, exerciseId: string, userAnswer: string): Promise<SubmitLevelTestAnswerResponse> {
        const response = await new TotoAPI().fetch(
            'tome-ms-language',
            `/users/${userId}/levelTests/${attemptId}/answers`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ exerciseId, userAnswer }),
            }
        );
        if (!response.ok) throw new Error(`Failed to submit level test answer (${response.status})`);
        return response.json();
    }

    /**
     * Finalises and scores the attempt.
     * Server runs SRS mastery updates, records the retry cooldown on fail, and
     * — on a pass — advances the user's CEFR level (`advancedTo`).
     *
     * Endpoint: POST /users/:userId/levelTests/:attemptId/submit
     */
    async submitLevelTest(userId: string, attemptId: string): Promise<SubmitLevelTestResponse> {
        const response = await new TotoAPI().fetch(
            'tome-ms-language',
            `/users/${userId}/levelTests/${attemptId}/submit`,
            { method: 'POST', headers: { 'Content-Type': 'application/json' } }
        );
        if (!response.ok) throw new Error(`Failed to submit level test (${response.status})`);
        return response.json();
    }

    /**
     * Fetches the per-question review for the Review screen: every question
     * with the user's answer vs. the correct answer, plus a weak-areas summary
     * (not yet rendered by the frontend — OQ-3).
     *
     * Endpoint: GET /users/:userId/levelTests/:attemptId/review
     */
    async getLevelTestReview(userId: string, attemptId: string): Promise<LevelTestReviewResponse> {
        const response = await new TotoAPI().fetch(
            'tome-ms-language',
            `/users/${userId}/levelTests/${attemptId}/review`
        );
        if (!response.ok) throw new Error(`Failed to fetch level test review (${response.status})`);
        return response.json();
    }
}

// ─── Response types ───────────────────────────────────────────────────────────

/**
 * Returned by GET /levelTest/eligibility.
 * Drives phase resolution on route entry: redirect-to-Home → ready → resume.
 */
export interface LevelTestEligibilityResponse {
    eligible: boolean;
    reason?: string;
    retryAvailableAt?: string;
    remainingMs?: number;
    activeAttemptId?: string;
}

/** Returned by POST /levelTests (fresh start). */
export interface StartLevelTestResponse {
    attemptId: string;
    cefrLevel: string;
    /** Complete ordered exercise list for this attempt (40 questions). */
    exercises: Exercise[];
    startedAt: string;
}

/** One submitted answer record as returned inside LevelTestAttempt. */
export interface LevelTestAnswer {
    exerciseId: string;
    isCorrect: boolean;
    userAnswer: string;
    answeredAt: string;
}

/**
 * Full attempt state returned by GET /levelTests/:attemptId.
 * Used to reconstruct phase/position on resume.
 */
export interface LevelTestAttempt {
    attemptId: string;
    cefrLevel: string;
    exercises: Exercise[];
    answers: LevelTestAnswer[];
    currentPosition: number;
    startedAt: string;
    takenAt: string | null;
}

/** Returned by POST /answers for immediate per-question feedback. */
export interface SubmitLevelTestAnswerResponse {
    isCorrect: boolean;
    /** Canonical correct answer — used to populate ResultSheet and AnswerBox. */
    correctAnswer: string;
}

/** Returned by POST /submit after scoring. Drives the Result phase. */
export interface SubmitLevelTestResponse {
    /** Score as a percentage 0–100. */
    score: number;
    /** True when score ≥ the backend's LEVEL_TEST_PASS_THRESHOLD (75%). */
    passed: boolean;
    /** The CEFR level the user was promoted to on a pass; null on fail or if already at C2. */
    advancedTo: string | null;
}

/** One entry in the Review list. */
export interface LevelTestReviewItem {
    exerciseId: string;
    prompt: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
}

/** Vocabulary/grammar the user underperformed on. Not yet rendered — OQ-3 (skipped). */
export interface LevelTestWeakAreas {
    vocabulary: string[];
    grammar: string[];
}

/** Returned by GET /review. */
export interface LevelTestReviewResponse {
    score: number;
    passed: boolean;
    questions: LevelTestReviewItem[];
    weakAreas: LevelTestWeakAreas;
}
