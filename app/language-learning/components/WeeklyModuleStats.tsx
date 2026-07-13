'use client';

import moment from 'moment';
import { DailyActivityDay } from '@/api/TomeLearningDashboardAPI';
import { computeWeeklyBarStacks } from '@/utils/weeklyBarStack';

interface WeeklyModuleStatsProps {
    loading?: boolean;
    /** Seven entries for the rolling 7-day window (oldest → today); days with no sessions have practiceSessions: 0. */
    days?: DailyActivityDay[];
}

/**
 * 7-day stacked bar chart over a rolling window (oldest → today): each bar stacks
 * practice sessions (bottom), module tests passed (middle) and level tests passed
 * (top), sized to the day's share of activity relative to the busiest day in the window.
 * Handles its own loading (skeleton) and empty states via props.
 * Day labels are derived from the date field.
 * Today's bar is highlighted with a lime accent.
 */
export function WeeklyModuleStats({ loading, days }: WeeklyModuleStatsProps) {

    if (loading) {
        return (
            <div aria-busy="true" aria-label="Loading weekly stats">
                <div className="skeleton-shimmer h-[11px] w-20 rounded mb-3" />
                <div className="flex items-end gap-2" style={{ height: 110 }}>
                    {Array.from({ length: 7 }).map((_, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1.5" style={{ height: '100%' }}>
                            <div className="skeleton-shimmer w-full rounded-sm" style={{ height: 20 + (i % 3) * 15 }} />
                            <div className="skeleton-shimmer h-2.5 w-3 rounded" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!days || days.length === 0) {
        return (
            <div>
                <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-white/80 mb-3">
                    This week
                </p>
                <div className="flex items-center justify-center text-sm text-white/50" style={{ height: 110 }}>
                    No activity in the last 7 days
                </div>
            </div>
        );
    }

    const today = moment().format('YYYYMMDD');
    const stacks = computeWeeklyBarStacks(days);

    return (
        <div className="flex-1 flex flex-col items-stretch">
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-white/80 mb-3">
                This week
            </p>

            <div className="flex flex-1 items-end gap-2" style={{ height: 110 }}>
                {days.map((day, i) => {
                    const isToday = day.date === today;
                    const stack = stacks[i];
                    const dayLabel = moment(day.date, 'YYYYMMDD').format('dd').charAt(0);
                    const ariaLabel = `${dayLabel}: ${stack.total} activit${stack.total !== 1 ? 'ies' : 'y'} `
                        + `(${day.practiceSessions} practice session${day.practiceSessions !== 1 ? 's' : ''}, `
                        + `${day.successfulModuleTests} module test${day.successfulModuleTests !== 1 ? 's' : ''}, `
                        + `${day.successfulLevelTests} level test${day.successfulLevelTests !== 1 ? 's' : ''})`;

                    return (
                        <div key={day.date} className="flex-1 flex flex-col items-center justify-end" style={{ height: '100%' }}>
                            {stack.total > 0 && (
                                <span className={`text-[10px] font-bold mb-1 ${isToday ? 'text-lime-200' : 'text-cyan-200'}`} aria-hidden="true">
                                    {stack.total}
                                </span>
                            )}
                            {stack.total > 0 ? (
                                <div className="w-full flex flex-col justify-end" role="img" aria-label={ariaLabel} style={{ height: stack.barHeight }}>
                                    {stack.levelTestHeight > 0 && (
                                        <div
                                            className={`w-full ${isToday ? 'bg-lime-400' : 'bg-cyan-400'} ${stack.moduleTestHeight === 0 && stack.practiceHeight === 0 ? 'rounded-sm' : 'rounded-t-sm'}`}
                                            style={{ height: stack.levelTestHeight }}
                                        />
                                    )}
                                    {stack.moduleTestHeight > 0 && (
                                        <div
                                            className={`w-full ${isToday ? 'bg-lime-300' : 'bg-cyan-600'} ${stack.levelTestHeight === 0 && stack.practiceHeight === 0 ? 'rounded-sm' : stack.levelTestHeight === 0 ? 'rounded-t-sm' : stack.practiceHeight === 0 ? 'rounded-b-sm' : ''}`}
                                            style={{ height: stack.moduleTestHeight }}
                                        />
                                    )}
                                    {stack.practiceHeight > 0 && (
                                        <div
                                            className={`w-full ${isToday ? 'bg-lime-200' : 'bg-cyan-800'} ${stack.moduleTestHeight === 0 && stack.levelTestHeight === 0 ? 'rounded-sm' : 'rounded-b-sm'}`}
                                            style={{ height: stack.practiceHeight }}
                                        />
                                    )}
                                </div>
                            ) : (
                                <div
                                    className="w-full rounded-sm bg-cyan-800/40"
                                    style={{ height: 2 }}
                                    role="img"
                                    aria-label={`${dayLabel}: no activity`}
                                />
                            )}
                            <span className={`text-[10px] mt-1.5 ${isToday ? 'text-lime-200 font-bold' : 'text-white/85'}`}>
                                {dayLabel}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
