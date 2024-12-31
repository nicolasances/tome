'use client'

import { RunningQuiz, TomeQuizAPI, TomeQuizError } from "@/api/TomeQuizAPI";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ScoreCard from "../ui/cards/ScoreCard";
import { Button } from "@/components/ui/button";
import { LoadingBar } from "../ui/graphics/Loading";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SingleValueCard from "../ui/cards/SingleValueCard";
import moment from "moment";

export default function NewQuiz() {

    const [loading, setLoading] = useState(false);
    const [runningQuiz, setRunningQuiz] = useState<RunningQuiz>()

    const router = useRouter()

    const init = async () => {

        const timer = setTimeout(() => { setLoading(true) }, 300)

        const runningQuiz = await new TomeQuizAPI().getRunningQuiz()

        clearTimeout(timer)
        setLoading(false)

        if (!runningQuiz) return;
        if (runningQuiz instanceof TomeQuizError) return;

        setRunningQuiz(runningQuiz)
    }

    useEffect(() => { init() }, [])

    if (loading) return <div className="text-base"><LoadingBar /></div>

    return (
        <div className="flex flex-1 flex-col items-center justify-center">
            {!runningQuiz && <StartQuiz />}
            {runningQuiz && <QuizSummary runningQuiz={runningQuiz} />}
            {runningQuiz &&
                <Button className="text-base" onClick={() => { router.push(`/quiz/question?quizId=${runningQuiz.id}`) }}>Continue</Button>
            }
        </div>
    )
}

function QuizSummary({ runningQuiz }: { runningQuiz: RunningQuiz }) {

    if (!runningQuiz) return <></>

    return (
        <div className="flex flex-1 flex-col space-y-2">
            <Card className="flex flex-col">
                <CardHeader>
                    <CardTitle>{runningQuiz.topic}</CardTitle>
                    <CardDescription>{runningQuiz.section}</CardDescription>
                </CardHeader>
            </Card>
            <div className="flex flex-row justify-start items-center space-x-2">
                <div className="">
                    <SingleValueCard value={moment(runningQuiz.startedOn, 'YYYYMMDD').format('DD.MM.YYYY')} label="Started On" style="none" />
                </div>
                <div className="">
                    <ScoreCard scoreNumerator={runningQuiz.score} scoreDenominator={runningQuiz.maxScore} label="score" />
                </div>
                <div className="">
                    <ScoreCard scoreNumerator={runningQuiz.numQuestionsAnswered} scoreDenominator={runningQuiz.numQuestions} label="questions" style="empty" />
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

        router.push('/quiz/question')

    }

    return (
        <div className="flex flex-col flex-1 items-stretch w-full">
            <div className="text-sm text-cyan-200 pl-2">
                You are going to start a quiz on:
            </div>
            <div className="mt-1">
                <Card className="flex-1 flex flex-col">
                    <CardHeader>
                        <CardTitle>Cortés</CardTitle>
                        <CardDescription>The Conquest of Mexico</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {startingQuiz &&
                            <div className="mt-2 flex w-full text-sm">
                                <LoadingBar label="Creating your Quiz.." />
                            </div>
                        }
                    </CardContent>
                </Card>
            </div>
            <div className="flex flex-1 flex-col justify-end">
                <Button className="text-base" onClick={startQuiz} disabled={startingQuiz}>Start the Quiz!</Button>
            </div>
        </div>
    )
}