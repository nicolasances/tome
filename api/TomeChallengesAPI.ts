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
}