'use client'

import { RunningQuiz, TomeQuizAPI, TomeQuizError } from "@/api/TomeQuizAPI";
import { QuizQuestion } from "@/model/QuizQuestion";
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react";
import QuizSummary from "../comp/QuizSummary";
import { LoadingBar } from "@/app/ui/graphics/Loading";
import RoundButton from "@/app/ui/buttons/RoundButton";
import HomeSVG from "@/app/ui/graphics/icons/HomeSVG";

export default function QuizDetail() {

    const router = useRouter()
    const params = useParams()

    const quizId = String(params.quizId);

    const [loading, setLoading] = useState(true);
    const [showLoadingBar, setShowLoadingBar] = useState(false)
    const [runningQuiz, setRunningQuiz] = useState<RunningQuiz>()
    const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>()

    const init = async () => {

        const timer = setTimeout(() => { setShowLoadingBar(true) }, 400)
        setLoading(true)

        const runningQuiz = await new TomeQuizAPI().getQuiz(quizId)

        clearTimeout(timer)
        setLoading(false)
        setShowLoadingBar(false)

        if (!runningQuiz || runningQuiz.id == null) return;
        if (runningQuiz instanceof TomeQuizError) return;

        loadQuestions(runningQuiz.id);

        setRunningQuiz(runningQuiz)
    }

    /**
     * Loads the quiz questions
     */
    const loadQuestions = async (quizId: string) => {

        const quizQuestionsResponse = await new TomeQuizAPI().getQuizQuestions(quizId);

        setQuizQuestions(quizQuestionsResponse.questions)

    }

    useEffect(() => { init() }, [])

    if (showLoadingBar) return <div className="text-base"><LoadingBar /></div>
    if (loading) return <></>

    return (
        <div className="flex flex-1 flex-col items-center justify-center">
            {runningQuiz && <QuizSummary runningQuiz={runningQuiz} quizQuestions={quizQuestions} />}
            <div className="flex flex-1 flex-col justify-end">
                <RoundButton icon={<HomeSVG />} onClick={() => { router.push('/') }} />
            </div>
        </div>
    )

}