import { QuizQuestion } from "@/model/QuizQuestion";

export default function QuizQuestionSummary({ question }: { question: QuizQuestion }) {

    return (
        <div className="flex flex-row items-center space-x-2 bg-cyan-300 rounded px-2 py-2">
            <div className="">{question.questionNum}</div>
            <div className="flex-1 truncate overflow-hidden w-full">{question.question}</div>
            <div className=""><span className="">{question.rating}</span><span className="">/{question.maxRating}</span></div>
        </div>
    )

}