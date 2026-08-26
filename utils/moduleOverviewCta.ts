import { ModuleProgressEntry } from '@/api/TomeLearningDashboardAPI';

export interface CtaInfo {
    label: string;
    disabled: boolean;
}

/**
 * The CTA shown once a module is fully completed (`step === 'done'`).
 * Both the mobile and desktop CTAs read this same constant so the two
 * breakpoints can never decide the 'done' label independently again —
 * that divergence is what left the desktop "Keep practicing" button dead.
 */
export const RE_PRACTICE_CTA: CtaInfo = { label: 'Re-practice this module', disabled: false };

/**
 * Formats the time remaining until `testUnlocksAt` as a short countdown string
 * (e.g. "2h 15m", "45m"). Returns an empty string once the deadline has passed.
 *
 * @param {string} testUnlocksAt - ISO timestamp the test unlocks at.
 *
 * @returns {string} A short, human-readable countdown.
 */
export function formatCountdown(testUnlocksAt: string): string {
    const ms = new Date(testUnlocksAt).getTime() - Date.now();
    if (ms <= 0) return '';

    const totalMinutes = Math.ceil(ms / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours === 0) return `${minutes}m`;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}

/**
 * Derives the primary CTA (label + enabled state) for a module's actual current step.
 * Used directly by the mobile overview, and by the desktop overview once the module
 * is 'done' (desktop otherwise derives its own label per the rail step being reviewed).
 *
 * @param {ModuleProgressEntry['step']} step - The module's current step, as reported by the backend.
 * @param {string | null} testUnlocksAt - ISO timestamp the test unlocks at, or null if not applicable.
 *
 * @returns {CtaInfo} The label to show and whether the CTA is disabled.
 */
export function deriveCtaInfo(step: ModuleProgressEntry['step'], testUnlocksAt: string | null): CtaInfo {
    switch (step) {
        case 'practice':
            return { label: 'Start practice', disabled: false };
        case 'test': {
            const testLocked = testUnlocksAt ? new Date(testUnlocksAt) > new Date() : false;
            if (testLocked) return { label: `Test unlocks in ${testUnlocksAt ? formatCountdown(testUnlocksAt) : ''}`, disabled: true };
            return { label: 'Start test', disabled: false };
        }
        case 'done':
            return RE_PRACTICE_CTA;
        default:
            return { label: 'Start grammar', disabled: false };
    }
}
