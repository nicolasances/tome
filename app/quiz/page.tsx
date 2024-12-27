'use client'

import { TomeQuizAPI } from "@/api/TomeQuizAPI";
import LightningBoltSVG from "@/app/ui/buttons/assets/LightningBoltSVG";
import RoundButton from "@/app/ui/buttons/RoundButton";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function NewQuiz() {

    const router = useRouter()

    const init = async () => {

        const runningQuiz = await new TomeQuizAPI().getRunningQuiz()

        if (!runningQuiz) return; 

    }

    useEffect(() => { init() }, [])

    return (
        <div className="flex flex-1 flex-col items-center justify-center space-y-2">
            <div className="text-3xl mb-6">
                Ready to start?
            </div>
            <div className="flex">
                <RoundButton icon={<LightningBoltSVG />} onClick={() => { router.push('/quiz/question') }} />
            </div>
        </div>
    )
}