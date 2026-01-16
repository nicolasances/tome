'use client'

import { useState } from "react";
import { MaskedSvgIcon } from "../../../../../components/MaskedSvgIcon";
import { Challenge, Trial } from "@/api/TomeChallengesAPI";
import { formatSectionCode } from "@/app/utils/sectionFormatting";
import { ProgressBar } from "@/app/ui/general/ProgressBar";


export interface ExtendedChallenge extends Challenge {
    enabled: boolean;
    score?: number;          // Score in percent (0-100) for challenges that are currently completed
    toRepeat: boolean;      // Whether the challenge needs to be repeated due to low score over a section group (window)
}

interface ChallengeDetailListProps {
    challenges: ExtendedChallenge[];
    nonExpiredTrials: Trial[];
    onChallengeClick?: (challengeId: string) => void;
}

export function ChallengeDetailList({ challenges, nonExpiredTrials, onChallengeClick }: ChallengeDetailListProps) {

    if (challenges.length === 0) {
        return <div className="text-base opacity-50">No challenges yet</div>
    }

    return (
        <div className="mt-2 ml-1">
            <SectionHeader title="Sections" />
            <div className="mb-6 space-y-2">
                {challenges.map((challenge, index) => (
                    <ChallengeDetailItem
                        key={`${challenge.sectionCode}-${index}`}
                        challenge={challenge}
                        onChallengeClick={onChallengeClick}
                        nonExpiredTrials={nonExpiredTrials}
                    />
                ))}
            </div>
        </div>
    )
}

function SectionHeader({ title }: { title: string }) {
    return (
        <div className="flex items-center text-sm opacity-70 py-1 mb-4 w-fit">
            <div className="uppercase">{title}</div>
        </div>
    )
}

function ChallengeDetailItem({ challenge, nonExpiredTrials, onChallengeClick }: { challenge: ExtendedChallenge; nonExpiredTrials: Trial[]; onChallengeClick?: (challengeId: string) => void }) {

    const [pressed, setPressed] = useState(false);

    const handleClick = () => {

        if (!challenge.enabled) return;

        onChallengeClick?.(challenge.id);
    }
    const isChallengeInProgress = nonExpiredTrials.some(trial => trial.challengeId === challenge.id && !trial.completedOn);
    const isChallengeCompleted = nonExpiredTrials.some(trial => trial.challengeId === challenge.id && trial.completedOn);
    const challengeScore = isChallengeCompleted ? nonExpiredTrials.find(trial => trial.challengeId === challenge.id && trial.completedOn)?.score || 0 : 0;

    /**
     * Returns the icon URL for the given challenge Id based on whether there are no trials, active trials or completed trials
     * @param challengeId
     */
    const getChallengeIcon = () => {

        if (challenge.toRepeat) return "/images/teacher.svg";
        else if (isChallengeCompleted) return "/images/challenge-completed.svg";
        else if (!challenge.enabled) return "/images/pause.svg";

        return "/images/challenge-todo.svg";

    }

    /**
     * Returns the colors for the challenge based on its state
     * 
     * @returns 
     */
    const getChallengeColors = () => {
        
        if (challenge.toRepeat) return {border: "border-cyan-800", bg: "bg-cyan-800", text: "text-cyan-800"};
        else if (isChallengeCompleted) return {border: "border-cyan-200", bg: "bg-cyan-200", text: "text-cyan-200"};
        else if (!challenge.enabled) return {border: "border-cyan-600", bg: "bg-cyan-600", text: "text-cyan-600"};

        return {border: "border-cyan-800", bg: "bg-cyan-800", text: "text-cyan-800"};
    }



    let currentProgress = 0;
    if (isChallengeInProgress) {
        const trial = nonExpiredTrials.find(trial => trial.challengeId === challenge.id && !trial.completedOn);
     
        const answeredTests = trial?.answers?.length || 0
        const totalTests = challenge.tests.length;

        currentProgress = totalTests > 0 ? Math.floor((answeredTests / totalTests) * 100) : 0;
    }

    return (
        <div className={`text-base flex items-center cursor-pointer ${getChallengeColors().text}`}
            onMouseDown={() => setPressed(true)}
            onMouseUp={() => setPressed(false)}
            onMouseLeave={() => setPressed(false)}
            onTouchStart={() => setPressed(true)}
            onTouchEnd={() => setPressed(false)}
            onClick={handleClick}
            style={{
                opacity: pressed ? 0.5 : 1,
            }}
        >
            <div className={`w-10 h-10 mr-3 flex items-center justify-center border-2 ${getChallengeColors().border} rounded-full p-1`}>
                <MaskedSvgIcon
                    src={getChallengeIcon()}
                    alt="challenge"
                    size="w-5 h-5"
                    color={`${getChallengeColors().bg}`}
                />
            </div>
            <div className="flex-1">
                <div>{`${formatSectionCode(challenge.sectionCode)} ${challenge.toRepeat ? "(Repeat)" : ""}`}</div>
                {isChallengeInProgress && (
                    <div>
                        <ProgressBar id={`progress-${challenge.id}`} hideNumber={true} current={currentProgress} max={100} size="s" />
                    </div>
                )}
            </div>
            <div>
                {isChallengeCompleted && (
                    <span>{Math.round(challengeScore * 100)}%</span>
                )}
            </div>
        </div>
    )
}
