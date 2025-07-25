'use client'

import { TomeTopicsAPI, Topic } from "@/api/TomeTopicsAPI";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import moment from "moment";
import { FlashcardSessionStats, FlashCardsSession } from "@/app/ui/complex/FlashCardsSession";
import { TomePracticeAPI } from "@/api/TomePracticeAPI";
import { Practice } from "@/model/Practice";
import { PracticeFinished } from "@/app/ui/complex/PracticeFinished";
import TrashSVG from "@/app/ui/graphics/icons/TrashSVG";
import RoundButton from "@/app/ui/buttons/RoundButton";


export default function PracticeTopicPage() {

    const params = useParams()
    const router = useRouter()

    const [topic, setTopic] = useState<Topic>()
    const [practice, setPractice] = useState<Practice>() // TODO: Define the type for practice
    const [finished, setFinished] = useState(false);
    const [endOfPracticeStats, setEndOfPracticeStats] = useState<FlashcardSessionStats>({
        score: 35,
        numCards: 46,
        averageAttempts: 1.4,
        totalWrongAnswers: 23
    });


    /**
     * Load the flashcards
     */
    const loadTopic = async () => {

        const [topic, { practices }] = await Promise.all([
            new TomeTopicsAPI().getTopic(String(params.topicId)),
            new TomePracticeAPI().getOngoingPractice(String(params.topicId))
        ]);

        setTopic(topic);
        setPractice(practices[0]);
    }

    /**
     * Delete the practice
     */
    const deletePractice = async () => {

        if (!practice || !practice.id) return;

        await new TomePracticeAPI().deletePractice(practice.id)

        router.back()
    }

    /**
     * When the practice is finished. 
     */
    const onFinishedSession = (stats: FlashcardSessionStats) => {

        setFinished(true);
        setEndOfPracticeStats(stats);

    }

    useEffect(() => { loadTopic() }, [])

    if (!topic || !practice) return <></>

    return (
        <div className="flex flex-1 flex-col items-stretch justify-start px-4 mt-6 ">
            <div className="flex w-full items-center">
                <div className="flex-1"></div>
                <div className="flex justify-center text-xl">{topic.name}</div>
                <div className="flex-1 flex justify-end cursor-pointer">
                    <RoundButton icon={<TrashSVG />} onClick={deletePractice} iconOnly={true} size='s' />
                </div>
            </div>
            <div className="flex justify-center mt-2">
                <div className="text-sm bg-cyan-200 rounded-full px-2">
                    {moment(topic.createdOn, 'YYYYMMDD').format('DD/MM/YYYY')}
                </div>
            </div>
            <div className="flex justify-center mt-8">
                {!finished && <FlashCardsSession practiceId={practice.id!} onFinishedSession={onFinishedSession} />}
                {finished && <PracticeFinished stats={endOfPracticeStats} onClose={() => { router.back() }} />}
            </div>
        </div>
    )
}