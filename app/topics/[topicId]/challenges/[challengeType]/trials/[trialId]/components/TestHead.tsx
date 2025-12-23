import { TomeTest } from "@/api/TomeChallengesAPI";

export function TestHead({ test, score, testIndex }: { test: TomeTest, score: number, testIndex: number }) {

    const percentScore = score * 100;

    const getScoreColor = (score: number): string => {
        if (score < 30) return 'text-red-200';
        if (score < 70) return 'text-lime-200';
        return 'text-green-300';
    };

    return (
        <div className="">
            <div className="flex justify-between items-start">
                <div className="text-cyan-800 font-semibold text-base bg-cyan-200 rounded-full px-3 inline-block">
                    Question {testIndex + 1}
                </div>
                <div className={`text-base font-bold ml-4 flex-shrink-0 ${getScoreColor(percentScore)}`}>
                    {percentScore} %
                </div>
            </div>
            <div className="text-base font-bold flex-shrink-0 text-cyan-800">
                <p className="text-cyan-800 text-base mt-2">{test.question}</p>
            </div>
        </div>

    )

}