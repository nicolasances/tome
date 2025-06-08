import { TopicReviewQuestion } from "@/model/questions";
import { TotoAPI } from "./TotoAPI";
import { Answer, AnswerRating } from "@/model/answer";
import { Timeline, TimelineDate, TopicReview } from "@/model/topicReview";
import { Topic } from "@/model/Topic";

export class TomeAPI {

    /**
     * Fetches the topic review that is currently running. 
     * If no topic review is running, it will return nothing
     */
    async getRunningTopicReview(): Promise<GetTopicReviewResponse> {

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
     * Fetches the next topic review
     */
    async getNextTopicReview(): Promise<Topic> {

        return (await new TotoAPI().fetch('toto-ms-tome-agent', `/topicreviews/next`, null, true)).json()

    }

    /**
     * Starts a new topic review. 
     * This method will return an 400 error if a topic review already exsists
     * 
     * @returns the topic review id
     */
    async startTopicReview(topicCode: string): Promise<StartTopicReviewResponse> {

        return (await new TotoAPI().fetch('toto-ms-tome-agent', '/topicreviews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                topicCode: topicCode
            })
        }, true)).json()
    }

    /**
     * Retrieves the next question of the running TR
     */
    async getNextQuestion(topicReviewId: string): Promise<TopicReviewQuestion> {

        return (await new TotoAPI().fetch('toto-ms-tome-agent', `/topicreviews/${topicReviewId}/questions/next`, null, true)).json()
    }

    /**
     * Retrieves a specific question
     */
    async getQuestion(questionId: string): Promise<TopicReviewQuestion> {

        return (await new TotoAPI().fetch('toto-ms-tome-agent', `/topicreviews/questions/${questionId}`, null, true)).json()
    }

    /**
     * Provides a refresher for a given topic's section, based on a question and relative answer 
     * from the user. 
     */
    async getRefresher(questionId: string): Promise<GetRefresherResponse> {

        return (await new TotoAPI().fetch('toto-ms-tome-agent', `/topicreviews/questions/${questionId}/refresher`, null, true)).json()
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

        return {
            topics: [
                { title: 'The Bad Popes', code: 'bad-popes', description: 'A topic about the bad popes in history.', lastReviewedOn: '2023-10-01', flashcardsCount: 22, lastScore: 18/22, blog_url: '' },
                { title: 'History of Rome', code: 'history-of-rome', description: 'A topic about the history of Rome.', lastReviewedOn: '2023-10-02', flashcardsCount: 15, lastScore: 12/15, blog_url: '' },
                { title: 'Byzantine Empire', code: 'byzantine-empire', description: 'A topic about the Byzantine Empire.', lastReviewedOn: '2023-10-03', flashcardsCount: 30, lastScore: 25/30, blog_url: '' },
                { title: 'The Crusades', code: 'the-crusades', description: 'A topic about the Crusades.', lastReviewedOn: '2023-10-04', flashcardsCount: 18, lastScore: 15/18, blog_url: '' },
                { title: 'Charlemagne', code: 'charlemagne', description: 'A topic about Charlemagne and his empire.', lastReviewedOn: '2023-10-05', flashcardsCount: 20, lastScore: 17/20, blog_url: '' },
                { title: 'Cortes', code: 'cortes', description: 'A topic about Hernán Cortés and the conquest of the Aztec Empire.', lastReviewedOn: '2023-10-06', flashcardsCount: 25, lastScore: 20/25, blog_url: '' },
            ]
        }

        // return (await new TotoAPI().fetch('toto-ms-tome-agent', `/topics`, null, true)).json()

    }

    /**
     * Posts a new topic
     */
    async postTopic(blogUrl: string): Promise<PostTopicResponse> {
        try {
            const response = await new TotoAPI().fetch('toto-ms-tome-scraper', '/blogs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    blogURL: blogUrl,
                    blogType: 'craft'
                })
            }, true);
    
            if (!response.ok) {
                // Handle non-OK responses
                if (response.status === 504) {
                    throw new Error('Gateway Timeout: The server took too long to respond.');
                } else {
                    throw new Error(`Error: ${response.status} ${response.statusText}`);
                }
            }
    
            return await response.json();
        } catch (error) {
            console.error('Error posting topic:', error);
            throw error;
        }
    }

    /**
     * Fetches the mem levels
     */
    async getMemLevels(): Promise<GetMemLevelsResponse> {

        return (await new TotoAPI().fetch('toto-ms-tome-agent', '/memlevels', null, true)).json()

    }

}

export interface GetMemLevelsResponse {
    topics: TopicMemLevel[]
}

export interface TopicMemLevel {
    topicCode: string, 
    topicTitle: string, 
    memLevel: number, 
    lastReviewedOn: string, 
    lastRating: number
}
export interface GetTopicsResponse {
    topics: Topic[]
}

export interface PostTopicResponse {
    blogUrl: string
 }

export interface GetTRQuestionsResponse {
    questions: TopicReviewQuestion[]
}

export interface StartTopicReviewResponse {
    topicReview: TopicReview
}

export interface GetTopicReviewResponse {
    topicReview: TopicReview
    questions: TopicReviewQuestion[]
    timeline: TimelineDate[]
}

export interface GetRefresherResponse {
    topic: Topic
    refresher: string
}
