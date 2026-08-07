import { isCheckWithAiShortcut, isInsertAeShortcut, insertCharacterAtCursor } from '../utils/keyboardShortcuts';

describe('isCheckWithAiShortcut', () => {

    it('returns true for Cmd+.', () => {
        expect(isCheckWithAiShortcut({ metaKey: true, key: '.' })).toBe(true);
    });

    it('returns false for Cmd+other key', () => {
        expect(isCheckWithAiShortcut({ metaKey: true, key: 'a' })).toBe(false);
    });

    it('returns false for "." without Cmd', () => {
        expect(isCheckWithAiShortcut({ metaKey: false, key: '.' })).toBe(false);
    });
});

describe('isInsertAeShortcut', () => {

    it('returns true for Cmd+a', () => {
        expect(isInsertAeShortcut({ metaKey: true, key: 'a' })).toBe(true);
    });

    it('returns true for Cmd+A (case-insensitive)', () => {
        expect(isInsertAeShortcut({ metaKey: true, key: 'A' })).toBe(true);
    });

    it('returns false for Cmd+other key', () => {
        expect(isInsertAeShortcut({ metaKey: true, key: 'b' })).toBe(false);
    });

    it('returns false for "a" without Cmd', () => {
        expect(isInsertAeShortcut({ metaKey: false, key: 'a' })).toBe(false);
    });
});

describe('insertCharacterAtCursor', () => {

    it('inserts at the start of the string with an empty selection', () => {
        const result = insertCharacterAtCursor('bc', 0, 0, 'æ');

        expect(result.value).toBe('æbc');
        expect(result.cursorPos).toBe(1);
    });

    it('inserts in the middle of the string with an empty selection', () => {
        const result = insertCharacterAtCursor('ac', 1, 1, 'æ');

        expect(result.value).toBe('aæc');
        expect(result.cursorPos).toBe(2);
    });

    it('inserts at the end of the string with an empty selection', () => {
        const result = insertCharacterAtCursor('ab', 2, 2, 'æ');

        expect(result.value).toBe('abæ');
        expect(result.cursorPos).toBe(3);
    });

    it('replaces a selection in the middle of the string', () => {
        const result = insertCharacterAtCursor('a-bcd-e', 2, 5, 'æ');

        expect(result.value).toBe('a-æ-e');
        expect(result.cursorPos).toBe(3);
    });

    it('replaces a selection spanning the entire string', () => {
        const result = insertCharacterAtCursor('hello', 0, 5, 'æ');

        expect(result.value).toBe('æ');
        expect(result.cursorPos).toBe(1);
    });

    it('inserts into an empty string', () => {
        const result = insertCharacterAtCursor('', 0, 0, 'æ');

        expect(result.value).toBe('æ');
        expect(result.cursorPos).toBe(1);
    });
});
