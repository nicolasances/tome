'use client';

import { RefObject, useEffect, useState } from 'react';

/**
 * Computes the height available to `containerRef`'s element between its own top edge
 * and the bottom of the live visual viewport — i.e. the top of the iOS Safari on-screen
 * keyboard when it is open. Sizing to the raw `visualViewport.height` is not enough:
 * the container sits below the app header, so its bottom would still end up under the
 * keyboard by the header's height and Safari would still auto-scroll the prompt away.
 *
 * While the keyboard is open it also counteracts Safari's automatic scroll-into-view of
 * the focused input: once the container fits above the keyboard the input is already
 * visible at scroll 0, so any residual page scroll only reveals a blank area below the
 * shrunk container and hides the prompt.
 *
 * Returns `undefined` when the Visual Viewport API is unavailable (SSR, unsupported
 * browsers) so callers can fall back to CSS.
 *
 * @returns {number | undefined} The available height in pixels, or undefined if unsupported.
 */
export function useKeyboardAwareMaxHeight(containerRef: RefObject<HTMLElement | null>): number | undefined {

    const [maxHeight, setMaxHeight] = useState<number | undefined>(undefined);

    useEffect(() => {
        const viewport = window.visualViewport;
        if (!viewport) return;

        const update = () => {
            // The layout viewport keeps its height when the iOS keyboard opens, so a visual
            // viewport much shorter than the layout viewport signals an open keyboard.
            const keyboardOpen = viewport.height < window.innerHeight - 100;

            // Undo Safari's automatic focus scroll: with the container sized to fit above
            // the keyboard, any leftover scroll only pushes the prompt out of view.
            if (keyboardOpen && (window.scrollY > 0 || viewport.offsetTop > 0)) window.scrollTo(0, 0);

            const top = containerRef.current?.getBoundingClientRect().top ?? 0;
            setMaxHeight(Math.max(viewport.height - top, 0));
        };
        update();

        viewport.addEventListener('resize', update);
        viewport.addEventListener('scroll', update);
        window.addEventListener('scroll', update);
        return () => {
            viewport.removeEventListener('resize', update);
            viewport.removeEventListener('scroll', update);
            window.removeEventListener('scroll', update);
        };
    }, [containerRef]);

    return maxHeight;
}
