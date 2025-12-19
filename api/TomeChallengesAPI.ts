import { TotoAPI } from "./TotoAPI";

export class TomeChallengesAPI {

    name: "tome-ms-challenges" = "tome-ms-challenges";

    /**
     * Retrieves the list of challenges available for the Topic. 
     */
    async getTopicChallenges(topicId: string): Promise<GetTopicChallengesResponse> {
        return (await new TotoAPI().fetch(this.name, `/topics/${topicId}/challenges`)).json()
    }

    /**
     * Retrieves a specific challenge by its id
     * 
     * @param challengeId 
     * @returns 
     */
    async getChallenge(challengeId: string): Promise<Challenge | JuiceChallenge> {
        return (await new TotoAPI().fetch(this.name, `/challenges/${challengeId}`)).json()
    }

    /**
     * Retrieves a trial
     * 
     * @param trialId the id of the trial
     * @returns 
     */
    async getTrial(trialId: string): Promise<GetTrialResponse> {
        return (await new TotoAPI().fetch(this.name, `/trials/${trialId}`)).json()
    }

    /**
     * Starts or resumes a trial on the given challenge.
     * 
     * @param challengeId the id of the challenge
     */
    async startOrResumeTrial(challengeId: string): Promise<{ id: string }> {

        return (await new TotoAPI().fetch('tome-ms-challenges', `/trials`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ challengeId })
        })).json()

    }

}

export interface GetTopicChallengesResponse {
    challenges: Challenge[];
}

export interface GetTrialResponse {
    trial: Trial
}
export interface Trial {
    id: string;
    challengeId: string;
}

export interface Challenge {
    id: string;
    type: string;
    code: string;
    context: string;
    topicId: string;
    topicCode: string;
    sectionIndex: number;
    sectionCode: string;
    name: string;
    description: string;
}

export interface JuiceChallenge {
    id?: string;
    type: string;
    code: string;
    context: string;
    topicId: string;
    topicCode: string;
    sectionIndex: number;
    sectionCode: string;
    toRemember: ToRemember[];
    tests: TomeTest[];
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

interface TomeTest {
    type: string;
    testId: string;
    question: string;
    correctAnswer?: any;
}
