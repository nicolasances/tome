'use client'

import { TomeTopicsAPI, Topic } from "@/api/TomeTopicsAPI";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import RoundButton from "@/app/ui/buttons/RoundButton";
import { MaskedSvgIcon } from "@/app/components/MaskedSvgIcon";
import { TomeChallengesAPI, Challenge, Trial, JuiceChallenge } from "@/api/TomeChallengesAPI";
import BackSVG from "@/app/ui/graphics/icons/Back";
import { formatSectionCode } from "@/app/utils/sectionFormatting";
import { JuiceTrial } from "@/app/topics/[topicId]/challenges/[challengeType]/trials/[trialId]/components/JuiceTrial";
import { JuiceTrialRecap } from "./components/JuiceTrialRecap";

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
        const { challenge } = await new TomeChallengesAPI().getChallenge(trialData.challengeId);
        setChallenge(challenge);

        // Load the topic
        const topicData = await new TomeTopicsAPI().getTopic(challenge.topicId);
        setTopic(topicData);
    }

    /**
     * When the trial is complete show a recap: 
     * - Final Score (for that we reload the trial)
     * - A list of individual test results and scores. For each test, the question, the given and correct answers are shown together with the score. 
     */
    const handleTrialComplete = () => {

        loadTrial();

    }

    const trialIsCompleted = () => {

        if (!trial) return false;

        return trial?.completedOn != null && trial?.completedOn !== undefined;
    }

    useEffect(() => { loadData() }, [])

    if (!topic || !challenge || !trial) return <></>

    const challengeType = (challenge as Challenge).code || 'juice';
    const sectionName = formatSectionCode((challenge as Challenge).sectionCode);

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
            {!trialIsCompleted() && challenge.code === 'juice' && (
                <JuiceTrial
                    challenge={challenge as any as JuiceChallenge}
                    trialId={String(params.trialId)}
                    onTrialComplete={handleTrialComplete}
                />
            )}
            {trialIsCompleted() && (
                <JuiceTrialRecap
                    challenge={challenge as any as JuiceChallenge}
                    trial={trial}
                />
            )}
        </div>
    )
}
