import { Challenge, SplitDate, TomeTest, Trial } from "@/api/TomeChallengesAPI";
import { MaskedSvgIcon } from "@/app/components/MaskedSvgIcon";

export function DateTestAnswer({ trial, test }: { trial: Trial, test: TomeTest, challenge: Challenge }) {

    const testAnswer = trial.answers?.find(ta => ta.testId === test.testId);

    /**
     * Format answer based on test type
     */
    const formatAnswer = (answer: any, testType: string): string => {
        if (testType === 'date') {
            return formatSplitDate(answer);
        }
        return String(answer || '');
    };

    /**
     * Format a split date (with optional year, month, day)
     */
    const formatSplitDate = (splitDate: SplitDate | any): string => {
        if (!splitDate) return '(no answer)';

        const parts: string[] = [];
        if (splitDate.year !== null && splitDate.year !== undefined) parts.push(`${splitDate.year}`);
        if (splitDate.month !== null && splitDate.month !== undefined) parts.push(`${String(splitDate.month).padStart(2, '0')}`);
        if (splitDate.day !== null && splitDate.day !== undefined) parts.push(`${String(splitDate.day).padStart(2, '0')}`);

        if (parts.length === 0) return '(no answer)';
        return parts.join('-');
    };

    return (
        <div className="grid gap-2 grid-cols-2">
            {/* User Answer */}
            <div>
                <span className="text-cyan-800 text-sm ">Your Answer</span>
                <div className="flex items-center">
                    <div className={`w-4 h-4 min-w-4 flex items-center justify-center mr-4 ${testAnswer?.score == 1 ? 'bg-green-700' : 'bg-red-800'} rounded-full`}>
                        <MaskedSvgIcon size="w-3 h-3" src={`${testAnswer?.score == 1 ? '/images/tick.svg' : '/images/wrong.svg'}`} color="bg-gray-100" alt={test.score == 1 ? "correct" : "incorrect"} />
                    </div>
                    <span className="text-cyan-800 mt-1 break-words font-bold">
                        {formatAnswer(testAnswer?.answer, test.type)}
                    </span>
                </div>
            </div>

            {/* Correct Answer */}
            <div>
                <span className="text-cyan-800 text-sm ">Correct Answer</span>
                <p className="text-cyan-800 mt-1 break-words font-bold">
                    {formatAnswer(test.correctAnswer, test.type)}
                </p>
            </div>
        </div>
    )

}
