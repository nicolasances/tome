import { TotoAPI } from "./TotoAPI";

export class TomeFlashcardsAPI {

    /**
     * Fetches the flash cards for the specified topic 
     */
    async getFlashCards(topicId: string): Promise<GetFlashCardsResponse> {

        return (await new TotoAPI().fetch('tome-ms-flashcards', `/flashcards?topicId=${topicId}`, null)).json()

    }

    async getLatestFlashcardsGeneration(): Promise<{latestGeneration: string}> {

        return (await new TotoAPI().fetch('tome-ms-flashcards', `/generation/latest`, null)).json()

    }

}

export interface SectionTimelineFlashcard {
    id?: string;
    type: string;
    user: string;
    topicId: string;
    topicCode: string;
    sectionCode: string;
    sectionIndex: number;
    sectionTitle: string;
    sectionShortTitle: string;
    events: SectionTimelineEvent[];
}

export interface SectionTimelineEvent {

    event: string;
    date: string;
    dateFormat: string;
    correctIndex: number;

}

export interface MultipleOptionsFlashcard {
    id?: string;
    type: string;
    question: string;
    options: string[];
    rightAnswerIndex: number;
    tag: string;
    sectionTitle: string;
    sectionShortTitle: string;
    sectionCode: string;
    sectionIndex: number;
}

export interface DateFlashcard {
    id?: string
    type: string;
    user: string
    topicId: string
    topicCode: string;
    sectionCode: string;
    sectionIndex: number;
    sectionTitle: string;
    sectionShortTitle: string;

    question: string;
    correctYear: number;

}

export interface GetFlashCardsResponse {
    sectionTimelineFlascards: SectionTimelineFlashcard[];
    multipleOptionsFlashcards: MultipleOptionsFlashcard[];
}
