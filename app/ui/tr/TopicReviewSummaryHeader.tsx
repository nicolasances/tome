import { TopicReviewQuestion } from "@/model/questions";
import { TopicReview } from "@/model/topicReview";
import TopicTitleCard from "../cards/TopicTitleCard";
import ScoreCard from "../cards/ScoreCard";
import { ProgressBar } from "../general/ProgressBar";

export default function TopicReviewSummaryHeader({ topicReview, questions }: { topicReview?: TopicReview, questions?: TopicReviewQuestion[] }) { 

    if (!topicReview) return <></>

    // Calculate the number of questions answered
    let numQuestionsAnswered = 0;
    if (questions) {
        for (const question of questions) {
            if (question.rating != null) numQuestionsAnswered++;
        }
    }

    // Calculate the average rating of the questions
    let averageRating = 0;
    if (questions) {
        for (const question of questions) {
            if (question.rating != null) averageRating += question.rating;
        }
        averageRating = averageRating / numQuestionsAnswered;
    }


    return (
        <div className="flex flex-1 flex-col w-full">
            <div style={{ height: 100 }}>
                <div className="mt-3 flex">
                    <div className="flex-1">
                        <TopicTitleCard topic={topicReview.topicTitle} />
                    </div>
                    <div className="pl-2">
                        <ScoreCard scoreNumerator={averageRating ? averageRating : -1} scoreDenominator={topicReview.maxRating} label="score" round={true} />
                    </div>
                </div>
                <div className="flex flex-row justify-start items-center space-x-2 mt-4">
                    <div className="">
                        <ProgressBar current={numQuestionsAnswered} max={questions ? questions.length : 1} />
                    </div>
                </div>
            </div>
        </div >
    )
}
