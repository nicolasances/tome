'use client'

import { TomeAPI } from "@/api/TomeAPI";
import { LoadingBar } from "@/app/ui/graphics/Loading";
import { Topic } from "@/model/Topic";
import { useRouter } from "next/navigation";
import { useState } from "react";
import TopicsCard from "@/app/ui/cards/TopicsCard";

export default function NewTopicReview() {

    return (
        <div className="flex flex-1 flex-col items-center justify-center">
            <StartTopicReview />
        </div>
    )
}

function StartTopicReview() {

    const [startingTopicReview, setStartingTopicReview] = useState(false)
    const [topic, setTopic] = useState<Topic>()

    const router = useRouter()

    /**
     * Starts the quiz
     */
    const startTopicReview = async (topic: Topic) => {

        setTopic(topic)
        setStartingTopicReview(true)

        const response = await new TomeAPI().startTopicReview(topic.code)

        setStartingTopicReview(false)

        router.push(`/tr/${response.topicReview.id}`)

    }

    if (startingTopicReview) return (
        <div className="w-full mt-4">
            <LoadingBar label={`Starting Review of Topic ${topic?.title}`} />
        </div>
    )

    return (
        <div className="w-full">
            <TopicsCard onSelectTopic={startTopicReview} />
        </div>
    )
}

