import React from "react";
import { FlashCard } from "../flashcards/FlashCard";
import { Dialog, DialogContent } from "@mui/material";
import { DateFlashcardWidget } from "../flashcards/DateFlashcardWidget";


export function OptionsFlashcardPopup({ open, question, options, correctAnswerIndex, onClose, onAnswerSelected }: { open: boolean, question: string, options: string[], correctAnswerIndex: number, onClose: () => void, onAnswerSelected: (isCorrect: boolean, selectedAnswerIndex: number) => void }) {

    return (
        <Dialog
            open={open}
            onClose={onClose}
            slotProps={{
                paper: {
                    style: {
                        background: "transparent",
                        boxShadow: "none",
                    },
                    elevation: 0,
                }
            }}
        >
            <DialogContent
                style={{
                    background: "transparent",
                    boxShadow: "none",
                }}
            >
                <FlashCard
                    question={question}
                    answers={options}
                    correctAnswerIndex={correctAnswerIndex}
                    context=""
                    cardNumber={1}
                    onAnswerSelect={onAnswerSelected}
                    totalCards={1}
                    tag="options"
                    disableFireworks={true}
                />
            </DialogContent>
        </Dialog>
    );
}
export function DateFlashcardPopup({ open, question, correctYear, sectionTitle, id, onClose, onAnswerSelected }: { open: boolean, question: string, correctYear: number, sectionTitle: string, id: string, onClose: () => void, onAnswerSelected: (isCorrect: boolean) => void }) {

    return (
        <Dialog
            open={open}
            onClose={onClose}
            slotProps={{
                paper: {
                    style: {
                        background: "transparent",
                        boxShadow: "none",
                    },
                    elevation: 0,
                }
            }}
        >
            <DialogContent
                style={{
                    background: "transparent",
                    boxShadow: "none",
                }}
            >
                <DateFlashcardWidget
                    question={question}
                    correctYear={correctYear}
                    sectionTitle={sectionTitle}
                    id={id}
                    cardNumber={1}
                    totalCards={1}
                    onAnswerSelect={onAnswerSelected}
                />
            </DialogContent>
        </Dialog>
    );
}