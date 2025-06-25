import RoundButton from "../buttons/RoundButton";
import MemLevel from "../graphics/MemLevel";
import BackSVG from "../graphics/icons/Back";
import { FlashcardSessionStats } from "./FlashCardsSession";


export function PracticeFinished( {stats, onClose} : {stats: FlashcardSessionStats, onClose: () => void}) {

    return (
        <div className="flex flex-col items-stretch flex-1">
            <div className="text-center">Practice Finished!</div>
            <div className="flex justify-center" >
                <MemLevel perc={stats.score} showLabel={true} size="xl" />
            </div>
            <div className="flex items-center mt-4 px-4">
            <div className="flex flex-col items-start flex-1">
                <div className="text-lg font-semibold">Wrong Answers: {stats.numWrongAnswers}</div>
                <div className="text-sm text-gray-700">Cards: <span className="text-black">{stats.numCards}</span></div>
            </div>
            <div className="flex">
                <RoundButton icon={<BackSVG/>} onClick={onClose} size='s' />
            </div>
            </div>
        </div>
    )
}