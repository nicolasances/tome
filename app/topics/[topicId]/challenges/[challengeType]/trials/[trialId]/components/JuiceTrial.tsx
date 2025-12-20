'use client'

import { useState } from "react";
import { JuiceChallenge } from "@/api/TomeChallengesAPI";
import RoundButton from "@/app/ui/buttons/RoundButton";
import OkSVG from "@/app/ui/graphics/icons/Ok";
import { TestFactory } from "./TestFactory";

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
            <div className="flex flex-1 flex-col items-center justify-start px-6 py-8">
                <div className="text-xl font-semibold mb-8 text-center">
                    {challenge.context}
                </div>
                <div className="flex-1"></div>
                <div className="flex justify-center">
                    <RoundButton icon={<OkSVG />} onClick={handleStartClick} size="m" />
                </div>
            </div>
        );
    }

    // Test phase
    if (!currentTest) {
        return <div>No tests available</div>;
    }

    return (
        <div className="flex flex-1 flex-col items-center justify-start px-4">
            {TestFactory.createTestComponent(
                currentTest,
                currentTest.type === 'open' ? handleOpenTestAnswer : handleDateTestAnswer
            )}
        </div>
    );
}
