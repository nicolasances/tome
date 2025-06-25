import { PracticeType } from "@/model/PracticeType";
import { TotoAPI } from "./TotoAPI";
import { PracticeFlashcard } from "@/model/PracticeFlashcard";
import { Practice } from "@/model/Practice";

export class TomePracticeAPI {

    /**
     * Starts a practice
     */
    async startPractice(topicId: string, type: PracticeType): Promise<StartPracticeResponse | TotoError> {

        return (await new TotoAPI().fetch('tome-ms-practice', `/practices`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                topicId,
                type
            })
        })).json()

    }

    /**
     * Returns the flashcards for a practice
     * 
     * @param practiceId the id of the practice to get the flashcards for
     * @returns the flashcards for the practice
     */
    async getPracticeFlashcards(practiceId: string): Promise<GetPracticeFlashcardsResponse> {
        return (await new TotoAPI().fetch('tome-ms-practice', `/practices/${practiceId}/flashcards`)).json()
    }

    /**
     * Returns the ongoing practice for a topic
     * 
     * @param topicId the id of the topic to get the ongoing practice for
     * @returns the ongoing practice for the topic
     */
    async getOngoingPractice(topicId: string): Promise<Practice> {
        return (await new TotoAPI().fetch('tome-ms-practice', `/practices/ongoing?topicId=${topicId}`)).json()
    }

    /**
     * Posts the answer to a flashcard
     */
    async answerFlashcard(practiceId: string, flashcardId: string, selectedAnswerIndex: number): Promise<AnswerFlashcardResponse> {

        return (await new TotoAPI().fetch('tome-ms-practice', `/practices/${practiceId}/flashcards/${flashcardId}/answer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ selectedAnswerIndex})
        })).json()

    }


}

interface AnswerFlashcardResponse {
    isCorrect: boolean;
    finished: boolean;
    score?: number; // score has a value only if finished
}

interface StartPracticeResponse {

    practiceId: string;
    flashcardsInsertedCount: number;

}

interface GetPracticeFlashcardsResponse {
    flashcards: PracticeFlashcard[]
}

interface TotoError {
    code: number
    message: string 
    subcode: string
}