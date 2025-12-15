import { Practice } from "@/model/Practice";
import moment from "moment";
import React from "react";
import * as d3 from "d3";

/**
 * This component shows a view of the week, with each day showing if a practice has been done. 
 * 
 * Display indications
 * --------------------------
 * Each day is represented by a circle.
 * The circle is bigger the more practices have been done for that day (with a maximum size).
 * The circle has a tick if at least one practice has been done for that day.
 * The circle is empty if no practice has been done for that day. The minimum size of the circle is 1/3 or the maximum size.
 * 
 * Organize the days of the week in a circle, starting from Monday and finishing on Sunday.
 */
const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

export function WeekPractices({ weekPractices }: { weekPractices: WeekPractice[] }) {
    const maxPractices = Math.max(...weekPractices.map(wp => wp.practicesDone), 1);
    const maxSize = 38;
    const minSize = 38;
    const radius = 100;
    const centerSize = radius * 2;
    const svgSize = (radius + maxSize) * 2;
    const center = svgSize / 2;

    // Calculate positions using d3
    const angles = d3.range(7).map(i => (2 * Math.PI / 7) * i - Math.PI / 2);
    const positions = angles.map(angle => ({
        x: center + radius * Math.cos(angle),
        y: center + radius * Math.sin(angle)
    }));
    const textPositions = angles.map(angle => ({
        tx: center + (radius - 42) * Math.cos(angle),
        ty: center + 6 + (radius - 42) * Math.sin(angle)
    }));


    return (
        <svg width={svgSize} height={svgSize} style={{ display: "block", margin: "0 auto" }}>
            {/* Center circle */}
            <circle
                cx={center}
                cy={center}
                r={centerSize / 2}
                fill="var(--background)"
                stroke="#d1d5db"
                strokeWidth={3}
            />
            {/* Days on perimeter */}
            {weekPractices.map((wp, i) => {

                let size = Math.round((wp.practicesDone / maxPractices) * maxSize);
                if (size < minSize) size = minSize;

                const isDone = wp.practicesDone > 0;
                const { x, y } = positions[i];
                const { tx, ty } = textPositions[i];

                return (
                    <g key={i}>
                        {/* Background circle */}
                        {/* {isDone && <circle cx={x} cy={y} r={size / 2 + 6} fill="var(--background)" stroke="#d1d5db" strokeWidth={1} />} */}
                        <circle
                            cx={x}
                            cy={y}
                            r={size / 2}
                            fill={"var(--background)"}
                            stroke="#d1d5db"
                            strokeWidth={2}
                        />
                        {/* Foreground arc proportional to averageDayScore */}
                        {isDone && wp.averageDayScore > 0 && (() => {
                            const score = wp.averageDayScore / 100;
                            const r = size / 2;
                            const circumference = 2 * Math.PI * r;
                            const arcLength = circumference * score;
                            return (
                                <circle
                                    cx={x}
                                    cy={y}
                                    r={r}
                                    fill={"var(--background)"}
                                    stroke="#bef264"
                                    strokeWidth={4}
                                    strokeDasharray={`${arcLength} ${circumference - arcLength}`}
                                    strokeDashoffset={circumference * 0.25}
                                    style={{ transition: "stroke-dasharray 0.3s" }}
                                />
                            );
                        })()}
                        {/* Score text */}
                        {isDone && (
                            <text
                                x={x}
                                y={y + 5}
                                textAnchor="middle"
                                fontSize={14}
                                fill="#bef264"
                                fontWeight="bold"
                                pointerEvents="none"
                            >
                                {wp.averageDayScore.toFixed(0)}
                            </text>
                        )}
                        {/* Day label */}
                        <text
                            x={tx}
                            y={ty}
                            textAnchor="middle"
                            fontSize={10}
                            fill="#d1d5db"
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