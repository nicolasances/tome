'use client'

import { useState, useEffect } from "react";
import { JuiceChallenge } from "@/api/TomeChallengesAPI";
import TextButton from "@/app/ui/buttons/TextButton";
import { DateFlashcardWidget } from "@/app/ui/cards/flashcards/DateFlashcardWidget";

interface JuiceTrialProps {
    challenge: JuiceChallenge;
    trialId: string;
    onTrialComplete: () => void;
}

export function JuiceTrial({ challenge, trialId, onTrialComplete }: JuiceTrialProps) {

    const [currentPhase, setCurrentPhase] = useState<'context' | 'test'>('context');
    const [currentTestIndex, setCurrentTestIndex] = useState(0);
    const [answers, setAnswers] = useState<{ [key: string]: any }>({});

    // Get the first "open" test
    const firstOpenTestIndex = challenge.tests.findIndex(test => test.type === 'open');

    // Get the remaining tests in order (all tests except the first open one)
    const getTestsInOrder = () => {
        if (firstOpenTestIndex === -1) {
            return challenge.tests;
        }
        const openTest = challenge.tests[firstOpenTestIndex];
        const remainingTests = challenge.tests.filter((_, idx) => idx !== firstOpenTestIndex);
        return [openTest, ...remainingTests];
    };

    const testsInOrder = getTestsInOrder();
    const currentTest = testsInOrder[currentTestIndex];
    const isLastTest = currentTestIndex === testsInOrder.length - 1;

    const handleStartClick = () => {
        setCurrentPhase('test');
    };

    const handleOpenTestAnswer = (answer: string) => {
        const newAnswers = {
            ...answers,
            [currentTest.testId]: answer
        };
        setAnswers(newAnswers);

        // Move to next test
        if (!isLastTest) {
            setCurrentTestIndex(currentTestIndex + 1);
        } else {
            onTrialComplete();
        }
    };

    const handleDateTestAnswer = (isCorrect: boolean) => {
        // For date tests, we just track that it was answered
        const newAnswers = {
            ...answers,
            [currentTest.testId]: isCorrect
        };
        setAnswers(newAnswers);

        // Move to next test
        if (!isLastTest) {
            setCurrentTestIndex(currentTestIndex + 1);
        } else {
            onTrialComplete();
        }
    };

    if (currentPhase === 'context') {
        return (
            <div className="flex flex-1 flex-col items-center justify-center px-4">
                <div className="max-w-md bg-cyan-50 rounded-lg p-8 shadow">
                    <div className="text-lg font-semibold mb-6">
                        {challenge.context}
                    </div>
                    <div className="flex justify-center">
                        <TextButton 
                            label="Start" 
                            onClick={handleStartClick}
                            size="m"
                        />
                    </div>
                </div>
            </div>
        );
    }

    // Test phase
    if (!currentTest) {
        return <div>No tests available</div>;
    }

    return (
        <div className="flex flex-1 flex-col items-center justify-center px-4">
            {currentTest.type === 'open' && (
                <OpenTestWidget
                    question={currentTest.question}
                    testId={currentTest.testId}
                    onAnswer={handleOpenTestAnswer}
                    cardNumber={currentTestIndex + 1}
                    totalCards={testsInOrder.length}
                />
            )}
            {currentTest.type === 'date' && (
                <DateFlashcardWidget
                    question={currentTest.question}
                    correctYear={(currentTest as any).correctAnswer?.year || new Date().getFullYear()}
                    sectionTitle={challenge.sectionCode}
                    id={currentTest.testId}
                    cardNumber={currentTestIndex + 1}
                    totalCards={testsInOrder.length}
                    onAnswerSelect={handleDateTestAnswer}
                />
            )}
        </div>
    );
}

function OpenTestWidget({ 
    question, 
    testId, 
    onAnswer,
    cardNumber,
    totalCards
}: { 
    question: string; 
    testId: string; 
    onAnswer: (answer: string) => void;
    cardNumber: number;
    totalCards: number;
}) {
    const [answer, setAnswer] = useState("");

    const handleSubmit = () => {
        if (answer.trim()) {
            onAnswer(answer);
            setAnswer("");
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            handleSubmit();
        }
    };

    return (
        <div className="p-4 shadow-lg rounded-lg bg-cyan-100 max-w-md mx-auto">
            <div className="flex justify-between items-center mb-4">
                <span className="bg-blue-200 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
                    open
                </span>
                <span className="text-gray-600 text-xs font-semibold">
                    {cardNumber}/{totalCards}
                </span>
            </div>
            <div className="mb-6 text-base font-bold">{question}</div>
            <div className="space-y-3">
                <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your answer..."
                    className="w-full p-3 border border-cyan-300 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400 min-h-24"
                />
                <div className="flex justify-center">
                    <button
                        onClick={handleSubmit}
                        disabled={!answer.trim()}
                        className={`py-2 px-4 rounded-3xl font-bold transition ${
                            answer.trim()
                                ? 'bg-cyan-500 text-white hover:shadow-lg cursor-pointer'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                        Submit
                    </button>
                </div>
            </div>
        </div>
    );
}
