import { TotoAPI } from "./TotoAPI";

export class TomePracticeSessionAPI {

    /**
     * Starts a new practice session for the given user and module.
     * On 409 (session already active), the backend returns the existing sessionId;
     * this method resumes that session via getSession and returns it transparently.
     * Returns null only on unrecoverable errors.
     *
     * Endpoint: POST /users/:userId/modules/:moduleId/practiceSessions
     */
    async startPracticeSession(userId: string, moduleId: string): Promise<StartPracticeSessionResponse | null> {
        const response = await new TotoAPI().fetch(
            'tome-ms-language',
            `/users/${userId}/modules/${moduleId}/practiceSessions`,
            { method: 'POST', headers: { 'Content-Type': 'application/json' } }
        );

        if (response.status === 409) {
            const body: { sessionId?: string } = await response.json();
            if (body.sessionId) {
                const session = await this.getSession(userId, body.sessionId);
                if (!session) return null;
                return { sessionId: session.sessionId, moduleId: session.moduleId, exerciseIds: session.exerciseIds, startedAt: session.startedAt };
            }
            return null;
        }
        if (!response.ok) throw new Error(`Failed to start practice session (${response.status})`);

        return response.json();
    }

    /**
     * Fetches a single exercise by ID.
     * Returns null on 404.
     *
     * Endpoint: GET /exercises/:exerciseId
     */
    async getExercise(exerciseId: string): Promise<Exercise | null> {
        const response = await new TotoAPI().fetch(
            'tome-ms-language',
            `/exercises/${exerciseId}`
        );

        if (response.status === 404) return null;
        if (!response.ok) throw new Error(`Failed to fetch exercise (${response.status})`);

        const body: { exercise: Exercise } = await response.json();
        return body.exercise;
    }

    /**
     * Fetches an in-progress session by ID — used to resume after the app closes.
     * Returns null on 404 (session not found or already completed).
     *
     * Endpoint: GET /users/:userId/practiceSessions/:sessionId
     */
    async getSession(userId: string, sessionId: string): Promise<PracticeSession | null> {
        const response = await new TotoAPI().fetch(
            'tome-ms-language',
            `/users/${userId}/practiceSessions/${sessionId}`
        );

        if (response.status === 404) return null;
        if (!response.ok) throw new Error(`Failed to fetch practice session (${response.status})`);

        return response.json();
    }

    /**
     * Submits the user's raw answer for one exercise.
     * The server evaluates correctness (including fuzzy matching where applicable)
     * and returns the verdict plus the canonical answer string for display.
     *
     * Endpoint: POST /users/:userId/practiceSessions/:sessionId/answers
     */
    async submitAnswer(userId: string, sessionId: string, exerciseId: string, userAnswer: string): Promise<SubmitAnswerResponse> {
        const response = await new TotoAPI().fetch(
            'tome-ms-language',
            `/users/${userId}/practiceSessions/${sessionId}/answers`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ exerciseId, userAnswer }),
            }
        );

        if (!response.ok) throw new Error(`Failed to submit answer (${response.status})`);

        return response.json();
    }

    /**
     * Marks the session complete. The server runs SRS mastery updates and
     * vocabulary coverage accumulation atomically, then evaluates the step-2
     * coverage gate.
     *
     * Endpoint: POST /users/:userId/practiceSessions/:sessionId/complete
     */
    async completeSession(userId: string, sessionId: string): Promise<CompleteSessionResponse> {
        const response = await new TotoAPI().fetch(
            'tome-ms-language',
            `/users/${userId}/practiceSessions/${sessionId}/complete`,
            { method: 'POST', headers: { 'Content-Type': 'application/json' } }
        );

        if (!response.ok) throw new Error(`Failed to complete session (${response.status})`);

        return response.json();
    }
}

// ─── Exercise ─────────────────────────────────────────────────────────────────

export type ExerciseType =
    | 'multiple_choice'
    | 'sentence_reorder'
    | 'fill_blank'
    | 'conjugation_drill'
    | 'error_correction'
    | 'translation_active';

export interface Exercise {
    id: string;
    moduleId: string;
    type: ExerciseType;
    /** The question / sentence shown to the user (Danish for most types; English for translation_active) */
    prompt: string;
    /** English translation of the Danish prompt; null for translation_active, sentence_reorder, conjugation_drill */
    promptTranslation: string | null;
    /** Canonical correct answer — shown in ResultSheet feedback */
    answer: string;
    alternativeAnswers: string[];
    /** Shuffled Danish word tokens (sentence_reorder only); null for all other types */
    words: string[] | null;
    /** Wrong-option strings (multiple_choice only) */
    distractors: string[];
    vocabularyItemId: string | null;
    grammarConceptId: string | null;
}

// ─── API response types ────────────────────────────────────────────────────────

export interface StartPracticeSessionResponse {
    sessionId: string;
    moduleId: string;
    /** Ordered exercise IDs for this session — fetch each via GET /exercises/:id */
    exerciseIds: string[];
    startedAt: string;
}

export interface PracticeSession {
    sessionId: string;
    moduleId: string;
    /** Ordered exercise IDs — fetch each via GET /exercises/:id */
    exerciseIds: string[];
    startedAt: string;
}

export interface SubmitAnswerResponse {
    isCorrect: boolean;
    /** Canonical correct answer — used to populate ResultSheet and AnswerBox */
    correctAnswer: string;
}

export interface CompleteSessionResponse {
    /** True when every vocabulary item in the module has been seen at least once */
    step2Complete: boolean;
    unseenVocabularyCount?: number;
}
