'use client'

import { TomeAPI } from "@/api/TomeAPI";
import RoundButton from "@/app/ui/buttons/RoundButton";
import BackSVG from "@/app/ui/graphics/icons/Back";
import Book from "@/app/ui/graphics/icons/Book";
import Tick from "@/app/ui/graphics/icons/Tick";
import { LoadingBar } from "@/app/ui/graphics/Loading";
import Footer from "@/app/ui/layout/Footer";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function NewTopicReview() {

    const init = async () => {

    }

    useEffect(() => { init() }, [])

    return (
        <div className="flex flex-1 flex-col items-center justify-center">
            <StartTopicReview />
        </div>
    )
}

function StartTopicReview() {

    const [startingTopicReview, setStartingTopicReview] = useState(false)

    const router = useRouter()

    /**
     * Starts the quiz
     */
    const startTopicReview = async () => {

        setStartingTopicReview(true)

        const response = await new TomeAPI().startTopicReview()

        console.log(response);


        setStartingTopicReview(false)

        router.push(`/tr/${response.topicReview.id}`)

    }

    return (
        <div className="flex flex-col flex-1 items-stretch w-full">
            <div className="uppercase text-base text-cyan-200 font-bold text-center">
                Starting a new Topic Review
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
                {startingTopicReview && <LoadingBar label="Preparing the Questions.." />}
            </div>
            <Footer>
                <div className="flex flex-row justify-center items-center space-x-2">
                    <div className="flex-1 flex justify-end">
                        <RoundButton icon={<BackSVG />} size='s' onClick={() => { router.push('/') }} />
                    </div>
                    <div className="flex">
                        <RoundButton icon={<Tick />} onClick={startTopicReview} disabled={startingTopicReview} />
                    </div>
                    <div className="flex-1">
                    </div>
                </div>
            </Footer>
        </div>
    )
}

