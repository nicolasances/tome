import LaureateSVG from "@/app/ui/graphics/icons/LaureateSVG";
import React from "react";


/**
 * This component shows the status of the daily goal for each day of the week (Monday to Sunday).
 * 
 * Each day of the week is represented by a circle. The style of the circle depends follows these rules: 
 * - The circle is progressively filled based on the completion status of the daily goal (number of accumulated points over daily goal in points for the user).
 * - The circle's border is dashed if the day is in the future (i.e., if the day is after the current date).
 * - The current day is marked with a dot (small filled circle) on top of the day circle
 * 
 * Daily circles are shown on the same row, distributed evenly to fill the window full width. 
 * 
 * Under each circle the day of the week is shown as a single letter (M, T, W, T, F, S, S). 
 */
type DayStatus = {
    points: number;
    goal: number;
};

type WeekDailyGoalsProps = {
    weekStatus: DayStatus[]; // Array of 7 elements, Monday to Sunday
};

const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];

function getCircleFill(points: number, goal: number) {
    if (goal === 0) return 0;
    return Math.min(points / goal, 1);
}

function isToday(dayIdx: number) {
    const today = new Date();
    // JS: Sunday=0, Monday=1, ..., Saturday=6
    // Our array: Monday=0, ..., Sunday=6
    let jsDay = today.getDay();
    jsDay = jsDay === 0 ? 6 : jsDay - 1;
    return dayIdx === jsDay;
}

function isFuture(dayIdx: number) {
    const today = new Date();
    let jsDay = today.getDay();
    jsDay = jsDay === 0 ? 6 : jsDay - 1;
    return dayIdx > jsDay;
}

export const WeekDailyGoals: React.FC<WeekDailyGoalsProps> = ({ weekStatus }) => {
    return (
        <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            {weekStatus.map((status, idx) => {

                const fill = getCircleFill(status.points, status.goal);
                const future = isFuture(idx);
                const today = isToday(idx);

                const radius = 16;
                const circumference = 2 * Math.PI * radius;
                const offset = circumference - fill * circumference;

                return (
                    <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                        <div className="relative flex" style={{ width: 40, height: 40 }}>
                            <svg width={40} height={40}>
                                <g transform="rotate(-90 20 20)">
                                    <circle
                                        cx={20}
                                        cy={20}
                                        r={radius}
                                        stroke={future ? "#bbb" : "#0891b2"}
                                        strokeWidth={2}
                                        strokeDasharray={future ? "4 2" : "0"}
                                        fill="var(--background)"
                                    />
                                    <circle
                                        cx={20}
                                        cy={20}
                                        r={radius}
                                        stroke="#d9f99d"
                                        strokeWidth={3}
                                        strokeDasharray={circumference}
                                        strokeDashoffset={offset}
                                        strokeLinecap="round"
                                        fill="none"
                                        style={{ transition: "stroke-dashoffset 0.3s" }}
                                    />
                                </g>
                            </svg>
                            {fill == 1 &&
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-4 fill-lime-200">
                                        <LaureateSVG />
                                    </div>
                                </div>
                            }
                            {today && (
                                <div
                                    style={{
                                        position: "absolute",
                                        top: -10,
                                        left: "50%",
                                        transform: "translateX(-50%)",
                                        width: 8,
                                        height: 8,
                                        borderRadius: "50%",
                                        background: "#d9f99d",
                                    }}
                                />
                            )}
                        </div>
                        <span className="text-sm" style={{ marginTop: 4, fontWeight: today ? "bold" : "normal" }}>{dayLabels[idx]}</span>
                    </div>
                );
            })}
        </div>
    );
};