import { acceptedNote, toVerificationOutcome, DEFAULT_ACCEPTED_NOTE } from '../utils/aiVerify';

// ─── toVerificationOutcome ──────────────────────────────────────────────────

describe('toVerificationOutcome', () => {

    it('keeps the AI explanation when the answer is accepted', () => {
        const outcome = toVerificationOutcome({ valid: true, explanation: 'Natural Danish. The exercise uses "vel" for the same idea.' });

        expect(outcome).toEqual({ phase: 'valid', explanation: 'Natural Danish. The exercise uses "vel" for the same idea.' });
    });

    it('returns an empty explanation when an accepted answer comes without one', () => {
        const outcome = toVerificationOutcome({ valid: true });

        expect(outcome).toEqual({ phase: 'valid', explanation: '' });
    });

    it('keeps the AI explanation when the answer is not accepted', () => {
        const outcome = toVerificationOutcome({ valid: false, explanation: 'Wrong verb tense.' });

        expect(outcome).toEqual({ phase: 'invalid', explanation: 'Wrong verb tense.' });
    });

    it('returns an empty explanation when a rejected answer comes without one', () => {
        const outcome = toVerificationOutcome({ valid: false });

        expect(outcome).toEqual({ phase: 'invalid', explanation: '' });
    });
});

// ─── acceptedNote ───────────────────────────────────────────────────────────

describe('acceptedNote', () => {

    it('shows the AI explanation in the accepted state when there is one', () => {
        expect(acceptedNote('Correct. The exercise teaches "vel": "Du er vel enig med mig?"')).toBe('Correct. The exercise teaches "vel": "Du er vel enig med mig?"');
    });

    it('falls back to the fixed line when there is no explanation', () => {
        expect(acceptedNote('')).toBe(DEFAULT_ACCEPTED_NOTE);
    });

    it('falls back to the fixed line when the explanation is only whitespace', () => {
        expect(acceptedNote('   ')).toBe(DEFAULT_ACCEPTED_NOTE);
    });

    it('keeps the current fixed line text', () => {
        expect(DEFAULT_ACCEPTED_NOTE).toBe('Your translation works too — counting it as correct.');
    });
});
