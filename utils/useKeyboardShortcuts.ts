'use client';

import { useEffect } from 'react';
import { isCheckWithAiShortcut, isInsertAeShortcut, insertCharacterAtCursor } from './keyboardShortcuts';

function insertAeIntoFocusedInput() {
    const el = document.activeElement;
    if (!(el instanceof HTMLInputElement) && !(el instanceof HTMLTextAreaElement)) return;

    const selectionStart = el.selectionStart ?? el.value.length;
    const selectionEnd = el.selectionEnd ?? el.value.length;
    const { value, cursorPos } = insertCharacterAtCursor(el.value, selectionStart, selectionEnd, 'æ');

    const proto = el instanceof HTMLTextAreaElement ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
    const setValue = Object.getOwnPropertyDescriptor(proto, 'value')!.set!;
    setValue.call(el, value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.setSelectionRange(cursorPos, cursorPos);
}

export function useKeyboardShortcuts({ onCheckWithAi }: { onCheckWithAi?: () => void }) {
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (isCheckWithAiShortcut(e) && onCheckWithAi) {
                e.preventDefault();
                onCheckWithAi();
                return;
            }
            if (isInsertAeShortcut(e)) {
                const el = document.activeElement;
                if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
                    e.preventDefault();
                    insertAeIntoFocusedInput();
                }
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onCheckWithAi]);
}
