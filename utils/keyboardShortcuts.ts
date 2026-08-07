export interface Shortcut {
    id: string;
    combo: string;
    label: string;
}

export const SHORTCUTS: Shortcut[] = [
    { id: 'check-with-ai', combo: 'Cmd+.', label: 'Check answer with AI' },
    { id: 'insert-ae', combo: 'Cmd+A', label: 'Write æ' },
];

export function isCheckWithAiShortcut(e: { metaKey: boolean; key: string }): boolean {
    return e.metaKey && e.key === '.';
}

export function isInsertAeShortcut(e: { metaKey: boolean; key: string }): boolean {
    return e.metaKey && e.key.toLowerCase() === 'a';
}

export function insertCharacterAtCursor(value: string, selectionStart: number, selectionEnd: number, char: string): { value: string; cursorPos: number } {
    const newValue = value.slice(0, selectionStart) + char + value.slice(selectionEnd);
    return { value: newValue, cursorPos: selectionStart + char.length };
}
