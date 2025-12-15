'use client'

import { TopicReviewQuestion } from "@/model/questions";
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react";
import { LoadingBar } from "@/app/ui/graphics/Loading";
import RoundButton from "@/app/ui/buttons/RoundButton";
import HomeSVG from "@/app/ui/graphics/icons/HomeSVG";
import { Timeline, TopicReview } from "@/model/topicReview";
import { TomeAPI } from "@/api/TomeAPI";
import TopicReviewSummary from "@/app/ui/tr/TopicReviewSummary";
import NextSVG from "@/app/ui/graphics/icons/Next";
import Footer from "@/app/ui/layout/Footer";
import { useTomeContext } from "@/context/TomeContext";
import TopicTimeline from "@/app/ui/tr/TopicTimeline";
import TimelineSVG from "@/app/ui/graphics/icons/TimelineSVG";
import QuestionsSVG from "@/app/ui/graphics/icons/QuestionsSVG";
import TopicReviewSummaryHeader from "@/app/ui/tr/TopicReviewSummaryHeader";

export default function QuizDetail() {

    const router = useRouter()
    const params = useParams()
    const tomeContext = useTomeContext()

    const topicReviewId = String(params.topicReviewId);

    const [loading, setLoading] = useState(true);
    const [showLoadingBar, setShowLoadingBar] = useState(false)
    const [topicReview, setTopicReview] = useState<TopicReview>()
    const [questions, setQuestions] = useState<TopicReviewQuestion[]>()
    const [timeline, setTimeline] = useState<Timeline>()
    const [showMobileTimeline, setShowMobileTimeline] = useState<boolean>(false)

    const init = async () => {

        const timer = setTimeout(() => { setShowLoadingBar(true) }, 400)
        setLoading(true)

        const response = await new TomeAPI().getTopicReview(topicReviewId)

        clearTimeout(timer)
        setLoading(false)
        setShowLoadingBar(false)

        setTopicReview(response.topicReview)
        setQuestions(response.questions)
        setTimeline({ timeline: response.timeline })

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

    const bottomPadding = '12px'
    const contentHeight = `calc(100vh - var(--app-header-height) - ${bottomPadding})`

    return (
        <div className="flex flex-1 flex-col items-center justify-start px-4  xl:px-0" style={{minHeight: contentHeight}}>

            <div className="flex flex-row w-full space-x-4 flex-1">
                <div className="w-full md:w-2/3">
                    <TopicReviewSummaryHeader topicReview={topicReview} questions={questions} />
                    {topicReview && !showMobileTimeline && <TopicReviewSummary topicReview={topicReview} questions={questions} />}
                    {showMobileTimeline && <TopicTimeline timeline={timeline} size="s" />}
                </div>
                <div className="flex-1 hidden md:flex pt-4">
                    <TopicTimeline timeline={timeline} />
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
                    <div className="flex-1 flex">
                        <div className="md:hidden">
                            {showMobileTimeline == false && <RoundButton icon={<TimelineSVG />} size="s" onClick={() => { setShowMobileTimeline(true) }} />}
                            {showMobileTimeline == true && <RoundButton icon={<QuestionsSVG />} size="s" onClick={() => { setShowMobileTimeline(false) }} />}
                        </div>
                    </div>
                </div>
            </Footer>
        </div>
    )

}