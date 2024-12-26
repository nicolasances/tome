'use client'

import { useState } from "react";
import NewQuiz from "./ui/NewQuiz";
import Question from "./ui/Question";

type QuizState = 'not-started' | 'question' | 'answer' | 'finished'

export default function Quiz() {

    const [quizState, setQuizState] = useState<QuizState>('not-started')

    /**
     * Starts a new quiz
     */
    const startQuiz = () => {

        setQuizState('question')

    }

    return (
        <>
            {quizState == 'not-started' && <NewQuiz onStartQuiz={startQuiz} />}
            {quizState == 'question' && <Question/>}
        </>
    );
}
