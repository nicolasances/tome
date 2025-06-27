
import { Practice } from "@/model/Practice";
import moment from "moment";
import React from "react";
import * as d3 from "d3";
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '../../tailwind.config';

const fullConfig = resolveConfig(tailwindConfig);
const twColors = fullConfig.theme.colors;

/**
 * This component shows a view of the week, with each day showing if a practice has been done. 
 * 
 * Display indications
 * --------------------------
 * Each day is represented by a bar in a bar chart. 
 * There are NO AXES displayed, only the bars. 
 * The magnitude of the bar is the average score of the day's practices. 
 * Below the bar, there's the day of the week (M, T, W, T, F, S, S).
 * Inside of the bar, on the bottom part, there's the number of practices done for that day.
 * 
 * The component uses D3.js to create a bar chart representation of the week practices.
 * 
 */
const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

export function WeekPractices({ weekPractices }: { weekPractices: WeekPractice[] }) {

    // Chart dimensions
    const width = 350;
    const height = 300;
    const margin = { top: 10, right: 10, bottom: 30, left: 10 };
    const barWidth = (width - margin.left - margin.right) / 7;
    const barMaxHeight = height - margin.top - margin.bottom - 20; // leave space for labels

    // D3 scale for bar heights (averageDayScore 0..1)
    const yScale = d3
        .scaleLinear()
        .domain([0, 100])
        .range([0, barMaxHeight]);

    return (
        <svg width={width} height={height}>

            {weekPractices.map((wp, i) => {

                const barHeight = yScale(wp.averageDayScore);
                const x = margin.left + i * barWidth;
                const y = height - margin.bottom - barHeight;

                return (
                    <g key={i} transform={`translate(${x},0)`}>
                        {/* Bar */}
                        <rect
                            x={0}
                            y={y}
                            width={barWidth * 0.7}
                            height={barHeight}
                            rx={4}
                            fill={twColors.cyan[700]}
                            style={{ transition: "all 0.3s" }}
                        />
                        {/* Number of practices inside bar, bottom-aligned */}
                        {wp.practicesDone > 0 && (
                            <text
                                x={barWidth * 0.35}
                                y={height - margin.bottom - 9}
                                textAnchor="middle"
                                fontSize={12}
                                fill={twColors.cyan[300]}
                                fontWeight="bold"
                                pointerEvents="none"
                                style={{ userSelect: "none" }}
                            >
                                {wp.practicesDone}
                            </text>
                        )}
                        {/* Day label below bar */}
                        <text
                            x={barWidth * 0.35}
                            y={height - 9}
                            textAnchor="middle"
                            fontSize={13}
                            fill="#222"
                            fontWeight="bold"
                            pointerEvents="none"
                            style={{ userSelect: "none" }}
                        >
                            {DAY_LABELS[i]}
                        </text>
                    </g>
                );
            })}
        </svg>
    );

}

export class WeekPractice {

    date: Date;
    practicesDone: number;
    averageDayScore: number;

    constructor(date: Date, practicesDone: number, averageDayScore: number) {
        this.date = date;
        this.practicesDone = practicesDone;
        this.averageDayScore = averageDayScore;
    }

    /**
     * Generates this week's view of practices from the history of practices.
     * Focuses only on the current week. Starts on Monday finishes on Sunday. 
     * 
     * @param history the history of practices
     * @returns an array of WeekPractice objects, one for each day of the week,
     */
    static generateWeekPracticeFromHistory(history: Practice[]): WeekPractice[] {

        const today = new Date();

        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Set to Monday

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Set to Sunday

        const weekPractices: WeekPractice[] = [];

        for (let i = 0; i < 7; i++) {

            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);

            const practicesDone = history.filter(practice => {

                // You can say that today you have practice if the practice started on the date or finished on the date. 
                const practiceDate = moment(practice.startedOn, "YYYYMMDD").toDate();
                const practiceEndDate = moment(practice.finishedOn, "YYYYMMDD").toDate();

                return (practiceDate.toDateString() === date.toDateString() || practiceEndDate.toDateString() === date.toDateString())

            });

            // Calculate the average score for that day. 
            const totalScore = practicesDone.reduce((acc, practice) => {
                return acc + (practice.score || 0); // Default to 0 if no score
            }, 0);
            const averageDayScore = practicesDone.length > 0 ? totalScore / practicesDone.length : 0;

            weekPractices.push(new WeekPractice(date, practicesDone.length, averageDayScore));
        }

        return weekPractices;
    }
}