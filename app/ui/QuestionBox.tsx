import { TopicReviewQuestion } from "@/model/questions";

export default function QuestionBox({ question }: { question: TopicReviewQuestion }) {

    return (
        <div className="flex flex-col align-left mt-2">
            <div className="font-bold flex items-center">
                <span className="mr-2 bg-cyan-800 rounded px-1 py-[2px] text-cyan-200">{question.questionNum}/{question.numQuestions}</span>Question:
            </div>
            <div className="mt-2 font-bold text-xl">
                {question.sectionTitle}
            </div>
            <div className="overflow-y-auto max-h-[200px] mt-2">
                {question.question}
            </div>
        </div>
    )
}