'use client';

import moment from 'moment';
import { DailyActivityDay } from '@/api/TomeLearningDashboardAPI';

interface WeeklyModuleStatsProps {
    loading?: boolean;
    /** Seven entries for the rolling 7-day window (oldest → today); days with no sessions have practiceSessions: 0. */
    days?: DailyActivityDay[];
}

/**
 * 7-day bar chart showing practice sessions completed per day over a rolling window (oldest → today).
 * Handles its own loading (skeleton) and empty states via props.
 * Day labels are derived from the date field.
 * Today's bar is highlighted with lime-200 accent.
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
    const maxCount = Math.max(...days.map((d) => d.practiceSessions), 1);

    return (
        <div>
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-white/80 mb-3">
                This week
            </p>

            <div className="flex items-end gap-2" style={{ height: 110 }}>
                {days.map((day) => {
                    const isToday = day.date === today;
                    const barHeight = day.practiceSessions > 0
                        ? Math.max((day.practiceSessions / maxCount) * 84, 8)
                        : 2;
                    const dayLabel = moment(day.date, 'YYYYMMDD').format('dd').charAt(0);

                    return (
                        <div key={day.date} className="flex-1 flex flex-col items-center justify-end" style={{ height: '100%' }}>
                            {day.practiceSessions > 0 && (
                                <span className={`text-[10px] font-bold mb-1 ${isToday ? 'text-lime-200' : 'text-cyan-200'}`} aria-hidden="true">
                                    {day.practiceSessions}
                                </span>
                            )}
                            <div
                                className={`w-full rounded-sm ${isToday ? 'bg-lime-200' : day.practiceSessions > 0 ? 'bg-cyan-800' : 'bg-cyan-800/40'}`}
                                style={{ height: barHeight }}
                                role="img"
                                aria-label={`${dayLabel}: ${day.practiceSessions} session${day.practiceSessions !== 1 ? 's' : ''} completed`}
                            />
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
