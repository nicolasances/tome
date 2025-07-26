'use client';

import { FlashCardsSession } from "@/app/ui/complex/FlashCardsSession";
import { useTomeContext } from "@/context/TomeContext";
import moment from "moment";
import { useRouter } from "next/navigation";


export default function SegmentPracticePage() {

    const tomeContext = useTomeContext();
    const router = useRouter()

    const segment = tomeContext.segmentPractice;
    const topic = segment!.topic;
    const practice = segment!.practice;

    const flashcards = segment!.flashcards;

    const sectionTitle = flashcards[0].originalFlashcard.sectionTitle;

    /**
     * When the session is finished, we navigate back to the practice page.
     */
    const onFinishedSession = () => {
        
        // Navigate back to the practice page
        router.back()
    }

    /**
     * When the whole practice is finished. 
     * @param stats the stats of the practice session
     */
    const onFinishedPractice = () => {

        // Navigate to the practice page
        router.back();
    }

    return (
        <div className="flex flex-1 flex-col items-stretch justify-start px-4 mt-6 ">
            <div className="flex w-full items-center">
                <div className="flex-1"></div>
                <div className="flex justify-center text-xl">{topic.name}</div>
                <div className="flex-1 flex justify-end cursor-pointer">
                </div>
            </div>
            <div className="text-center text-base text-gray-700 mt-2">
                {sectionTitle}
            </div>
            <div className="flex justify-center mt-2">
                <div className="text-sm bg-cyan-200 rounded-full px-2">
                    {moment(practice.startedOn, 'YYYYMMDD').format('DD/MM/YYYY')}
                </div>
            </div>

            <div className="flex justify-center mt-8">
                <FlashCardsSession practiceId={practice.id!} flashcards={flashcards} onFinishedPractice={onFinishedPractice} onFinishedSession={onFinishedSession} />
            </div>
        </div>
    )
}