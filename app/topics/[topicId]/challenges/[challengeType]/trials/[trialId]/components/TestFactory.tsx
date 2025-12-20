import { TomeTest } from "@/api/TomeChallengesAPI";
import { OpenTestWidget } from "./OpenTestWidget";
import { DateFlashcardWidget } from "@/app/ui/cards/flashcards/DateFlashcardWidget";


export class TestFactory {

    static createTestComponent(test: TomeTest, handleAnswer: (answer: any, test: TomeTest) => void) {

        console.log(test);
        
        switch (test.type) {
            case 'open':
                return (
                    <OpenTestWidget
                        question={test.question}
                        onAnswer={(answer) => handleAnswer(answer, test)}
                    />
                )
            case 'date':
                return (
                    <DateFlashcardWidget
                        key={test.testId}
                        question={test.question}
                        correctYear={(test as any).correctAnswer?.year || new Date().getFullYear()}
                        onAnswer={(answer) => handleAnswer(answer, test)}
                    />
                )
            default:
                throw new Error(`Unknown test type: ${test.type}`);
        }
    }
}