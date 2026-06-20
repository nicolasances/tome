/** Result of processing a keyboard event for multiple choice navigation. */
interface KeyHandlerResult {
    newCursorIndex: number;  // The updated cursor position after processing the key
    action: 'select' | 'submit' | null;  // The action to take: select the option, submit the answer, or nothing
}

const LETTER_TO_INDEX: Record<string, number> = { a: 0, b: 1, c: 2, d: 3 };
const NUMBER_TO_INDEX: Record<string, number> = { '1': 0, '2': 1, '3': 2, '4': 3 };

/**
 * Pure function that maps a keyboard event key to a cursor movement and/or action
 * for the multiple choice exercise.
 *
 * Supported keys:
 * - ArrowDown / ArrowUp: move cursor with wrapping
 * - A–D / 1–4: jump to a specific option and select it
 * - Enter: submit the currently cursored option
 *
 * @param key - The `KeyboardEvent.key` value
 * @param cursorIndex - The current cursor position (0-based)
 * @param optionCount - The total number of options available
 *
 * @returns A `KeyHandlerResult` with the new cursor index and action, or `null` if the key is not handled
 */
export function multipleChoiceKeyHandler(key: string, cursorIndex: number, optionCount: number): KeyHandlerResult | null {

    if (key === 'ArrowDown') {
        return { newCursorIndex: (cursorIndex + 1) % optionCount, action: null };
    }

    if (key === 'ArrowUp') {
        return { newCursorIndex: (cursorIndex - 1 + optionCount) % optionCount, action: null };
    }

    const letterIndex = LETTER_TO_INDEX[key.toLowerCase()];
    if (letterIndex !== undefined && letterIndex < optionCount) {
        return { newCursorIndex: letterIndex, action: 'select' };
    }

    const numberIndex = NUMBER_TO_INDEX[key];
    if (numberIndex !== undefined && numberIndex < optionCount) {
        return { newCursorIndex: numberIndex, action: 'select' };
    }

    if (key === 'Enter') {
        return { newCursorIndex: cursorIndex, action: 'submit' };
    }

    return null;
}
