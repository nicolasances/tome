import { TomeTest } from "@/api/TomeChallengesAPI";

export function TestHead({ test, testIndex }: { test: TomeTest, testIndex: number }) {

    return (
        <div className="">
            <div className="flex justify-between items-start">
                <div className="text-cyan-800 font-semibold text-base bg-cyan-200 rounded-full px-3 inline-block">
                    Question {testIndex + 1}
                </div>
                <div className="text-base font-bold ml-4 flex-shrink-0 text-cyan-800">
                    {Math.round((test.score || 0) * 100)} %
                </div>
            </div>
            <div className="text-base font-bold flex-shrink-0 text-cyan-800">
                <p className="text-cyan-800 text-base mt-2">{test.question}</p>
            </div>
        </div>

    )

}