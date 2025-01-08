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

            <div className="flex flex-1 flex-col align-left mt-4">
                <div className="font-bold flex items-center">
                    Let's refresh this section!
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

            <div className="flex-1"></div>

            <div className="flex justify-center my-6">
                <RoundButton icon={<Book />} onClick={() => { router.push(`/tr/${topicReviewId}`) }} />
                {/* <RoundButton icon={<IdeaSVG/>} onClick={onClickIdea}/> */}
            </div>
        </div>
    )

}