'use client'

import { RunningQuiz } from "@/api/TomeQuizAPI"
import QuizTopicCard from "@/app/ui/cards/QuizTopicCard"
import ScoreCard from "@/app/ui/cards/ScoreCard"
import { ProgressBar } from "@/app/ui/general/ProgressBar"
import { QuizQuestion } from "@/model/QuizQuestion"
import QuizQuestionSummary from "../question/comp/QuizQuestionSummary"

export default function QuizSummary({ runningQuiz, quizQuestions }: { runningQuiz: RunningQuiz, quizQuestions?: QuizQuestion[] }) {

    if (!runningQuiz) return <></>

    return (
        <div className="flex flex-1 flex-col w-full">
            <div className="mt-3 flex">
                <QuizTopicCard />
                <div className="">
                    <ScoreCard scoreNumerator={runningQuiz.score} scoreDenominator={runningQuiz.maxScore} label="score" round={true} />
                </div>
            </div>
            <div className="flex flex-row justify-start items-center space-x-2 mt-4">
                <div className="">
                    <ProgressBar current={runningQuiz.numQuestionsAnswered} max={runningQuiz.numQuestions} />
                </div>
            </div>
            {
                quizQuestions &&
                <div className="mt-4 text-base">
                    <div className="pl-2 text-cyan-200">The Questions:</div>
                    <div className="flex flex-col space-y-1 mt-1">
                        {quizQuestions.map((question) => {
                            if (question.rating == null) return <div key={question.id}></div>
                            return (
                                <QuizQuestionSummary key={question.id} question={question} />
                            )
                        })}
                    </div>
                </div>

            }
        </div >
    )
}
