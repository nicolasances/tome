import { TotoAPI } from "./TotoAPI";

export class TomeLanguageAPI {

    /**
     * Fetches the vocabulary for the specified language
     */
    async getVocabulary(language: string): Promise<GetVocabularyResponse> {
        return (await new TotoAPI().fetch('tome-ms-language', `/vocabulary/${language}`)).json();
    }

    /**
     * Fetches a paginated page of vocabulary with per-word practice statistics.
     * Always sorted by difficulty descending (hardest first); words with no stats appear at the end.
     */
    async getVocabularyWithStats(language: string, page: number, pageSize: number): Promise<GetVocabularyWithStatsResponse> {
        return (await new TotoAPI().fetch('tome-ms-language', `/vocabulary/${language}/with-stats?page=${page}&pageSize=${pageSize}&sortBy=difficulty&sortDir=desc`)).json();
    }

    /**
     * Fetches a paginated page of sentences with per-sentence practice statistics.
     * Always sorted by difficulty descending (hardest first); sentences with no stats appear at the end.
     */
    async getSentencesWithStats(language: string, page: number, pageSize: number): Promise<GetSentencesWithStatsResponse> {
        return (await new TotoAPI().fetch('tome-ms-language', `/sentences/${language}/with-stats?page=${page}&pageSize=${pageSize}&sortBy=difficulty&sortDir=desc`)).json();
    }

    /**
     * Fetches the sentences for the specified language
     */
    async getSentences(language: string): Promise<GetSentencesResponse> {
        return (await new TotoAPI().fetch('tome-ms-language', `/sentences/${language}`)).json();
    }

    /**
     * Fetches per-day completed session counts for the last N calendar days, inclusive today.
     * Days with no completed sessions have count: 0.
     */
    async getRollingStats(days = 7): Promise<{ days: Array<{ date: string; count: number }> }> {
        return (await new TotoAPI().fetch('tome-ms-language', `/sessions/stats/rolling?days=${days}`)).json();
    }

    async getWord(language: string, wordId: string): Promise<WordDetail> {
        return (await new TotoAPI().fetch('tome-ms-language', `/vocabulary/${language}/words/${wordId}`)).json();
    }

    async getSentence(language: string, sentenceId: string): Promise<SentenceDetail> {
        return (await new TotoAPI().fetch('tome-ms-language', `/sentences/${language}/${sentenceId}`)).json();
    }

    async addWordAlternative(language: string, wordId: string, translation: string): Promise<AlternativeTranslation> {
        return (await new TotoAPI().fetch('tome-ms-language', `/vocabulary/${language}/words/${wordId}/alternatives`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ translation }) })).json();
    }

    async removeWordAlternative(language: string, wordId: string, id: string): Promise<void> {
        await new TotoAPI().fetch('tome-ms-language', `/vocabulary/${language}/words/${wordId}/alternatives/${id}`, { method: 'DELETE' });
    }

    async addSentenceAlternative(language: string, sentenceId: string, translation: string): Promise<AlternativeTranslation> {
        return (await new TotoAPI().fetch('tome-ms-language', `/sentences/${language}/${sentenceId}/alternatives`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ translation }) })).json();
    }

    async removeSentenceAlternative(language: string, sentenceId: string, id: string): Promise<void> {
        await new TotoAPI().fetch('tome-ms-language', `/sentences/${language}/${sentenceId}/alternatives/${id}`, { method: 'DELETE' });
    }

}

export interface Word {
    id: string;
    english: string;
    translation: string;
    createdAt: string;
    knowledgeSource: string;
}

export interface WordWithStats {
    id: string;
    english: string;
    translation: string;
    createdAt: string;
    knowledgeSource: string;
    alternativeTranslations: Array<{ id: string; translation: string }>;
    stats: {
        failureRatio: number;
        totalAttempts: number;
        totalFailures: number;
        lastPracticed: string;
    } | null;
}

export interface GetVocabularyResponse {
    language: string;
    words: Word[];
}

export interface GetVocabularyWithStatsResponse {
    language: string;
    page: number;
    pageSize: number;
    totalCount: number;
    words: WordWithStats[];
}

export interface Sentence {
    id: string;
    sentence: string;
    translation: string;
    createdAt: string;
    knowledgeSource: string;
}

export interface GetSentencesWithStatsResponse {
    language: string;
    page: number;
    pageSize: number;
    totalCount: number;
    sentences: SentenceWithStats[];
}

export interface SentenceWithStats {
    id: string;
    sentence: string;
    translation: string;
    createdAt: string;
    knowledgeSource: string;
    alternativeTranslations: Array<{ id: string; translation: string }>;
    stats: {
        failureRatio: number;
        totalAttempts: number;
        totalFailures: number;
        lastPracticed: string;
    } | null;
}

export interface GetSentencesResponse {
    language: string;
    sentences: Sentence[];
}

export interface AlternativeTranslation {
    id: string;
    translation: string;
}

export interface WordDetail {
    id: string;
    language: string;
    english: string;
    translation: string;
    createdAt: string;
    knowledgeSource: string;
    alternativeTranslations: AlternativeTranslation[];
}

export interface SentenceDetail {
    id: string;
    language: string;
    sentence: string;
    translation: string;
    createdAt: string;
    knowledgeSource: string;
    alternativeTranslations: AlternativeTranslation[];
}
