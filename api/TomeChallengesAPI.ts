import { TotoAPI } from "./TotoAPI";

export class TomeChallengesAPI {

    /**
     * Retrieves the list of challenges available for the Topic. 
     */
    async getTopicChallenges(topicId: string): Promise<GetTopicChallengesResponse> {
        return (await new TotoAPI().fetch('tome-ms-challenges', `/topics/${topicId}/challenges`)).json()
    }

}

export interface GetTopicChallengesResponse {
    challenges: Challenge[];
}

export interface Challenge {
    type: string;
    context: string;
    topicId: string;
    topicCode: string;
    sectionCode: string;
    name: string;
    description: string;
}

export interface JuiceChallenge {

    type: string;
    context: string;
    topicId: string;
    topicCode: string;
    sectionCode: string; 
    toRemember: ToRemember[];

}

interface ToRemember {
    toRemember: string;
    date?: SplitDate | null;
}

interface SplitDate {
    day: number | null;
    month: number | null;
    year: number | null;
}