import { PracticeFlashcard } from "@/model/PracticeFlashcard";
import React, { useEffect, useState } from "react";
import GraphSVG from "../graphics/icons/GraphSVG";
import DateSVG from "../graphics/icons/DateSVG";
import JusticeSVG from "../graphics/icons/JusticeSVG";
import Tick from "../graphics/icons/Tick";
import { EventNode, HistoricalGraphFC } from "@/model/api/GraphFlashcard";


export function PracticeSections({ flashcards, onItemClick }: { flashcards: PracticeFlashcard[], onItemClick: (itemId: SegmentItemId) => void }) {

    const [sections, setSections] = useState<string[]>([]);

    /**
     * Get distinct section codes from the flashcards.
     * @returns a set of distinct section codes
     */
    const getSections = () => {

        const sectionCodes = flashcards.sort((a, b) => a.originalFlashcard.sectionIndex - b.originalFlashcard.sectionIndex).map(card => card.originalFlashcard.sectionCode)

        setSections(Array.from(new Set(sectionCodes).values()));
    }


    useEffect(() => {
        getSections();
    }, []);

    return (
        <div className="w-full flex flex-col">
            {sections && sections.map((section, index) => {

                // // Define the status of the segment as done if all items are done, otherwise todo
                // const status: Status = segment.items.every(item => item.status === 'done') ? 'done' : 'todo';

                return (
                    <Section key={index} sectionCode={section} sectionFlashcards={flashcards.filter(card => card.originalFlashcard.sectionCode === section)} index={index} onPracticeItemClick={onItemClick} />
                )
            })}
        </div>
    )

}

function Section({ sectionCode, sectionFlashcards, index, onPracticeItemClick }: { sectionCode: string, sectionFlashcards: PracticeFlashcard[], index: number, onPracticeItemClick: (id: SegmentItemId) => void }) {

    const [status, setStatus] = useState<Status>('todo');

    const title = sectionFlashcards[0].originalFlashcard.sectionShortTitle;

    const cardTypes = Array.from(new Set(sectionFlashcards.map(card => card.originalFlashcard.type))).sort((a, b) => {
        const order: Record<CardType, number> = { 'graph': 0, 'options': 1, 'timeline': 2, 'date': 3 };
        return (order[a as CardType] ?? 4) - (order[b as CardType] ?? 4);
    });

    useEffect(() => {
        // Check if all the cards in the section have been completed, a.k.a have a  correctlyAsnwerAt != null
        const allCompleted = sectionFlashcards.every(card => card.correctlyAsnwerAt != null);
        setStatus(allCompleted ? 'done' : 'todo');
    }, [])

    return (
        <div className={`rounded pt-4 pb-2 px-2 `}>
            <div className={`text-base mb-4 flex justify-start items-end gap-2 border-b border-gray-200 pb-2 ${status == 'done' ? 'text-cyan-300' : 'text-gray-900'}`}>
                <div className={`text-sm flex justify-center items-center border ${status === 'done' ? 'bg-cyan-300 rounded-full' : ''}`}>
                    {status == 'done' ? <div className="w-4 h-4 text-cyan-500"><Tick /></div> : <span>{index + 1}</span>}
                </div>
                {title}
                <div className="flex-1 flex justify-end px-2">{sectionFlashcards.length}</div>
            </div>
            <div className="flex flex-row justify-start items-center gap-4">
                {cardTypes.map((type, idx) => (
                    <PracticeItem key={idx} id={{ sectionCode, type }} cardType={type as CardType} flashcards={sectionFlashcards.filter(card => card.originalFlashcard.type === type)} onPracticeItemClick={onPracticeItemClick} />
                ))}
            </div>
        </div>
    )
}

export function PracticeItem({ id, cardType, flashcards, onPracticeItemClick }: { id: SegmentItemId, cardType: CardType, flashcards: PracticeFlashcard[], onPracticeItemClick: (id: SegmentItemId) => void }) {

    const [pressed, setPressed] = useState(false);
    const [status, setStatus] = useState<Status>('todo');

    const borderWidth = 2;

    const countGraphItems = (graphCard: HistoricalGraphFC) => {
        const graph = graphCard.graph.eventGraph;

        let count = 0;
        let node = graph.firstEvent as EventNode | null;
        while (node != null) {
            count++;
            node = node.nextEvent;
        }

        return count;
    }

    let count = flashcards.length;
    if (cardType == 'graph') count = countGraphItems(flashcards[0].originalFlashcard as HistoricalGraphFC);

    useEffect(() => {
        // Check if all the cards in the section have been completed, a.k.a have a  correctlyAsnwerAt != null
        const allCompleted = flashcards.every(card => card.correctlyAsnwerAt != null);
        setStatus(allCompleted ? 'done' : 'todo');
    }, [])

    return (
        <div className="flex flex-col items-center">

            <div className={`
                flex items-center justify-center h-10 w-10 rounded-full border-${borderWidth} relative
                ${status == 'done' ? 'border-cyan-300 bg-cyan-300' : 'border-lime-200 cursor-pointer'}
                `}
                style={{
                    transform: pressed ? "scale(0.95)" : "scale(1)",
                }}
                onMouseDown={() => setPressed(true)}
                onMouseUp={() => setPressed(false)}
                onMouseLeave={() => setPressed(false)}
                onTouchStart={() => setPressed(true)}
                onTouchEnd={() => setPressed(false)}
                onClick={() => { if (status != 'done') onPracticeItemClick(id) }}
                role="button"
            >

                <div className={`
                    w-4 h-4 flex items-center justify-center
                    ${status == 'done' ? 'fill-cyan-400' : 'fill-lime-200'}
                    `}>
                    {cardType == 'graph' ? <GraphSVG /> : cardType == 'date' ? <DateSVG /> : <JusticeSVG />}
                </div>
            <div className={`absolute bg-cyan-300 w-4 h-4 rounded-full flex justify-center items-center top-0 -right-2 text-xs ${status == 'done' ? 'text-cyan-500' : 'text-gray-900'}`}>
                    {count}
                </div>

            </div>
        </div>
    )
}

export type CardType = 'options' | 'timeline' | 'date' | 'graph';
export type Status = 'done' | 'todo';

interface SegmentData { sectionCode: string, type: CardType, sectionShortTitle: string, status: Status }
interface SegmentItemId { sectionCode: string, type: string }