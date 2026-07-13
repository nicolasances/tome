import { computeWeeklyBarStacks } from '../utils/weeklyBarStack';
import { DailyActivityDay } from '../api/TomeLearningDashboardAPI';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function day(date: string, practiceSessions: number, successfulModuleTests: number, successfulLevelTests: number): DailyActivityDay {
    return { date, practiceSessions, successfulModuleTests, successfulLevelTests };
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('computeWeeklyBarStacks', () => {

    it('proportionally splits a mixed day\'s bar height across all three segments', () => {
        const days = [
            day('20260706', 4, 2, 2),
            day('20260707', 1, 0, 0),
        ];

        const [mixed] = computeWeeklyBarStacks(days);

        expect(mixed.total).toBe(8);
        expect(mixed.practiceHeight).toBeCloseTo(mixed.barHeight * (4 / 8));
        expect(mixed.moduleTestHeight).toBeCloseTo(mixed.barHeight * (2 / 8));
        expect(mixed.levelTestHeight).toBeCloseTo(mixed.barHeight * (2 / 8));
        expect(mixed.practiceHeight + mixed.moduleTestHeight + mixed.levelTestHeight).toBeCloseTo(mixed.barHeight);
    });

    it('gives a zero-height practice segment (no sliver) when a day has only test successes', () => {
        const days = [
            day('20260706', 0, 3, 1),
        ];

        const [result] = computeWeeklyBarStacks(days);

        expect(result.total).toBe(4);
        expect(result.practiceHeight).toBe(0);
        expect(result.moduleTestHeight).toBeGreaterThan(0);
        expect(result.levelTestHeight).toBeGreaterThan(0);
    });

    it('reports zero total and zero segment heights for a fully empty day', () => {
        const days = [
            day('20260706', 0, 0, 0),
        ];

        const [result] = computeWeeklyBarStacks(days);

        expect(result.total).toBe(0);
        expect(result.barHeight).toBe(0);
        expect(result.practiceHeight).toBe(0);
        expect(result.moduleTestHeight).toBe(0);
        expect(result.levelTestHeight).toBe(0);
    });

    it('gives the day with the highest total the max bar height, and roughly halves it for a day at half the total', () => {
        const days = [
            day('20260701', 10, 0, 0),
            day('20260702', 5, 0, 0),
        ];

        const [maxDay, halfDay] = computeWeeklyBarStacks(days);

        expect(maxDay.barHeight).toBe(84);
        expect(halfDay.barHeight).toBeCloseTo(42);
    });

    it('applies the minimum bar height floor to a low-total day in a high-total window', () => {
        const days = [
            day('20260701', 100, 0, 0),
            day('20260702', 1, 0, 0),
        ];

        const [, lowDay] = computeWeeklyBarStacks(days);

        expect(lowDay.barHeight).toBe(8);
    });
});
