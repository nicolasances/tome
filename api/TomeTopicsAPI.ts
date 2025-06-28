import { TotoAPI } from "./TotoAPI";

export class TomeTopicsAPI {

    /**
     * Posts a new topic
     */
    async postTopic(blogUrl: string, topicName: string): Promise<PostTopicResponse> {
        try {
            const response = await new TotoAPI().fetch('tome-ms-topics', '/topics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    blogURL: blogUrl,
                    blogType: 'craft', 
                    name: topicName
                })
            }, false);
    
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

export interface PostTopicResponse {

}

export interface Topic {
    id?: string;
    name: string;
    blogURL: string;
    createdOn: string; // Date in format YYYYMMDD
    user: string; // User email
    lastScore?: number;
    lastPracticed?: string;
}

export interface GetTopicsResponse {
    topics: Topic[]
}