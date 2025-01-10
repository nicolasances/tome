import QuestionSummary from "@/app/ui/tr/QuestionSummary";
import TopicTitleCard from "../cards/TopicTitleCard";
import ScoreCard from "../cards/ScoreCard";
import { ProgressBar } from "../general/ProgressBar";
import { TopicReview } from "@/model/topicReview";
import { TopicReviewQuestion } from "@/model/questions";
import BottomFade from "../layout/BottomFade";

export default function TopicReviewSummary({ topicReview, questions }: { topicReview: TopicReview, questions?: TopicReviewQuestion[] }) {

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
                        <ScoreCard scoreNumerator={averageRating} scoreDenominator={topicReview.maxRating} label="score" round={true} />
                    </div>
                </div>
                <div className="flex flex-row justify-start items-center space-x-2 mt-4">
                    <div className="">
                        <ProgressBar current={numQuestionsAnswered} max={questions ? questions.length : 1} />
                    </div>
                </div>
            </div>
            {
                questions &&
                <div className="relative">
                    <div className="pl-2 text-cyan-200">The Questions:</div>
                    <div className="text-base overflow-scroll no-scrollbar -mx-2 px-2 mt-1" style={{ maxHeight: 'calc(100vh - var(--app-header-height) - var(--app-footer-height) - 100px - 64px)', paddingBottom: '24px' }}>
                        <div className="flex flex-col space-y-1 relative">
                            {questions.map((question) => {
                                if (question.rating == null) return <div key={question.id}></div>
                                return (
                                    <QuestionSummary key={question.id} question={question} />
                                )
                            })}
                        </div>
                    </div>
                    <BottomFade></BottomFade>
                </div>

            }
        </div >
    )
}
