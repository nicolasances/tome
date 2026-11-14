import { WordsPracticeWord } from '@/api/TomeWordsPracticeAPI';

export interface MissedWord {
    wordKey: string;
    english: string;
    danish: string;
}

export interface WordsResults {
    headline: string;
    subline: string;        // Tone adapts to first-attempt accuracy.
    total: number;          // Words in the session.
    firstTry: number;       // Words answered correctly on the first attempt (AI-accepted first attempts included).
    accuracyPct: number;    // firstTry ÷ total, whole percent.
    missed: MissedWord[];   // Words missed on the first attempt, in session order.
}

/** Derives the results screen content from a completed session's words. */
export function deriveWordsResults(words: WordsPracticeWord[]): WordsResults {

    const total = words.length;
    const firstTry = words.filter(w => w.firstAttemptCorrect === true).length;
    const missed = words.filter(w => w.firstAttemptCorrect === false).map(w => ({ wordKey: w.wordKey, english: w.english, danish: w.danish }));
    const accuracy = total > 0 ? firstTry / total : 0;

    const subline = accuracy >= 0.85 ? 'Your vocabulary is holding up well.'
        : accuracy >= 0.6 ? 'Solid — a few words are worth another look.'
        : 'Some words have faded. Another round will bring them back.';

    return { headline: 'Words refreshed', subline, total, firstTry, accuracyPct: Math.round(accuracy * 100), missed };
}
