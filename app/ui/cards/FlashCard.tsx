import React, { useState } from 'react';
import { Fireworks } from '@fireworks-js/react';

/**
 * Create a flashcard component that displays a question and a set of possible answers
 * The flashcard should look like a card, with some padding and a shadow
 * The input is 
 *  - a question, 
 *  - a list of possible answers, 
 *  - the right answer (index of it), 
 *  - a callback for when the right answer is selected 
 *  - a tag (metadata, label) that specifies the topic
 *  - the number of the card in the topic and the total number of cards in the topic
 * The component highlights in green the right answer when selected, and in red the wrong answers when selected. 
 * The user can keep selecting answers until the right one is selected. 
 * On the top of the card, the top left corner displays a little label with the tag, and the top right corner displays the number of the card in the topic (e.g. 1/10). 
 * Use tailwindcss for styling
 * Selecting an answer should have a little animation that makes it look like a button has been pressed
 * When the selected answer is correct, there should be a small animation of success: the animation should: 
 * 1. grey out the other answer
 * 2. show a small green checkmark on the correct answer
 * 3. shows a fireworks animation on the card
 *  */
interface FlashCardProps {
    question: string;
    answers: string[];
    correctAnswerIndex: number;
    onAnswerSelect: (isCorrect: boolean) => void;
    tag: string;
    cardNumber: number;
    totalCards: number;
}

export const FlashCard: React.FC<FlashCardProps> = ({ question, answers, correctAnswerIndex, onAnswerSelect, tag, cardNumber, totalCards }) => {
    const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
    const [clickedIndex, setClickedIndex] = useState<number | null>(null);
    const [showFireworks, setShowFireworks] = useState(false);

    const handleAnswerClick = (index: number) => {
        setClickedIndex(index);
        setTimeout(() => setClickedIndex(null), 150); // Reset the clicked state after animation
        setSelectedAnswerIndex(index);
        const isCorrect = index === correctAnswerIndex;
        onAnswerSelect(isCorrect);

        if (isCorrect) {
            setShowFireworks(true);
            setTimeout(() => setShowFireworks(false), 2000); // Hide fireworks after 2 seconds
        }
    };

    const getAnswerClass = (index: number): string => {
        const baseClass = "p-2 mb-2 rounded cursor-pointer bg-white hover:bg-cyan-200 transition-transform duration-20 ease-out";
        const activeClass = clickedIndex === index ? "scale-98" : "";

        if (selectedAnswerIndex === null) {
            return `${baseClass} ${activeClass}`;
        }
        if (index === correctAnswerIndex && selectedAnswerIndex === correctAnswerIndex) {
            return `p-2 mb-2 rounded bg-green-300 animate-fade-in ${activeClass}`;
        }
        if (index === selectedAnswerIndex) {
            return `p-2 mb-2 rounded bg-red-200 animate-fade-in ${activeClass}`;
        }
        return `${baseClass} ${activeClass}`;
    };

    return (
        <div className="p-4 shadow-lg rounded-lg bg-cyan-100 max-w-md mx-auto relative">
            {showFireworks && (
                <div className="absolute inset-0 z-10">
                    <Fireworks options={{ intensity: 20, explosion: 1 }} style={{ width: '100%', height: '100%' }} />
                </div>
            )}
            <div className="flex justify-between items-center mb-4">
                <span className="bg-blue-200 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
                    {tag}
                </span>
                <span className="text-gray-600 text-xs font-semibold">
                    {cardNumber}/{totalCards}
                </span>
            </div>
            <div className="mb-4 text-lg font-bold">{question}</div>
            <ul className="list-none p-0 m-0">
                {answers.map((answer, index) => (
                    <li
                        key={index}
                        className={getAnswerClass(index)}
                        onClick={() => handleAnswerClick(index)}
                    >
                        {answer}
                    </li>
                ))}
            </ul>
        </div>
    );
};

