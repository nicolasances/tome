'use client';

import { useEffect, useRef } from 'react';
import { reduceEnterToConfirm, EnterToConfirmState } from './enterToConfirm';

/**
 * Wires a global `Enter` listener to a single-button screen's primary action
 * (e.g. `TestReady`'s "Start test", `TestSubmit`'s "Submit test").
 *
 * The listener is disarmed on mount and only arms on the first `keyup`, so a
 * screen that mounts while `Enter` is still held down from a previous screen's
 * own `Enter` handling (see `ResultSheet`) cannot be fired by that key's
 * auto-repeat — see `utils/enterToConfirm.ts` for the state machine this wraps.
 *
 * @param onConfirm - Invoked on a qualifying `Enter` press
 * @param disabled - When true, a qualifying press is swallowed instead of firing (e.g. while the action is already in flight)
 */
export function useEnterToConfirm(onConfirm: () => void, disabled?: boolean) {
    const onConfirmRef = useRef(onConfirm);
    const disabledRef = useRef(disabled);

    useEffect(() => { onConfirmRef.current = onConfirm; }, [onConfirm]);
    useEffect(() => { disabledRef.current = disabled; }, [disabled]);

    useEffect(() => {
        let state: EnterToConfirmState = 'disarmed';

        const handleKeyUp = () => { state = reduceEnterToConfirm(state, 'keyup').state; };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key !== 'Enter') return;

            const result = reduceEnterToConfirm(state, 'enter-keydown');
            state = result.state;

            if (result.fire && !disabledRef.current) onConfirmRef.current();
        };

        window.addEventListener('keyup', handleKeyUp);
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);
}
