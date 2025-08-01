import { JSX } from "react";
import { FlashCard as FlashCardWidget } from './FlashCard';
import { DateFlashcard, MultipleOptionsFlashcard, SectionTimelineFlashcard } from "@/api/TomeFlashcardsAPI";
import { TimelineFlashcardWidget } from "./TimelineFlashcardWidget";
import { PracticeFlashcard } from "@/model/PracticeFlashcard";
import { DateFlashcardWidget } from "./DateFlashcardWidget";
import { GraphWidget } from "./GraphWidget";


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
                    onAnswerSelect={(isCorrect) => handleAnswerSelect(isCorrect, flashcard.id!)}
                    tag="options"
                    cardNumber={idx + 1}
                    totalCards={numCards}
                    disableFireworks={true} // Disable fireworks for practice sessions
                />
            )
        }
        else if (flashcard.originalFlashcard.type == 'timeline') {

            return (
                <TimelineFlashcardWidget card={flashcard.originalFlashcard as SectionTimelineFlashcard} cardNumber={idx + 1} totalCards={numCards} disableFireworks={true} context={flashcard.originalFlashcard.sectionTitle} onAnswerSelect={(isCorrect) => { handleAnswerSelect(isCorrect, flashcard.id!) }} tag="timeline" />
            )
        }
        else if (flashcard.originalFlashcard.type == 'date') {
            const fc = flashcard.originalFlashcard as DateFlashcard;
            return <DateFlashcardWidget correctYear={fc.correctYear} id={flashcard.id!} question={fc.question} sectionTitle={fc.sectionTitle} cardNumber={idx + 1} totalCards={numCards} onAnswerSelect={(isCorrect) => { handleAnswerSelect(isCorrect, flashcard.id!) }} />
        }
        else if (flashcard.originalFlashcard.type == 'graph') {
            return <GraphWidget flashcard={flashcard} />
        }

        return (<div className="text-base text-center" > Card of type <b className="text-cyan-300" > {flashcard.originalFlashcard.type}</b> is not currently supported.</div >)

    }
}