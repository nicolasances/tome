'use client'

import { RunningQuiz, TomeQuizAPI, TomeQuizError } from "@/api/TomeQuizAPI";
import LightningBoltSVG from "@/app/ui/buttons/assets/LightningBoltSVG";
import RoundButton from "@/app/ui/buttons/RoundButton";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ScoreCard from "../ui/cards/ScoreCard";
import { Button } from "@/components/ui/button";

export default function NewQuiz() {

    const [runningQuiz, setRunningQuiz] = useState<RunningQuiz>()

    const router = useRouter()

    const init = async () => {

        const runningQuiz = await new TomeQuizAPI().getRunningQuiz()

        if (!runningQuiz) return;
        if (runningQuiz instanceof TomeQuizError) return;

        setRunningQuiz(runningQuiz)
    }

    useEffect(() => { init() }, [])

    return (
        <div className="flex flex-1 flex-col items-center justify-center space-y-2">
            {!runningQuiz && <StartQuiz />}
            {runningQuiz && <QuizSummary runningQuiz={runningQuiz} />}
            <div className="flex-1"></div>
            {runningQuiz &&
                <Button onClick={() => { router.push('/quiz/question') }}>Continue</Button>
            }
        </div>
    )
}

function QuizSummary({ runningQuiz }: { runningQuiz: RunningQuiz }) {

    if (!runningQuiz) return <></>

    return (
        <div className="flex flex-1 flex-col">
            <div className="flex flex-row justify-start items-center space-x-2">
                <div className="text-sm">You have a running quiz {runningQuiz.topic && 'on '}<span className="uppercase font-bold text-cyan-200 pr-10">{runningQuiz.topic}</span></div>
                <div className="">
                    <ScoreCard scoreNumerator={runningQuiz.score} scoreDenominator={runningQuiz.maxScore} label="score" />
                </div>
                <div className="">
                    <ScoreCard scoreNumerator={runningQuiz.questions} scoreDenominator={runningQuiz.maxQuestions} label="questions" style="empty" />
                </div>
            </div>
        </div>
    )
}

function StartQuiz() {
    const router = useRouter()
    return (
        <>
            <div className="text-3xl mb-6">
                Ready to start?
            </div>
            <div className="flex">
                <RoundButton icon={<LightningBoltSVG />} onClick={() => { router.push('/quiz/question') }} />
            </div>
        </>
    )
}