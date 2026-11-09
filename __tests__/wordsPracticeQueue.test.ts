import { buildQueueState, applyAnswer, kickerLabel, restoreOutstanding } from '../utils/wordsPracticeQueue';
import { WordsPracticeWord } from '../api/TomeWordsPracticeAPI';

function word(wordKey: string, attempts: boolean[] = [], correct = false): WordsPracticeWord {
    return {
        wordKey, english: wordKey, type: 'noun', context: null, danish: wordKey,
        attempts: attempts.map((isCorrect, i) => ({ userAnswer: 'x', isCorrect, isFirstAttempt: i === 0, aiChecked: false, timestamp: '' })),
        firstAttemptCorrect: attempts.length ? attempts[0] : null,
        correct,
    };
}

describe('buildQueueState (resume)', () => {

    it('queues every word in presentation order for a fresh session', () => {
        const s = buildQueueState([word('a'), word('b'), word('c')]);
        expect(s.queue).toEqual(['a', 'b', 'c']);
        expect(s.correct).toEqual([]);
        expect(s.attempted).toEqual([]);
    });

    it('puts unattempted words first, then words with only wrong attempts; drops correct words', () => {
        const s = buildQueueState([word('a', [false]), word('b'), word('c', [true], true), word('d', [false, false]), word('e')]);
        expect(s.queue).toEqual(['b', 'e', 'a', 'd']);
        expect(s.correct).toEqual(['c']);
        expect(s.attempted).toEqual(['a', 'c', 'd']);
    });
});

describe('applyAnswer', () => {

    it('removes a correct word from the queue and marks it correct', () => {
        const s = applyAnswer(buildQueueState([word('a'), word('b')]), 'a', true);
        expect(s.queue).toEqual(['b']);
        expect(s.correct).toEqual(['a']);
        expect(s.attempted).toContain('a');
    });

    it('re-queues a wrong word at the end', () => {
        const s = applyAnswer(buildQueueState([word('a'), word('b'), word('c')]), 'a', false);
        expect(s.queue).toEqual(['b', 'c', 'a']);
        expect(s.correct).toEqual([]);
    });

    it('does not mutate its input', () => {
        const before = buildQueueState([word('a'), word('b')]);
        applyAnswer(before, 'a', true);
        expect(before.queue).toEqual(['a', 'b']);
    });
});

describe('kickerLabel', () => {

    it('shows the position during the first pass', () => {
        const s = applyAnswer(buildQueueState([word('a'), word('b'), word('c')]), 'a', true);
        expect(kickerLabel(s, 3)).toBe('Word 2 of 3');
    });

    it('counts a missed word as presented, so the first pass keeps advancing', () => {
        const s = applyAnswer(buildQueueState([word('a'), word('b'), word('c')]), 'a', false);
        expect(kickerLabel(s, 3)).toBe('Word 2 of 3');
    });

    it('switches to the retry wording once the head word has been attempted', () => {
        let s = buildQueueState([word('a'), word('b')]);
        s = applyAnswer(s, 'a', false);
        s = applyAnswer(s, 'b', true);
        expect(kickerLabel(s, 2)).toBe('Retry · 1 left');
    });

    it('is restored on resume', () => {
        expect(kickerLabel(buildQueueState([word('a', [false]), word('b', [true], true)]), 2)).toBe('Retry · 1 left');
    });
});

describe('restoreOutstanding (complete drift)', () => {

    it('puts the outstanding words back in the queue and un-corrects them', () => {
        let s = buildQueueState([word('a'), word('b')]);
        s = applyAnswer(s, 'a', true);
        s = applyAnswer(s, 'b', true);
        const r = restoreOutstanding(s, ['b']);
        expect(r.queue).toEqual(['b']);
        expect(r.correct).toEqual(['a']);
    });
});
