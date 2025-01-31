import { useEffect, useState } from "react";
import MemLevel from "../graphics/MemLevel";
import { TomeAPI, TopicMemLevel } from "@/api/TomeAPI";
import { useRouter } from "next/navigation";
import RoundButton from "../buttons/RoundButton";
import NextSVG from "../graphics/icons/Next";
import { useTomeContext } from "@/context/TomeContext";

export default function TopicMemLevels() {

    const [topicMemorizationLevels, setTopicMemorizationLevels] = useState<TopicMemLevel[] | undefined>(undefined)

    const tomeContext = useTomeContext()
    const router = useRouter()

    /**
     * Loads for each topic its memorization level
     */
    const loadTopicMemorizationLevels = async () => {

        const response = await new TomeAPI().getMemLevels()

        const topics = response.topics.sort((a, b) => b.memLevel - a.memLevel)

        setTopicMemorizationLevels(topics)
        tomeContext.updateTopicMemLevels({memLevels: topics})

    }

    useEffect(() => { loadTopicMemorizationLevels() }, [])

    if (!topicMemorizationLevels) return <></>

    return (
        <div className="mx-3 border-cyan-700">
            <div className="flex flex-row items-center mb-2">
                <div className="text-sm">Topics Reviewed Recently</div>
                <div className="flex flex-1 justify-end">
                    <RoundButton icon={<NextSVG/>} size="xs" onClick={() => {router.push('/topics')}} />
                </div>
            </div>
            {topicMemorizationLevels.map((topic: TopicMemLevel) => {
                return (
                    <div className={`flex flex-row items-center `} key={topic.topicCode} >
                        <div className="mr-2"><MemLevel perc={topic.memLevel * 100} /></div>
                        <div className="flex-1">{topic.topicTitle}</div>
                    </div>
                );
            })}
        </div>
    )
}