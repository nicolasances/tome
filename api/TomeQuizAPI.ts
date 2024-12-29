import { TotoAPI } from "./TotoAPI";

const mockQuizId = '9898390129038190283'

export class TomeQuizAPI {

    /**
     * Fetches the quiz that is currently running. 
     * If no quiz is running, it will return nothing
     */
    async getRunningQuiz(): Promise<RunningQuiz | TomeQuizError | undefined> {

        return undefined;

        // return { id: mockQuizId, score: 3.5, maxScore: 5, questions: 5, maxQuestions: 10, topic: "Crusades" }

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
    async getNextQuestion(): Promise<QuizQuestion> {

        return {
            id: '897asd9a789s7d89a7sd',
            question: 'How was Jerusalem conquered by the Crusaders for the first time and in which year did that happen?'
        }

    }

    /**
     * Sends the user's answer to the question
     * @param answer the answer to send
     */
    async sendAnswer(answer: QuizAnswer): Promise<AnswerRating> {

        return {
            questionId: '98as90d8a90s8d90a8sd',
            answerId: 'as8d79a8s7d98a7sd',
            rating: {
                score: 2,
                maxScore: 5,
                explanation: `You're mostly correct! The Crusaders did indeed refuse al-Afdal’s offer, stating they would enter Jerusalem by force. The key point is that they were deeply motivated by religious fervor and saw the conquest of Jerusalem as a divine mission. Their commitment to reclaiming Jerusalem "in arms" was fueled by the belief that it was a holy task, and they were unwilling to settle for anything less than outright control of the city. Nice job! Just a bit more detail about their religious motivations would have made your answer even more complete. Keep it up!`
            }
        }

    }

}

export interface RunningQuiz {

    id: string,
    score: number,
    maxScore: number,   // e.g. 5, if the max achievable score is 5
    questions: number,
    maxQuestions: number,
    topic?: string

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

export interface QuizQuestion {

    id: string,
    question: string

}

export interface QuizAnswer {

    questionId: string,
    answer: string
}

export interface AnswerRating {

    questionId: string,
    answerId: string,
    rating: {
        score: number,
        maxScore: number,
        explanation: string
    }
}