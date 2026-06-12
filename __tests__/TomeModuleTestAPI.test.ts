import {
    TomeModuleTestAPI,
    TestEligibilityResponse,
    StartTestResponse,
    TestAttempt,
    TestAnswer,
    SubmitTestAnswerResponse,
    SubmitTestResponse,
    TestReviewItem,
    TestReviewResponse,
} from '../api/TomeModuleTestAPI';
import { Exercise } from '../api/TomePracticeSessionAPI';

// ─── Type-shape tests ─────────────────────────────────────────────────────────
// These tests verify the TypeScript types are exported correctly and have the
// expected shapes. They act as living documentation of the API contract.

describe('TomeModuleTestAPI type shapes', () => {

    it('TestEligibilityResponse has the required fields', () => {
        const r: TestEligibilityResponse = {
            canStart: true,
            testUnlocksAt: null,
            inProgressAttemptId: null,
            testRetryAvailableAt: null,
        };
        expect(r.canStart).toBe(true);
        expect(r.testUnlocksAt).toBeNull();
        expect(r.inProgressAttemptId).toBeNull();
        expect(r.testRetryAvailableAt).toBeNull();
    });

    it('TestEligibilityResponse supports lock and retry timestamps', () => {
        const r: TestEligibilityResponse = {
            canStart: false,
            testUnlocksAt: '2026-06-13T10:00:00Z',
            inProgressAttemptId: null,
            testRetryAvailableAt: '2026-06-12T12:20:00Z',
        };
        expect(r.canStart).toBe(false);
        expect(typeof r.testUnlocksAt).toBe('string');
        expect(typeof r.testRetryAvailableAt).toBe('string');
    });

    it('StartTestResponse has attemptId and exercises list', () => {
        const exercise: Exercise = {
            id: 'ex-1',
            moduleId: 'mod-1',
            type: 'multiple_choice',
            prompt: 'Test prompt',
            promptTranslation: null,
            answer: 'correct',
            alternativeAnswers: [],
            words: null,
            distractors: ['wrong1', 'wrong2'],
            vocabularyItemId: null,
            grammarConceptId: null,
        };
        const r: StartTestResponse = {
            attemptId: 'attempt-1',
            moduleId: 'mod-1',
            exercises: [exercise],
            startedAt: '2026-06-12T09:00:00Z',
        };
        expect(r.attemptId).toBe('attempt-1');
        expect(r.exercises).toHaveLength(1);
    });

    it('TestAnswer records the answer details', () => {
        const a: TestAnswer = {
            exerciseId: 'ex-1',
            isCorrect: true,
            userAnswer: 'correct',
            answeredAt: '2026-06-12T09:01:00Z',
        };
        expect(a.exerciseId).toBe('ex-1');
        expect(a.isCorrect).toBe(true);
    });

    it('TestAttempt contains exercises and answers for resume', () => {
        const attempt: TestAttempt = {
            attemptId: 'attempt-1',
            userId: 'user-1',
            moduleId: 'mod-1',
            exercises: [],
            answers: [],
            status: 'in_progress',
            startedAt: '2026-06-12T09:00:00Z',
            submittedAt: null,
        };
        expect(attempt.status).toBe('in_progress');
        expect(attempt.submittedAt).toBeNull();
    });

    it('SubmitTestAnswerResponse has isCorrect and correctAnswer', () => {
        const r: SubmitTestAnswerResponse = {
            isCorrect: false,
            correctAnswer: 'spiser',
        };
        expect(r.isCorrect).toBe(false);
        expect(r.correctAnswer).toBe('spiser');
    });

    it('SubmitTestResponse pass case has no retry timestamp', () => {
        const r: SubmitTestResponse = {
            score: 85,
            passed: true,
            correctCount: 17,
            totalCount: 20,
            testRetryAvailableAt: null,
        };
        expect(r.passed).toBe(true);
        expect(r.score).toBe(85);
        expect(r.testRetryAvailableAt).toBeNull();
    });

    it('SubmitTestResponse fail case has a retry timestamp', () => {
        const r: SubmitTestResponse = {
            score: 70,
            passed: false,
            correctCount: 14,
            totalCount: 20,
            testRetryAvailableAt: '2026-06-12T09:20:00Z',
        };
        expect(r.passed).toBe(false);
        expect(typeof r.testRetryAvailableAt).toBe('string');
    });

    it('TestReviewItem has prompt, userAnswer, correctAnswer, and isCorrect', () => {
        const item: TestReviewItem = {
            exerciseId: 'ex-1',
            type: 'translation_active',
            prompt: 'I eat',
            promptTranslation: null,
            userAnswer: 'Jeg spise',
            correctAnswer: 'Jeg spiser',
            isCorrect: false,
        };
        expect(item.isCorrect).toBe(false);
        expect(item.correctAnswer).toBe('Jeg spiser');
    });

    it('TestReviewResponse wraps an items array', () => {
        const r: TestReviewResponse = { items: [] };
        expect(Array.isArray(r.items)).toBe(true);
    });
});

describe('TomeModuleTestAPI class', () => {
    it('can be instantiated', () => {
        const api = new TomeModuleTestAPI();
        expect(api).toBeInstanceOf(TomeModuleTestAPI);
    });

    it('exposes all six required methods', () => {
        const api = new TomeModuleTestAPI();
        expect(typeof api.getTestEligibility).toBe('function');
        expect(typeof api.startTest).toBe('function');
        expect(typeof api.getTestAttempt).toBe('function');
        expect(typeof api.submitAnswer).toBe('function');
        expect(typeof api.submitTest).toBe('function');
        expect(typeof api.getReview).toBe('function');
    });
});
