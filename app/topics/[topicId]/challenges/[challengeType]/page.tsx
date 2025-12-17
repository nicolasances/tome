'use client'

import { TomeTopicsAPI, Topic } from "@/api/TomeTopicsAPI";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import HomeSVG from "@/app/ui/graphics/icons/HomeSVG";
import RoundButton from "@/app/ui/buttons/RoundButton";
import { MaskedSvgIcon } from "@/app/components/MaskedSvgIcon";

export default function ChallengeDetailPage() {

    const router = useRouter();
    const params = useParams()

    const [topic, setTopic] = useState<Topic>()

    const loadData = async () => {
        loadTopic();
    }

    /**
     * Load the topic 
     */
    const loadTopic = async () => {
        const topic = await new TomeTopicsAPI().getTopic(String(params.topicId));
        setTopic(topic);
    }

    useEffect(() => { loadData() }, [])

    if (!topic) return <></>

    const challengeType = String(params.challengeType);
    const challengeName = challengeType.charAt(0).toUpperCase() + challengeType.slice(1);

    return (
        <div className="flex flex-1 flex-col items-stretch justify-start px-4 h-full">
            <div className="mt-6 flex justify-between items-center">
                <div className="flex-1"></div>
                <div className="flex justify-center text-xl">{topic.name}</div>
                <div className="flex flex-1 items-center justify-end p-1 flex-shrink-0">
                    <MaskedSvgIcon 
                        src={`/images/challenges/${challengeType}.svg`}
                        alt={challengeType}
                        size="w-5 h-5"
                        color="bg-cyan-800"
                    />
                </div>
            </div>
            <div className="flex justify-center mt-4 text-base opacity-70">
                {challengeName}
            </div>
            <div className="mt-8 flex justify-center items-center">
                <RoundButton icon={<HomeSVG />} onClick={() => { router.back() }} size="s" />
            </div>
            <div className="flex-1"></div>
        </div>
    )
}
