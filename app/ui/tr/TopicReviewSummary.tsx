import QuestionSummary from "@/app/ui/tr/QuestionSummary";
import TopicTitleCard from "../cards/TopicTitleCard";
import ScoreCard from "../cards/ScoreCard";
import { ProgressBar } from "../general/ProgressBar";
import { TopicReview } from "@/model/topicReview";
import { TopicReviewQuestion } from "@/model/questions";

export default function TopicReviewSummary({ topicReview, questions }: { topicReview: TopicReview, questions?: TopicReviewQuestion[] }) {

    if (!topicReview) return <></>

    // Calculate the number of questions answered
    let numQuestionsAnswered = 0;
    if (questions) {
        for (let question of questions) {
            if (question.rating != null) numQuestionsAnswered++;
        }
    }


    return (
        <div className="flex flex-1 flex-col w-full">
            <div className="mt-3 flex">
                <div className="flex-1">
                    <TopicTitleCard topic={topicReview.topicTitle} />
                </div>
                <div className="pl-2">
                    <ScoreCard scoreNumerator={topicReview.rating ? topicReview.rating : 0} scoreDenominator={topicReview.maxRating} label="score" round={true} />
                </div>
            </div>
            <div className="flex flex-row justify-start items-center space-x-2 mt-4">
                <div className="">
                    <ProgressBar current={numQuestionsAnswered} max={questions ? questions.length : 1} />
                </div>
            </div>
            {
                questions &&
                <div className="mt-4 text-base">
                    <div className="pl-2 text-cyan-200">The Questions:</div>
                    <div className="flex flex-col space-y-1 mt-1">
                        {questions.map((question) => {
                            if (question.rating == null) return <div key={question.id}></div>
                            return (
                                <QuestionSummary key={question.id} question={question} />
                            )
                        })}
                    </div>
                </div>

            }
        </div >
    )
}
