import { TotoAPI } from "./TotoAPI";

export class TomePointsAPI {

    /**
     * Get the total points for a specific day.
     * @param day The day to get the total points for (format: YYYYMMDD).
     * @returns A promise that resolves to the total points for the day.
     */
    async getDayTotalPoints(day: string): Promise<GetDayTotalPointsResponse> {
        return (await new TotoAPI().fetch('tome-ms-points', `/points/${day}/total`)).json()
    }

    async getDailyPoints(dayGte: string): Promise<GetDailyPointsResponse> {
        return (await new TotoAPI().fetch('tome-ms-points', `/points/daily-totals?dateGte=${dayGte}`)).json()
    }

    /**
     * Loads the user preferences.
     * @returns A promise that resolves to the user preferences.
     */
    async getUserPreferences(): Promise<{preferences: UserPreference[]}> {
        return (await new TotoAPI().fetch('tome-ms-points', `/preferences`)).json()
    }

}

interface GetDailyPointsResponse {
    dailyTotals: DailyTotal[];
}

interface DailyTotal {
    points: number;
    day: string;
}

interface UserPreference {
    user: string;
    code: PreferenceCode; 
    value: any;
}

type PreferenceCode = 'dailyPointsGoal' | 'weeklyPracticesGoal';

interface GetDayTotalPointsResponse {
    points: number,
    day: string
}