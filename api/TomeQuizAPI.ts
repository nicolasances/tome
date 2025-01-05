import { QuizQuestion } from "@/model/QuizQuestion";
import { TotoAPI } from "./TotoAPI";
import { Topic } from "@/model/Topic";

const mockQuizId = '9898390129038190283'

export class TomeQuizAPI {

    /**
     * Fetches the quiz that is currently running. 
     * If no quiz is running, it will return nothing
     */
    async getRunningQuiz(): Promise<RunningQuiz | undefined> {

        return (await new TotoAPI().fetch('toto-ms-tome-agent', '/quizzes/running', null, true)).json()

    }

    /**
     * Fetches the quiz
     */
    async getQuiz(quizId: string): Promise<RunningQuiz> {

        return (await new TotoAPI().fetch('toto-ms-tome-agent', `/quizzes/${quizId}`, null, true)).json()

    }

    /**
     * Fetches the quiz questions
     */
    async getQuizQuestions(quizId: string): Promise<GetQuizQuestionsResponse> {

        return (await new TotoAPI().fetch('toto-ms-tome-agent', `/quizzes/${quizId}/questions`, null, true)).json()

    }

    /**
     * Starts a new quiz. 
     * This method will return an 400 error if a quiz already exsists
     * 
     * @returns the quiz id
     */
    async startQuiz(): Promise<{ quizId: string }> {

        return (await new TotoAPI().fetch('toto-ms-tome-agent', '/quizzes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({})
        }, true)).json()
    }

    /**
     * Retrieves the next question of the running quiz
     */
    async getNextQuestion(quizId: string): Promise<QuizQuestion> {

        return (await new TotoAPI().fetch('toto-ms-tome-agent', `/quizzes/${quizId}/questions/next`, null, true)).json()
    }

    /**
     * Sends the user's answer to the question
     * @param answer the answer to send
     */
    async sendAnswer(answer: QuizAnswer): Promise<AnswerRating> {

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

}

interface GetTopicsResponse {
    topics: Topic[]
}

export interface RunningQuiz {

    id: string,
    topic: string,
    section?: string,
    startedOn: string
    score: number,
    maxScore: number,   // e.g. 5, if the max achievable score is 5
    numQuestions: number,
    numQuestionsAnswered: number,

}

export class TomeQuizError {

    code: number
    msg: string
    reason?: string

    constructor(code: number, msg: string) {
        this.code = code
        this.msg = msg
    }
}

export interface QuizAnswer {

    questionId: string,
    answer: string
}

export interface AnswerRating {

    rating: number
    maxRating: number
    explanations: string
    detailedExplanations: string
    quizFinished: boolean
}

export interface GetQuizQuestionsResponse {
    questions: QuizQuestion[]
}