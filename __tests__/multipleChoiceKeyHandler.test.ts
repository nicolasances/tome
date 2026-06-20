import { multipleChoiceKeyHandler } from '../utils/multipleChoiceKeyHandler';

describe('multipleChoiceKeyHandler', () => {

    // ─── Arrow navigation ────────────────────────────────────────────────────

    it('moves cursor down on ArrowDown', () => {
        const result = multipleChoiceKeyHandler('ArrowDown', 0, 4);

        expect(result).not.toBeNull();
        expect(result!.newCursorIndex).toBe(1);
        expect(result!.action).toBeNull();
    });

    it('wraps cursor to 0 when ArrowDown from last option', () => {
        const result = multipleChoiceKeyHandler('ArrowDown', 3, 4);

        expect(result).not.toBeNull();
        expect(result!.newCursorIndex).toBe(0);
    });

    it('moves cursor up on ArrowUp', () => {
        const result = multipleChoiceKeyHandler('ArrowUp', 2, 4);

        expect(result).not.toBeNull();
        expect(result!.newCursorIndex).toBe(1);
        expect(result!.action).toBeNull();
    });

    it('wraps cursor to last option when ArrowUp from 0', () => {
        const result = multipleChoiceKeyHandler('ArrowUp', 0, 4);

        expect(result).not.toBeNull();
        expect(result!.newCursorIndex).toBe(3);
    });

    // ─── Letter keys (A–D) ──────────────────────────────────────────────────

    it('jumps cursor to index 0 on key "a"', () => {
        const result = multipleChoiceKeyHandler('a', 2, 4);

        expect(result).not.toBeNull();
        expect(result!.newCursorIndex).toBe(0);
        expect(result!.action).toBe('select');
    });

    it('jumps cursor to index 1 on key "B" (case-insensitive)', () => {
        const result = multipleChoiceKeyHandler('B', 0, 4);

        expect(result).not.toBeNull();
        expect(result!.newCursorIndex).toBe(1);
        expect(result!.action).toBe('select');
    });

    it('jumps cursor to index 2 on key "c"', () => {
        const result = multipleChoiceKeyHandler('c', 0, 4);

        expect(result).not.toBeNull();
        expect(result!.newCursorIndex).toBe(2);
        expect(result!.action).toBe('select');
    });

    it('jumps cursor to index 3 on key "d"', () => {
        const result = multipleChoiceKeyHandler('d', 0, 4);

        expect(result).not.toBeNull();
        expect(result!.newCursorIndex).toBe(3);
        expect(result!.action).toBe('select');
    });

    // ─── Number keys (1–4) ──────────────────────────────────────────────────

    it('jumps cursor to index 0 on key "1"', () => {
        const result = multipleChoiceKeyHandler('1', 3, 4);

        expect(result).not.toBeNull();
        expect(result!.newCursorIndex).toBe(0);
        expect(result!.action).toBe('select');
    });

    it('jumps cursor to index 3 on key "4"', () => {
        const result = multipleChoiceKeyHandler('4', 0, 4);

        expect(result).not.toBeNull();
        expect(result!.newCursorIndex).toBe(3);
        expect(result!.action).toBe('select');
    });

    // ─── Enter key ──────────────────────────────────────────────────────────

    it('returns submit action on Enter', () => {
        const result = multipleChoiceKeyHandler('Enter', 1, 4);

        expect(result).not.toBeNull();
        expect(result!.newCursorIndex).toBe(1);
        expect(result!.action).toBe('submit');
    });

    // ─── Ignored keys ───────────────────────────────────────────────────────

    it('returns null action for unrecognized keys', () => {
        const result = multipleChoiceKeyHandler('x', 1, 4);

        expect(result).toBeNull();
    });

    it('returns null for letter keys beyond option count', () => {
        const result = multipleChoiceKeyHandler('d', 0, 3);

        expect(result).toBeNull();
    });

    it('returns null for number keys beyond option count', () => {
        const result = multipleChoiceKeyHandler('4', 0, 3);

        expect(result).toBeNull();
    });
});
