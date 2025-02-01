'use client'

import { TopicReviewQuestion } from "@/model/questions";
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react";
import { LoadingBar } from "@/app/ui/graphics/Loading";
import RoundButton from "@/app/ui/buttons/RoundButton";
import HomeSVG from "@/app/ui/graphics/icons/HomeSVG";
import { TopicReview } from "@/model/topicReview";
import { TomeAPI } from "@/api/TomeAPI";
import TopicReviewSummary from "@/app/ui/tr/TopicReviewSummary";
import NextSVG from "@/app/ui/graphics/icons/Next";
import Footer from "@/app/ui/layout/Footer";
import { useTomeContext } from "@/context/TomeContext";
import TopicTimeline from "@/app/ui/tr/TopicTimeline";

export default function QuizDetail() {

    const router = useRouter()
    const params = useParams()
    const tomeContext = useTomeContext()

    const topicReviewId = String(params.topicReviewId);

    const [loading, setLoading] = useState(true);
    const [showLoadingBar, setShowLoadingBar] = useState(false)
    const [topicReview, setTopicReview] = useState<TopicReview>()
    const [questions, setQuestions] = useState<TopicReviewQuestion[]>()

    const init = async () => {

        const timer = setTimeout(() => { setShowLoadingBar(true) }, 400)
        setLoading(true)

        const response = await new TomeAPI().getTopicReview(topicReviewId)

        clearTimeout(timer)
        setLoading(false)
        setShowLoadingBar(false)

        setTopicReview(response.topicReview)
        setQuestions(response.questions)

        tomeContext.updateTopicReviewContext({
            topicReview: response.topicReview,
            questions: response.questions
        })

    }

    /**
     * Finds the next question to answer
     */
    const getNextQuestion = () => {

        if (!questions) return null;

        for (const q of questions) {

            // If the question has no answer that's the next one!
            if (!q.answer) return q;

        }

        return null;

    }

    /**
     * Returns true if the TR is finished
     */
    const isFinished = () => {

        return getNextQuestion() == null;
    }

    /**
     * Route to the next question
     */
    const routeToNextQuestion = () => {

        const nextQuestion = getNextQuestion()

        if (!nextQuestion) return;

        router.push(`/tr/${topicReviewId}/questions/${nextQuestion.id}`)
    }


    useEffect(() => { init() }, [])

    if (showLoadingBar) return <div className="text-base"><LoadingBar /></div>
    if (loading) return <></>

    return (
        <div className="flex flex-1 flex-col items-center justify-center">

            <div className="flex flex-row w-full space-x-4">
                <div className="w-full md:w-2/3">
                    {topicReview && <TopicReviewSummary topicReview={topicReview} questions={questions} />}
                </div>
                <div className="flex-1 hidden md:flex">
                    <TopicTimeline />
                </div>
            </div>

            <Footer>
                <div className="flex flex-1 flex-row justify-center items-center space-x-2">
                    <div className="flex-1 flex justify-end">
                        {!isFinished() && <RoundButton icon={<HomeSVG />} size='s' onClick={() => { router.push('/') }} />}
                    </div>
                    <div className="">
                        <div>
                            {!isFinished() && <RoundButton icon={<NextSVG />} onClick={routeToNextQuestion} />}
                            {isFinished() && <RoundButton icon={<HomeSVG />} onClick={() => { router.push('/') }} />}
                        </div>
                    </div>
                    <div className="flex-1"></div>
                </div>
            </Footer>
        </div>
    )

}