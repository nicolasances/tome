import { TotoAPI } from "./TotoAPI";

export class TomeChallengesAPI {

    name: "tome-ms-challenges" = "tome-ms-challenges";

    /**
     * Retrieves all challenges, with their status
     * @returns 
     */
    async getChallenges(): Promise<{ challenges: {challenge: Challenge, status: "not-started" | "in-progress" | "completed"} }> {
        return (await new TotoAPI().fetch(this.name, `/challenges?includeStatus=true`)).json()
    }

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
    async getChallenge(challengeId: string): Promise<GetChallengeResponse> {
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
     * Retrieves the non-expired trials for the given topic and challenge code
     * E.g. Retrieves all non-expired trials for challenge code "juice" on topic 984092384908209384
     * 
     * @param topicId the DB Id of the topic
     * @param challengeCode the challenge code (e.g. "juice")
     * 
     * @returns all the non-expired trials for the given topic and challenge code
     */
    async getNonExpiredTrialsOnChallenge(topicId: string, challengeCode: string): Promise<{ trials: Trial[] }> {
        return (await new TotoAPI().fetch(this.name, `/trials?topicId=${topicId}&challengeCode=${challengeCode}`)).json()
    }

    /**
     * Retrievs the non-expired trials for the given topic, for all challenges (regardless of challenge code)
     * 
     * @param topicId the DB Id of the topic
     * @returns 
     */
    async getNonExpiredTrialsOnTopic(topicId: string): Promise<{ trials: Trial[] }> {
        return (await new TotoAPI().fetch(this.name, `/trials?topicId=${topicId}`)).json()
    }

    /**
     * Delete a trial by its id
     * @param trialId 
     */
    async deleteTrial(trialId: string): Promise<void> {

        await new TotoAPI().fetch(this.name, `/trials/${trialId}`, {
            method: 'DELETE'
        });
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

    /**
     * Posts a trial answer
     * @param trialId 
     * @param test the Tome Test for which the answer is given
     * @param answer the user answer
     * @returns 
     */
    async postTrialAnswer(trialId: string, test: TomeTest, answer: any): Promise<{ score: number }> {

        return (await new TotoAPI().fetch('tome-ms-challenges', `/trials/${trialId}/answers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ test, answer })
        })).json()

    }

}

export interface GetChallengeResponse {
    challenge: Challenge;
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
    startedOn: Date;
    completedOn?: Date;
    expiresOn: Date;    // The date when the trial's results expire. This is typically defined at a challenge level, and tracked in the trial for convenience, but also for tracking and ML.
    score?: number;
    
    answers?: TestAnswer[];
}
export interface TestAnswer {
    testId: string; 
    answer: any;
    score: number;
    details?: any;
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
    tests: TomeTest[];
    status?: "not-started" | "in-progress" | "completed";
}

export interface JuiceChallenge extends Challenge {
    id: string;
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

export interface ToRemember {
    toRemember: string;
    date?: SplitDate | null;
}

export interface SplitDate {
    day: number | null;
    month: number | null;
    year: number | null;
}

export interface TomeTest {
    type: string;
    testId: string;
    question: string;
    correctAnswer?: any;
    score?: number;
}
