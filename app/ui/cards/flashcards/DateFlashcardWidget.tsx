import { DateFlashcard } from "@/api/TomeFlashcardsAPI";
import { PracticeFlashcard } from "@/model/PracticeFlashcard";
import React, { useRef, useState } from "react";

export function DateFlashcardWidget({ flashcard, cardNumber, totalCards, onAnswerSelect }: { flashcard: PracticeFlashcard, cardNumber: number, totalCards: number, onAnswerSelect: (isCorrect: boolean) => void }) {

    return (
        <div className="p-4 shadow-lg rounded-lg bg-cyan-100 max-w-md mx-auto relative">
            <div className="flex justify-between items-center mb-4">
                <span className="bg-blue-200 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
                    date
                </span>
                <span className="text-gray-600 text-xs font-semibold">
                    {cardNumber}/{totalCards}
                </span>
            </div>
            <div className='text-sm mb-2 opacity-60'>{flashcard.originalFlashcard.sectionTitle}</div>
            <div className="mb-8 text-base font-bold">{(flashcard.originalFlashcard as DateFlashcard).question}</div>
            <div className="flex justify-center space-y-3 relative ml-2">
                <YearInput correctYear={(flashcard.originalFlashcard as DateFlashcard).correctYear} flashcard={flashcard} onAnswer={onAnswerSelect} />
            </div>
        </div>
    );
}

/**
 * Widget that allows for the user to input a year.
 * It shows x boxes for the user to input a year. The number x of boxes to show is determined by the correct year.
 * The user inputs the year in the boxes, one at the time, starting from the leftmost one. Only one number is allowed in each box. Once the number in the box is inputed, the focus moves to the next box. 
 * The first box is focused by default.
 * 
 * @param correctYear the correct year to input. The number of boxes to show is determined by the number of digits in this year.
 * 
 * @returns 
 */
function YearInput({ correctYear, flashcard, onAnswer }: { correctYear: number, flashcard: PracticeFlashcard, onAnswer: (isCorrect: boolean) => void }) {

    const getDigits = (year: number) => year.toString().split("");

    const digits = getDigits(correctYear);
    const numDigits = digits.length;
    const [values, setValues] = useState<string[]>(Array(numDigits).fill(""));
    const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
    const [correct, setCorrect] = useState<boolean | null>(null);

    // // Focus first box on mount
    // React.useEffect(() => {
    //     inputsRef.current[0]?.focus();
    // }, []);

    const handleChange = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/[^0-9]/g, "");
        if (val.length > 1) val = val.slice(-1); // Only one digit per box

        const newValues = [...values];
        newValues[idx] = val;
        setValues(newValues);

        // Move focus to next box if filled
        if (val && idx < numDigits - 1) {
            document.getElementById(`${idx + 1}-${flashcard.id}`)?.focus();
            // inputsRef.current[idx + 1]?.focus();
        }

        // If the last box is filled, check if the input is correct
        if (idx === numDigits - 1 && val) {

            const inputYear = newValues.join("");

            const isAnswerCorrect = inputYear === correctYear.toString();

            setCorrect(isAnswerCorrect);
            onAnswer(isAnswerCorrect);

            if (!isAnswerCorrect) {
                // The correct answer will be shown, so wait a second and then call onAnswer(true) to move to the next slide
                setTimeout(() => {onAnswer(true);}, 1000);
            }

        }
    };

    const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Tab") {
            e.preventDefault();
        }
        if (e.key === "Backspace" && !values[idx] && idx > 0) {
            inputsRef.current[idx - 1]?.focus();
        }
    };

    return (
        <div>
            <div className="flex space-x-2">
                {digits.map((_, idx) => (
                    <input
                        id={`${idx}-${flashcard.id}`}
                        key={`${idx}-${flashcard.id}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        className={`
                        w-10 h-12 text-center text-xl border rounded focus:outline-none focus:ring-2 focus:ring-cyan-400
                        ${correct === null
                                ? "border-gray-300 bg-white text-grey-700"
                                : correct
                                    ? "border-green-400 bg-green-200 text-green-600"
                                    : "border-red-400 bg-red-200 text-red-600"}
                        `}
                        value={values[idx]}
                        onChange={e => handleChange(idx, e)}
                        onKeyDown={e => handleKeyDown(idx, e)}
                    />
                ))}
            </div>
            {correct === false &&
                <div className="flex flex-col items-center mb-4">
                    <div className="text-base mt-6 mb-2">The correct answer was</div>
                    <div className="flex space-x-2">
                        {digits.map((_, idx) => (
                            <input
                                key={`corr-${idx}-${flashcard.id}`}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                disabled={true}
                                className={`w-10 h-12 text-grey-600 bg.white text-center text-xl border rounded focus:outline-none`}
                                defaultValue={correctYear.toString().split("")[idx] || ""}
                            />
                        ))}
                    </div>
                </div>
            }
        </div>
    );
}