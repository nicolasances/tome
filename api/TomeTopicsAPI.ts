import { TotoAPI } from "./TotoAPI";

export class TomeTopicsAPI {

    /**
     * Retrieves the list of topics
     */
    async getTopics(): Promise<GetTopicsResponse> {

        return (await new TotoAPI().fetch('tome-ms-topics', '/topics', null)).json()
        
    }
    
    /**
     * Finds the topic with the given id
     * 
     * @param id the id of the topic
     * @returns the Topic
     */
    async getTopic(id: string): Promise<Topic> {
        
        return (await new TotoAPI().fetch('tome-ms-topics', `/topics/${id}`, null)).json()
    }


}

export interface Topic {
    id?: string;
    name: string;
    blogURL: string;
    createdOn: string; // Date in format YYYYMMDD
    user: string; // User email
    lastScore?: number;
    lastReviewedOn?: string;
}

export interface GetTopicsResponse {
    topics: Topic[]
}