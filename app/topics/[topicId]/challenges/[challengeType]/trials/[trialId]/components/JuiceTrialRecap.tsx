'use client'

import { Trial, JuiceChallenge, TestAnswer } from "@/api/TomeChallengesAPI";
import { ProgressBar } from "@/app/ui/general/ProgressBar";
import { TestHead } from "./TestHead";
import { TestFactory } from "./TestFactory";
import { useCarMode } from "@/context/CarModeContext";
import RoundButton from "@/app/ui/buttons/RoundButton";
import { useState } from "react";
import { useAudio } from "@/context/AudioContext";
import { GoogleTTSAPI } from "@/api/GoogleTTSAPI";

interface JuiceTrialRecapProps {
    trial: Trial;
    challenge: JuiceChallenge;
}

export function JuiceTrialRecap({ trial, challenge }: JuiceTrialRecapProps) {

    const { carMode } = useCarMode();
    const { play, isSpeaking } = useAudio();

    /**
     * Format the completion date
     */
    const formatCompletionDate = (date: Date | undefined) => {
        if (!date) return "Not completed";
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const expiresProgress = {
        total: trial.expiresOn && trial.startedOn ? new Date(trial.expiresOn).getTime() - new Date(trial.startedOn).getTime() : 0,
        current: 100 * (new Date().getTime() - new Date(trial.startedOn).getTime()) / (trial.expiresOn && trial.startedOn ? new Date(trial.expiresOn).getTime() - new Date(trial.startedOn).getTime() : 1), // the current day, on a scale from startedOn to expiresOn
    }

    const getScoreColor = (score: number): string => {
        if (score < 30) return 'text-red-200 border-red-200';
        if (score < 70) return 'text-lime-200 border-lime-200';
        return 'text-green-300 border-green-300';
    };

    /**
     * Goes through the trial answers and finds which important aspects were remembered and which were missed
     */
    const findImportantAspectsRemembered = (): { rememberedIndexes: number[], missedIndexes: number[] } => {

        // Get the answer to the Juice Open Test (there's only one)
        const openTestAnswer = trial.answers?.find(ta => ta.testId === challenge.tests.find(t => t.type === 'open')?.testId);

        // Check if this item was found in the answer
        const testDetails = openTestAnswer?.details || {};
        const juiceIndexesFound: number[] = testDetails.juiceIndexesFound || [];

        return {
            rememberedIndexes: juiceIndexesFound,
            missedIndexes: challenge.toRemember.map((_, idx) => idx).filter(idx => !juiceIndexesFound.includes(idx)),
        }
    }

    /**
     * Read important aspects to remember aloud
     */
    const readImportantAspects = async () => {

        // Get the remembered and missed aspects
        const { rememberedIndexes, missedIndexes } = findImportantAspectsRemembered();

        const aspectsToRemember = challenge.toRemember.reduce((acc, item, idx) => {
            return acc + "Aspect " + (idx + 1) + ": " + item.toRemember + ". "
        }, "These were the most important aspects to remember: ");

        // Create the speech text
        let speechText = ""; 
        if (rememberedIndexes.length == 0) speechText += "You did not remember any of the important aspects. " + aspectsToRemember;
        else if (rememberedIndexes.length == 1) speechText += `You correctly remembered aspect ${rememberedIndexes[0] + 1}. You missed the rest. ` + aspectsToRemember;
        else if (rememberedIndexes.length == challenge.toRemember.length) speechText += "Congratulations! You remembered all the important aspects. ";
        else speechText += `Among the important aspects to remember, you correctly remembered aspects ${rememberedIndexes.map(i => i + 1).join(", ")}. You missed aspects ${missedIndexes.length > 0 ? missedIndexes.map(i => i + 1).join(", ") : 'none'}. ` + aspectsToRemember;

        try {
            const audioUrl = await new GoogleTTSAPI().synthesizeSpeech(speechText);

            await play(audioUrl, () => { });

        } catch (error) {
            console.error('Error with Google TTS:', error);
        }
    }

    return (
        <div className="flex flex-1 flex-col w-full py-8 space-y-8 items-center">
            {/* Top Section: Completion Date and Final Score */}
            <div className="space-y-4 pb-2 flex flex-col items-center">
                <div className="text-cyan-900 mb-4 text-sm flex flex-col items-center space-x-2">
                    <div className={`flex items-center justify-center w-16 min-w-16 h-16 mb-2 border-2 rounded-full text-xl font-bold ${getScoreColor(trial.score !== undefined ? Math.round(trial.score * 100) : 0)}`}>
                        {trial.score !== undefined ? Math.round(trial.score * 100) : '—'}<span className="text-xs pt-1 ml-[2px]">%</span>
                    </div>
                    <div>Final score</div>
                </div>
                <div className="flex flex-col">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-cyan-900 text-xs">Trial completed on</span>
                            <span className="text-cyan-900 text-base font-semibold">{formatCompletionDate(trial.completedOn)}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-cyan-900 text-xs">Expires On</span>
                            <span className="text-cyan-900 text-base font-semibold">{formatCompletionDate(trial.expiresOn)}</span>
                        </div>
                    </div>
                    <div className="mt-2">
                        <ProgressBar current={expiresProgress.current} max={100} hideNumber={true} size="s" />
                    </div>
                </div>
            </div>

            {/* Test Results Section */}
            <div className="space-y-4 w-full">
                {trial.answers && trial.answers.length > 0 ? (
                    <div className="space-y-2">
                        {trial.answers.map((testAnswer: TestAnswer, index: number) => (
                            <Answer key={`Answer-${testAnswer.testId}`} testAnswer={testAnswer} index={index} challenge={challenge} trial={trial} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-cyan-900">
                        No test results available
                    </div>
                )}
            </div>

            {carMode &&
                <div className={`fixed bottom-8 flex bg-cyan-800/80 w-80 rounded-xl justify-center py-4`}>
                    <RoundButton
                        svgIconPath={{ src: "/images/voice.svg", alt: "Read" }}
                        size='car'
                        onClick={readImportantAspects}
                        disabled={isSpeaking}
                    />
                </div>
            }
        </div>
    );
}

function Answer({ testAnswer, index, challenge, trial }: { testAnswer: TestAnswer, index: number, challenge: JuiceChallenge, trial: Trial }) {

    const [showDetails, setShowDetails] = useState(false);

    /**
     * Find the test by testId
     */
    const getTest = (testId: string) => {
        return challenge.tests.find(t => t.testId === testId);
    };

    const toggleDetails = () => {
        setShowDetails(!showDetails);
    }

    const test = getTest(testAnswer.testId);
    if (!test) return null;
    return (
        <div key={testAnswer.testId} className="space-y-3 ">
            <TestHead test={test} score={testAnswer.score} testIndex={index} onExpand={toggleDetails} />
            {showDetails && (
                <div className="ml-12" style={{ marginTop: "-8px" }}>
                    {TestFactory.createTestAnswerComponent(test, trial, challenge)}
                </div>
            )}
        </div>
    )
}