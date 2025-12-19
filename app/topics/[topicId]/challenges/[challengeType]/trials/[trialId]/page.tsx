'use client'

import { TomeTopicsAPI, Topic } from "@/api/TomeTopicsAPI";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import RoundButton from "@/app/ui/buttons/RoundButton";
import { MaskedSvgIcon } from "@/app/components/MaskedSvgIcon";
import { TomeChallengesAPI, Challenge, Trial } from "@/api/TomeChallengesAPI";
import BackSVG from "@/app/ui/graphics/icons/Back";
import { formatSectionCode } from "@/app/utils/sectionFormatting";

export default function TrialPage() {

    const router = useRouter();
    const params = useParams()

    const [topic, setTopic] = useState<Topic>()
    const [challenge, setChallenge] = useState<Challenge>()
    const [trial, setTrial] = useState<Trial>()

    const loadData = async () => {
        loadTrial();
    }

    /**
     * Load the trial
     */
    const loadTrial = async () => {
        const trialResponse = await new TomeChallengesAPI().getTrial(String(params.trialId));
        const trialData = trialResponse.trial;
        setTrial(trialData);

        // Load the challenge
        const challengeData = await new TomeChallengesAPI().getChallenge(trialData.challengeId);
        setChallenge(challengeData);

        // Load the topic
        const topicData = await new TomeTopicsAPI().getTopic(challengeData.topicId);
        setTopic(topicData);
    }

    useEffect(() => { loadData() }, [])

    if (!topic || !challenge || !trial) return <></>

    const challengeType = challenge.code;
    const sectionName = formatSectionCode(challenge.sectionCode);

    return (
        <div className="flex flex-1 flex-col items-stretch justify-start px-4 h-full">
            <div className="mt-6 flex justify-between items-center">
                <div className="flex-1 flex">
                    <RoundButton icon={<BackSVG />} onClick={() => { router.back() }} size="s" secondary />
                </div>
                <div className="flex justify-center text-xl">{topic.name}</div>
                <div className="flex flex-1 items-center justify-end p-1 flex-shrink-0">
                    <MaskedSvgIcon 
                        src={`/images/challenges/${challengeType}.svg`}
                        alt={challengeType}
                        size="w-5 h-5"
                        color="bg-cyan-800"
                    />
                </div>
            </div>
            <div className="flex justify-center text-base opacity-70">
                {sectionName}
            </div>
        </div>
    )
}
