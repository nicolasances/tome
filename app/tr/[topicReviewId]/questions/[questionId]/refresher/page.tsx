'use client'

import { TomeAPI } from "@/api/TomeAPI";
import RoundButton from "@/app/ui/buttons/RoundButton";
import Book from "@/app/ui/graphics/icons/Book";
import { LoadingBar } from "@/app/ui/graphics/Loading";
import { Topic } from "@/model/Topic";
import { FormattedDetailedRatingExplanation } from "@/utils/RatingExplanation";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from 'next/link'
import Footer from "@/app/ui/layout/Footer";
import BackSVG from "@/app/ui/graphics/icons/Back";
import BottomFade from "@/app/ui/layout/BottomFade";

export default function RefresherPage() {

    const [loading, setLoading] = useState<boolean>(true)
    const [refresher, setRefresher] = useState<string>()
    const [topic, setTopic] = useState<Topic>()

    const params = useParams()
    const router = useRouter()

    const topicReviewId = String(params.topicReviewId);
    const questionId = String(params.questionId);

    const loadRefresher = async () => {

        setLoading(true)

        const refresher = await new TomeAPI().getRefresher(questionId);

        setRefresher(refresher.refresher)
        setTopic(refresher.topic)
        setLoading(false)

    }

    useEffect(() => { loadRefresher() }, [])

    return (
        <div className="flex flex-1 flex-col items-stretch justify-start text-lg">

            <div className="relative">

                <div className="flex flex-1 flex-col align-left mt-4 pb-8 overflow-scroll no-scrollbar" style={{ maxHeight: 'calc(100vh - var(--app-header-height) - var(--app-footer-height) - 48px)' }}>
                    <div className="font-bold flex items-center">
                        A little refresher of this section!
                    </div>
                    {loading &&
                        <div className="mt-1">
                            <LoadingBar />
                        </div>
                    }
                    {!loading && refresher &&
                        <div className="mt-2">
                            <FormattedDetailedRatingExplanation text={refresher} />
                            {topic &&
                                <div className="mt-4">
                                    <div className="text-cyan-200">Want more information?</div>
                                    <Link href={topic.blog_url} target="_blank"><span className="underline text-blue">{topic.blog_url}</span></Link>
                                </div>
                            }
                        </div>
                    }
                </div>
                <BottomFade height="lg" />
            </div>

            <div className="flex-1"></div>

            <Footer>
                <div className="flex justify-center items-center space-x-2">
                    <div className="flex flex-1 justify-end">
                        <RoundButton icon={<BackSVG />} size='s' onClick={() => { router.back() }} />
                    </div>
                    <RoundButton icon={<Book />} onClick={() => { router.push(`/tr/${topicReviewId}`) }} />
                    <div className="flex-1">
                    </div>
                </div>
            </Footer>

        </div>
    )

}