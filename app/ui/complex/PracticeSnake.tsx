import React, { useEffect, useState } from "react"
import { ChessSVG } from "../graphics/icons/ChessSVG";
import JusticeSVG from "../graphics/icons/JusticeSVG";
import { PracticeFlashcard } from "@/model/PracticeFlashcard";
import DateSVG from "../graphics/icons/DateSVG";
import GraphSVG from "../graphics/icons/GraphSVG";

export function PracticeSnake({ flashcards, onItemClick }: { flashcards: PracticeFlashcard[], onItemClick: (itemId: SegmentItemId) => void }) {

    const [segments, setSegments] = React.useState<{ items: SegmentData[] }[]>([]);

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
                    type: card.originalFlashcard.type,
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
        <div className="w-full px-4">
            {segments && segments.map((segment, index) => {

                // Get the items 
                // For odd segments, items array need to be reversed (to follow the "snake" pattern)
                const items = index % 2 === 0 ? segment.items : segment.items.slice().reverse();

                return (
                    <Segment key={index} index={index} last={index === segments.length - 1} items={items.map((item, idx) => {

                        const randomMarginTopElement = Math.random() * 6; // Random element to make the items not aligned in a straight line
                        const randomMarginSign = Math.random() < 0.5 ? -1 : 1; // Randomly choose if the margin will be negative or positive

                        return <PracticeItem
                            key={idx}
                            id={{ sectionCode: item.sectionCode, type: item.type } as SegmentItemId}
                            title={item.sectionShortTitle}
                            cardType={item.type as CardType}
                            status={item.status}
                            denseLine={segment.items.length > 2}
                            lastInPractice={idx === segment.items.length - 1}
                            randomNoise={randomMarginSign * randomMarginTopElement}
                            onPracticeItemClick={onItemClick}
                        />

                    })} />
                )
            })}
        </div>
    )
}

function Segment({ items, index, last }: { items: React.ReactNode[], index: number, last?: boolean }) {

    return (
        <div className={`
            relative
            flex h-28 border-cyan-300 
            ${index % 2 == 0 ? ' rounded-r-full ' : ' rounded-l-full '}
            ${items.length > 2 ? ' space-x-12 ' : 'space-x-16 '}
            ${last == true ? (index % 2 == 0 ? 'justify-end' : 'justify-start') : (index % 2 == 0 ? 'justify-start' : 'justify-end')}
            `}
            style={{
                width: 'calc(100% - 46px)',
                maxWidth: 'calc(100% - 46px)',
                marginLeft: index % 2 == 0 ? 46 : -8,
                marginTop: index > 0 ? -8 : 0,
                borderWidth: last == true ? '0 0 8px 0 !important' : index % 2 == 0 ? '8px 8px 8px 0' : '8px 0 8px 8px',
                paddingLeft: index % 2 != 0 ? (last ? 24 : 0) : 0
            }}>

            {items.map((item, idx) => (
                <React.Fragment key={idx}>{item}</React.Fragment>
            ))}

        </div>
    )
}

/**
 * Some design notes: 
 * ---
 * - Items are displayed with a negative margin-top that has a random element to it, so that the items are not aligned in a straight line.
 * 
 * Params
 * ---- 
 * - denseLine: if true, the line is more dense, otherwise it is more spaced out. For dense lines we "lift" the item a bit more up (negative margin-top), because the title will be most likely on two lines.
 * - lastInPractice: if true, the item is the last in the practice. Concretely, we will try to make sure that the item is aligned to the middle of the segment.
 */
export function PracticeItem({ id, title, cardType, status, denseLine, lastInPractice, randomNoise, onPracticeItemClick }: { id: SegmentItemId, title: string, cardType: CardType, status?: Status, denseLine?: boolean, lastInPractice?: boolean, randomNoise: number, onPracticeItemClick: (id: SegmentItemId) => void }) {

    const [pressed, setPressed] = useState(false);

    const borderWidth = 2;
    const marginTop = (denseLine && !lastInPractice ? -56 : -46) + randomNoise; // -46 is the default margin-top, -56 is for dense lines

    return (
        <div className="flex flex-col items-center" style={{ marginTop: marginTop }}>

            <div className={`
                text-xs mb-1 text-center
                ${status == 'done' ? 'text-cyan-300' : ''}
                `}>
                {title}
            </div>

            <div className={`
                flex items-center justify-center h-14 w-14 rounded-full border-${borderWidth}
                ${status == 'done' ? 'border-cyan-300 bg-cyan-300' : 'border-lime-200 cursor-pointer'}
                `}
                style={{
                    backgroundColor: status == 'done' ? '' : 'var(--background)', minWidth: "3.5rem",
                    transform: pressed ? "scale(0.95)" : "scale(1)",
                    marginLeft: '-4px'
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
                    w-7 h-7 flex items-center justify-center
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

interface SegmentData { sectionCode: string, type: string, sectionShortTitle: string, status: Status }
interface SegmentItemId { sectionCode: string, type: string }