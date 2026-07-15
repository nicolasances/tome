export interface ShouldRevealAnswerParams {
    exerciseType: string;
    ok: boolean;
    correctAnswer?: string;
    userAnswer?: string;
}

/**
 * Normalizes an answer string for comparison: lowercases, trims, and strips
 * punctuation. Mirrors tome-ms-language's AnswerChecker.normalize so the
 * frontend can tell a fuzzy (non-exact) match from an exact one without
 * duplicating the backend's Levenshtein matching itself.
 */
export function normalizeAnswer(answer: string): string {

    return answer
        .toLowerCase()
        .trim()
        .replace(/[.,!?;:'"()\-]/g, '')
        .trim();
}

/**
 * Whether the ResultSheet should reveal the canonical correct answer text.
 *
 * - Multiple choice never reveals a separate answer (the chosen/correct option
 *   is already highlighted inline).
 * - A wrong submission always reveals the correct answer, for any other type.
 * - A correct submission only reveals it for Translation exercises, and only
 *   when the submitted answer differs from the canonical one after
 *   normalization — i.e. it was accepted via the backend's fuzzy matching
 *   rather than an exact match, so the exact phrasing is worth surfacing.
 */
export function shouldRevealAnswer({ exerciseType, ok, correctAnswer, userAnswer }: ShouldRevealAnswerParams): boolean {

    if (exerciseType === 'multiple_choice') return false;
    if (!correctAnswer) return false;

    if (!ok) return true;

    if (exerciseType !== 'translation_active') return false;
    if (userAnswer === undefined) return false;

    return normalizeAnswer(userAnswer) !== normalizeAnswer(correctAnswer);
}
