import { TopicReviewQuestion } from "@/model/questions";
import { TotoAPI } from "./TotoAPI";
import { Answer, AnswerRating } from "@/model/answer";
import { TopicReview } from "@/model/topicReview";
import { Topic } from "@/model/Topic";

export class TomeAPI {

    /**
     * Fetches the topic review that is currently running. 
     * If no topic review is running, it will return nothing
     */
    async getRunningTopicReview(): Promise<TopicReview | undefined> {

        return (await new TotoAPI().fetch('toto-ms-tome-agent', '/topicreviews/running', null, true)).json()

    }

    /**
     * Fetches the topic review
     */
    async getTopicReview(topicReviewId: string): Promise<GetTopicReviewResponse> {

        return (await new TotoAPI().fetch('toto-ms-tome-agent', `/topicreviews/${topicReviewId}`, null, true)).json()

    }

    /**
     * Fetches the topic review questions
     */
    async getTopicReviewQuestions(tropicReviewId: string): Promise<GetTRQuestionsResponse> {

        return (await new TotoAPI().fetch('toto-ms-tome-agent', `/topicreviews/${tropicReviewId}/questions`, null, true)).json()

    }

    /**
     * Starts a new topic review. 
     * This method will return an 400 error if a topic review already exsists
     * 
     * @returns the topic review id
     */
    async startTopicReview(): Promise<StartTopicReviewResponse> {

        return (await new TotoAPI().fetch('toto-ms-tome-agent', '/topicreviews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({})
        }, true)).json()
    }

    /**
     * Retrieves the next question of the running TR
     */
    async getNextQuestion(topicReviewId: string): Promise<TopicReviewQuestion> {

        return (await new TotoAPI().fetch('toto-ms-tome-agent', `/topicreviews/${topicReviewId}/questions/next`, null, true)).json()
    }

    /**
     * Sends the user's answer to the question
     * @param answer the answer to send
     */
    async sendAnswer(answer: Answer): Promise<AnswerRating> {

        return (await new TotoAPI().fetch('toto-ms-tome-agent', '/answers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(answer)
        }, true)).json()

    }

    /**
     * Get Topics
     */
    async getTopics(): Promise<GetTopicsResponse> {

        return (await new TotoAPI().fetch('toto-ms-tome-agent', `/topics`, null, true)).json()

    }

    /**
     * Posts a new topic
     */
    async postTopic(blogUrl: string): Promise<PostTopicResponse> {

        return (await new TotoAPI().fetch('toto-ms-tome-scraper', '/blogs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                blogURL: blogUrl,
                blogType: 'craft'
            })
        }, true)).json()

    }

}

export interface GetTopicsResponse {
    topics: Topic[]
}

export interface PostTopicResponse {}

export interface GetTRQuestionsResponse {
    questions: TopicReviewQuestion[]
}

export interface StartTopicReviewResponse {
    topicReview: TopicReview
}

export interface GetTopicReviewResponse {
    topicReview: TopicReview
    questions: TopicReviewQuestion[]
}