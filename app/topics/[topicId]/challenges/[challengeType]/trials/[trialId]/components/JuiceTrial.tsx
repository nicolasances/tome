'use client'

import { useEffect, useRef, useState } from "react";
import { JuiceChallenge, TomeChallengesAPI, TomeTest, Trial } from "@/api/TomeChallengesAPI";
import { GoogleTTSAPI } from "@/api/GoogleTTSAPI";
import RoundButton from "@/app/ui/buttons/RoundButton";
import OkSVG from "@/app/ui/graphics/icons/Ok";
import { TestFactory } from "./TestFactory";
import { useCarMode } from "@/context/CarModeContext";
import { useAudio } from "@/context/AudioContext";
import { SpeechButtonHandle } from "./SpeechButton";
import { WhisperAPI } from "@/api/WhisperAPI";
import { AudioLoadingBar } from "@/components/AudioLoadingBar";

interface JuiceTrialProps {
    challenge: JuiceChallenge;
    trialId: string;
    trial: Trial;
    onTrialComplete: () => void;
    onTrialDeleted: () => void;
}

export function JuiceTrial({ challenge, trialId, trial, onTrialComplete, onTrialDeleted }: JuiceTrialProps) {

    const [currentPhase, setCurrentPhase] = useState<'context' | 'test'>(trial.answers && trial.answers.length > 0 ? 'test' : 'context');
    const [currentTestIndex, setCurrentTestIndex] = useState(0);
    const [answers, setAnswers] = useState<{ [key: string]: any }>({});

    const pendingScores = useRef<Promise<{ score: number }>[]>([]);
    const speechButtonRef = useRef<SpeechButtonHandle>(null);

    const { carMode, toggleCarMode } = useCarMode();
    const { play: playAudio, stop: stopAudio } = useAudio();

    const translationJobs = useRef<{ [key: string]: NodeJS.Timeout }>({});

    // Get the first "open" test
    const firstOpenTestIndex = challenge.tests.findIndex(test => test.type === 'open');

    // Get the remaining tests in order (all tests except the first open one)
    const getTestsInOrder = (tests: TomeTest[]) => {
        if (firstOpenTestIndex === -1) {
            return tests;
        }
        const openTest = tests[firstOpenTestIndex];
        const remainingTests = tests.filter((_, idx) => idx !== firstOpenTestIndex);
        return [openTest, ...remainingTests];
    };

    /**
     * Filters out the tests that have already been answered in this trial
     */
    const filterOutAnsweredTests = (tests: TomeTest[]): TomeTest[] => {

        if (!trial || !trial.answers || trial.answers.length === 0) return tests;

        const answeredTestIds = trial.answers!.map(a => a.testId);

        return tests.filter(test => !answeredTestIds.includes(test.testId));
    }

    const tests = filterOutAnsweredTests(getTestsInOrder(challenge.tests));

    const currentTest = tests[currentTestIndex];
    const isLastTest = currentTestIndex === tests.length - 1;

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

        pendingScores.current = [...pendingScores.current, scorePromise];

        // Move to next test
        nextTest();
    };

    /**
     * METHOD USED ALTERNATIVELY TO handleAnswer 
     * 
     * Method used to handle transcription job triggered in async mode. 
     * This method moves on to the next question, as the answer will be processed in the background.
     * When the answer comes, it will post it to the Trial automatically. 
     * 
     * If there are no more questions, and the job is not yet ready, we'll wait. 
     * 
     * @param jobId 
     */
    const onTranscriptionJobTriggered = (jobId: string) => {

        const scorePromise = waitForTranscriptionAndScore(jobId);

        pendingScores.current = [...pendingScores.current, scorePromise];

        nextTest();
    }

    /**
     * Moves to the next test. 
     * If there are no more tests: 
     * - if all the answers have been gathered, completes the trial
     * - if some answers are pending (async transcription jobs), waits for them to complete
     */
    const nextTest = () => {

        // Move to next test
        if (!isLastTest) {
            setCurrentTestIndex(currentTestIndex + 1);
        }
        else {
            // No more tests: 
            // Wait for all scoring to complete then complete the trial
            Promise.all(pendingScores.current)
                .then(() => onTrialComplete())
                .catch((error) => {
                    console.error('Error scoring answers:', error);
                    // Still complete the trial even if scoring failed
                    onTrialComplete();
                });
        }
    }

    const speakQuestionAloud = async (currentTest: TomeTest) => {

        if (!carMode) return;

        await startGoogleTTSSpeech("Answer the following question: " + currentTest.question, () => {
            // Auto-start recording when question finishes in car mode
            // CHOSEN NOT TO AUTO-START RECORDING FOR NOW
            // speechButtonRef.current?.startRecording();
        });
    }

    /**
     * When car mode is active, start speech: the context is spoken aloud and for each test the question is spoken too.
     */
    const readContextAloud = () => {
        if (currentPhase !== 'context') return;

        startGoogleTTSSpeech(challenge.context, handleStartClick);
    }

    const startGoogleTTSSpeech = async (text: string, onEnded?: () => void) => {

        if (!carMode) return;

        try {
            const audioUrl = await new GoogleTTSAPI().synthesizeSpeech(text);

            await playAudio(audioUrl, () => {
                if (onEnded) onEnded();
            });

        } catch (error) {
            console.error('Error with Google TTS:', error);
        }
    }

    /**
     * Deletes the current trial
     */
    const deleteTrial = async () => {

        await new TomeChallengesAPI().deleteTrial(trialId);

        onTrialDeleted();
    }

    /**
     * This function returns a Promise that releases when BOTH: 
     * - the transcription job is complete
     * - the transcription has been sent as answer and the answer has been scored
     * 
     * That allows this Promise to be considered the same as any other pendingScores Promise.
     * 
     * @param jobId 
     */
    const waitForTranscriptionAndScore = async (jobId: string): Promise<{ score: number }> => {

        return new Promise<{ score: number }>((resolve, reject) => {

            try {
                // Set up a timer to poll for job status every 3 seconds
                translationJobs.current[jobId] = setInterval(async () => {
    
                    const statusResponse = await new WhisperAPI().getTranscriptionJobStatus(jobId);
    
                    if (statusResponse.status === 'completed' && statusResponse.text) {
    
                        // Clear the timer
                        clearInterval(translationJobs.current[jobId]);
                        delete translationJobs.current[jobId];
    
                        // Save the answer
                        const newAnswers = {
                            ...answers,
                            [currentTest.testId]: statusResponse.text
                        };
                        setAnswers(newAnswers);
    
                        // Send answer to API
                        const scoreResponse = await new TomeChallengesAPI().postTrialAnswer(trialId, currentTest, statusResponse.text);
    
                        resolve(scoreResponse)
                    }
                }, 4000);
            }
            catch (error) {
                reject(error);
            }

        });
    }


    // Stop audio on component unmount
    useEffect(() => {
        return () => {
            stopAudio();
        };
    }, [stopAudio]);

    // Start speech when car mode is activated
    useEffect(readContextAloud, [carMode]);
    useEffect(() => { if (currentPhase == 'test' && currentTest) speakQuestionAloud(currentTest); }, [currentPhase, currentTestIndex]);

    if (currentPhase === 'context') {
        return (
            <div className="flex flex-1 flex-col items-center justify-start px-6 py-8">
                <div className="text-xl mb-8 text-center">
                    {challenge.context}
                </div>
                <div className="flex-1"></div>
                <div className="flex justify-between gap-2 items-center">
                    <RoundButton svgIconPath={{ src: "/images/trash.svg", alt: "Delete Trial" }} onClick={deleteTrial} />
                    {!carMode && <RoundButton svgIconPath={{ src: "/images/car.svg", alt: "Car Mode", color: carMode ? 'bg-red-700' : '' }} secondary={carMode} onClick={toggleCarMode} />}
                    <RoundButton icon={<OkSVG />} onClick={handleStartClick} size="m" />
                </div>
            </div>
        );
    }

    // Test phase
    if (!currentTest) {
        return  <div className="flex flex-1 flex-col items-center justify-start px-4">No tests available</div>;
    }

    // If we're waiting for the scores to be calculated but the user has done it all, show a loading indicator
    if (isLastTest && pendingScores.current.length === tests.length) return (
         <div className="flex flex-1 flex-col text-base items-center justify-start px-4 pt-8 gap-4">
            <AudioLoadingBar color="bg-cyan-200" barCount={20} />
            <div>Scoring your answers..</div>
         </div>
    )

    return (
        <div className="flex flex-1 flex-col items-center justify-start px-4">
            {TestFactory.createTestComponent(currentTest, handleAnswer, { speechButtonRef, onTranscriptionJobTriggered: onTranscriptionJobTriggered })}
        </div>
    );
}
