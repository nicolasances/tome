import { useEffect, useState } from "react";
import MemLevel from "../graphics/MemLevel";

export default function TopicMemLevels() {

    const [topicMemorizationLevels, setTopicMemorizationLevels] = useState<{memorizationLevel: number, title: string} | undefined>(undefined)

    /**
     * Loads for each topic its memorization level
     */
    const loadTopicMemorizationLevels = async () => {

        const response = {
            topics: [
                { title: 'Rome', memorizationLevel: 69 },
                { title: 'History of Japan', memorizationLevel: 46 },
                { title: 'History of China', memorizationLevel: 12 },
                { title: 'The Vietnam Wars', memorizationLevel: 7 },
                { title: 'History of Middle Ages', memorizationLevel: 0 },
            ]
        }

        setTopicMemorizationLevels(response.topics)

    }

    useEffect(() => { loadTopicMemorizationLevels() }, [])

    if (!topicMemorizationLevels) return <></>

    return (
        <div className="mx-3 border-cyan-700">
            <div className="text-sm mb-2">Your Memorization Levels</div>
            {topicMemorizationLevels.map((topic: {memorizationLevel: number, title: string}) => {
                return (
                    <div className={`flex flex-row items-center `} key={topic.title} >
                        <div className="mr-2"><MemLevel perc={topic.memorizationLevel} /></div>
                        <div className="flex-1">{topic.title}</div>
                    </div>
                );
            })}
        </div>
    )
}