'use client'

import { TomeTopicsAPI, Topic } from "@/api/TomeTopicsAPI";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Challenge, TomeChallengesAPI, Trial } from "@/api/TomeChallengesAPI";
import { ChallengeDetailList, ExtendedChallenge } from "@/app/topics/[topicId]/challenges/[challengeType]/components/ChallengeDetailList";
import { useHeader } from "@/context/HeaderContext";
import { loadTopicChallenges } from "./trials/[trialId]/logic/trialLogic";

export default function ChallengeDetailPage() {

    const router = useRouter();
    const params = useParams()
    const { setConfig } = useHeader();

    const [topic, setTopic] = useState<Topic>()
    const [challenges, setChallenges] = useState<ExtendedChallenge[]>([]);
    const [challengeName, setChallengeName] = useState<string>("");
    const [trials, setTrials] = useState<Trial[]>([]);

    useEffect(() => {
        if (topic) {
            setConfig({
                title: `${topic.name}`,
                backButton: {
                    enabled: true,
                    onClick: () => { router.back() }
                },
                actions: undefined,
            });
        }
    }, [topic, challengeName, setConfig]);

    const loadData = async () => {
        loadTopic();
        loadChallenges();
    }

    /**
     * Loads the challenges for the topic
     * @returns 
     */
    const loadChallenges = async () => {

        const response = await loadTopicChallenges(String(params.topicId), String(params.challengeType));

        if (!response) return;

        setTrials(response.trials);
        setChallenges(response.challenges);

        if (response.challenges && response.challenges.length > 0) {
            setChallengeName(response.challenges[0].name);
        }
    }

    /**
     * Load the topic 
     */
    const loadTopic = async () => {
        const topic = await new TomeTopicsAPI().getTopic(String(params.topicId));
        setTopic(topic);
    }

    /**
     * Starts or resumes a trial for the given challenge
     * 
     * @param challengeId the id of the challenge to start or resume a trial for
     */
    const startOrResumeTrial = async (challengeId: string, action: "run" | "recap", trialId?: string) => {

        if (action == 'run') {

            const response = await new TomeChallengesAPI().startOrResumeTrial(challengeId) as { id: string } | { code: string; message: string };

            if ('code' in response) {
                console.log('Error starting or resuming trial:', response.code, response.message);
                return;
            }
            // Redirect to the trial  page
            router.push(`/topics/${params.topicId}/challenges/${params.challengeType}/trials/${response.id}/${action}`);
        }
        else {
            // Redirect to the trial page
            router.push(`/topics/${params.topicId}/challenges/${params.challengeType}/trials/${trialId}/${action}`);
        }
    }

    useEffect(() => { loadData() }, [])

    if (!topic) return <></>

    return (
        <div className="flex flex-1 flex-col items-stretch justify-start px-4 h-full">
            <div className="flex justify-center text-base opacity-70">
                {challengeName}
            </div>
            <ChallengeDetailList challenges={challenges} nonExpiredTrials={trials} onChallengeClick={startOrResumeTrial} />
            <div className="flex-1 mt-6 text-center">
            </div>
        </div>
    )
}
