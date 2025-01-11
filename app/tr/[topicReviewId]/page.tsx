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

export default function QuizDetail() {

    const router = useRouter()
    const params = useParams()

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

    }

    useEffect(() => { init() }, [])

    if (showLoadingBar) return <div className="text-base"><LoadingBar /></div>
    if (loading) return <></>

    return (
        <div className="flex flex-1 flex-col items-center justify-center">
            {topicReview && <TopicReviewSummary topicReview={topicReview} questions={questions} />}
            <Footer>
                <div className="flex flex-1 flex-row justify-center items-center space-x-2">
                    <div className="flex-1 flex justify-end">
                        {!topicReview?.completedOn &&
                            <RoundButton icon={<HomeSVG />} size='s' onClick={() => { router.push('/') }} />
                        }
                    </div>
                    <div className="">
                        {!topicReview?.completedOn &&
                            <div>
                                <RoundButton icon={<NextSVG />} onClick={() => { router.push(`/tr/${topicReviewId}/questions/next`) }} />
                            </div>
                        }
                        {topicReview?.completedOn &&
                            <div className="flex flex-1 flex-col justify-end">
                                <RoundButton icon={<HomeSVG />} onClick={() => { router.push('/') }} />
                            </div>
                        }
                    </div>
                    <div className="flex-1"></div>
                </div>
            </Footer>
        </div>
    )

}