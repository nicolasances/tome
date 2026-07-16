import { DailyActivityDay } from '@/api/TomeLearningDashboardAPI';

/**
 * Counts how many days in a rolling window had any learning activity at all:
 * a practice session, a passed module test, or a passed level test. This
 * mirrors the "any activity" definition already used by the weekly bar chart
 * (see computeWeeklyBarStacks), so a day with e.g. only a passed module test
 * counts as active here too.
 *
 * @param {DailyActivityDay[]} days - The rolling-window days to count over.
 *
 * @returns {number} The number of days with at least one activity.
 */
export function countActiveDays(days: DailyActivityDay[]): number {

    return days.filter((d) => d.practiceSessions + d.successfulModuleTests + d.successfulLevelTests > 0).length;
}
