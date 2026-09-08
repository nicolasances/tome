/** Arming state of an "Enter to confirm" screen: disarmed until a keyup is observed, then armed. */
export type EnterToConfirmState = 'disarmed' | 'armed';

/** A key event relevant to the arming state machine. */
export type EnterToConfirmEvent = 'keyup' | 'enter-keydown';

/** Outcome of processing an `EnterToConfirmEvent`. */
interface EnterToConfirmResult {
    state: EnterToConfirmState;  // The updated arming state
    fire: boolean;                // Whether the screen's primary action should fire
}

/**
 * Pure state machine backing single-button screens (e.g. `TestReady`, `TestSubmit`)
 * that want `Enter` to trigger their primary action, without misfiring on a key
 * auto-repeat carried over from a screen the user just left.
 *
 * A screen starts `disarmed`. It only arms on a `keyup` — which auto-repeat never
 * sends, since the browser holds the key down without releasing it — so an `Enter`
 * keydown reaching a screen while it is still disarmed is ignored. Firing disarms
 * the screen again, so a second, genuine press requires its own keyup first.
 *
 * @param state - The current arming state
 * @param event - The key event being processed
 *
 * @returns The updated state and whether to fire the primary action
 */
export function reduceEnterToConfirm(state: EnterToConfirmState, event: EnterToConfirmEvent): EnterToConfirmResult {

    if (event === 'keyup') return { state: 'armed', fire: false };

    if (state === 'armed') return { state: 'disarmed', fire: true };

    return { state: 'disarmed', fire: false };
}
