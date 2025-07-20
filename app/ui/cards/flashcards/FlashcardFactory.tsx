import { Flashcard } from "@/model/Flashcard";
import { JSX } from "react";
import { FlashCard as FlashCardWidget } from './FlashCard';
import { MultipleOptionsFlashcard, SectionTimelineFlashcard } from "@/api/TomeFlashcardsAPI";
import { TimelineFlashcardWidget } from "./TimelineFlashcardWidget";
import { PracticeFlashcard } from "@/model/PracticeFlashcard";


export class FlashcardFactory {

    static createFlashcardWidget(flashcard: PracticeFlashcard, idx: number, numCards: number, handleAnswerSelect: (isCorrect: boolean, cardId: string) => void): JSX.Element {

        if (flashcard.originalFlashcard.type === 'options') {

            const card = flashcard.originalFlashcard as MultipleOptionsFlashcard;

            return (
                <FlashCardWidget
                    context={card.sectionTitle}
                    question={card.question}
                    answers={card.options}
                    correctAnswerIndex={card.rightAnswerIndex}
                    onAnswerSelect={(isCorrect, selectedAnswerIndex) => handleAnswerSelect(isCorrect, flashcard.id!)}
                    tag="options"
                    cardNumber={idx + 1}
                    totalCards={numCards}
                    disableFireworks={true} // Disable fireworks for practice sessions
                />
            )
        }
        else if (flashcard.originalFlashcard.type == 'timeline') {

            return (
                <TimelineFlashcardWidget card={flashcard.originalFlashcard as SectionTimelineFlashcard} cardNumber={idx + 1} totalCards={numCards} disableFireworks={true} context={flashcard.originalFlashcard.sectionTitle} onAnswerSelect={(isCorrect) => { handleAnswerSelect(isCorrect, flashcard.id!) }} tag = "timeline" />
            )
    }

    return(<div className = "text-base text-center" > Card of type <b className = "text-cyan-300" > { flashcard.originalFlashcard.type }</b> is not currently supported.</div >)

    }
}