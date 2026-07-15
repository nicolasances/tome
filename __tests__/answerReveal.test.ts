import { normalizeAnswer, shouldRevealAnswer } from '../utils/answerReveal';

// ─── normalizeAnswer ────────────────────────────────────────────────────────

describe('normalizeAnswer', () => {

    it('lowercases the input', () => {
        expect(normalizeAnswer('Jeg Spiser')).toBe('jeg spiser');
    });

    it('trims leading and trailing whitespace', () => {
        expect(normalizeAnswer('  jeg spiser  ')).toBe('jeg spiser');
    });

    it('strips punctuation characters', () => {
        expect(normalizeAnswer('Jeg spiser, ikke også?')).toBe('jeg spiser ikke også');
    });

    it('treats a punctuated, differently-cased, padded answer as equal to its plain form', () => {
        expect(normalizeAnswer('Jeg spiser.')).toBe(normalizeAnswer('jeg spiser'));
    });
});

// ─── shouldRevealAnswer ─────────────────────────────────────────────────────

describe('shouldRevealAnswer', () => {

    it('never reveals for multiple_choice, even on a wrong answer', () => {
        const result = shouldRevealAnswer({
            exerciseType: 'multiple_choice',
            ok: false,
            correctAnswer: 'spiser',
            userAnswer: 'drikker',
        });

        expect(result).toBe(false);
    });

    it('never reveals for multiple_choice, even when the user answer differs from the correct answer', () => {
        const result = shouldRevealAnswer({
            exerciseType: 'multiple_choice',
            ok: true,
            correctAnswer: 'spiser',
            userAnswer: 'drikker',
        });

        expect(result).toBe(false);
    });

    it.each([
        'translation_active',
        'error_correction',
        'fill_blank',
        'conjugation_drill',
        'sentence_reorder',
    ])('reveals the correct answer on a wrong submission for %s', (exerciseType) => {
        const result = shouldRevealAnswer({
            exerciseType,
            ok: false,
            correctAnswer: 'Jeg spiser et æble.',
            userAnswer: 'Jeg drikker en øl.',
        });

        expect(result).toBe(true);
    });

    it('does not reveal when a wrong submission has no correctAnswer to show', () => {
        const result = shouldRevealAnswer({
            exerciseType: 'translation_active',
            ok: false,
            correctAnswer: undefined,
            userAnswer: 'Jeg drikker en øl.',
        });

        expect(result).toBe(false);
    });

    it('does not reveal a translation_active exact match', () => {
        const result = shouldRevealAnswer({
            exerciseType: 'translation_active',
            ok: true,
            correctAnswer: 'Jeg spiser et æble.',
            userAnswer: 'Jeg spiser et æble.',
        });

        expect(result).toBe(false);
    });

    it('reveals a translation_active fuzzy match (accepted despite a typo)', () => {
        const result = shouldRevealAnswer({
            exerciseType: 'translation_active',
            ok: true,
            correctAnswer: 'Jeg spiser et æble.',
            userAnswer: 'Jeg spiser et able.',
        });

        expect(result).toBe(true);
    });

    it('does not reveal a translation_active correct match that only differs by case, punctuation or padding', () => {
        const result = shouldRevealAnswer({
            exerciseType: 'translation_active',
            ok: true,
            correctAnswer: 'Jeg spiser et æble.',
            userAnswer: '  jeg spiser et æble  ',
        });

        expect(result).toBe(false);
    });

    it.each([
        'error_correction',
        'fill_blank',
        'conjugation_drill',
        'sentence_reorder',
    ])('never reveals a correct-but-different %s answer (fuzzy reveal is scoped to translation_active only)', (exerciseType) => {
        const result = shouldRevealAnswer({
            exerciseType,
            ok: true,
            correctAnswer: 'Jeg spiser et æble.',
            userAnswer: 'Jeg spiser et able.',
        });

        expect(result).toBe(false);
    });

    it('does not reveal a translation_active correct answer when userAnswer is unavailable', () => {
        const result = shouldRevealAnswer({
            exerciseType: 'translation_active',
            ok: true,
            correctAnswer: 'Jeg spiser et æble.',
            userAnswer: undefined,
        });

        expect(result).toBe(false);
    });
});
