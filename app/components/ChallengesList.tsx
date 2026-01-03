'use client'

import { Challenge } from "@/api/TomeChallengesAPI";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MaskedSvgIcon } from "./MaskedSvgIcon";
import { ProgressBar } from "../ui/general/ProgressBar";

export interface ExtendedChallenge {
    challenge: Challenge;
    progress: number;       // Progress in percent (0-100)
    score: number;          // Score in percent (0-100) for challenges that are currently completed
}

interface ChallengesListProps {
    challenges: ExtendedChallenge[];    // All the challenges for the current topic
    topicId: string;
}

export function ChallengesList({ challenges, topicId }: ChallengesListProps) {

    if (challenges.length === 0) {
        return <div className="text-base opacity-50">No challenges yet</div>
    }

    return (
        <div className="mt-2 ml-1">
            <SectionHeader title="Challenges" />
            <div className="mb-6 space-y-2">
                {challenges.map((challenge, index) => (
                    <ChallengeItem
                        key={`${challenge.challenge.code}-${index}`}
                        challenge={challenge}
                        topicId={topicId}
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

function ChallengeItem({ challenge, topicId }: { challenge: ExtendedChallenge, topicId: string }) {

    const [pressed, setPressed] = useState(false);
    const router = useRouter();

    return (
        <div className="text-base flex items-center cursor-pointer"
            onClick={() => router.push(`/topics/${topicId}/challenges/${challenge.challenge.code}`)}
            onMouseDown={() => setPressed(true)}
            onMouseUp={() => setPressed(false)}
            onMouseLeave={() => setPressed(false)}
            onTouchStart={() => setPressed(true)}
            onTouchEnd={() => setPressed(false)}
            style={{
                opacity: pressed ? 0.5 : 1,
            }}
        >
            <div className="w-10 h-10 max-h-10 max-w-10 min-w-10 mr-3 flex items-center justify-center border-2 border-cyan-800 rounded-full p-1">
                <MaskedSvgIcon
                    src={`/images/challenges/${challenge.challenge.code}.svg`}
                    alt={challenge.challenge.code}
                    size="w-5 h-5"
                    color="bg-cyan-800"
                />
            </div>
            <div>
                <div className="capitalize">{challenge.challenge.name || challenge.challenge.code}</div>
                {challenge.progress > 0 &&
                    (<div><ProgressBar id={challenge.challenge.code} current={challenge.progress} max={100} hideNumber={true} size='s' /></div>)
                }
            </div>
        </div>
    )
}
