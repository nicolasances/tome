'use client'

import { AnswerRating } from "@/api/TomeQuizAPI";
import RoundButton from "@/app/ui/buttons/RoundButton";
import BackSVG from "@/app/ui/graphics/icons/Back";
import NextSVG from "@/app/ui/graphics/icons/Next";
import QuestionSVG from "@/app/ui/graphics/icons/QuestionSVG";
import Tick from "@/app/ui/graphics/icons/Tick";
import { FormattedDetailedRatingExplanation, FormattedRatingExplanation } from "@/utils/RatingExplanation";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function UserAnswerRating({ rating, quizId }: { rating: AnswerRating, quizId: string }) {

    const [showDetails, setShowDetails] = useState(false)

    const router = useRouter()

    return (
        <div className="flex flex-1 flex-col items-stretch justify-start">

            <div style={{ maxHeight: 'calc(90vh - var(--app-header-height) - var(--app-footer-height))', overflow: 'scroll' }}>

                <div className="flex items-center text-lg">
                    <div className="">Rating: </div>
                    <div className="ml-2 bg-cyan-200 rounded px-2 py-1"><span className="font-bold">{rating.rating}</span><span>/{rating.maxRating}</span></div>
                </div>

                {/* Explanation Box */}
                <div id="explanation-box" className="flex flex-1 flex-col align-left mt-4" >
                    {!showDetails && <FormattedRatingExplanation explanation={rating.explanations} />}
                    {showDetails &&
                        <div className="mb-4">
                            <FormattedDetailedRatingExplanation text={rating.detailedExplanations} />
                        </div>
                    }
                </div>

            </div>
            <div className="flex-1"></div>

            <div style={{ height: 'var(--app-footer-height)' }}>
                <div className="flex justify-center flex-row space-x-2" style={{ maxHeight: 'var(--app-footer-height)' }}>
                    {!showDetails && <RoundButton icon={<QuestionSVG />} onClick={() => { setShowDetails(true) }} />}
                    {showDetails && <RoundButton icon={<BackSVG />} onClick={() => { setShowDetails(false) }} />}

                    {!rating.quizFinished && <RoundButton icon={<NextSVG />} onClick={() => { window.location.reload() }} />}
                    {rating.quizFinished && <RoundButton icon={<Tick/>} onClick={() => { router.push(`/quiz/${quizId}`) }}/>}
                </div>
            </div>

        </div>
    )
}