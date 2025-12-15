import { TomePointsAPI } from "@/api/TomePointsAPI";
import { TomePracticeAPI } from "@/api/TomePracticeAPI";
import LaureateSVG from "@/app/ui/graphics/icons/LaureateSVG";
import moment from "moment";
import React, { useEffect } from "react";


/**
 * Component WeeklyPracticeGoal. 
 * 
 * This component displays in a row the following: 
 * - N rectangles (each representing a practice) where N is a parameter representing the weekly goal in terms of number of practices. 
 * - A circle at the end that is initially greyed out and that highlights when all practices are completed.
 * 
 * Instructions: 
 * - Each rectangle has a transparent background and a dashed, greyed-out border if the corresponding practice is not completed.
 * - Each rectangle becomes filled with a color (e.g. green) when the corresponding practice is completed.
 * 
 * Implementation Details:
 * - The component should accept a prop for the number of practices and the number of completed practices. 
 * - The rectangles can be implemented using div elements styled with CSS.
 * - The circle is a div element styled to look like a circle.
 * 
 * Use tailwind. 
 */

export default function WeeklyPracticeGoal() {

    const [weeklyPracticesGoal, setWeeklyPracticesGoal] = React.useState<number | null>(null);
    const [completedPractices, setCompletedPractices] = React.useState<number>(0);

    const beginningOfWeek = moment().startOf("isoWeek").format("YYYYMMDD");

    const init = async () => {
        loadGoal();
        loadWeekPractices();
    }

    const loadWeekPractices = async () => {
        
        const result = await new TomePracticeAPI().getPractices({ finishedFrom: beginningOfWeek })

        setCompletedPractices(result.practices.length);
        
    }

    const loadGoal = async () => {

        const pref = await new TomePointsAPI().getUserPreferences();

        const weeklyPracticesGoal = pref.preferences.find((p) => p.code === 'weeklyPracticesGoal')?.value ?? 3

        setWeeklyPracticesGoal(weeklyPracticesGoal);

    }

    useEffect(() => { init() }, []);

    if (!weeklyPracticesGoal) return <></>

    return (
        <div className="">
            <div className="text-base text-center opacity-60">Weekly Practice Goal</div>
            <div className="flex items-center space-x-2 w-full">
                {Array.from({ length: weeklyPracticesGoal }).map((_, idx) => (
                    <div key={idx}
                        className={`w-8 h-4 flex-1 rounded border text-center text-sm ${idx < completedPractices
                            ? "bg-lime-200 border-lime-200 border-solid text-lime-600"
                            : "bg-transparent border-dashed border-cyan-600 text-cyan-700"
                            }`}
                    >
                        {idx + 1}
                    </div>
                ))}
                <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ml-4 border-2 ${completedPractices >= weeklyPracticesGoal
                        ? "border-lime-200 border-[3px]"
                        : "border-cyan-600"
                        }`}
                >
                    {/* Optionally, you can add a checkmark or icon here when completed */}
                    {completedPractices >= weeklyPracticesGoal && <div className="fill-lime-200 w-4"><LaureateSVG/></div>}
                </div>
            </div>
        </div>
    );
};
