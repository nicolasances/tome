'use client';

import { useEffect, useState } from 'react';

/**
 * Tracks `window.visualViewport.height` live, so a container can size itself to
 * the area actually visible above an iOS Safari on-screen keyboard instead of
 * the stale `100vh` the layout viewport keeps reporting once the keyboard opens.
 * Returns `undefined` when the Visual Viewport API is unavailable (SSR, unsupported
 * browsers) so callers can fall back to a CSS `100dvh` class.
 *
 * @returns {number | undefined} The current visual viewport height in pixels, or undefined if unsupported.
 */
export function useVisualViewportHeight(): number | undefined {

    const [height, setHeight] = useState<number | undefined>(() =>
        typeof window !== 'undefined' ? window.visualViewport?.height : undefined
    );

    useEffect(() => {
        const viewport = window.visualViewport;
        if (!viewport) return;

        const updateHeight = () => setHeight(viewport.height);
        updateHeight();

        viewport.addEventListener('resize', updateHeight);
        viewport.addEventListener('scroll', updateHeight);
        return () => {
            viewport.removeEventListener('resize', updateHeight);
            viewport.removeEventListener('scroll', updateHeight);
        };
    }, []);

    return height;
}
