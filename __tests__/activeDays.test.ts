import { countActiveDays } from '../utils/activeDays';
import { DailyActivityDay } from '../api/TomeLearningDashboardAPI';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function day(date: string, practiceSessions: number, successfulModuleTests: number, successfulLevelTests: number): DailyActivityDay {
    return { date, practiceSessions, successfulModuleTests, successfulLevelTests };
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('countActiveDays', () => {

    it('counts a day with only practice sessions as active', () => {
        const days = [day('20260706', 2, 0, 0)];

        expect(countActiveDays(days)).toBe(1);
    });

    it('counts a day with only a passed module test as active', () => {
        const days = [day('20260706', 0, 1, 0)];

        expect(countActiveDays(days)).toBe(1);
    });

    it('counts a day with only a passed level test as active', () => {
        const days = [day('20260706', 0, 0, 1)];

        expect(countActiveDays(days)).toBe(1);
    });

    it('does not count a day with no activity at all', () => {
        const days = [day('20260706', 0, 0, 0)];

        expect(countActiveDays(days)).toBe(0);
    });

    it('counts each active day once across a mixed week', () => {
        const days = [
            day('20260706', 1, 0, 0), // practice only -> active
            day('20260707', 0, 1, 0), // module test only -> active
            day('20260708', 0, 0, 0), // no activity -> inactive
            day('20260709', 2, 1, 1), // mixed -> active
        ];

        expect(countActiveDays(days)).toBe(3);
    });

    it('returns 0 for an empty week', () => {
        expect(countActiveDays([])).toBe(0);
    });
});
