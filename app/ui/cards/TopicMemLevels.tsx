import { useEffect, useState } from "react";
import MemLevel from "../graphics/MemLevel";
import { TomeAPI, TopicMemLevel } from "@/api/TomeAPI";

export default function TopicMemLevels() {

    const [topicMemorizationLevels, setTopicMemorizationLevels] = useState<TopicMemLevel[] | undefined>(undefined)

    /**
     * Loads for each topic its memorization level
     */
    const loadTopicMemorizationLevels = async () => {

        const response = await new TomeAPI().getMemLevels()

        const topics = response.topics.sort((a, b) => b.memLevel - a.memLevel)

        setTopicMemorizationLevels(topics)

    }

    useEffect(() => { loadTopicMemorizationLevels() }, [])

    if (!topicMemorizationLevels) return <></>

    return (
        <div className="mx-3 border-cyan-700">
            <div className="text-sm mb-2">Your Memorization Levels</div>
            {topicMemorizationLevels.map((topic: TopicMemLevel) => {
                return (
                    <div className={`flex flex-row items-center `} key={topic.topicCode} >
                        <div className="mr-2"><MemLevel perc={topic.memLevel*100} /></div>
                        <div className="flex-1">{topic.topicTitle}</div>
                    </div>
                );
            })}
        </div>
    )
}