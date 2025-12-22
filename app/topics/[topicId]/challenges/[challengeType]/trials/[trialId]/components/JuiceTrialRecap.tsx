'use client'

import { Trial, JuiceChallenge, TestAnswer, SplitDate } from "@/api/TomeChallengesAPI";
import { MaskedSvgIcon } from "@/app/components/MaskedSvgIcon";
import { ProgressBar } from "@/app/ui/general/ProgressBar";

interface JuiceTrialRecapProps {
    trial: Trial;
    challenge: JuiceChallenge;
}

export function JuiceTrialRecap({ trial, challenge }: JuiceTrialRecapProps) {

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

    /**
     * Find the test by testId
     */
    const getTest = (testId: string) => {
        return challenge.tests.find(t => t.testId === testId);
    };

    /**
     * Format answer based on test type
     */
    const formatAnswer = (answer: any, testType: string): string => {
        if (testType === 'date') {
            return formatSplitDate(answer);
        }
        return String(answer || '');
    };

    /**
     * Format a split date (with optional year, month, day)
     */
    const formatSplitDate = (splitDate: SplitDate | any): string => {
        if (!splitDate) return '(no answer)';

        const parts: string[] = [];
        if (splitDate.year !== null && splitDate.year !== undefined) parts.push(`${splitDate.year}`);
        if (splitDate.month !== null && splitDate.month !== undefined) parts.push(`${String(splitDate.month).padStart(2, '0')}`);
        if (splitDate.day !== null && splitDate.day !== undefined) parts.push(`${String(splitDate.day).padStart(2, '0')}`);

        if (parts.length === 0) return '(no answer)';
        return parts.join('-');
    };

    const expiresProgress = {
        total: trial.expiresOn && trial.startedOn ? new Date(trial.expiresOn).getTime() - new Date(trial.startedOn).getTime() : 0,
        current: 100 * (new Date().getTime() - new Date(trial.startedOn).getTime()) / (trial.expiresOn && trial.startedOn ? new Date(trial.expiresOn).getTime() - new Date(trial.startedOn).getTime() : 1), // the current day, on a scale from startedOn to expiresOn
    }

    return (
        <div className="flex flex-1 flex-col w-full py-8 space-y-8">
            {/* Top Section: Completion Date and Final Score */}
            <div className="space-y-4 pb-2">
                <div className="text-cyan-800 mb-4 text-base flex items-center space-x-2">
                    <MaskedSvgIcon src="/images/challenge-completed.svg" color="bg-cyan-800" alt="completed" />
                    <div>Trial Complete</div>
                    <div className="flex-1"></div>
                    <div className="flex flex-col items-end">
                        <span className="text-cyan-800 text-xs font-semibold">Final Score</span>
                        <span className="text-lg font-bold text-cyan-800">
                            {trial.score !== undefined ? Math.round(trial.score * 100) : '—'} %
                        </span>
                    </div>
                </div>
                <div className="flex flex-col">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-cyan-800 text-xs">Completed On</span>
                            <span className="text-cyan-800 text-base">{formatCompletionDate(trial.completedOn)}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-cyan-800 text-xs">Expires On</span>
                            <span className="text-cyan-800 text-base">{formatCompletionDate(trial.expiresOn)}</span>
                        </div>
                    </div>
                    <div className="mt-2">
                        <ProgressBar current={expiresProgress.current} max={100} hideNumber={true} size="s" />
                    </div>
                </div>
            </div>

            {/* Test Results Section */}
            <div className="space-y-4">
                <div className="text-lg font-semibold text-cyan-800">Test Results</div>

                {trial.answers && trial.answers.length > 0 ? (
                    <div className="space-y-6">
                        {trial.answers.map((testAnswer: TestAnswer, index: number) => {
                            const test = getTest(testAnswer.testId);
                            if (!test) return null;

                            return (
                                <div key={testAnswer.testId} className="space-y-3 pb-6 ">
                                    <div className="flex justify-between items-start">
                                        <div className="">
                                            <div className="text-cyan-800 font-semibold text-base bg-cyan-200 rounded-full px-3 inline-block">
                                                Question {index + 1}
                                            </div>
                                            <p className="text-cyan-800 text-sm mt-2">{test.question}</p>
                                        </div>
                                        <div className="text-base font-bold ml-4 flex-shrink-0 text-cyan-800">
                                            {Math.round(testAnswer.score * 100)} %
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        {/* User Answer */}
                                        <div>
                                            <span className="text-cyan-800 text-sm font-semibold">Your Answer</span>
                                            <p className="text-cyan-800 mt-1 break-words">
                                                {formatAnswer(testAnswer.answer, test.type)}
                                            </p>
                                        </div>

                                        {/* Correct Answer */}
                                        <div>
                                            <span className="text-cyan-800 text-sm font-semibold">Correct Answer</span>
                                            <p className="text-cyan-800 mt-1 break-words">
                                                {formatAnswer(test.correctAnswer, test.type)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-8 text-cyan-800">
                        No test results available
                    </div>
                )}
            </div>
        </div>
    );
}
