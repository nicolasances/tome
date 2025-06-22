'use client'

import { TomeTopicsAPI, Topic } from "@/api/TomeTopicsAPI";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import moment from "moment";
import FlashCardsSession from "@/app/ui/complex/FlashCardsSession";


export default function PracticeTopicPage() {

    const params = useParams()

    const [topic, setTopic] = useState<Topic>()

    /**
     * Load the flashcards
     */
    const loadTopic = async () => {

        const topic = await new TomeTopicsAPI().getTopic(String(params.topicId));

        setTopic(topic);
    }

    useEffect(() => { loadTopic() }, [])

    if (!topic) return <></>

    return (
        <div className="flex flex-1 flex-col items-stretch justify-start px-4">
            <div className="flex">
                <div className="flex-1"></div>
                <div className="text-sm bg-cyan-200 rounded-full px-2">
                    {moment(topic.createdOn, 'YYYYMMDD').format('DD/MM/YYYY')}
                </div>
            </div>
            <div className="mt-4 flex justify-center text-2xl">{topic.name}</div>
            <div className="mt-8 flex justify-center">
                <FlashCardsSession topicId={String(params.topicId)}/>
            </div>
        </div>
    )
}