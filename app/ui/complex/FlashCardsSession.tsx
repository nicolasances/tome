import React, { useState, useEffect, useRef } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { TomePracticeAPI } from '@/api/TomePracticeAPI';
import { PracticeFlashcard } from '@/model/PracticeFlashcard';
import { FlashcardFactory } from '../cards/flashcards/FlashcardFactory';


/**
 * This component shows a flashcard (FlashCard) at a time, until the user has correctly answered them all. 
 * The list of flashcards is provided by the TomeFlashAPI and is loaded at init of the component. 
 * 
 * Once a user correctly selects an answer, after 3 seconds the next flashcard is shown. The transition between flashcards is animated: 
 *  - the current flashcard is moved out of the screen to the left, and disappears completely 
 *  - the next flashcard is moved in from the right.
 * 
 * The next flashcard is not visible in the beginning. IT only becomes visible after the user has correctly answered the current flashcard and when the other is moved out.
 * Remember to wait 3 seconds before the flashcard is moved out of the screen, so that the user can see the correct answer and learn from it.
 * 
 * Use tailwind. 
 * 
 * Implement this component as a carousel, where each flashcard is a slide. Use react-slick or any other carousel library you prefer. Do not implement the carousel from scratch, use a library.
 * 
 * Cards are loaded as such: const { cards } = await new TomeFlashAPI().getFlashCards(""); setCards(cards);
 * Make sure you handle the flashcard widget interface: interface FlashCardProps { question: string; answers: string[]; correctAnswerIndex: number; onAnswerSelect: (isCorrect: boolean) => void; tag: string; cardNumber: number; totalCards: number;}
 * 
 */
export const FlashCardsSession: React.FC<{ practiceId: string, flashcards: PracticeFlashcard[], onFinishedSession: () => void, onFinishedPractice: () => void }> = ({ practiceId, flashcards, onFinishedSession, onFinishedPractice }) => {

    const [currentIndex, setCurrentIndex] = useState(0);
    const [answeredCorrectly, setAnsweredCorrectly] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const sliderRef = useRef<Slider>(null);
    const [firstUnansweredIndex, setFirstUnansweredIndex] = useState<number | null>(null);

    const cards = flashcards;

    /**
     * Loads the flashcards for the given practiceId from the TomePracticeAPI.
     */
    const loadCards = async () => {

        setIsLoading(true);

        // Go through the flashcards and find the first one that has not been answered yet
        const firstUnansweredIndex = flashcards.findIndex(card => card.correctlyAsnwerAt == null);

        setFirstUnansweredIndex(firstUnansweredIndex);

        setIsLoading(false);
    };

    /**
     * Handles the answer selection by the user.
     * 
     * 1. Posts the answer through the TomePracticeAPI
     * 2. Shows the next flashcard, if the answer is correct 
     * 
     * @param isCorrect Whether the answer is correct or not
     * @param flashcardId the id of the flashcard
     * @param selectedAnswerIndex the index of the answer selected by the user
     */
    const handleAnswerSelect = async (isCorrect: boolean, flashcardId: string) => {

        // 1. Send the answer to the API
        const response = await new TomePracticeAPI().answerFlashcard(practiceId, flashcardId, isCorrect);

        console.log(`Flashcard answered: ${flashcardId}, Correct: ${response.isCorrect}, Response:`, response);

        if (response.finished) {
            onFinishedPractice();
            return;
        }

        if (isCorrect && !answeredCorrectly) {

            setAnsweredCorrectly(true);

            // Wait a sec and move to the next flashcard
            setTimeout(() => {

                if (sliderRef.current && currentIndex < cards.length - 1) {
                    sliderRef.current.slickNext();
                    setAnsweredCorrectly(false);
                    setCurrentIndex((prev) => Math.min(prev + 1, cards.length - 1));
                }
                else {
                    // There are no more flashcards, finish the practice
                    onFinishedSession();
                }

            }, 300);
        }
    };

    useEffect(() => { loadCards() }, []);

    const settings = {
        dots: false,
        arrows: false,
        infinite: false,
        speed: 300,
        slidesToShow: 1,
        slidesToScroll: 1,
        swipe: false,
        draggable: false,
        beforeChange: (_: number, next: number) => setCurrentIndex(next),
        initialSlide: firstUnansweredIndex !== null ? firstUnansweredIndex : 0,
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <span className="text-gray-500">Loading flashcards...</span>
            </div>
        );
    }

    if (!cards || !cards.length) {
        return (
            <div className="flex items-center justify-center h-64">
                <span className="text-gray-500">No flashcards available.</span>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto">
            <Slider ref={sliderRef} {...settings}>
                {cards.map((card, idx) => (
                    <div key={idx} className="px-2">
                        {FlashcardFactory.createFlashcardWidget(
                            card,
                            idx,
                            cards.length,
                            handleAnswerSelect
                        )}
                    </div>
                ))}
            </Slider>
        </div>
    );
};

export interface PracticeStats {
    score: number;
    numCards: number;
    averageAttempts: number;
    totalWrongAnswers: number;
}