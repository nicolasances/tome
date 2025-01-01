'use client'

import { AnswerRating, QuizQuestion, TomeQuizAPI } from "@/api/TomeQuizAPI";
import { Suspense, useEffect, useState } from "react";
import UserAnswerRating from "./ui/AnswerRating";
import { useSearchParams } from "next/navigation";
import Question from "./ui/Question";

export default function QuestionAndAnswerPage() {

    return (
        <Suspense>
            <QuestionUI/>
        </Suspense>
    )
}

function QuestionUI() {

    const [question, setQuestion] = useState<QuizQuestion>();
    const [rating, setRating] = useState<AnswerRating>();

    const searchParams = useSearchParams()
    const quizId = searchParams.get('quizId')

    const loadQuestion = async () => {

        const question = await new TomeQuizAPI().getNextQuestion(quizId!);

        setQuestion(question)

    }

    /**
     * Sends the answer and gets it rated
     */
    const sendAnswer = async (answer: string) => {

        if (!answer || !question) return;

        const ratingResponse = await new TomeQuizAPI().sendAnswer({ questionId: question.id, answer: answer })

        setRating(ratingResponse);

    }

    useEffect(() => { loadQuestion() }, [])

    return (

        <div className="flex flex-1 flex-col items-stretch justify-start">

            {question && !rating && <Question question={question} onAnswer={sendAnswer} />}
            {question && rating && <UserAnswerRating rating={rating} quizId={quizId!} />}

        </div>
    )

}