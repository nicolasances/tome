import { useRef } from "react";
import SendSVG from "./graphics/icons/Send";
import RoundButton from "./buttons/RoundButton";

export function AnswerTextArea({ answer, onChange, onClickSendAnswer, loading }: { answer: string, onChange: (value: string) => void, onClickSendAnswer: () => void, loading?: boolean }) {

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
        onChange(e.target.value);
        adjustTextAreaHeight();
    };

    return (
        <div className="flex flex-col border border-cyan-800 rounded-xl px-4 py-3 mb-2">
            <textarea
                ref={textareaRef}
                onChange={onChangeHandler}
                value={answer}
                className="bg-transparent no-border focus:outline-none w-full text-xl no-scrollbar"
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

    )
}