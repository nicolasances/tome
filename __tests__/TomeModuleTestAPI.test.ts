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
        const r: TestEligibilityResponse = { eligible: true };
        expect(r.eligible).toBe(true);
        expect(r.testUnlocksAt).toBeUndefined();
        expect(r.testRetryAvailableAt).toBeUndefined();
    });

    it('TestEligibilityResponse supports lock and retry timestamps', () => {
        const r: TestEligibilityResponse = {
            eligible: false,
            testUnlocksAt: '2026-06-13T10:00:00Z',
            testRetryAvailableAt: '2026-06-12T12:20:00Z',
        };
        expect(r.eligible).toBe(false);
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
            moduleId: 'mod-1',
            exercises: [],
            answers: [],
            currentPosition: 0,
            startedAt: '2026-06-12T09:00:00Z',
            takenAt: null,
        };
        expect(attempt.currentPosition).toBe(0);
        expect(attempt.takenAt).toBeNull();
    });

    it('SubmitTestAnswerResponse has isCorrect and correctAnswer', () => {
        const r: SubmitTestAnswerResponse = {
            isCorrect: false,
            correctAnswer: 'spiser',
        };
        expect(r.isCorrect).toBe(false);
        expect(r.correctAnswer).toBe('spiser');
    });

    it('SubmitTestResponse has score and passed', () => {
        const r: SubmitTestResponse = { score: 85, passed: true };
        expect(r.passed).toBe(true);
        expect(r.score).toBe(85);
    });

    it('SubmitTestResponse fail case only returns score and passed', () => {
        const r: SubmitTestResponse = { score: 70, passed: false };
        expect(r.passed).toBe(false);
        expect(r.score).toBe(70);
    });

    it('TestReviewItem has prompt, userAnswer, correctAnswer, and isCorrect', () => {
        const item: TestReviewItem = {
            exerciseId: 'ex-1',
            prompt: 'I eat',
            userAnswer: 'Jeg spise',
            correctAnswer: 'Jeg spiser',
            isCorrect: false,
        };
        expect(item.isCorrect).toBe(false);
        expect(item.correctAnswer).toBe('Jeg spiser');
    });

    it('TestReviewResponse wraps a questions array', () => {
        const r: TestReviewResponse = { questions: [] };
        expect(Array.isArray(r.questions)).toBe(true);
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
