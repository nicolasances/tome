import {
    TomeLevelTestAPI,
    LevelTestEligibilityResponse,
    StartLevelTestResponse,
    LevelTestAttempt,
    LevelTestAnswer,
    SubmitLevelTestAnswerResponse,
    SubmitLevelTestResponse,
    LevelTestReviewItem,
    LevelTestReviewResponse,
} from '../api/TomeLevelTestAPI';
import { Exercise } from '../api/TomePracticeSessionAPI';

// ─── Type-shape tests ─────────────────────────────────────────────────────────
// These tests verify the TypeScript types are exported correctly and have the
// expected shapes. They act as living documentation of the API contract.

describe('TomeLevelTestAPI type shapes', () => {

    it('LevelTestEligibilityResponse has the required fields', () => {
        const r: LevelTestEligibilityResponse = { eligible: true };
        expect(r.eligible).toBe(true);
        expect(r.reason).toBeUndefined();
        expect(r.retryAvailableAt).toBeUndefined();
        expect(r.remainingMs).toBeUndefined();
        expect(r.activeAttemptId).toBeUndefined();
    });

    it('LevelTestEligibilityResponse supports the cooldown shape', () => {
        const r: LevelTestEligibilityResponse = {
            eligible: false,
            reason: 'Cooldown not yet elapsed since the most recent attempt',
            retryAvailableAt: '2026-07-17T10:00:00Z',
            remainingMs: 1800000,
        };
        expect(r.eligible).toBe(false);
        expect(typeof r.retryAvailableAt).toBe('string');
        expect(r.remainingMs).toBe(1800000);
    });

    it('LevelTestEligibilityResponse supports the active-attempt (resume) shape', () => {
        const r: LevelTestEligibilityResponse = { eligible: true, activeAttemptId: 'attempt-1' };
        expect(r.eligible).toBe(true);
        expect(r.activeAttemptId).toBe('attempt-1');
    });

    it('StartLevelTestResponse has attemptId, cefrLevel and exercises list', () => {
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
        const r: StartLevelTestResponse = {
            attemptId: 'attempt-1',
            cefrLevel: 'A1',
            exercises: [exercise],
            startedAt: '2026-07-17T09:00:00Z',
        };
        expect(r.attemptId).toBe('attempt-1');
        expect(r.cefrLevel).toBe('A1');
        expect(r.exercises).toHaveLength(1);
    });

    it('LevelTestAnswer records the answer details', () => {
        const a: LevelTestAnswer = {
            exerciseId: 'ex-1',
            isCorrect: true,
            userAnswer: 'correct',
            answeredAt: '2026-07-17T09:01:00Z',
        };
        expect(a.exerciseId).toBe('ex-1');
        expect(a.isCorrect).toBe(true);
    });

    it('LevelTestAttempt contains exercises and answers for resume', () => {
        const attempt: LevelTestAttempt = {
            attemptId: 'attempt-1',
            cefrLevel: 'A1',
            exercises: [],
            answers: [],
            currentPosition: 0,
            startedAt: '2026-07-17T09:00:00Z',
            takenAt: null,
        };
        expect(attempt.currentPosition).toBe(0);
        expect(attempt.takenAt).toBeNull();
    });

    it('SubmitLevelTestAnswerResponse has isCorrect and correctAnswer', () => {
        const r: SubmitLevelTestAnswerResponse = {
            isCorrect: false,
            correctAnswer: 'spiser',
        };
        expect(r.isCorrect).toBe(false);
        expect(r.correctAnswer).toBe('spiser');
    });

    it('SubmitLevelTestResponse has score, passed and advancedTo on a pass', () => {
        const r: SubmitLevelTestResponse = { score: 88, passed: true, advancedTo: 'A2' };
        expect(r.passed).toBe(true);
        expect(r.score).toBe(88);
        expect(r.advancedTo).toBe('A2');
    });

    it('SubmitLevelTestResponse has a null advancedTo on a fail', () => {
        const r: SubmitLevelTestResponse = { score: 60, passed: false, advancedTo: null };
        expect(r.passed).toBe(false);
        expect(r.advancedTo).toBeNull();
    });

    it('LevelTestReviewItem has prompt, userAnswer, correctAnswer, and isCorrect', () => {
        const item: LevelTestReviewItem = {
            exerciseId: 'ex-1',
            prompt: 'I eat',
            userAnswer: 'Jeg spise',
            correctAnswer: 'Jeg spiser',
            isCorrect: false,
        };
        expect(item.isCorrect).toBe(false);
        expect(item.correctAnswer).toBe('Jeg spiser');
    });

    it('LevelTestReviewResponse wraps score, passed, a questions array and weakAreas', () => {
        const r: LevelTestReviewResponse = {
            score: 88,
            passed: true,
            questions: [],
            weakAreas: { vocabulary: ['vocab-1'], grammar: [] },
        };
        expect(Array.isArray(r.questions)).toBe(true);
        expect(r.weakAreas.vocabulary).toEqual(['vocab-1']);
        expect(r.weakAreas.grammar).toEqual([]);
    });
});

describe('TomeLevelTestAPI class', () => {
    it('can be instantiated', () => {
        const api = new TomeLevelTestAPI();
        expect(api).toBeInstanceOf(TomeLevelTestAPI);
    });

    it('exposes all six required methods', () => {
        const api = new TomeLevelTestAPI();
        expect(typeof api.getLevelTestEligibility).toBe('function');
        expect(typeof api.startLevelTest).toBe('function');
        expect(typeof api.getLevelTest).toBe('function');
        expect(typeof api.submitLevelTestAnswer).toBe('function');
        expect(typeof api.submitLevelTest).toBe('function');
        expect(typeof api.getLevelTestReview).toBe('function');
    });
});
