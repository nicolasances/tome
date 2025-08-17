import { TomePracticeAPI } from "@/api/TomePracticeAPI";
import { Practice } from "@/model/Practice";
import moment from "moment";
import { useEffect, useState } from "react";
import WeekSquare from "./WeekSquare";

export function WeeklyPractices() {

    const [weeksPractices, setWeeksPractices] = useState<WeekPractices[]>([]);

    const loadData = async () => {

        // Load the practices for the current week
        const beginningOfTheWeek = new Date();
        if (new Date().getDay() === 0) beginningOfTheWeek.setDate(new Date().getDate() - 6);
        else beginningOfTheWeek.setDate(beginningOfTheWeek.getDate() - beginningOfTheWeek.getDay() + 1); // Set to Monday

        // We start looking weeksDepth weeks ago
        const weeksDepth = 4;

        // Calculate the beginning of the period: the Monday of weeksDepth weeks ago => weeksDepth + this week
        const beginningOfPeriod = moment(beginningOfTheWeek).subtract(weeksDepth, "weeks").isoWeekday(1).startOf("isoWeek");

        const result = await new TomePracticeAPI().getPractices({ finishedFrom: beginningOfPeriod.format("YYYYMMDD") })

        // Create a list of all the weeks weeksDepth + 1 weeks ago
        const weeks = [];
        for (let i = 0; i <= weeksDepth; i++) {
            weeks.push(moment(beginningOfPeriod).add(i, "weeks").isoWeekday(1).startOf("isoWeek").format("YYYY-MM-DD"));
        }

        // Get the weeks pratices
        const wp = WeekPractices.generateWeekPracticeFromHistory(result.practices);

        // For all the weeks in "weeks" create an empty WeekPractices if it can't be found in wp
        // The result is a list of all the weeks with their practices
        const allWeeksPractices = weeks.map(week => {
            const practices = wp.find(wp => wp.week === week)?.practices || [];
            return new WeekPractices(week, practices);
        });

        setWeeksPractices(allWeeksPractices);
    }

    useEffect(() => {
        loadData();
    }, []);

    return (
        <div className="flex items-center w-full justify-evenly">
            {weeksPractices.map(weekPractice => (
                <div key={weekPractice.week} className="flex flex-col items-center">
                    <WeekSquare filled={weekPractice.successDays} />
                    <div className="text-sm mt-1">{moment(weekPractice.week).format("DD.MM")}</div>
                </div>
            ))}
        </div>
    )
}

class WeekPractices {

    week: string;
    practices: Practice[];
    successDays: boolean[]; // Array of 7 booleans, 0 for Monday, 7 for Sunday, where true indicates that that day there was a practice that had been completed.

    constructor(week: string, practices: Practice[]) {
        this.week = week;
        this.practices = practices;
        this.successDays = this.calculateSuccessDays();
    }

    private calculateSuccessDays(): boolean[] {
        const successDays = Array(7).fill(false);
        this.practices.forEach(practice => {
            const day = moment(practice.finishedOn).isoWeekday() - 1; // 0 for Monday, 6 for Sunday
            if (day >= 0 && day < 7) {
                successDays[day] = true;
            }
        });
        return successDays;
    }

    static generateWeekPracticeFromHistory(history: Practice[]): WeekPractices[] {
        // Group practices by week
        const groupedByWeek: { [key: string]: Practice[] } = {};
        history.forEach(practice => {
            const week = moment(practice.finishedOn).isoWeekday(1).startOf("isoWeek").format("YYYY-MM-DD");
            if (!groupedByWeek[week]) {
                groupedByWeek[week] = [];
            }
            groupedByWeek[week].push(practice);
        });

        // Create WeekPractices instances
        const weekPractices = Object.entries(groupedByWeek).map(([week, practices]) => {
            return new WeekPractices(week, practices);
        });

        return weekPractices;
    }
}