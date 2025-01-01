'use client'

import { RunningQuiz, TomeQuizAPI, TomeQuizError } from "@/api/TomeQuizAPI";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ScoreCard from "../ui/cards/ScoreCard";
import { LoadingBar } from "../ui/graphics/Loading";
import Book from "../ui/graphics/icons/Book";
import RoundButton from "../ui/buttons/RoundButton";
import Tick from "../ui/graphics/icons/Tick";
import QuizTopicCard from "../ui/cards/QuizTopicCard";
import { ProgressBar } from "../ui/general/ProgressBar";
import NextSVG from "../ui/graphics/icons/Next";

export default function NewQuiz() {

    const [loading, setLoading] = useState(true);
    const [showLoadingBar, setShowLoadingBar] = useState(false)
    const [runningQuiz, setRunningQuiz] = useState<RunningQuiz>()

    const router = useRouter()

    const init = async () => {

        const timer = setTimeout(() => { setShowLoadingBar(true) }, 400)
        setLoading(true)

        const runningQuiz = await new TomeQuizAPI().getRunningQuiz()

        clearTimeout(timer)
        setLoading(false)
        setShowLoadingBar(false)

        if (!runningQuiz || runningQuiz.id == null) return;
        if (runningQuiz instanceof TomeQuizError) return;

        setRunningQuiz(runningQuiz)
    }

    useEffect(() => { init() }, [])

    if (showLoadingBar) return <div className="text-base"><LoadingBar /></div>
    if (loading) return <></>

    return (
        <div className="flex flex-1 flex-col items-center justify-center">
            {!runningQuiz && <StartQuiz />}
            {runningQuiz && <QuizSummary runningQuiz={runningQuiz} />}
            {runningQuiz &&
                <RoundButton icon={<NextSVG />} onClick={() => { router.push(`/quiz/question?quizId=${runningQuiz.id}`) }} />
            }
        </div>
    )
}

function QuizSummary({ runningQuiz }: { runningQuiz: RunningQuiz }) {

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
        </div>
    )
}

function StartQuiz() {

    const [startingQuiz, setStartingQuiz] = useState(false)

    const router = useRouter()

    /**
     * Starts the quiz
     */
    const startQuiz = async () => {

        setStartingQuiz(true)

        const response = await new TomeQuizAPI().startQuiz()

        console.log(response);

        setStartingQuiz(false)

        router.push(`/quiz/question?quizId=${response.quizId}`)

    }

    return (
        <div className="flex flex-col flex-1 items-stretch w-full">
            <div className="uppercase text-base text-cyan-200 font-bold text-center">
                Chosen Quiz
            </div>
            <div className="flex flex-col justify-center items-center mt-4">
                <div className="fill-cyan-800 w-12 h-12 rounded-full border-2 border border-cyan-800 p-3">
                    <Book />
                </div>
                <div className="flex-col justify-center items-center text-center pt-2">
                    <div className="text-xl uppercase"><b>Cortés</b></div>
                    <div className="text-lg">Invasion of Mexico and La Noche Triste</div>
                </div>
            </div>
            <div className="flex-1 mt-12">
                {startingQuiz && <LoadingBar label="Preparing the Questions.." />}
            </div>
            <div className="flex flex-col justify-end items-center">
                <div className="flex">
                    <RoundButton icon={<Tick />} onClick={startQuiz} disabled={startingQuiz} />
                </div>
            </div>
        </div>
    )
}