'use client'

import { useEffect, useRef, useState } from "react";
import { JuiceChallenge, TomeChallengesAPI } from "@/api/TomeChallengesAPI";
import { GoogleTTSAPI } from "@/api/GoogleTTSAPI";
import RoundButton from "@/app/ui/buttons/RoundButton";
import OkSVG from "@/app/ui/graphics/icons/Ok";
import { TestFactory } from "./TestFactory";
import { useCarMode } from "@/context/CarModeContext";

interface JuiceTrialProps {
    challenge: JuiceChallenge;
    trialId: string;
    onTrialComplete: () => void;
}

export function JuiceTrial({ challenge, trialId, onTrialComplete }: JuiceTrialProps) {

    const [currentPhase, setCurrentPhase] = useState<'context' | 'test'>('context');
    const [currentTestIndex, setCurrentTestIndex] = useState(0);
    const [answers, setAnswers] = useState<{ [key: string]: any }>({});
    const [pendingScores, setPendingScores] = useState<Promise<{ score: number }>[]>([]);
    const { carMode, toggleCarMode } = useCarMode();
    const audioRef = useRef<HTMLAudioElement | null>(null);

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

    /**
     * Handles the user answer: 
     * 1. Stores it 
     * 2. Sends it to the Tome Challenges API and gets back the score
     * 3. Moves to the next test or completes the trial
     * 
     * @param answer 
     */
    const handleAnswer = async (answer: any) => {

        const newAnswers = {
            ...answers,
            [currentTest.testId]: answer
        };
        setAnswers(newAnswers);

        // Send answer to API
        const scorePromise = new TomeChallengesAPI().postTrialAnswer(trialId, currentTest, answer);

        setPendingScores([...pendingScores, scorePromise])

        // Move to next test
        if (!isLastTest) {
            setCurrentTestIndex(currentTestIndex + 1);
        } else {
            Promise.all(pendingScores.concat(scorePromise))
                .then(() => onTrialComplete())
                .catch((error) => {
                    console.error('Error scoring answers:', error);
                    // Still complete the trial even if scoring failed
                    onTrialComplete();
                });
        }
    };

    /**
     * When car mode is active, start speech: the context is spoken aloud and for each test the question is spoken too.
     */
    const startSpeech = () => {

        // startNativeBrowserSpeech(); 

        // Google TTS
        startGoogleTTSSpeech();
    }

    const startGoogleTTSSpeech = async () => {

        // Stop any currently playing audio
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        
        if (!carMode) return;

        // Only speak the context when in the context phase
        if (currentPhase === 'context') {
            try {
                const audioUrl = await new GoogleTTSAPI().synthesizeSpeech(challenge.context);
                const audio = new Audio(audioUrl);
                audioRef.current = audio;
                audio.play();
            } catch (error) {
                console.error('Error with Google TTS:', error);
            }
        }
    }

    const startNativeBrowserSpeech = async () => {
        
        // Always cancel any ongoing speech first
        window.speechSynthesis.cancel();
        
        if (!carMode) return;

        // Only speak the context when in the context phase
        if (currentPhase === 'context') {
            // Create utterance with the challenge context
            const utterance = new SpeechSynthesisUtterance(challenge.context);
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            
            // Speak the text
            window.speechSynthesis.speak(utterance);
        }
    }

    // Start speech when car mode is activated
    useEffect(startSpeech, [carMode]);

    if (currentPhase === 'context') {
        return (
            <div className="flex flex-1 flex-col items-center justify-start px-6 py-8">
                <div className="text-xl mb-8 text-center">
                    {challenge.context}
                </div>
                <div className="flex-1"></div>
                <div className="flex justify-between gap-2 items-center">
                    <RoundButton svgIconPath={{src: "/images/car.svg", alt: "Car Mode", color: carMode ? 'bg-red-700' : '' }} secondary={carMode} onClick={toggleCarMode} />
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
            {TestFactory.createTestComponent(currentTest, handleAnswer)}
        </div>
    );
}
