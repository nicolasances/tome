'use client'

import { TomeTopicsAPI, Topic } from "@/api/TomeTopicsAPI";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import moment from "moment";
import { PracticeStats, FlashCardsSession } from "@/app/ui/complex/FlashCardsSession";
import { TomePracticeAPI } from "@/api/TomePracticeAPI";
import { Practice } from "@/model/Practice";
import { PracticeFinished } from "@/app/ui/complex/PracticeFinished";
import TrashSVG from "@/app/ui/graphics/icons/TrashSVG";
import RoundButton from "@/app/ui/buttons/RoundButton";
import { PracticeSnake } from "@/app/ui/complex/PracticeSnake";
import { PracticeFlashcard } from "@/model/PracticeFlashcard";
import { useTomeContext } from "@/context/TomeContext";


export default function PracticeTopicPage() {

    const params = useParams()
    const router = useRouter()
    const tomeContext = useTomeContext()

    const [topic, setTopic] = useState<Topic>()
    const [practice, setPractice] = useState<Practice>() // TODO: Define the type for practice
    const [flashcards, setFlashcards] = useState<PracticeFlashcard[]>([]); // Assuming PracticeFlashcard is the type for flashcards


    /**
     * Load the flashcards
     */
    const loadData = async () => {

        console.log(`Loading practice for topic ${params.topicId} and practice ${params.practiceId}`)

        const [topic, practice] = await Promise.all([
            new TomeTopicsAPI().getTopic(String(params.topicId)),
            new TomePracticeAPI().getPractice(String(params.practiceId))
        ]);

        setTopic(topic);
        setPractice(practice);

        // Load the flashcards 
        const { flashcards } = await new TomePracticeAPI().getPracticeFlashcards(practice.id!);

        setFlashcards(flashcards);
    }

    /**
     * Delete the practice
     */
    const deletePractice = async () => {

        if (!practice || !practice.id) return;

        await new TomePracticeAPI().deletePractice(practice.id)

        router.back()
    }

    /**
     * When an item is clicked in the practice snake, go to the segment practice page.
     */
    const onPracticeItemClick = (itemId: { sectionCode: string, type: string }) => {

        // Filter the flashcards to only include those that match the section code and type
        const filteredFlashcards = flashcards.filter(f => f.originalFlashcard.sectionCode === itemId.sectionCode && f.originalFlashcard.type === itemId.type);

        // Update the Tome context with the current segment review
        tomeContext.updateSegmentPractice({
            practice: practice!,
            topic: topic!,
            flashcards: filteredFlashcards,
            segmentId: {
                sectionCode: itemId.sectionCode,
                type: itemId.type
            }
        });

        // Navigate to the segment practice page, passing the section code and type as query parameters and the topic in the context
        router.push(`/topics/${params.topicId}/practice/${practice!.id}/segment`);

    }

    useEffect(() => { loadData() }, [])

    if (!topic || !practice) return <></>

    return (
        <div className="flex flex-col h-screen items-stretch justify-start px-4 h-full max-h-screen">
            {/* Header - make sticky */}
            <div className="sticky top-0 z-10 pt-4">
                <div className="flex w-full items-center">
                    <div className="flex-1"></div>
                    <div className="flex justify-center text-xl">{topic.name}</div>
                    <div className="flex-1 flex justify-end cursor-pointer">
                        {practice.finishedOn == null && <RoundButton icon={<TrashSVG />} onClick={deletePractice} iconOnly={true} size='s' />}
                    </div>
                </div>
                <div className="flex justify-center mt-2">
                    <div className="text-sm bg-cyan-200 rounded-full px-2">
                        {moment(practice.startedOn, 'YYYYMMDD').format('DD/MM/YYYY')}
                    </div>
                </div>
            </div>
            {/* Body - should scroll on overflow */}
            <div className="flex flex-1 flex-col justify-start pt-8 overflow-y-auto" style={{ scrollbarWidth: "none" }} >
                <style jsx>{`
                div::-webkit-scrollbar {
                display: none;
                }
            `}</style>
                {practice.finishedOn != null && <PracticeFinished practice={practice} stats={practice.stats!} onClose={() => { router.back() }} />}
                {practice.finishedOn == null && flashcards && flashcards.length > 0 &&
                    <div className="mt-16">
                        <PracticeSnake flashcards={flashcards} onItemClick={onPracticeItemClick} />
                    </div>
                }
            </div>
        </div>
    )
}