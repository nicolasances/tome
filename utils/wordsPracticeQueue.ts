import { WordsPracticeWord } from '@/api/TomeWordsPracticeAPI';

/** Client-side state of a Words Practice session, derived from the words and the answers given so far. */
export interface WordsQueueState {
    queue: string[];        // Word keys still to present; the head is the current word.
    correct: string[];      // Word keys answered correctly (including AI-accepted).
    attempted: string[];    // Word keys that have had at least one attempt.
}

/**
 * Rebuilds the queue from a loaded session (fresh start or resume): words with no
 * attempt first, in presentation order, then words that only have wrong attempts.
 * Words already correct are not queued.
 */
export function buildQueueState(words: WordsPracticeWord[]): WordsQueueState {

    const correct = words.filter(w => w.correct).map(w => w.wordKey);
    const attempted = words.filter(w => w.attempts.length > 0).map(w => w.wordKey);
    const fresh = words.filter(w => !w.correct && w.attempts.length === 0).map(w => w.wordKey);
    const retry = words.filter(w => !w.correct && w.attempts.length > 0).map(w => w.wordKey);

    return { queue: [...fresh, ...retry], correct, attempted };
}

/**
 * Applies the outcome of answering the current (head) word. A correct word leaves the
 * queue; a wrong one goes to the end of it. Returns a new state.
 */
export function applyAnswer(state: WordsQueueState, wordKey: string, isCorrect: boolean): WordsQueueState {

    const rest = state.queue.filter(k => k !== wordKey);

    return {
        queue: isCorrect ? rest : [...rest, wordKey],
        correct: isCorrect && !state.correct.includes(wordKey) ? [...state.correct, wordKey] : state.correct,
        attempted: state.attempted.includes(wordKey) ? state.attempted : [...state.attempted, wordKey],
    };
}

/** Kicker above the prompt: "Word 12 of 40" during the first pass, "Retry · 3 left" afterwards. */
export function kickerLabel(state: WordsQueueState, total: number): string {

    const head = state.queue[0];

    if (head !== undefined && state.attempted.includes(head)) return `Retry · ${state.queue.length} left`;

    return `Word ${Math.min(state.attempted.length + 1, total)} of ${total}`;
}

/**
 * Handles client/server drift on complete: the backend says these words are not yet
 * correct, so they go back in the queue and are no longer counted as correct.
 */
export function restoreOutstanding(state: WordsQueueState, outstandingWordKeys: string[]): WordsQueueState {

    return {
        queue: outstandingWordKeys,
        correct: state.correct.filter(k => !outstandingWordKeys.includes(k)),
        attempted: state.attempted,
    };
}

/** Words that were presented, answered wrong and are still waiting for a retry: the right-hand segment of the progress bar. */
export function deferredCount(state: WordsQueueState): number {

    return state.queue.filter(k => state.attempted.includes(k)).length;
}
