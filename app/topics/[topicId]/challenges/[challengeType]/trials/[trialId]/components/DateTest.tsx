import RoundButton from "@/app/ui/buttons/RoundButton";
import React, { useRef, useState, useEffect, useImperativeHandle } from "react";

export function DateTestWidget({ question, correctYear, onAnswer }: { question: string, correctYear: number, onAnswer: (date: { year?: number, day?: number, month?: number }) => void }) {

    const yearInputRef = useRef<{ fillYearFromSpeech: (year: number) => void }>(null);
    const [isListening, setIsListening] = useState(false);

    const handleSpeechRecognition = () => {
        // Check browser support
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            alert("Speech Recognition is not supported in your browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        if (isListening) {
            console.log("Stopping Speech Recognition");
            // Stop listening if already active
            recognition.stop();
            setIsListening(false);
            return;
        }

        setIsListening(true);

        recognition.onstart = () => {
            console.log("Speech Recognition started");
            setIsListening(true);
        };

        recognition.onresult = (event: any) => {
            let transcript = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }

            console.log("Speech Recognition done. Transcript: ", transcript);
            
            // Parse the transcript to extract the year
            const year = parseYearFromSpeech(transcript);
            if (year) {
                yearInputRef.current?.fillYearFromSpeech(year);
            }
        };

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        // Auto-stop after 5 seconds of silence or speech
        setTimeout(() => {
            recognition.stop();
        }, 5000);

        recognition.start();
    };

    const parseYearFromSpeech = (transcript: string): number | null => {
        // Remove extra whitespace and convert to lowercase
        const cleaned = transcript.toLowerCase().trim();

        // Try to extract a 4-digit number
        const match = cleaned.match(/\b(\d{4})\b/);
        if (match) {
            return parseInt(match[1]);
        }

        // Try to parse spoken numbers like "twenty twenty one" -> 2021
        const spokenNumbers: { [key: string]: number } = {
            "zero": 0, "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
            "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
            "twenty": 20, "thirty": 30, "forty": 40, "fifty": 50,
            "sixty": 60, "seventy": 70, "eighty": 80, "ninety": 90,
            "hundred": 100, "thousand": 1000
        };

        const words = cleaned.split(/\s+/);
        let current = 0;

        for (const word of words) {
            if (spokenNumbers[word] !== undefined) {
                const num = spokenNumbers[word];
                if (num === 1000) {
                    current *= 1000;
                } else if (num === 100) {
                    current *= 100;
                } else if (num >= 20) {
                    current += num;
                } else {
                    current += num;
                }
            }
        }

        if (current > 999 && current < 3000) {
            return current;
        }

        return null;
    };

    return (
        <div className="flex flex-1 flex-col w-full max-w-2xl mx-auto mt-8">
            <div className="mb-8 text-xl">{question}</div>
            <div className="flex justify-center relative">
                <YearInput ref={yearInputRef} correctYear={correctYear} flashcardId={Math.random()} onAnswer={onAnswer} />
            </div>
            <div className="flex-1"></div>
            <div className="flex items-center justify-center mb-8">
                <RoundButton
                    onClick={handleSpeechRecognition}
                    svgIconPath={{ src: "/images/microphone.svg", alt: "Record Answer", color: isListening ? "bg-red-400" : "" }}
                />
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
const YearInput = React.forwardRef(function YearInputInner(
    { correctYear, flashcardId, onAnswer }: { correctYear: number, flashcardId: number, onAnswer: (date: { year?: number, day?: number, month?: number }) => void },
    ref: React.Ref<{ fillYearFromSpeech: (year: number) => void }>
) {

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

    const fillYearFromSpeech = (year: number) => {
        const yearStr = year.toString();
        const newValues = yearStr.split("");

        // Pad with empty strings if the spoken year has fewer digits than expected
        while (newValues.length < numDigits) {
            newValues.unshift("");
        }

        // Trim if the spoken year has more digits
        newValues.splice(numDigits);

        setValues(newValues);

        // Simulate the user filling in the year programmatically
        const inputYear = newValues.join("");
        const isAnswerCorrect = inputYear === correctYear.toString();

        setCorrect(isAnswerCorrect);

        // Wait a bit before calling onAnswer to let the user see if they were correct
        setTimeout(() => {
            onAnswer({ year: parseInt(inputYear) });
        }, 2000);
    };

    // Expose the fillYearFromSpeech method via the ref
    useImperativeHandle(ref, () => ({
        fillYearFromSpeech
    }), [correctYear, numDigits]);

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
});