import { TopicReviewQuestion } from "@/model/questions";
import { useRouter } from "next/navigation";

export default function QuestionSummary({ question }: { question: TopicReviewQuestion }) {

    const router = useRouter()

    const goToQuestionDetail = () => {

        router.push(`/tr/${question.topicReviewId}/questions/${question.id}`)

    }

    let bg = 'bg-cyan-300'
    let txt = 'text-cyan-900'
    if (question.rating == null) {
        bg = 'bg-cyan-500'; 
        txt = 'text-cyan-700'
    }

    return (
        <div className={`flex flex-row items-center space-x-2 ${bg} ${txt} rounded px-2 py-2 hover:bg-cyan-400 cursor-pointer`} onClick={goToQuestionDetail}>
            <div className="">{question.questionNum}</div>
            <div className="flex-1 truncate overflow-hidden w-full">{question.question}</div>
            {question.rating && <div className=""><span className="">{question.rating}</span><span className="">/{question.maxRating}</span></div>}
        </div>
    )

}