import { deriveCtaInfo, formatCountdown, RE_PRACTICE_CTA } from '../utils/moduleOverviewCta';

describe('deriveCtaInfo', () => {

    it('returns an enabled "Start grammar" CTA for a module that has not started', () => {
        const cta = deriveCtaInfo(null, null);

        expect(cta).toEqual({ label: 'Start grammar', disabled: false });
    });

    it('returns an enabled "Start practice" CTA when the step is practice', () => {
        const cta = deriveCtaInfo('practice', null);

        expect(cta).toEqual({ label: 'Start practice', disabled: false });
    });

    it('returns an enabled "Start test" CTA when the test is unlocked', () => {
        const cta = deriveCtaInfo('test', null);

        expect(cta).toEqual({ label: 'Start test', disabled: false });
    });

    it('returns a disabled countdown CTA when the test is still cooling down', () => {
        const testUnlocksAt = new Date(Date.now() + 90 * 60 * 1000).toISOString();

        const cta = deriveCtaInfo('test', testUnlocksAt);

        expect(cta.disabled).toBe(true);
        expect(cta.label).toBe('Test unlocks in 1h 30m');
    });

    // Reproduces #335: a completed module used to return a disabled "Module complete"
    // dead-end. It must now offer an enabled re-practice CTA instead.
    it('returns the enabled re-practice CTA when the module is done', () => {
        const cta = deriveCtaInfo('done', null);

        expect(cta).toEqual({ label: 'Re-practice this module', disabled: false });
        expect(cta).toBe(RE_PRACTICE_CTA);
    });
});

describe('formatCountdown', () => {

    it('formats a countdown under an hour as minutes only', () => {
        const target = new Date(Date.now() + 45 * 60 * 1000).toISOString();

        expect(formatCountdown(target)).toBe('45m');
    });

    it('formats a countdown over an hour as hours and minutes', () => {
        const target = new Date(Date.now() + 125 * 60 * 1000).toISOString();

        expect(formatCountdown(target)).toBe('2h 5m');
    });

    it('formats an exact hour without a minutes suffix', () => {
        const target = new Date(Date.now() + 60 * 60 * 1000).toISOString();

        expect(formatCountdown(target)).toBe('1h');
    });

    it('returns an empty string once the deadline has passed', () => {
        const target = new Date(Date.now() - 1000).toISOString();

        expect(formatCountdown(target)).toBe('');
    });
});
