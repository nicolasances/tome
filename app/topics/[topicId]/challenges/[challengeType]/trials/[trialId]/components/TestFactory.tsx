import { Challenge, JuiceChallenge, TomeTest, Trial } from "@/api/TomeChallengesAPI";
import { OpenTestWidget } from "./OpenTestWidget";
import { DateTestAnswer } from "./DateTestAnswer";
import { JuiceOpenTestAnswer } from "./JuiceOpenTestAnswer";
import { DateTestWidget } from "./DateTest";


export class TestFactory {

    static createTestComponent(test: TomeTest, handleAnswer: (answer: any, test: TomeTest) => Promise<void>) {

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
                    <DateTestWidget
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

    static createTestAnswerComponent(test: TomeTest, trial: Trial, challenge: Challenge) {

        switch (test.type) {
            case 'date':
                return <DateTestAnswer trial={trial} test={test} challenge={challenge} />;
            case 'open':
                return <JuiceOpenTestAnswer trial={trial} test={test} challenge={challenge as JuiceChallenge} />;
            default:
                throw new Error(`Unknown test type: ${test.type}`);
        }
    }
}