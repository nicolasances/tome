'use client';

import { useEffect } from 'react';
import { isCheckWithAiShortcut } from './keyboardShortcuts';

export function useKeyboardShortcuts({ onCheckWithAi }: { onCheckWithAi?: () => void }) {
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (isCheckWithAiShortcut(e) && onCheckWithAi) {
                e.preventDefault();
                onCheckWithAi();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onCheckWithAi]);
}
