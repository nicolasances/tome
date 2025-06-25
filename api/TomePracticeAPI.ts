import { PracticeType } from "@/model/PracticeType";
import { TotoAPI } from "./TotoAPI";

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


}

interface StartPracticeResponse {

    practiceId: string;
    flashcardsInsertedCount: number;

}

interface TotoError {
    code: number
    message: string 
    subcode: string
}