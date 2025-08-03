import { PracticeFlashcard } from "@/model/PracticeFlashcard";
import React, { useEffect, useState } from "react";
import GraphSVG from "../graphics/icons/GraphSVG";
import DateSVG from "../graphics/icons/DateSVG";
import JusticeSVG from "../graphics/icons/JusticeSVG";
import Tick from "../graphics/icons/Tick";


export function PracticeSections({ flashcards, onItemClick }: { flashcards: PracticeFlashcard[], onItemClick: (itemId: SegmentItemId) => void }) {

    const [segments, setSegments] = useState<{ items: SegmentData[] }[]>([]);

    /**
     * Extract distinct practice items from the provided flashcards. 
     * A practice item is considered distinct if it has a unique sectionTitle and card type.
     * @param flashcards the flashcards to extract sections from
     * @returns a list of objects { sectionTitle: string, type: CardType }
     */
    const extractDistinctPracticeItems = (flashcards: PracticeFlashcard[]) => {

        const distinctItems: { [key: string]: SegmentData } = {};

        flashcards.forEach(card => {

            const key = `${card.originalFlashcard.sectionCode}-${card.originalFlashcard.type}`;

            if (!distinctItems[key]) {

                distinctItems[key] = {
                    sectionCode: card.originalFlashcard.sectionCode,
                    type: card.originalFlashcard.type as CardType,
                    sectionShortTitle: card.originalFlashcard.sectionShortTitle,
                    status: flashcards.filter(fc => fc.originalFlashcard.sectionCode === card.originalFlashcard.sectionCode && fc.originalFlashcard.type === card.originalFlashcard.type && fc.correctlyAsnwerAt == null).length == 0 ? 'done' : 'todo'
                };

            }
        });
        return Object.values(distinctItems);
    }

    /**
     * Creates segments from the distinct items. 
     * Concretely: 
     *  - creates an array of segments. 
     *  - each segment is a list of items 
     *  - there can be either 2 or 3 items in a segment, the number is chosen randomly 
     *  - the last segment can have 1 item if there's only one item left. 
     * @param distinctItems the distinct items to create segments from
     * @return segments as an array of json objects
     */
    const createSegments = (distinctItems: SegmentData[]) => {

        const segments: { items: SegmentData[] }[] = [];

        let currentSegment: SegmentData[] = [];

        distinctItems.forEach(item => {

            currentSegment.push(item);

            if (currentSegment.length === 3) {
                segments.push({ items: currentSegment });
                currentSegment = [];
            }
        });

        if (currentSegment.length > 0) {
            segments.push({ items: currentSegment });
        }

        // Store in a state variable to use in the component
        setSegments(segments);
    }

    useEffect(() => {
        createSegments(extractDistinctPracticeItems(flashcards));
    }, []);

    return (
        <div className="w-full px-4 flex flex-col gap-2">
            {segments && segments.map((segment, index) => {

                // Sort items in the segment to first show "graph" then "options" and then "date". 
                segment.items.sort((a, b) => {
                    const order = { 'graph': 0, 'options': 1, 'timeline': 2, 'date': 3 };
                    return (order[a.type] ?? 4) - (order[b.type] ?? 4);
                });

                // Define the status of the segment as done if all items are done, otherwise todo
                const status: Status = segment.items.every(item => item.status === 'done') ? 'done' : 'todo';

                return (
                    <Segment key={index} index={index} last={index === segments.length - 1} status={status} title={segment.items[0].sectionShortTitle} items={segment.items.map((item, idx) => {

                        return <PracticeItem
                            key={idx}
                            id={{ sectionCode: item.sectionCode, type: item.type } as SegmentItemId}
                            title={item.sectionShortTitle}
                            cardType={item.type as CardType}
                            status={item.status}
                            onPracticeItemClick={onItemClick}
                        />

                    })} />
                )
            })}
        </div>
    )

}

function Segment({ items, index, last, title, status }: { items: React.ReactNode[], index: number, last?: boolean, title: string, status: Status }) {

    return (
        <div className={`rounded py-4 px-4 ${status == 'done' ? 'bg-cyan-800 opacity-50' : 'bg-cyan-800'}`}>
            <div className="text-base text-cyan-200 mb-4 flex justify-start items-center gap-2">
                {title}
                <div className="flex-1"></div>
                <div className={`text-sm flex justify-center items-center border w-6 h-6 rounded border-cyan-200 ${status === 'done' ? 'bg-cyan-200' : ''}`}>
                    {status == 'done' ? <div className="w-4 h-4 text-cyan-500"><Tick /></div> : <span>{index + 1}</span>}
                </div>
            </div>
            <div className="flex flex-row justify-start items-center gap-4">

                {items.map((item, idx) => (
                    <React.Fragment key={idx}>{item}</React.Fragment>
                ))}

            </div>
        </div>
    )
}

export function PracticeItem({ id, title, cardType, status, onPracticeItemClick }: { id: SegmentItemId, title: string, cardType: CardType, status?: Status, onPracticeItemClick: (id: SegmentItemId) => void }) {

    const [pressed, setPressed] = useState(false);

    const borderWidth = 2;

    return (
        <div className="flex flex-col items-center">

            <div className={`
                flex items-center justify-center h-10 w-10 rounded-full border-${borderWidth}
                ${status == 'done' ? 'border-cyan-300 bg-cyan-300' : 'border-lime-200 cursor-pointer bg-cyan-800'}
                `}
                style={{
                    minWidth: "3.5rem",
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
                    w-6 h-6 flex items-center justify-center
                    ${status == 'done' ? 'fill-cyan-400' : 'fill-lime-200'}
                    `}>
                    {cardType == 'graph' ? <GraphSVG /> : cardType == 'date' ? <DateSVG /> : <JusticeSVG />}
                </div>

            </div>
        </div>
    )
}

export type CardType = 'options' | 'timeline' | 'date' | 'graph';
export type Status = 'done' | 'todo';

interface SegmentData { sectionCode: string, type: CardType, sectionShortTitle: string, status: Status }
interface SegmentItemId { sectionCode: string, type: string }