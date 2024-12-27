'use client'

import { AnswerRating } from "@/api/TomeQuizAPI";
import RoundButton from "@/app/ui/buttons/RoundButton";
import ScoreCard from "@/app/ui/cards/ScoreCard";
import OkSVG from "@/app/ui/graphics/icons/Ok";
import { useRouter } from "next/navigation";

export default function UserAnswerRating({ rating }: { rating: AnswerRating }) {

    const router = useRouter()

    return (
        <div className="flex flex-1 flex-col items-stretch justify-start">

            <div className="flex justify-center">
                <ScoreCard scoreNumerator={rating.rating.score} scoreDenominator={rating.rating.maxScore} />
            </div>

            {/* Explanation Box */}
            <div className="flex flex-1 flex-col align-left mt-8">
                <div className="text-[48px]">{'"'}</div>
                <div className="-mt-8 mb-2 font-bold text-sm">
                    Rating:
                </div>
                <div className="">
                    {rating.rating.explanation}
                </div>
            </div>

            <div className="flex justify-center">
                <RoundButton icon={<OkSVG />} onClick={() => { router.back() }} />
            </div>

        </div>
    )
}