import { computeWeeklyBarStacks } from '../utils/weeklyBarStack';
import { DailyActivityDay } from '../api/TomeLearningDashboardAPI';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function day(date: string, practiceSessions: number, successfulModuleTests: number, successfulLevelTests: number, wordsPracticeSessions = 0): DailyActivityDay {
    return { date, practiceSessions, successfulModuleTests, successfulLevelTests, wordsPracticeSessions };
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

    it('stacks Words Practice sessions as their own segment between practice and module tests', () => {
        const days = [
            day('20260706', 2, 1, 1, 4),
            day('20260707', 1, 0, 0),
        ];

        const [mixed] = computeWeeklyBarStacks(days);

        expect(mixed.total).toBe(8);
        expect(mixed.wordsPracticeHeight).toBeCloseTo(mixed.barHeight * (4 / 8));
        expect(mixed.practiceHeight + mixed.wordsPracticeHeight + mixed.moduleTestHeight + mixed.levelTestHeight).toBeCloseTo(mixed.barHeight);
    });

    it('renders a day with only Words Practice sessions as a non-empty bar', () => {
        const [result] = computeWeeklyBarStacks([day('20260706', 0, 0, 0, 3)]);

        expect(result.total).toBe(3);
        expect(result.barHeight).toBeGreaterThan(0);
        expect(result.practiceHeight).toBe(0);
        expect(result.wordsPracticeHeight).toBeCloseTo(result.barHeight);
    });

    it('normalizes bar height against the busiest day including Words Practice sessions', () => {
        const [quiet, busy] = computeWeeklyBarStacks([day('20260706', 1, 0, 0), day('20260707', 0, 0, 0, 5)]);

        expect(busy.barHeight).toBeGreaterThan(quiet.barHeight);
    });
});
