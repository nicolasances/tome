import QuestionSummary from "@/app/ui/tr/QuestionSummary";
import { TopicReview } from "@/model/topicReview";
import { TopicReviewQuestion } from "@/model/questions";
import BottomFade from "../layout/BottomFade";

export default function TopicReviewSummary({ topicReview, questions }: { topicReview: TopicReview, questions?: TopicReviewQuestion[] }) {

    if (!topicReview) return <></>

    return (
        <div className="flex flex-1 flex-col w-full">
            {
                questions && 
                <div className="relative mt-4">
                    <div className="pl-2 text-cyan-200">The Questions:</div>
                    <div className="text-base overflow-scroll no-scrollbar -mx-2 px-2 mt-1" style={{ maxHeight: 'calc(100vh - var(--app-header-height) - var(--app-footer-height) - 100px - 64px)', paddingBottom: '24px' }}>
                        <div className="flex flex-col space-y-1 relative">
                            {questions.map((question) => {
                                // if (question.rating == null) return <div key={question.id}></div>
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
