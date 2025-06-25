import { PracticeType } from "./PracticeType";

export interface Practice {
    id?: string;
    user: string;
    topicId: string;
    type: PracticeType;
    startedOn: string; // YYYYMMDD
    finishedOn?: string; // YYYYMMDD
    score?: number; // Percentage
}