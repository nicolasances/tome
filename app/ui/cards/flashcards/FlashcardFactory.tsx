import { Flashcard } from "@/model/Flashcard";
import { JSX } from "react";
import { FlashCard as FlashCardWidget } from './FlashCard';
import { MultipleOptionsFlashcard, SectionTimelineFlashcard } from "@/api/TomeFlashcardsAPI";
import { TimelineFlashcardWidget } from "./TimelineFlashcardWidget";


export class FlashcardFactory {

    static createFlashcardWidget(flashcard: Flashcard, idx: number, numCards: number, handleAnswerSelect: (isCorrect: boolean, cardId: string, selectedAnswerIndex: number) => void): JSX.Element {

        if (flashcard.type === 'options') {

            const card = flashcard as MultipleOptionsFlashcard;

            return (
                <FlashCardWidget
                    context={card.sectionTitle}
                    question={card.question}
                    answers={card.options}
                    correctAnswerIndex={card.rightAnswerIndex}
                    onAnswerSelect={(isCorrect, selectedAnswerIndex) => handleAnswerSelect(isCorrect, card.id!, selectedAnswerIndex)}
                    tag="options"
                    cardNumber={idx + 1}
                    totalCards={numCards}
                    disableFireworks={true} // Disable fireworks for practice sessions
                />
            )
        }
        else if (flashcard.type == 'timeline') { 

            const card = flashcard as SectionTimelineFlashcard; 

            return (
                <TimelineFlashcardWidget card={card} cardNumber={idx + 1} totalCards={numCards} disableFireworks={true} context={card.sectionTitle} onAnswerSelect={() => {}} tag="timeline" />
            )
        }

        return (<div className="text-base text-center">Card of type <b className="text-cyan-300">{flashcard.type}</b> is not currently supported.</div>)

    }
}