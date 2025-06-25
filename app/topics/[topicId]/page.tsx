'use client'

import { TomeTopicsAPI, Topic } from "@/api/TomeTopicsAPI";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LampSVG from "../../ui/graphics/icons/Lamp";
import RoundButton from "@/app/ui/buttons/RoundButton";
import moment from "moment";
import { ProgressBar } from "@/app/ui/general/ProgressBar";
import { TomePracticeAPI } from "@/api/TomePracticeAPI";


export default function TopicDetailPage() {

    const router = useRouter();
    const params = useParams()

    const [topic, setTopic] = useState<Topic>()
    const [startingPractice, setStartingPractice] = useState<boolean>(false)

    /**
     * Load the topic 
     */
    const loadTopic = async () => {

        const topic = await new TomeTopicsAPI().getTopic(String(params.topicId));

        setTopic(topic);
    }

    /**
     * Starts a practice on this topic
     */
    const startPractice = async () => {

        setStartingPractice(true);

        const response = await new TomePracticeAPI().startPractice(String(params.topicId), "options")

        if (response && 'practiceId' in response) router.push(`${params.topicId}/practice`);
        else if (response && response.subcode == 'ongoing-practice-found') router.push(`${params.topicId}/practice`);


    }

    useEffect(() => { loadTopic() }, [])

    if (!topic) return <></>

    return (
        <div className="flex flex-1 flex-col items-stretch justify-start px-8">
            <div className="mt-6 flex justify-center text-xl">{topic.name}</div>
            <div className="flex justify-center mt-2">
                <div className="text-sm bg-cyan-200 rounded-full px-2">
                    {moment(topic.createdOn, 'YYYYMMDD').format('DD/MM/YYYY')}
                </div>
            </div>
            <div className="flex items-center mt-8">
                <div className="w-6"><LampSVG/></div>
                <div className="flex flex-col px-4">
                    <div className="text-xs uppercase">Last Practice</div>
                    <div className="text-base"><b>14</b> days ago</div>
                </div>
            </div>
            <div className="mt-4">
                <div className="text-xs uppercase">Memorization level</div>
                <ProgressBar hideNumber={true} current={12} max={100} />
            </div>
            <div className="mt-8 flex justify-center">
                <RoundButton icon={<LampSVG />} onClick={startPractice} size="m" loading={startingPractice} />
            </div>
        </div>
    )
}