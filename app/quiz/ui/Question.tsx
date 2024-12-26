import LightningBoltSVG from "@/app/ui/buttons/assets/LightningBoltSVG";
import RoundButton from "@/app/ui/buttons/RoundButton";
import ScoreCard from "@/app/ui/cards/ScoreCard";
import SendSVG from "@/app/ui/graphics/icons/Send";
import { useState } from "react";

export default function Question() {

    const [textAreaRows, setTextAreaRows] = useState<number>(1)
    const maxTextAreaRows = 8;
    const minTextAreaRows = 3

    /**
     * Used to increase the size of the text area the more the user writes
     * @returns 
     */
    const onKeyDown = (ev: any) => {

        if (ev.keyCode == 13) {
            if (textAreaRows == maxTextAreaRows) return;
            setTextAreaRows(textAreaRows + 1)
        }

    }

    /**
     * Sends the answer and gets it rated
     */
    const sendAnswer = () => {

    }

    return (
        <div className="flex flex-1 flex-col items-stretch justify-start">
            <div className="flex justify-center">
                <ScoreCard scoreNumerator={3.5} scoreDenominator={5} />
            </div>

            {/* Question Box */}
            <div className="flex flex-1 flex-col align-left mt-8">
                <div className="text-[48px]">"</div>
                <div className="-mt-8 mb-2 font-bold text-sm">
                    Question:
                </div>
                <div className="overflow-y-auto max-h-[200px]">
                    Which ruler of Egypt tried to negotiate with the Crusaders by offering freedom of worship in Jerusalem?
                </div>
            </div>

            {/* Answer box */}
            <div className="flex flex-col border border-cyan-200 rounded-xl px-4 py-3">
                <textarea className="bg-transparent no-border focus:outline-none w-full text-sm" rows={textAreaRows < minTextAreaRows ? minTextAreaRows : textAreaRows} onKeyDown={onKeyDown}></textarea>
                <div className="flex justify-end fill-cyan-800">
                    <RoundButton icon={<SendSVG />} onClick={sendAnswer} size='s' />
                </div>
            </div>

        </div>
    )
}