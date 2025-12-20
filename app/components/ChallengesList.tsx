'use client'

import { Challenge } from "@/api/TomeChallengesAPI";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MaskedSvgIcon } from "./MaskedSvgIcon";

interface ChallengesListProps {
    challenges: Challenge[];
    topicId: string;
}

export function ChallengesList({ challenges, topicId }: ChallengesListProps) {

    if (challenges.length === 0) {
        return <div className="text-base opacity-50">No challenges yet</div>
    }

    return (
        <div className="mt-2 ml-4">
            <SectionHeader title="Challenges" />
            <div className="mb-6 space-y-2">
                {challenges.map((challenge, index) => (
                    <ChallengeItem 
                        key={`${challenge.type}-${index}`} 
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

function ChallengeItem({ challenge, topicId }: { challenge: Challenge, topicId: string }) {

    const [pressed, setPressed] = useState(false);
    const router = useRouter();

    return (
        <div className="text-base flex items-center cursor-pointer"
            onClick={() => router.push(`/topics/${topicId}/challenges/${challenge.code}`)}
            onMouseDown={() => setPressed(true)}
            onMouseUp={() => setPressed(false)}
            onMouseLeave={() => setPressed(false)}
            onTouchStart={() => setPressed(true)}
            onTouchEnd={() => setPressed(false)}
            style={{
                opacity: pressed ? 0.5 : 1,
            }}
        >
            <div className="w-10 h-10 mr-3 flex items-center justify-center border-2 border-cyan-800 rounded-full p-1">
                <MaskedSvgIcon 
                    src={`/images/challenges/${challenge.code}.svg`}
                    alt={challenge.code}
                    size="w-5 h-5"
                    color="bg-cyan-800"
                />
            </div>
            <div className="capitalize">{challenge.name || challenge.code}</div>
        </div>
    )
}
