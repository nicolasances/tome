import React, { useState } from 'react';
import { SectionTimelineEvent, SectionTimelineFlashcard } from '@/api/TomeFlashcardsAPI';
import RoundButton from '../../buttons/RoundButton';
import OkSVG from '../../graphics/icons/Ok';

interface FlashCardProps {
    context: string;
    card: SectionTimelineFlashcard;
    onAnswerSelect: (isCorrect: boolean) => void;
    tag: string;
    cardNumber: number;
    totalCards: number;
    disableFireworks?: boolean;
}

interface SectionTimelineEventExtended extends SectionTimelineEvent {
    isCorrect?: boolean; // Added to track correctness of the event position
}

/**
 * This widget creates a flashcard component that displays a list of events, taken from the provided card (field events). 
 * 
 * For each event it displays the event name as a box with no border (white background, text-base). 
 * 
 * When an event is clicked, the following happens: 
 *  - some space is formed between above each event, with a small box (full width, positioned between two events). When clicking on that box, the clicked event is moved in that position (so before the event under the box). 
 *  - a "clicked" animation is played and the event is highlighted with a small background color difference
 * 
 * Tailwindcss is used for styling
 * 
 * The schema of card is as follows:
 * export interface SectionTimelineEvent {
 *  event: string;
 *  date: string; 
 *  dateFormat: string;
 *  correctIndex: number;
 * }
 *  */
export const TimelineFlashcardWidget: React.FC<FlashCardProps> = ({ context, card, onAnswerSelect, tag, cardNumber, totalCards, }) => {
    const [events, setEvents] = useState<SectionTimelineEventExtended[]>([...card.events]);
    const [selectedEventIndex, setSelectedEventIndex] = useState<number | null>(null);
    const [lastMovedEventIndex, setLastMovedEventIndex] = useState<number | null>(null);
    const [allEventsCorrect, setAllEventsCorrect] = useState<boolean>(false);

    // Refs for each event
    const eventRefs = React.useRef<(HTMLDivElement | null)[]>([]);

    const selectEvent = (event: SectionTimelineEvent, index: number) => {
        if (selectedEventIndex === index) setSelectedEventIndex(null);
        else setSelectedEventIndex(index);
    }

    // Scroll to selected event when selectedEventIndex changes
    React.useEffect(() => {
        if (selectedEventIndex !== null && eventRefs.current[selectedEventIndex]) {
            eventRefs.current[selectedEventIndex]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, [selectedEventIndex]);

    const moveSelectedEventHere = (index: number) => {

        if (selectedEventIndex === null) return;
        const selectedEvent = events[selectedEventIndex];

        const updatedEvents = events.filter((_, i) => i !== selectedEventIndex);

        if (index > selectedEventIndex) index--; // Adjust index if moving down

        updatedEvents.splice(index, 0, selectedEvent);

        setEvents(updatedEvents);
        setSelectedEventIndex(null);
        setLastMovedEventIndex(index);
        setTimeout(() => setLastMovedEventIndex(null), 1000);
    }

    const submit = () => {

        // Check the correctness of the answer: verify that each event has been positioned in the correct order (determined by the correctIndex field). Add a field to each event called isCorrect, which is true if the event is in the correct position, false otherwise.
        const checkedEvents = events.map((event, index) => {
            return {
                ...event,
                isCorrect: event.correctIndex == null || event.correctIndex === index
            }
        })

        // Check if all events are correct
        const allCorrect = events.filter((event) => event.correctIndex != null).map((event, index) => { return { isCorrect: event.correctIndex == index } }).every(event => event.isCorrect === true)

        setEvents(checkedEvents);
        setAllEventsCorrect(allCorrect);

        onAnswerSelect(allCorrect);
    }

    return (
        <div className="p-4 shadow-lg rounded-lg bg-cyan-100 max-w-md mx-auto relative">
            <div className="flex justify-between items-center mb-4">
                <span className="bg-blue-200 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
                    {tag}
                </span>
                <span className="text-gray-600 text-xs font-semibold">
                    {cardNumber}/{totalCards}
                </span>
            </div>
            <div className='text-sm mb-2 opacity-60'>{context}</div>

            <div className="flex flex-col space-y-3 relative ml-2">
                <div className={`absolute h-full border mt-4 ml-3 ${allEventsCorrect ? 'border-green-300' : ''}`} style={{ zIndex: 0 }}></div>
                {events.map((event, index) => (
                    <div
                        key={index}
                        className='flex flex-col'
                        style={{ zIndex: 1 }}
                        ref={el => { eventRefs.current[index] = el; }}
                    >

                        {selectedEventIndex != null && selectedEventIndex != index && index != selectedEventIndex + 1 &&
                            <MoveDivider onClick={moveSelectedEventHere} index={index} />
                        }

                        <div className='flex items-start'>
                            <div
                                className={`w-6 h-6 min-w-6 border mr-2 mt-[1px] text-xs
                                    ${event.isCorrect == null ? 'bg-cyan-100' : ''}
                                    ${selectedEventIndex === index && event.isCorrect == null ? 'rounded-full border-cyan-300' : 'rounded'}
                                    ${lastMovedEventIndex === index ? 'border-amber-600' : ''}
                                    ${event.isCorrect == null ? '' : event.isCorrect ? 'border-green-300 bg-green-200' : 'border-red-300 bg-red-200'}
                                `}
                                style={{
                                    transition: 'border-color 0.4s, border-radius 0.4s'
                                }}
                            >
                            </div>
                            <div className={`flex flex-col items-start text-base cursor-pointer 
                                ${selectedEventIndex === index ? 'opacity-40 transition' : 'opacity-100'}
                                ${lastMovedEventIndex === index ? 'text-amber-600' : ''}`
                            }
                                style={{
                                    transition: 'color 0.4s'
                                }}
                                onClick={() => { selectEvent(event, index) }}>
                                <div>
                                    {event.event}
                                </div>
                            </div>
                        </div>

                        {selectedEventIndex != null && index == events.length - 1 &&
                            <MoveDivider onClick={moveSelectedEventHere} index={events.length} />
                        }
                    </div>
                ))}
            </div>
            <div style={{ zIndex: 2 }} className='flex mt-4'>
                <RoundButton icon={<OkSVG />} onClick={submit} size='m' dark={true} disabled={allEventsCorrect} />
            </div>
        </div >
    );
};

function MoveDivider({ onClick, index }: { index: number, onClick: (index: number) => void }) {

    return (
        <div className='flex items-start' onClick={() => { onClick(index) }}>
            <div className={`w-3 h-3 min-w-6 border border-cyan-200 mr-2 mt-[1px] bg-cyan-100 text-xs`}>
            </div>
            <div className='flex flex-1 items-center justify-center h-3 bg-cyan-200 cursor-pointer mb-2 text-2xs opacity-60 text-center'>
                move here
            </div>
        </div>
    )
}
