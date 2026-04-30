import { TotoAPI } from "./TotoAPI";

export class TomeLanguageAPI {

    /**
     * Fetches the vocabulary for the specified language
     */
    async getVocabulary(language: string): Promise<GetVocabularyResponse> {
        return (await new TotoAPI().fetch('tome-ms-language', `/vocabulary/${language}`)).json();
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
