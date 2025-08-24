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

}

interface GetDayTotalPointsResponse {
    points: number,
    day: string
}