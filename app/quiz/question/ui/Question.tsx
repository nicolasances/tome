'use client'

import { QuizQuestion } from "@/api/TomeQuizAPI";
import RoundButton from "@/app/ui/buttons/RoundButton";
import SendSVG from "@/app/ui/graphics/icons/Send";
import { LoadingBar } from "@/app/ui/graphics/Loading";
import { useState, useRef } from "react";

export default function Question({ question, onAnswer }: { question: QuizQuestion, onAnswer: (answer: string) => Promise<any> }) {  // eslint-disable-line @typescript-eslint/no-explicit-any

    const [answer, setAnswer] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const maxTextAreaHeight = 240; // Maximum height in pixels
    const minTextAreaHeight = 64; // Minimum height in pixels
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    /**
     * Dynamically adjusts the height of the textarea based on its content, up to a maximum height.
     */
    const adjustTextAreaHeight = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto"; // Reset height to calculate the new scrollHeight
            const newHeight = Math.min(textareaRef.current.scrollHeight, maxTextAreaHeight);
            textareaRef.current.style.height = `${newHeight}px`;
        }
    };

    const onChangeHandler = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setAnswer(e.target.value);
        adjustTextAreaHeight();
    };

    const onClickSendAnswer = async () => {
        if (!answer.trim()) return;

        setLoading(true);

        await onAnswer(answer);

        setLoading(false);
    };

    return (
        <div className="flex flex-1 flex-col items-stretch justify-start text-lg">
            {/* Question Box */}
            <div className="flex flex-1 flex-col align-left mt-2">
                <div className="font-bold flex items-center">
                    <span className="mr-2 bg-cyan-800 rounded px-1 py-[2px] text-cyan-200">{question.questionNum}/{question.numQuestionsInQuiz}</span>Question:
                </div>
                <div className="overflow-y-auto max-h-[200px] mt-2">
                    {question.question}
                </div>
            </div>

            {loading && (
                <div className="mb-2 px-2">
                    <LoadingBar label="Evaluating your Answer" />
                </div>
            )}

            {/* Answer box */}
            <div className="flex flex-col border border-cyan-800 rounded-xl px-4 py-3">
                <textarea
                    ref={textareaRef}
                    onChange={onChangeHandler}
                    value={answer}
                    className="bg-transparent no-border focus:outline-none w-full"
                    rows={1}
                    style={{
                        resize: "none",
                        overflowY: answer.length > 0 && textareaRef.current?.scrollHeight! > maxTextAreaHeight ? 'auto' : 'hidden', // eslint-disable-line @typescript-eslint/no-non-null-asserted-optional-chain
                        minHeight: `${minTextAreaHeight}px`,
                        maxHeight: `${maxTextAreaHeight}px`,
                    }}
                ></textarea>
                <div className="flex justify-end fill-cyan-800">
                    {!loading && <RoundButton icon={<SendSVG />} onClick={onClickSendAnswer} size="s" />}
                </div>
            </div>
        </div>
    );
}
