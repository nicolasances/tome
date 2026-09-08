import { reduceEnterToConfirm } from '../utils/enterToConfirm';

describe('reduceEnterToConfirm', () => {

    // ─── Arming ─────────────────────────────────────────────────────────────

    it('arms on the first keyup while disarmed', () => {
        const result = reduceEnterToConfirm('disarmed', 'keyup');

        expect(result.state).toBe('armed');
        expect(result.fire).toBe(false);
    });

    it('stays armed on a further keyup and does not fire', () => {
        const result = reduceEnterToConfirm('armed', 'keyup');

        expect(result.state).toBe('armed');
        expect(result.fire).toBe(false);
    });

    // ─── Guarding against auto-repeat ───────────────────────────────────────

    it('does nothing on an Enter keydown while still disarmed', () => {
        const result = reduceEnterToConfirm('disarmed', 'enter-keydown');

        expect(result.state).toBe('disarmed');
        expect(result.fire).toBe(false);
    });

    it('a held-down Enter key (repeated keydowns, no intervening keyup) only fires once', () => {
        const first = reduceEnterToConfirm('disarmed', 'enter-keydown');
        const second = reduceEnterToConfirm(first.state, 'enter-keydown');
        const third = reduceEnterToConfirm(second.state, 'enter-keydown');

        expect(first.fire).toBe(false);
        expect(second.fire).toBe(false);
        expect(third.fire).toBe(false);
    });

    // ─── Firing ──────────────────────────────────────────────────────────────

    it('fires and disarms on an Enter keydown while armed', () => {
        const result = reduceEnterToConfirm('armed', 'enter-keydown');

        expect(result.state).toBe('disarmed');
        expect(result.fire).toBe(true);
    });

    it('a genuine second press (keyup then Enter keydown again) fires again', () => {
        const armed = reduceEnterToConfirm('disarmed', 'keyup');
        const fired = reduceEnterToConfirm(armed.state, 'enter-keydown');
        const rearmed = reduceEnterToConfirm(fired.state, 'keyup');
        const firedAgain = reduceEnterToConfirm(rearmed.state, 'enter-keydown');

        expect(fired.fire).toBe(true);
        expect(firedAgain.fire).toBe(true);
    });
});
