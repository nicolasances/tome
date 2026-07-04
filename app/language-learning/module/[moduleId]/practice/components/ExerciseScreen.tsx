'use client';

import { useRef } from 'react';
import { useKeyboardAwareMaxHeight } from '@/utils/useKeyboardAwareMaxHeight';

/**
 * Shared shell for the practice and module-test in-progress screens. Clamps itself to
 * the space between its own top edge and the bottom of the live visual viewport, so on
 * iOS Safari the exercise fits above the on-screen keyboard and the prompt is not
 * scrolled out of view when a text input is focused. Falls back to `100dvh` when the
 * Visual Viewport API is unavailable.
 */
export function ExerciseScreen({children}: {children: React.ReactNode}) {

    const containerRef = useRef<HTMLDivElement>(null);
    const maxHeight = useKeyboardAwareMaxHeight(containerRef);

    return (
        <div ref={containerRef} className="relative flex flex-1 flex-col overflow-hidden" style={{maxHeight: maxHeight ? `${maxHeight}px` : '100dvh'}}>
            {children}
        </div>
    );
}
