import React, { useRef, useState, useEffect } from "react";

export function DateFlashcardWidget({ question, correctYear, onAnswer }: { question: string, correctYear: number, onAnswer: (date: { year?: number, day?: number, month?: number }) => void }) {

    return (
        <div className="w-full max-w-2xl mx-auto mt-8">
            <div className="mb-8 text-xl">{question}</div>
            <div className="flex justify-center relative">
                <YearInput correctYear={correctYear} flashcardId={Math.random()} onAnswer={onAnswer} />
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
function YearInput({ correctYear, flashcardId, onAnswer }: { correctYear: number, flashcardId: number, onAnswer: (date: { year?: number, day?: number, month?: number }) => void }) {

    const getDigits = (year: number) => year.toString().split("");

    const digits = getDigits(correctYear);
    const numDigits = digits.length;
    const [values, setValues] = useState<string[]>(Array(numDigits).fill(""));
    const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
    const [correct, setCorrect] = useState<boolean | null>(null);

    // Auto-focus the first input on mount
    useEffect(() => {
        document.getElementById(`0-${flashcardId}`)?.focus();
    }, [flashcardId]);

    const handleChange = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/[^0-9]/g, "");
        if (val.length > 1) val = val.slice(-1); // Only one digit per box

        const newValues = [...values];
        newValues[idx] = val;
        setValues(newValues);

        // Move focus to next box if filled
        if (val && idx < numDigits - 1) {
            document.getElementById(`${idx + 1}-${flashcardId}`)?.focus();
            // inputsRef.current[idx + 1]?.focus();
        }

        // If the last box is filled, check if the input is correct
        if (idx === numDigits - 1 && val) {

            const inputYear = newValues.join("");

            const isAnswerCorrect = inputYear === correctYear.toString();

            setCorrect(isAnswerCorrect);

            // Wait a bit before calling onAnswer to let the user see if they were correct
            setTimeout(() => {
                onAnswer({ year: parseInt(inputYear) });
            }, 2000);
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
            <div className="flex space-x-2 justify-center">
                {digits.map((_, idx) => (
                    <input
                        id={`${idx}-${flashcardId}`}
                        key={`${idx}-${flashcardId}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        className={`
                        w-10 h-12 text-center text-xl border rounded focus:outline-none focus:ring-2 focus:ring-cyan-200
                        ${correct === null
                                ? "border-gray-300 bg-white text-grey-700"
                                : correct
                                    ? "border-green-400 bg-green-200 text-green-600"
                                    : "border-red-400 bg-red-300 text-red-600"}
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
                                key={`corr-${idx}-${flashcardId}`}
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