'use client'

import { AnswerRating, QuizQuestion, TomeQuizAPI } from "@/api/TomeQuizAPI";
import { useEffect, useState } from "react";
import Question from "./ui/Question";
import UserAnswerRating from "./ui/AnswerRating";

export default function QuestionAndAnswerPage() {

    const [question, setQuestion] = useState<QuizQuestion>();
    const [rating, setRating] = useState<AnswerRating>();

    const loadQuestion = async () => {

        const question = await new TomeQuizAPI().getNextQuestion();

        setQuestion(question)

    }

    /**
     * Sends the answer and gets it rated
     */
    const sendAnswer = async (answer: string) => {

        if (!answer || !question) return;

        const ratingResponse = await new TomeQuizAPI().sendAnswer({ questionId: question.id, answer: answer })

        setRating(ratingResponse);

        console.log(ratingResponse);


    }

    useEffect(() => { loadQuestion() }, [])

    return (
        <div className="flex flex-1 flex-col items-stretch justify-start">

            {question && !rating && <Question question={question} onAnswer={sendAnswer} />}
            {question && rating && <UserAnswerRating rating={rating} />}

        </div>
    )
}