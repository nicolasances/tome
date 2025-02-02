import { TopicReview } from "@/model/topicReview"
import NextSVG from "../graphics/icons/Next"
import RoundButton from "../buttons/RoundButton"
import { useRouter } from "next/navigation"
import Book from "../graphics/icons/Book"

export default function RunningTopicReviewCard({ topicReview }: { topicReview?: TopicReview }) {

    const router = useRouter()

    return (
        <div className="flex flex-row items-center justify-center mt-6 md:mt-0">
            <div className="group w-full md:w-fit flex items-center border-2 rounded border-lime-200 px-3 py-2 space-x-2 cursor-pointer hover:border-cyan-200" onClick={() => { router.push(`/tr/${topicReview?.id}`) }} > 
                <div className="w-10 h-10 p-2 fill-lime-200 group-hover:fill-cyan-200"><Book /></div>
                <div className="flex flex-col flex-1 md:flex-none">
                    <div className="text-sm text-cyan-800">You have a running Topic Review</div>
                    <div className="text-lg">{topicReview?.topicTitle}</div>
                </div>
                <div className="md:pl-8 group-hover:text-cyan-200">
                    <RoundButton icon={<NextSVG />} iconOnly={true} size="s" onClick={() => { router.push(`/tr/${topicReview?.id}`) }} />
                </div>
            </div>
        </div>
    )
}