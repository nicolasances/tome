'use client'

import { QuizQuestion } from "@/api/TomeQuizAPI";
import RoundButton from "@/app/ui/buttons/RoundButton";
import SendSVG from "@/app/ui/graphics/icons/Send";
import { useState } from "react";

export default function Question({ question, onAnswer }: { question: QuizQuestion, onAnswer: (answer: string) => void }) {

    const [textAreaRows, setTextAreaRows] = useState<number>(1)
    const [answer, setAnswer] = useState<string>();
    const maxTextAreaRows = 8;
    const minTextAreaRows = 3

    /**
     * Used to increase the size of the text area the more the user writes
     * @returns 
     */
    const onKeyDown = (ev: React.KeyboardEvent<HTMLTextAreaElement>) => {

        if (ev?.keyCode == 13) {
            if (textAreaRows == maxTextAreaRows) return;
            setTextAreaRows(textAreaRows + 1)
        }

    }

    const onClickSendAnswer = () => {

        if (!answer) return
        
        onAnswer(answer)
    }

    return (
        <div className="flex flex-1 flex-col items-stretch justify-start">

            {/* Question Box */}
            <div className="flex flex-1 flex-col align-left">
                <div className="text-[48px]">{'"'}</div>
                <div className="-mt-8 mb-2 font-bold text-sm">
                    Question:
                </div>
                <div className="overflow-y-auto max-h-[200px]">
                    {question?.question}
                </div>
            </div>

            {/* Answer box */}
            <div className="flex flex-col border border-cyan-800 rounded-xl px-4 py-3">
                <textarea onChange={(v) => { setAnswer(v.target.value); }} className="bg-transparent no-border focus:outline-none w-full text-sm" rows={textAreaRows < minTextAreaRows ? minTextAreaRows : textAreaRows} onKeyDown={onKeyDown} style={{ resize: "none" }}></textarea>
                <div className="flex justify-end fill-cyan-800">
                    <RoundButton icon={<SendSVG />} onClick={onClickSendAnswer} size='s' />
                </div>
            </div>

        </div>
    )
}