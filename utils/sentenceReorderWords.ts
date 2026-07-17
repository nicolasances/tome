/** A single word tile carrying a stable per-instance identity, so duplicate words in a sentence can be told apart. */
export interface WordTile {
    id: number;    // The word's index in the original words array — stable across the exercise's lifetime
    text: string;  // The word's text
}

/**
 * Tags each word in a sentence with a per-instance id (its original index).
 *
 * This gives duplicate words (e.g. "spiser" appearing twice in a sentence) distinct
 * identities, so selection/removal can operate on id rather than on string value.
 *
 * @param words - The exercise's words, in their original order
 *
 * @returns A `WordTile[]` where each tile's `id` is its index in `words`
 */
export function tagWords(words: string[]): WordTile[] {

    return words.map((text, id) => ({ id, text }));
}

/**
 * Toggles a single word instance in the built (placed) list, by id.
 *
 * Because ids are per-instance, toggling one occurrence of a duplicated word
 * never affects any other occurrence sharing the same text.
 *
 * @param builtIds - The ids currently placed in the answer, in order
 * @param id - The id of the word instance being toggled
 *
 * @returns A new array with `id` removed if it was present, or appended otherwise
 */
export function toggleWordId(builtIds: number[], id: number): number[] {

    if (builtIds.includes(id)) return builtIds.filter(builtId => builtId !== id);

    return [...builtIds, id];
}

/**
 * Resolves a list of built ids back into the words they represent, in order.
 *
 * @param words - The exercise's words, in their original order (same array `tagWords` was given)
 * @param builtIds - The ids placed in the answer, in the order they were placed
 *
 * @returns The words corresponding to `builtIds`, in order
 */
export function resolveBuiltWords(words: string[], builtIds: number[]): string[] {

    return builtIds.map(id => words[id]);
}
