import { AnswerRating } from "@/model/answer";
import { FormattedRatingExplanation } from "@/utils/RatingExplanation";

export function AnswerRatingWidget({rating, className}: {rating: AnswerRating | undefined, className: string}) {

    if (!rating) return <div></div>

    return (

        <div className={className}>

            <div className="flex items-center text-lg">
                <div className="font-bold">Rating: </div>
                <div className="ml-2 bg-cyan-200 rounded px-2 py-1"><span className="font-bold">{rating.rating}</span><span>/{rating.maxRating}</span></div>
            </div>

            {/* Explanation Box */}
            <div id="explanation-box" className="flex flex-1 flex-col align-left mt-4 pb-4" >
                <FormattedRatingExplanation explanation={rating.explanations} />
            </div>

        </div>
    )
}