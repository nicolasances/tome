import { TomeTest } from "@/api/TomeChallengesAPI";
import { MaskedSvgIcon } from "@/app/components/MaskedSvgIcon";

export function TestHead({ test, score, testIndex, onExpand }: { test: TomeTest, score: number, testIndex: number, onExpand?: () => void }) {

    const percentScore = score * 100;


    const getQuestionLabel = (testType: string): string => {
        switch (testType) {
            case 'open':
                return 'Open Question';
            case 'date':
                return 'Date Question';
            default:
                return 'Question';
        }
    }

    return (
        <div className="cursor-pointer" onClick={onExpand ? onExpand : () => { }}>
            <div className="flex items-center">
                <div className={`border-2 rounded-full w-10 h-10 flex items-center justify-center text-base font-bold mr-2 text-cyan-900 border-cyan-800`}>
                    {percentScore == 100 && (<MaskedSvgIcon src="/images/tick.svg" alt="Perfect Score" />)}
                    {percentScore < 100 && (<>{percentScore} <span className="text-xs pt-1 ml-[1px]">%</span></>)}
                </div>
                <div className="text-cyan-900 font-semibold text-lg flex-1">
                    {getQuestionLabel(test.type)} {testIndex + 1}
                </div>
            </div>
        </div>

    )

}