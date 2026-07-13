import { DailyActivityDay } from '@/api/TomeLearningDashboardAPI';

const MAX_BAR_HEIGHT = 84;
const MIN_BAR_HEIGHT = 8;

export interface WeeklyBarStack {
    date: string;
    total: number;
    barHeight: number;
    practiceHeight: number;
    moduleTestHeight: number;
    levelTestHeight: number;
}

/**
 * Computes stacked bar-chart segment heights for the "This week" widget: each
 * day's bar stacks practiceSessions (bottom), successfulModuleTests (middle)
 * and successfulLevelTests (top), sized proportionally to its share of the
 * day's total, with the overall bar height normalized against the highest
 * daily total in the window (floored at 1 to avoid divide-by-zero when every
 * day is empty).
 *
 * @param {DailyActivityDay[]} days - The rolling-window days to compute stacks for.
 *
 * @returns {WeeklyBarStack[]} One stack per input day, same order.
 */
export function computeWeeklyBarStacks(days: DailyActivityDay[]): WeeklyBarStack[] {

    const totals = days.map((d) => d.practiceSessions + d.successfulModuleTests + d.successfulLevelTests);
    const maxTotal = Math.max(...totals, 1);

    return days.map((day, i) => {
        const total = totals[i];

        if (total === 0) {
            return { date: day.date, total: 0, barHeight: 0, practiceHeight: 0, moduleTestHeight: 0, levelTestHeight: 0 };
        }

        const barHeight = Math.max((total / maxTotal) * MAX_BAR_HEIGHT, MIN_BAR_HEIGHT);

        return {
            date: day.date,
            total,
            barHeight,
            practiceHeight: (day.practiceSessions / total) * barHeight,
            moduleTestHeight: (day.successfulModuleTests / total) * barHeight,
            levelTestHeight: (day.successfulLevelTests / total) * barHeight,
        };
    });
}
