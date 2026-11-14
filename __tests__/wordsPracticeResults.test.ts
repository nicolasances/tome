import { deriveWordsResults } from '../utils/wordsPracticeResults';
import { WordsPracticeWord } from '../api/TomeWordsPracticeAPI';

function word(wordKey: string, firstAttemptCorrect: boolean | null): WordsPracticeWord {
    return { wordKey, english: `en-${wordKey}`, type: 'noun', context: null, danish: `da-${wordKey}`, attempts: [], firstAttemptCorrect, correct: true };
}

describe('deriveWordsResults', () => {

    it('counts words and first-try correct answers and computes accuracy', () => {
        const r = deriveWordsResults([word('a', true), word('b', false), word('c', true), word('d', true)]);
        expect(r.total).toBe(4);
        expect(r.firstTry).toBe(3);
        expect(r.accuracyPct).toBe(75);
    });

    it('lists the words missed on the first attempt, in session order, as english → danish', () => {
        const r = deriveWordsResults([word('a', false), word('b', true), word('c', false)]);
        expect(r.missed).toEqual([{ wordKey: 'a', english: 'en-a', danish: 'da-a' }, { wordKey: 'c', english: 'en-c', danish: 'da-c' }]);
    });

    it('has no missed words when every word was right first time', () => {
        const r = deriveWordsResults([word('a', true), word('b', true)]);
        expect(r.missed).toEqual([]);
        expect(r.accuracyPct).toBe(100);
    });

    it('handles an empty session without dividing by zero', () => {
        const r = deriveWordsResults([]);
        expect(r.total).toBe(0);
        expect(r.accuracyPct).toBe(0);
    });

    it('rounds accuracy to a whole percent', () => {
        expect(deriveWordsResults([word('a', true), word('b', false), word('c', false)]).accuracyPct).toBe(33);
    });

    it('adapts the subline to first-attempt accuracy', () => {
        const strong = deriveWordsResults([word('a', true), word('b', true), word('c', true), word('d', true), word('e', true), word('f', true), word('g', true), word('h', false)]);
        const solid = deriveWordsResults([word('a', true), word('b', true), word('c', false)]);
        const weak = deriveWordsResults([word('a', false), word('b', false), word('c', true)]);
        expect(new Set([strong.subline, solid.subline, weak.subline]).size).toBe(3);
        expect(strong.headline).toBe('Words refreshed');
    });
});
