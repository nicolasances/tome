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
    const [lastScore, setLastScore] = useState<number>(0)
    const [lastPracticeDate, setLastPracticeDate] = useState<string>("");
    const [historicalPractices, setHistoricalPractices] = useState<Practice[]>([]);

    const loadData = async () => {
        loadTopic();
        loadLatestFinishedPractice();
        loadHistoricalPractices();
    }

    /**
     * Load the topic 
     */
    const loadTopic = async () => {

        const topic = await new TomeTopicsAPI().getTopic(String(params.topicId));

        setTopic(topic);
    }

    /**
     * Load historical finished practices on the topic
     */
    const loadHistoricalPractices = async () => {

        const {practices} = await new TomePracticeAPI().getHistoricalPractices(String(params.topicId));

        setHistoricalPractices(practices);
    }


    /**
     * Loads the latest finished practice for this topic and save its score for the header
     */
    const loadLatestFinishedPractice = async () => {
        const latestFinishedPractice = await new TomePracticeAPI().getLatestFinishedPractice(String(params.topicId));
        setLastScore(latestFinishedPractice?.score ?? 0);
        setLastPracticeDate(latestFinishedPractice?.finishedOn ?? "");
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

    useEffect(() => { loadData() }, [])

    if (!topic) return <></>

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
                    <LastPracticeTimedelta lastPracticeDate={lastPracticeDate} />
                </div>
            </div>
            <div className="mt-4">
                <div className="text-xs uppercase">Last Score</div>
                <ProgressBar hideNumber={true} current={lastScore} max={100} />
            </div>
            <div className="mt-8 flex justify-center">
                <RoundButton icon={<LampSVG />} onClick={startPractice} size="m" loading={startingPractice} />
            </div>
            <div className="flex-1"></div>
            <div className="">
                <div className="text-center text-base text-cyan-900 uppercase ">Historical Scores</div>
                {historicalPractices && <PracticeHistoryGraph historicalPractices={historicalPractices} />}
            </div>
        </div>
    )
}

function LastPracticeTimedelta({ lastPracticeDate }: { lastPracticeDate: string }) {

    if (!lastPracticeDate) return <></>

    const daysAgo = moment().diff(moment(lastPracticeDate, 'YYYYMMDD'), 'days');
    
    return (
        <div className="text-base">
            {daysAgo == 0 && "Today!"}
            {daysAgo > 0 && <><b>{daysAgo}</b> day{daysAgo > 1 ? "s" : ""} ago</>}
        </div>
    )
}