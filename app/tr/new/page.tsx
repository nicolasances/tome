'use client'

import { TomeAPI } from "@/api/TomeAPI";
import RoundButton from "@/app/ui/buttons/RoundButton";
import BackSVG from "@/app/ui/graphics/icons/Back";
import Book from "@/app/ui/graphics/icons/Book";
import Tick from "@/app/ui/graphics/icons/Tick";
import { LoadingBar } from "@/app/ui/graphics/Loading";
import Footer from "@/app/ui/layout/Footer";
import { Topic } from "@/model/Topic";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from 'next/link'

export default function NewTopicReview() {

    return (
        <div className="flex flex-1 flex-col items-center justify-center">
            <StartTopicReview />
        </div>
    )
}

function StartTopicReview() {

    const [startingTopicReview, setStartingTopicReview] = useState(false)
    const [loadingTopic, setLoadingTopic] = useState(false)
    const [topic, setTopic] = useState<Topic>()

    const router = useRouter()

    const loadTopic = async () => {

        const timer = setTimeout(() => { setLoadingTopic(true) }, 500)

        const response = await new TomeAPI().getNextTopicReview()

        clearTimeout(timer)
        setLoadingTopic(false)

        setTopic(response)

    }

    /**
     * Starts the quiz
     */
    const startTopicReview = async () => {

        if (!topic) return;

        setStartingTopicReview(true)

        const response = await new TomeAPI().startTopicReview(topic.code)

        setStartingTopicReview(false)

        router.push(`/tr/${response.topicReview.id}`)

    }

    useEffect(() => { loadTopic() }, [])

    if (loadingTopic) return <LoadingBar />
    if (!topic) return <></>

    return (
        <div className="flex flex-col flex-1 items-stretch w-full">
            <div className="uppercase text-base text-cyan-200 font-bold text-center">
                Starting a new Topic Review
            </div>
            <div className="flex flex-col justify-center items-center mt-[24px]">
                <div className="fill-cyan-800 w-12 h-12 rounded border-2 border border-cyan-800 p-3">
                    <Book />
                </div>
                <div className="flex-col justify-center items-center text-center pt-4 ">
                    <div className="text-xl capitalize"><b>{topic.title}</b></div>
                    <div className="text-base"><b>{topic.sections.length}</b> sections</div>
                    <div className="text-sm text-cyan-200 underline"><Link href={topic.blog_url} target='_blank'>{topic.blog_url}</Link></div>
                </div>
            </div>
            <div className="flex-1 mt-12">
                {startingTopicReview && <LoadingBar label="Preparing the Questions.." />}
            </div>
            <Footer>
                <div className="flex flex-row justify-center items-center space-x-2">
                    <div className="flex-1 flex justify-end">
                        <RoundButton icon={<BackSVG />} size='s' onClick={() => { router.push('/') }} />
                    </div>
                    <div className="flex">
                        <RoundButton icon={<Tick />} onClick={startTopicReview} disabled={startingTopicReview} />
                    </div>
                    <div className="flex-1">
                    </div>
                </div>
            </Footer>
        </div>
    )
}

