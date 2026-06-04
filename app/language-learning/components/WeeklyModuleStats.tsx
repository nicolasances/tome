'use client';

import moment from 'moment';
import { WeeklyStatDay } from '@/api/TomeLearningDashboardAPI';

interface WeeklyModuleStatsProps {
    /** Seven entries for Mon–Sun; days with no completions have count: 0. */
    days: WeeklyStatDay[];
}

/**
 * 7-day bar chart (Mon–Sun) showing sessions completed per day.
 * Day labels are derived from the date field.
 * Today's bar is highlighted with lime-200 accent.
 * Bars scale relative to the day with the highest count.
 */
export function WeeklyModuleStats({ days }: WeeklyModuleStatsProps) {
    const today = moment().format('YYYYMMDD');
    const maxCount = Math.max(...days.map((d) => d.count), 1);

    return (
        <div>
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-white/80 mb-3">
                This week
            </p>

            <div className="flex items-end gap-2" style={{ height: 110 }}>
                {days.map((day) => {
                    const isToday = day.date === today;
                    const barHeight =
                        day.count > 0
                            ? Math.max((day.count / maxCount) * 84, 8) // min 8 px for visible bars
                            : 2; // hairline for zero days

                    const dayLabel = moment(day.date, 'YYYYMMDD').format('dd').charAt(0);

                    return (
                        <div
                            key={day.date}
                            className="flex-1 flex flex-col items-center justify-end"
                            style={{ height: '100%' }}
                        >
                            {/* Count label (only when > 0) */}
                            {day.count > 0 && (
                                <span
                                    className={`text-[10px] font-bold mb-1 ${
                                        isToday ? 'text-lime-200' : 'text-cyan-200'
                                    }`}
                                    aria-hidden="true"
                                >
                                    {day.count}
                                </span>
                            )}

                            {/* Bar */}
                            <div
                                className={`w-full rounded-sm ${
                                    isToday
                                        ? 'bg-lime-200'
                                        : day.count > 0
                                        ? 'bg-cyan-800'
                                        : 'bg-cyan-800/40'
                                }`}
                                style={{ height: barHeight }}
                                role="img"
                                aria-label={`${dayLabel}: ${day.count} session${day.count !== 1 ? 's' : ''} completed`}
                            />

                            {/* Day label */}
                            <span
                                className={`text-[10px] mt-1.5 ${
                                    isToday ? 'text-lime-200 font-bold' : 'text-white/85'
                                }`}
                            >
                                {dayLabel}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
