

export interface Flashcard {

    type: string;
    user: string;
    topicId: string; 
    topicCode: string; 
    question: string; 
    options: string[];
    rightAnswerIndex: number; 
    id?: string;
}