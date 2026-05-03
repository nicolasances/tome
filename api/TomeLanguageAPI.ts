import { TotoAPI } from "./TotoAPI";

export class TomeLanguageAPI {

    /**
     * Fetches the vocabulary for the specified language
     */
    async getVocabulary(language: string): Promise<GetVocabularyResponse> {
        return (await new TotoAPI().fetch('tome-ms-language', `/vocabulary/${language}`)).json();
    }

    /**
     * Fetches per-day completed session counts for the last N calendar days, inclusive today.
     * Days with no completed sessions have count: 0.
     */
    async getRollingStats(days = 7): Promise<{ days: Array<{ date: string; count: number }> }> {
        return (await new TotoAPI().fetch('tome-ms-language', `/sessions/stats/rolling?days=${days}`)).json();
    }

}

export interface Word {
    id: string;
    english: string;
    translation: string;
    createdAt: string;
    knowledgeSource: string;
}

export interface GetVocabularyResponse {
    language: string;
    words: Word[];
}
