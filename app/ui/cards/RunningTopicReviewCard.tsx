import { TopicReview } from "@/model/topicReview"
import NextSVG from "../graphics/icons/Next"
import RoundButton from "../buttons/RoundButton"
import { useRouter } from "next/navigation"
import Book from "../graphics/icons/Book"
import { ProgressBar } from "../general/ProgressBar"
import { TopicReviewQuestion } from "@/model/questions"

export default function RunningTopicReviewCard({ topicReview, questions }: { topicReview?: TopicReview, questions?: TopicReviewQuestion[] }) {

    const router = useRouter()

    let numQuestionsAnswered = 0;
    if (questions) {
        for (const question of questions) {
            if (question.rating != null) numQuestionsAnswered++;
        }
    }


    return (
        <div className="flex flex-row items-center justify-center mt-6 md:mt-0">
            <div className="group w-full md:w-fit flex flex-col items-stretch border-2 rounded border-lime-200 px-3 py-2 space-x-2 cursor-pointer hover:border-cyan-200" onClick={() => { router.push(`/tr/${topicReview?.id}`) }} >
                <div className="group w-full flex items-center" onClick={() => { router.push(`/tr/${topicReview?.id}`) }} >
                    <div className="w-10 h-10 p-2 fill-lime-200 group-hover:fill-cyan-200"><Book /></div>
                    <div className="flex flex-col flex-1">
                        <div className="text-sm text-cyan-800">You have a running Topic Review</div>
                        <div className="text-lg">{topicReview?.topicTitle}</div>
                    </div>
                    <div className="md:pl-8 group-hover:text-cyan-200">
                        <RoundButton icon={<NextSVG />} iconOnly={true} size="s" onClick={() => { router.push(`/tr/${topicReview?.id}`) }} />
                    </div>
                </div>
                <div className="pt-1">
                    <ProgressBar current={numQuestionsAnswered} max={questions ? questions.length : 1} size="s" />
                </div>
            </div>

        </div>
    )
}