'use client';

import moment from 'moment';
import { DailyActivityDay } from '@/api/TomeLearningDashboardAPI';
import { computeWeeklyBarStacks } from '@/utils/weeklyBarStack';

interface WeeklyModuleStatsProps {
    loading?: boolean;
    /** Seven entries for the rolling 7-day window (oldest → today); days with no sessions have all counts 0. */
    days?: DailyActivityDay[];
}

/** Rounds the outer corners of the stack: top segment gets a rounded top, bottom a rounded bottom, a lone segment both. Segments are listed top → bottom. */
function segmentRounding(index: number, count: number) {
    if (count === 1) return 'rounded-sm';
    if (index === 0) return 'rounded-t-sm';
    if (index === count - 1) return 'rounded-b-sm';
    return '';
}

/**
 * 7-day stacked bar chart over a rolling window (oldest → today): each bar stacks
 * practice sessions (bottom), Words Practice sessions, module tests passed and
 * level tests passed (top), sized to the day's share of activity relative to the busiest day in the window.
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
                    const segments = [
                        { key: 'levelTest', height: stack.levelTestHeight, color: 'bg-cyan-400', todayColor: 'bg-lime-400' },
                        { key: 'moduleTest', height: stack.moduleTestHeight, color: 'bg-cyan-600', todayColor: 'bg-lime-300' },
                        { key: 'wordsPractice', height: stack.wordsPracticeHeight, color: 'bg-cyan-800', todayColor: 'bg-lime-800' },
                        { key: 'practice', height: stack.practiceHeight, color: 'bg-cyan-800', todayColor: 'bg-lime-100' },
                    ].filter((segment) => segment.height > 0);
                    const ariaLabel = `${dayLabel}: ${stack.total} activit${stack.total !== 1 ? 'ies' : 'y'} `
                        + `(${day.practiceSessions} practice session${day.practiceSessions !== 1 ? 's' : ''}, `
                        + `${day.wordsPracticeSessions} words practice session${day.wordsPracticeSessions !== 1 ? 's' : ''}, `
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
                                    {segments.map((segment, s) => (
                                        <div
                                            key={segment.key}
                                            className={`w-full ${isToday ? segment.todayColor : segment.color} ${segmentRounding(s, segments.length)}`}
                                            style={{ height: segment.height }}
                                        />
                                    ))}
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
