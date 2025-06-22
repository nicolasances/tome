import { TotoAPI } from "./TotoAPI";

export class TomeFlashcardsAPI {

    /**
     * Fetches the flash cards for the specified topic 
     */
    async getFlashCards(topicId: string): Promise<GetFlashCardsResponse> {

        return (await new TotoAPI().fetch('tome-ms-flashcards', `/flashcards?topicId=${topicId}`, null)).json()

    }


}

export interface FlashCard {
    question: string;
    options: string[];
    rightAnswerIndex: number;
    tag: string;
}

export interface GetFlashCardsResponse {
    flashcards: FlashCard[];
}
