import React, { useState } from 'react';
import { SectionTimelineFlashcard } from '@/api/TomeFlashcardsAPI';

interface FlashCardProps {
    context: string;
    card: SectionTimelineFlashcard;
    onAnswerSelect: (isCorrect: boolean, selectedAnswerIndex: number) => void;
    tag: string;
    cardNumber: number;
    totalCards: number;
    disableFireworks?: boolean; 
}

export const TimelineFlashcardWidget: React.FC<FlashCardProps> = ({
    context,
    card,
    // onAnswerSelect,
    tag,
    cardNumber,
    totalCards,
}) => {

    const [events, setEvents] = useState(card.events); 
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    // For touch support
    const [touchDragging, setTouchDragging] = useState(false);
    const [touchOverIndex, setTouchOverIndex] = useState<number | null>(null);

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (index: number) => {
        if (draggedIndex === null || draggedIndex === index) return;
        const updatedEvents = [...events];
        const [removed] = updatedEvents.splice(draggedIndex, 1);
        updatedEvents.splice(index, 0, removed);
        setEvents(updatedEvents);
        setDraggedIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
        setTouchDragging(false);
        setTouchOverIndex(null);
        // You can call onAnswerSelect here if you want to check the order
    };

    // Touch event handlers
    const handleTouchStart = (index: number) => {
        setDraggedIndex(index);
        setTouchDragging(true);
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLLIElement>, index: number) => {
        if (!touchDragging || draggedIndex === null) return;
        e.preventDefault(); // Prevent scrolling while dragging
        setTouchOverIndex(index);
    };

    const handleTouchEnd = () => {
        if (draggedIndex !== null && touchOverIndex !== null && draggedIndex !== touchOverIndex) {
            const updatedEvents = [...events];
            const [removed] = updatedEvents.splice(draggedIndex, 1);
            updatedEvents.splice(touchOverIndex, 0, removed);
            setEvents(updatedEvents);
        }
        setDraggedIndex(null);
        setTouchDragging(false);
        setTouchOverIndex(null);
    };

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
            <div className="text-sm mb-2 opacity-60">{context}</div>
            <div className="mb-4 text-base font-bold">Question here</div>
            <ul className="list-none p-0 m-0">
                {events.map((event, index) => (
                    <li
                        key={index}
                        className={`p-2 mb-2 rounded bg-white shadow cursor-move transition-transform duration-100 ${
                            draggedIndex === index ? "scale-95 opacity-70" : ""
                        }`}
                        style={{ touchAction: 'none' }}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={e => {
                            e.preventDefault();
                            handleDragOver(index);
                        }}
                        onDrop={handleDragEnd}
                        onDragEnd={handleDragEnd}
                        // Touch events for mobile
                        onTouchStart={() => handleTouchStart(index)}
                        onTouchMove={e => handleTouchMove(e, index)}
                        onTouchEnd={handleTouchEnd}
                    >
                        {event.event}
                    </li>
                ))}
            </ul>
        </div>
    );
};
