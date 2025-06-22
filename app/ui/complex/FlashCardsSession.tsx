import React, { useState, useEffect, useRef } from 'react';
import { FlashCard, TomeFlashcardsAPI } from '@/api/TomeFlashcardsAPI';
import { FlashCard as FlashCardWidget } from '../cards/FlashCard';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';


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
const FlashCardsSession: React.FC = () => {
    const [cards, setCards] = useState<FlashCard[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answeredCorrectly, setAnsweredCorrectly] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const sliderRef = useRef<Slider>(null);

    useEffect(() => {
        const fetchCards = async () => {
            setIsLoading(true);
            const { cards } = await new TomeFlashcardsAPI().getFlashCards('');
            setCards(cards);
            setIsLoading(false);
        };
        fetchCards();
    }, []);

    const handleAnswerSelect = (isCorrect: boolean) => {
        if (isCorrect && !answeredCorrectly) {
            setAnsweredCorrectly(true);
            setTimeout(() => {
                if (sliderRef.current && currentIndex < cards.length - 1) {
                    sliderRef.current.slickNext();
                }
                setCurrentIndex((prev) => Math.min(prev + 1, cards.length - 1));
                setAnsweredCorrectly(false);
            }, 1800);
        }
    };

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
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <span className="text-gray-500">Loading flashcards...</span>
            </div>
        );
    }

    if (!cards.length) {
        return (
            <div className="flex items-center justify-center h-64">
                <span className="text-gray-500">No flashcards available.</span>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto mt-8">
            <Slider ref={sliderRef} {...settings}>
                {cards.map((card, idx) => (
                    <div key={idx} className="px-2">
                        <FlashCardWidget
                            question={card.question}
                            answers={card.answers}
                            correctAnswerIndex={card.correctAnswerIndex}
                            onAnswerSelect={handleAnswerSelect}
                            tag={card.tag}
                            cardNumber={idx + 1}
                            totalCards={cards.length}
                        />
                    </div>
                ))}
            </Slider>
        </div>
    );
};

export default FlashCardsSession;