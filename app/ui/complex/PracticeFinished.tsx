import RoundButton from "../buttons/RoundButton";
import MemLevel from "../graphics/MemLevel";
import BackSVG from "../graphics/icons/Back";
import { FlashcardSessionStats } from "./FlashCardsSession";


export function PracticeFinished( {stats, onClose} : {stats: FlashcardSessionStats, onClose: () => void}) {

    return (
        <div className="flex flex-col items-stretch flex-1">
            <div className="text-center">Practice Finished!</div>
            <div className="flex justify-center mt-4" >
                <MemLevel perc={Number(stats.score?.toFixed(0))} showLabel={true} size="xl" />
            </div>
            <div className="flex items-center mt-6 px-4">
            <div className="flex flex-col items-start flex-1 text-gray-800 space-y-1 text-base">
                <div className="text-base font-semibold">Num of wrong attemps: <span className="text-base text-black bold bg-cyan-200 px-2 rounded-full ml-1">{stats.totalWrongAnswers}</span></div>
                <div className="text-base font-semibold">Average attempts to answer: <span className="text-base text-black bold bg-cyan-200 px-2 rounded-full ml-1">{stats.averageAttempts?.toFixed(1)}</span></div>
                <div className="text-base font-semibold">Number of cards: <span className="text-base text-black bold bg-cyan-200 px-2 rounded-full ml-1">{stats.numCards}</span></div>
            </div>
            <div className="flex">
                <RoundButton icon={<BackSVG/>} onClick={onClose} size='s' />
            </div>
            </div>
        </div>
    )
}