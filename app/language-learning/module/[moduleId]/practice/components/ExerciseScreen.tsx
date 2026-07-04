'use client';

import { useVisualViewportHeight } from '@/utils/useVisualViewportHeight';

/**
 * Shared shell for the practice and module-test in-progress screens. Sizes itself to
 * the live visual viewport (falling back to `100dvh`) instead of inheriting the
 * ancestor layout's fixed `h-screen`, so on iOS Safari the on-screen keyboard doesn't
 * push the prompt above it out of view when a text input is focused.
 */
export function ExerciseScreen({children}: {children: React.ReactNode}) {

    const viewportHeight = useVisualViewportHeight();

    return (
        <div className="relative flex flex-1 flex-col overflow-hidden" style={{maxHeight: viewportHeight ? `${viewportHeight}px` : '100dvh'}}>
            {children}
        </div>
    );
}
