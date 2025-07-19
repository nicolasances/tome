import React, { useState } from 'react';
import { SectionTimelineEvent, SectionTimelineFlashcard } from '@/api/TomeFlashcardsAPI';
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors, DragEndEvent, TouchSensor
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
interface FlashCardProps {
    context: string;
    card: SectionTimelineFlashcard;
    onAnswerSelect: (isCorrect: boolean, selectedAnswerIndex: number) => void;
    tag: string;
    cardNumber: number;
    totalCards: number;
    disableFireworks?: boolean;
}

/**
 * This widget creates a flashcard component that displays a list of events. 
 * 
 * Instructions for the flashcard:
 * - Each event is draggable. 
 * - This widget supports touch mode for mobile devices. 
 * - The flashcard looks like a card, with some padding and a shadow, same as FlashCard.tsx
 * - On the top of the card, the top left corner displays a little label with the tag, and the top right corner displays the number of the card in the topic (e.g. 1/10). 
 * - no bullet points, just a list of events
 * 
 * Tailwindcss is used for styling
 * Use dmd-kit for the drag and drop functionality
 * 
 * The schema of card is as follows:
 * export interface SectionTimelineEvent {
 *  event: string;
 *  date: string; 
 *  dateFormat: string;
 *  real: boolean;
 *  order: number;
 * }
 *  */
export const TimelineFlashcardWidget: React.FC<FlashCardProps> = ({
    context,
    card,
    onAnswerSelect,
    tag,
    cardNumber,
    totalCards,
}) => {
    const [events, setEvents] = useState(card.events);
    const [isAnswered, setIsAnswered] = useState(false);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);


    // Setup sensors for mouse and touch
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
        })
    );

    // Check if the current order is correct
    function checkOrder(evts: typeof events) {
        // Sorted by correct order
        const correct = [...evts].sort((a, b) => a.order - b.order);
        for (let i = 0; i < evts.length; i++) {
            if (evts[i].event !== correct[i].event) return false;
        }
        return true;
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (!over) return;
        if (active.id !== over.id) {
            const oldIndex = events.findIndex(e => e.event === active.id);
            const newIndex = events.findIndex(e => e.event === over.id);
            const newEvents = arrayMove(events, oldIndex, newIndex);
            setEvents(newEvents);
        }
    }

    function handleSubmit() {
        const correct = checkOrder(events);
        setIsAnswered(true);
        setIsCorrect(correct);
        onAnswerSelect(correct, correct ? 0 : 1); // selectedAnswerIndex is not meaningful here
    }

    return (
        <div className="p-4 shadow-lg rounded-lg bg-cyan-100 max-w-md mx-auto relative">
            {/* Tag and card number */}
            <div className="flex justify-between mb-4">
                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">{tag}</span>
                <span className="text-xs text-gray-400">{cardNumber}/{totalCards}</span>
            </div>
            {/* Context */}
            <div className='text-sm mb-2 opacity-60'>{context}</div>
            {/* Timeline events */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={isAnswered ? undefined : handleDragEnd}
            >
                <SortableContext
                    items={events.map(e => e.event)}
                    strategy={verticalListSortingStrategy}
                >
                    {events.map((event) => (
                        <SortableEvent
                            key={event.event}
                            id={event.event}
                            event={event}
                            disabled={isAnswered}
                        />
                    ))}
                </SortableContext>
            </DndContext>
            {/* Submit button */}
            {!isAnswered && (
                <button
                    className="mt-4 w-full bg-blue-600 text-white py-2 rounded shadow hover:bg-blue-700 transition"
                    onClick={handleSubmit}
                >
                    Submit
                </button>
            )}
            {/* Feedback */}
            {isAnswered && (
                <div className={`mt-4 text-center font-semibold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                    {isCorrect ? 'Correct!' : 'Try again!'}
                </div>
            )}
        </div>
    );

};


// Sortable item component
function SortableEvent({ event, id, disabled }: { event: SectionTimelineEvent, id: string, disabled: boolean }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        cursor: disabled ? 'default' : 'grab',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`bg-white rounded shadow p-3 mb-2 flex items-center ${disabled ? 'opacity-70' : ''}`}
            {...attributes}
            {...(!disabled ? listeners : {})}
        >
            <span className="text-base">{event.event}</span>
            {/* <span className="ml-auto text-gray-400 text-xs">{event.date}</span> */}
        </div>
    );
}