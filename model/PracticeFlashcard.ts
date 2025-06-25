import { Flashcard } from "./Flashcard";

export interface PracticeFlashcard {
    
    practiceId: string; // Relates to a Practice
    originalFlashcard: Flashcard;  

    numWrongAnswers?: number;    // number of wrong answers from the user before getting the right one
    correctlyAsnwerAt?: string;  // YYYYMMDD HH:mm
    id?: string; // Id as stored in this db
}