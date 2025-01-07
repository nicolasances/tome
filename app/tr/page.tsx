'use client'

import { TomeAPI } from "@/api/TomeAPI";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LoadingBar } from "../ui/graphics/Loading";
import Book from "../ui/graphics/icons/Book";
import RoundButton from "../ui/buttons/RoundButton";
import Tick from "../ui/graphics/icons/Tick";
import NextSVG from "../ui/graphics/icons/Next";
import { TopicReviewQuestion } from "@/model/questions";
import { TopicReview } from "@/model/topicReview";
import TopicReviewSummary from "../ui/tr/TopicReviewSummary";

export default function NewQuiz() {

    const [loading, setLoading] = useState(true);
    const [showLoadingBar, setShowLoadingBar] = useState(false)
    const [runningTopicReview, setRunningTopicReview] = useState<TopicReview>()
    const [questions, setQuestions] = useState<TopicReviewQuestion[]>()

    const router = useRouter()

    const init = async () => {

        const timer = setTimeout(() => { setShowLoadingBar(true) }, 400)
        setLoading(true)

        const runningTopicReview = await new TomeAPI().getRunningTopicReview()
        clearTimeout(timer)
        setLoading(false)
        setShowLoadingBar(false)

        if (!runningTopicReview || runningTopicReview.id == null) return;

        loadQuestions(runningTopicReview.id);

        setRunningTopicReview(runningTopicReview)
    }

    /**
     * Loads the quiz questions
     */
    const loadQuestions = async (topicReviewId: string) => {

        const quizQuestionsResponse = await new TomeAPI().getTopicReviewQuestions(topicReviewId);

        setQuestions(quizQuestionsResponse.questions)

    }

    useEffect(() => { init() }, [])

    if (showLoadingBar) return <div className="text-base"><LoadingBar /></div>
    if (loading) return <></>

    return (
        <div className="flex flex-1 flex-col items-center justify-center">
            {!runningTopicReview && <StartTopicReview />}
            {runningTopicReview && <TopicReviewSummary topicReview={runningTopicReview} questions={questions} />}
            {runningTopicReview &&
                <RoundButton icon={<NextSVG />} onClick={() => { router.push(`/tr/${runningTopicReview.id}`) }} />
            }
        </div>
    )
}

function StartTopicReview() {

    const [startingTopicReview, setStartingTopicReview] = useState(false)

    const router = useRouter()

    /**
     * Starts the quiz
     */
    const startTopicReview = async () => {

        setStartingTopicReview(true)

        const response = await new TomeAPI().startTopicReview()

        setStartingTopicReview(false)

        router.push(`/tr/question?topicReviewId=${response.topicReview.id}`)

    }

    return (
        <div className="flex flex-col flex-1 items-stretch w-full">
            <div className="uppercase text-base text-cyan-200 font-bold text-center">
                Chosen Quiz
            </div>
            <div className="flex flex-col justify-center items-center mt-4">
                <div className="fill-cyan-800 w-12 h-12 rounded-full border-2 border border-cyan-800 p-3">
                    <Book />
                </div>
                <div className="flex-col justify-center items-center text-center pt-2">
                    <div className="text-xl uppercase"><b>Cortés</b></div>
                    <div className="text-lg">Invasion of Mexico and La Noche Triste</div>
                </div>
            </div>
            <div className="flex-1 mt-12">
                {startingTopicReview && <LoadingBar label="Preparing the Questions.." />}
            </div>
            <div className="flex flex-col justify-end items-center">
                <div className="flex">
                    <RoundButton icon={<Tick />} onClick={startTopicReview} disabled={startingTopicReview} />
                </div>
            </div>
        </div>
    )
}

