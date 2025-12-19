'use client'

import { useState } from "react";
import { MaskedSvgIcon } from "../../../../../components/MaskedSvgIcon";
import { Challenge } from "@/api/TomeChallengesAPI";
import { formatSectionCode } from "@/app/utils/sectionFormatting";

interface ChallengeDetailListProps {
    challenges: Challenge[];
    onChallengeClick?: (challengeId: string) => void;
}

export function ChallengeDetailList({ challenges, onChallengeClick }: ChallengeDetailListProps) {

    if (challenges.length === 0) {
        return <div className="text-base opacity-50">No challenges yet</div>
    }

    return (
        <div className="mt-2 ml-4">
            <SectionHeader title="Sections" />
            <div className="mb-6 space-y-2">
                {challenges.map((challenge, index) => (
                    <ChallengeDetailItem 
                        key={`${challenge.sectionCode}-${index}`} 
                        challenge={challenge} 
                        onChallengeClick={onChallengeClick}
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

function ChallengeDetailItem({ challenge, onChallengeClick }: { challenge: Challenge; onChallengeClick?: (challengeId: string) => void }) {

    const [pressed, setPressed] = useState(false);

    const handleClick = () => {
        onChallengeClick?.(challenge.id);
    }

    return (
        <div className="text-base flex items-center cursor-pointer"
            onMouseDown={() => setPressed(true)}
            onMouseUp={() => setPressed(false)}
            onMouseLeave={() => setPressed(false)}
            onClick={handleClick}
            style={{
                opacity: pressed ? 0.5 : 1,
            }}
        >
            <div className="w-10 h-10 mr-3 flex items-center justify-center border-2 border-cyan-800 rounded-full p-1">
                <MaskedSvgIcon 
                    src="/images/challenge-todo.svg"
                    alt="challenge"
                    size="w-5 h-5"
                    color="bg-cyan-800"
                />
            </div>
            <div>{formatSectionCode(challenge.sectionCode)}</div>
        </div>
    )
}
