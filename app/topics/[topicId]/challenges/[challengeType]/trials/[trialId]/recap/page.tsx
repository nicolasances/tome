'use client'

import { TomeTopicsAPI, Topic } from "@/api/TomeTopicsAPI";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TomeChallengesAPI, Challenge, Trial, JuiceChallenge } from "@/api/TomeChallengesAPI";
import { formatSectionCode } from "@/app/utils/sectionFormatting";
import { JuiceTrialRecap } from "../components/JuiceTrialRecap";
import { useHeader } from "@/context/HeaderContext";

export default function TrialPage() {

    const router = useRouter();
    const params = useParams()
    const { setConfig } = useHeader();

    const [topic, setTopic] = useState<Topic>()
    const [challenge, setChallenge] = useState<Challenge>()
    const [trial, setTrial] = useState<Trial>()

    useEffect(() => {
        if (topic) {
            setConfig({
                title: topic.name,
                backButton: {
                    enabled: true,
                    onClick: () => { router.back() }
                },
                actions: undefined,
            });
        }
    }, [topic, setConfig]);

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

        console.log(trialData);
        

        // Load the challenge
        const { challenge } = await new TomeChallengesAPI().getChallenge(trialData.challengeId);
        setChallenge(challenge);

        // Load the topic
        const topicData = await new TomeTopicsAPI().getTopic(challenge.topicId);
        setTopic(topicData);
    }

    useEffect(() => { loadData() }, [])

    if (!topic || !challenge || !trial) return <></>

    const sectionName = formatSectionCode((challenge as Challenge).sectionCode);

    return (
        <div className="flex flex-1 flex-col items-stretch justify-start px-4 h-full">
            <div className="flex justify-center text-base opacity-70">
                {sectionName}
            </div>
            {challenge.code === 'juice' && (
                <JuiceTrialRecap
                    challenge={challenge as any as JuiceChallenge}
                    trial={trial}
                />
            )}
        </div>
    )
}
