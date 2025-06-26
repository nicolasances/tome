'use client'

import { TomeTopicsAPI, Topic } from "@/api/TomeTopicsAPI";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LampSVG from "../../ui/graphics/icons/Lamp";
import RoundButton from "@/app/ui/buttons/RoundButton";
import moment from "moment";
import { ProgressBar } from "@/app/ui/general/ProgressBar";
import { TomePracticeAPI } from "@/api/TomePracticeAPI";
import { PracticeHistoryGraph } from "@/components/graph/PracticeHistory";
import { Practice } from "@/model/Practice";


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

    const historicalPractices: Practice[] = [
        { startedOn: "20250601", topicId: String(params.topicId), type: "options", user: "me", finishedOn: "20250601", score: 53 },
        // { startedOn: "20250603", topicId: String(params.topicId), type: "options", user: "me", finishedOn: "20250603", score: 14 },
        // { startedOn: "20250609", topicId: String(params.topicId), type: "options", user: "me", finishedOn: "20250610", score: 27 },
        // { startedOn: "20250614", topicId: String(params.topicId), type: "options", user: "me", finishedOn: "20250615", score: 25 },
        // { startedOn: "20250623", topicId: String(params.topicId), type: "options", user: "me", finishedOn: "20250623", score: 56 },
        // { startedOn: "20250625", topicId: String(params.topicId), type: "options", user: "me", finishedOn: "20250625", score: 56 },
        // { startedOn: "20250626", topicId: String(params.topicId), type: "options", user: "me", finishedOn: "20250626", score: 64 },
        // { startedOn: "20250630", topicId: String(params.topicId), type: "options", user: "me", finishedOn: "20250630", score: 72 },
        // { startedOn: "20250712", topicId: String(params.topicId), type: "options", user: "me", finishedOn: "20250713", score: 58 },
        // { startedOn: "20250720", topicId: String(params.topicId), type: "options", user: "me", finishedOn: "20250721", score: 45 },
        // { startedOn: "20250722", topicId: String(params.topicId), type: "options", user: "me", finishedOn: "20250722", score: 56 },
        // { startedOn: "20250726", topicId: String(params.topicId), type: "options", user: "me", finishedOn: "20250726", score: 60 },
        // { startedOn: "20250801", topicId: String(params.topicId), type: "options", user: "me", finishedOn: "20250801", score: 48 },
        // { startedOn: "20250805", topicId: String(params.topicId), type: "options", user: "me", finishedOn: "20250805", score: 67 },
        // { startedOn: "20250812", topicId: String(params.topicId), type: "options", user: "me", finishedOn: "20250812", score: 39 },
        // { startedOn: "20250819", topicId: String(params.topicId), type: "options", user: "me", finishedOn: "20250819", score: 81 },
        // { startedOn: "20250826", topicId: String(params.topicId), type: "options", user: "me", finishedOn: "20250826", score: 54 },
        // { startedOn: "20250902", topicId: String(params.topicId), type: "options", user: "me", finishedOn: "20250902", score: 23 },
        // { startedOn: "20250909", topicId: String(params.topicId), type: "options", user: "me", finishedOn: "20250909", score: 77 },
        // { startedOn: "20250916", topicId: String(params.topicId), type: "options", user: "me", finishedOn: "20250916", score: 62 },
        // { startedOn: "20250920", topicId: String(params.topicId), type: "options", user: "me", finishedOn: "20250920", score: 45 },
        // { startedOn: "20250925", topicId: String(params.topicId), type: "options", user: "me", finishedOn: "20250925", score: 90 },
        // { startedOn: "20250930", topicId: String(params.topicId), type: "options", user: "me", finishedOn: "20250930", score: 34 },
    ]

    return (
        <div className="flex flex-1 flex-col items-stretch justify-start px-8 h-full">
            <div className="mt-6 flex justify-center text-xl">{topic.name}</div>
            <div className="flex justify-center mt-2">
                <div className="text-sm bg-cyan-200 rounded-full px-2">
                    {moment(topic.createdOn, 'YYYYMMDD').format('DD/MM/YYYY')}
                </div>
            </div>
            <div className="flex items-center mt-8">
                <div className="w-6"><LampSVG /></div>
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
            <div className="flex-1"></div>
            <div className="">
                <div className="text-center text-base text-cyan-900 uppercase ">Historical Scores</div>
                <PracticeHistoryGraph historicalPractices={historicalPractices} />
            </div>
        </div>
    )
}