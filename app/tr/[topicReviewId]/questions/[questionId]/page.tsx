'use client'

import { TomeAPI } from "@/api/TomeAPI";
import RoundButton from "@/app/ui/buttons/RoundButton";
import IdeaSVG from "@/app/ui/graphics/icons/IdeaSVG";
import { TopicReviewQuestion } from "@/model/questions";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function QuestionDetailPage() {

    const [question, setQuestion] = useState<TopicReviewQuestion>()

    const params = useParams()
    const router = useRouter()
    const pathname = usePathname()

    // const topicReviewId = String(params.topicReviewId);
    const questionId = String(params.questionId);

    const loadQuestion = async () => {

        const question = await new TomeAPI().getQuestion(questionId)

        setQuestion(question)

    }

    /**
     * Go to the page where the user can be helped with a refresher of the topic
     */
    const onClickIdea = () => {

        router.push(`${pathname}/refresher`)

    }

    useEffect(() => { loadQuestion() }, [])

    if (!question) return <></>

    return (

        <div className="flex flex-1 flex-col items-stretch justify-start text-lg">

            {/* Question Box */}
            <div className="flex flex-col align-left mt-2">
                <div className="font-bold flex items-center">
                    <span className="mr-2 bg-cyan-800 rounded px-1 py-[2px] text-cyan-200">{question.questionNum}/{question.numQuestions}</span>Question:
                </div>
                <div className="overflow-y-auto max-h-[200px] mt-2">
                    {question.question}
                </div>
            </div>

            {/* Answer Box */}
            <div className="flex flex-1 flex-col align-left mt-4">
                <div className="font-bold flex items-center">
                    Answer:
                </div>
                <div className="overflow-y-auto max-h-[200px] mt-1">
                    {question.answer}
                </div>
            </div>

            <div className="flex-1"></div>

            <div className="flex justify-center">
                <RoundButton icon={<IdeaSVG/>} onClick={onClickIdea}/>
            </div>
        </div>
    )
}